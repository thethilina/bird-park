import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import Circle from "@/lib/models/Circle";
import Post from "@/lib/models/Post";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ============================================================
    // CURRENT USER
    // ============================================================

    const userId = await getCurrentUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await Artist.findById(userObjectId)
      .select("_id currentCategory circles")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // PAGINATION
    // ============================================================

    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      30
    );

    // ============================================================
    // GET ALL USER ANALYZED POSTS
    //
    // IMPORTANT:
    // We are NOT using only the latest 30 posts anymore.
    //
    // The user's complete emotional history contributes
    // to their emotional profile.
    // ============================================================

    const userPosts = await Post.find({
      author: userObjectId,

      "emotionProfile.themes": {
        $exists: true,
        $ne: [],
      },

      "emotionAnalysis.status": "completed",
    })
      .select("emotionProfile createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // ============================================================
    // BUILD USER EMOTIONAL PROFILE
    // ============================================================

    const userEmotionScores: Record<string, number> = {};

    for (const post of userPosts) {
      const themes = post.emotionProfile?.themes || [];

      for (const theme of themes) {
        if (!theme?.emotion) continue;

        const emotion = normalize(theme.emotion);
        const score = Number(theme.score) || 0;

        userEmotionScores[emotion] =
          (userEmotionScores[emotion] || 0) + score;
      }
    }

    // ============================================================
    // USER TOP 3 EMOTIONS
    // ============================================================

    const userTopEmotions = Object.entries(userEmotionScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, score]) => ({
        emotion,
        score: Number(score.toFixed(4)),
      }));

    const userEmotionMap = new Map(
      userTopEmotions.map((emotion) => [emotion.emotion, emotion.score])
    );

    // ============================================================
    // GET ALL CIRCLES
    //
    // EXCLUDE any circle the user already belongs to in ANY role.
    //
    // We query membership straight off the Circle document instead
    // of trusting Artist.circles, because Artist.circles can go
    // stale if some join/promote code path forgets to push the
    // circle id there. Circle.members / admins / moderators /
    // owner / creator are the actual source of truth for "is this
    // user already in this circle".
    // ============================================================

    const circleQuery: any = {
      owner: { $ne: userObjectId },
      creator: { $ne: userObjectId },
      admins: { $ne: userObjectId },
      moderators: { $ne: userObjectId },
      members: { $ne: userObjectId },
    };

    const circles = await Circle.find(circleQuery)
      .select(
        "_id name description image icon creator owner admins moderators members joinType category createdAt"
      )
      .lean();

    if (circles.length === 0) {
      return NextResponse.json({
        success: true,
        type: "emotion",
        title: "Circles That Resonate",

        userProfile: {
          hasEmotionalProfile: userTopEmotions.length > 0,
          topEmotions: userTopEmotions,
        },

        circles: [],
        hasMore: false,
      });
    }

    // ============================================================
    // GET ALL POSTS BELONGING TO THESE CIRCLES
    //
    // We don't trust Circle.topEmotions.
    //
    // We calculate the emotional profile directly from
    // the posts currently inside each circle.
    // ============================================================

    const circleIds = circles.map((circle: any) => circle._id);

    // --------------------------------------------------------
    // TOTAL POST COUNT PER CIRCLE
    //
    // This is intentionally NOT filtered by emotionProfile.
    // It answers "does this circle have any content at all",
    // which is a different question from "does this circle
    // have posts with usable emotion data". Conflating the two
    // means every circle looks empty until emotionProfile is
    // actually populated on Post documents.
    // --------------------------------------------------------

    const totalPostCounts = await Post.aggregate([
      {
        $match: {
          circle: { $in: circleIds },
        },
      },
      {
        $group: {
          _id: "$circle",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPostCountMap = new Map<string, number>(
      totalPostCounts.map((entry: any) => [
        entry._id.toString(),
        entry.count,
      ])
    );

    const circlePosts = await Post.find({
      circle: {
        $in: circleIds,
      },

      "emotionProfile.themes": {
        $exists: true,
        $ne: [],
      },

      "emotionAnalysis.status": "completed",
    })
      .select("circle emotionProfile createdAt")
      .lean();

    // ============================================================
    // GROUP POSTS BY CIRCLE
    // ============================================================

    const circleEmotionMaps = new Map<string, Record<string, number>>();
    const analyzedPostCounts = new Map<string, number>();

    for (const post of circlePosts) {
      if (!post.circle) continue;

      const circleId = post.circle.toString();

      analyzedPostCounts.set(
        circleId,
        (analyzedPostCounts.get(circleId) || 0) + 1
      );

      if (!circleEmotionMaps.has(circleId)) {
        circleEmotionMaps.set(circleId, {});
      }

      const emotionMap = circleEmotionMaps.get(circleId)!;
      const themes = post.emotionProfile?.themes || [];

      for (const theme of themes) {
        if (!theme?.emotion) continue;

        const emotion = normalize(theme.emotion);
        const score = Number(theme.score) || 0;

        emotionMap[emotion] = (emotionMap[emotion] || 0) + score;
      }
    }

    // ============================================================
    // SCORE EVERY CIRCLE
    // ============================================================

    const ranked = circles.map((circle: any) => {
      const circleId = circle._id.toString();
      const emotionMap = circleEmotionMaps.get(circleId) || {};

      let emotionScore = 0;

      // --------------------------------------------------------
      // EMOTION MATCHING
      // --------------------------------------------------------

      for (const [emotion, circleScore] of Object.entries(emotionMap)) {
        const userScore = userEmotionMap.get(emotion) || 0;

        if (userScore <= 0) continue;

        emotionScore += userScore * Number(circleScore);
      }

      // --------------------------------------------------------
      // NORMALIZE EMOTION SCORE
      //
      // We don't want huge numbers because a circle has
      // many posts.
      //
      // sqrt keeps large communities from automatically
      // winning just because they have more content.
      // --------------------------------------------------------

      emotionScore = Math.sqrt(emotionScore);
      emotionScore = Math.min(emotionScore * 10, 100);

      // --------------------------------------------------------
      // CATEGORY MATCH
      // --------------------------------------------------------

      let categoryScore = 0;

      if (
        user.currentCategory &&
        circle.category &&
        normalize(user.currentCategory) === normalize(circle.category)
      ) {
        categoryScore = 15;
      }

      // --------------------------------------------------------
      // ACTIVITY
      // --------------------------------------------------------

      let activityScore = 0;

      if (circle.createdAt) {
        const age = Date.now() - new Date(circle.createdAt).getTime();
        const days = age / (1000 * 60 * 60 * 24);

        if (days <= 7) {
          activityScore = 5;
        } else if (days <= 30) {
          activityScore = 3;
        } else {
          activityScore = 1;
        }
      }

      // --------------------------------------------------------
      // CONTENT EXISTENCE
      //
      // A circle with no posts should not beat a circle
      // that actually matches the user's emotions.
      //
      // But it can still appear as discovery.
      // --------------------------------------------------------

      const totalPostCount = totalPostCountMap.get(circleId) || 0;
      const analyzedPostCount = analyzedPostCounts.get(circleId) || 0;

      // --------------------------------------------------------
      // FINAL SCORE
      // --------------------------------------------------------

      const finalScore =
        emotionScore * 0.8 + categoryScore * 0.15 + activityScore * 0.05;

      return {
        ...circle,

        recommendation: {
          score: Number(finalScore.toFixed(4)),
          emotionScore: Number(emotionScore.toFixed(4)),
          categoryScore,
          activityScore,
          postCount: totalPostCount,
          analyzedPostCount,
          hasEmotionalProfile: Object.keys(emotionMap).length > 0,
        },
      };
    });

    // ============================================================
    // FILTER OUT CIRCLES WITH NO POSTS AT ALL
    //
    // This checks totalPostCount (ANY post in the circle), not
    // analyzedPostCount. If we filtered on analyzed posts instead,
    // every circle would get excluded until emotionProfile.themes
    // is actually populated on Post documents — which would make
    // this feed return nothing, even for circles with real content.
    //
    // A circle with genuinely zero posts still gets excluded here,
    // since it has no content and no possible emotional signal.
    // Circles with posts but no emotion data yet will still show
    // up (with emotionScore = 0 until the AI pipeline is wired up),
    // ranked by category/activity in the meantime.
    //
    // Empty/new circles should be surfaced through a separate
    // "discovery" or "new circles" feed instead of this one.
    // ============================================================

    const eligible = ranked.filter(
      (circle) => circle.recommendation.postCount > 0
    );

    // ============================================================
    // SORT
    //
    // Highest emotional relevance first.
    // ============================================================

    eligible.sort((a, b) => b.recommendation.score - a.recommendation.score);

    // ============================================================
    // RETURN
    // ============================================================

    const results = eligible.slice(0, limit);

    return NextResponse.json({
      success: true,

      type: "emotion",

      title: "Circles That Resonate",

      userProfile: {
        hasEmotionalProfile: userTopEmotions.length > 0,
        topEmotions: userTopEmotions,
      },

      circles: results,

      hasMore: eligible.length > limit,
    });
  } catch (error) {
    console.error("[CIRCLE_RECOMMENDATION_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load recommended circles",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}