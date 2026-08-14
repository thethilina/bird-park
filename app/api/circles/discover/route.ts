import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import Circle from "@/lib/models/Circle";
import Post from "@/lib/models/Post";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

// ============================================================
// DISCOVER CIRCLES
//
// This is deliberately NOT emotion-based (see the "resonate"
// endpoint for that). This is a social discovery feed:
//
//   1. Circles where people you're CONNECTED to are members
//   2. Circles where people OBSERVING you are members
//   3. Category match
//   4. General popularity / recency, as a tiebreaker
//
// Suggested path: /api/circles/discover
// ============================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // --------------------------------------------------------
    // CONNECTION DIAGNOSTIC
    //
    // If mongosh shows circles that exist but this route
    // returns none, the #1 cause is the app connecting to a
    // DIFFERENT database than the one you're inspecting in
    // mongosh (wrong MONGODB_URI, missing db name in the
    // connection string, stale local/dev DB, etc). This logs
    // exactly what the app is actually connected to.
    // --------------------------------------------------------

    console.log("[CIRCLE_DISCOVERY_DEBUG] connection", {
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState, // 1 = connected
    });

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
      .select("_id currentCategory connections observers")
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
    // USER'S SOCIAL GRAPH
    //
    // connections: people the user is mutually connected to.
    // observers: people who observe (follow) the user.
    //
    // Both go into fast-lookup Sets so scoring each circle is
    // O(members) instead of doing array searches per member.
    // ============================================================

    const connectionSet = new Set(
      (user.connections || []).map((id: any) => id.toString())
    );

    const observerSet = new Set(
      (user.observers || []).map((id: any) => id.toString())
    );

    // ============================================================
    // USER'S EMOTIONAL PROFILE
    //
    // Pulled the SAME WAY as the "Circles That Resonate" endpoint.
    // We don't score discovery on this — we only use it to figure
    // out which circles already qualify as an emotion match, so
    // we can hide them from this feed. A circle should show up
    // in exactly one of the two feeds, not both.
    // ============================================================

    const userPosts = await Post.find({
      author: userObjectId,

      "emotionProfile.themes": {
        $exists: true,
        $ne: [],
      },

      "emotionAnalysis.status": "completed",
    })
      .select("emotionProfile")
      .lean();

    const userEmotionScores: Record<string, number> = {};

    for (const post of userPosts) {
      const themes = (post as any).emotionProfile?.themes || [];

      for (const theme of themes) {
        if (!theme?.emotion) continue;

        const emotion = normalize(theme.emotion);
        const score = Number(theme.score) || 0;

        userEmotionScores[emotion] =
          (userEmotionScores[emotion] || 0) + score;
      }
    }

    const userTopEmotionMap = new Map(
      Object.entries(userEmotionScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    );

    // ============================================================
    // GET CANDIDATE CIRCLES
    //
    // EXCLUDE any circle the user already belongs to in ANY role.
    //
    // We query membership straight off the Circle document
    // (owner / creator / admins / moderators / members) rather
    // than Artist.circles, since that array can go stale if a
    // join/promote path forgets to sync it.
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

    // --------------------------------------------------------
    // DIAGNOSTICS
    //
    // Temporary, cheap to leave in. Tells us whether an empty
    // result is because the Circle collection is empty, because
    // this specific user is excluded from everything (e.g. owns
    // every circle in the seed data), or because the query is
    // somehow wrong. Remove once confirmed working.
    // --------------------------------------------------------

    const totalCircleCount = await Circle.countDocuments({});

    console.log("[CIRCLE_DISCOVERY_DEBUG]", {
      userId: userObjectId.toString(),
      totalCircleCount,
      matchedAfterExclusion: circles.length,
      userConnections: connectionSet.size,
      userObservers: observerSet.size,
    });

    if (circles.length === 0) {
      return NextResponse.json({
        success: true,
        type: "discovery",
        title: "Discover Circles",

        circles: [],
        hasMore: false,

        debug: {
          dbName: mongoose.connection.name,
          host: mongoose.connection.host,
          totalCircleCount,
          matchedAfterExclusion: circles.length,
          reason:
            totalCircleCount === 0
              ? "No circles exist in the database this route is connected to — check dbName above against what you inspected in mongosh."
              : "Every circle was excluded — this user is owner/creator/admin/moderator/member of all of them, or the exclusion query is matching too broadly.",
        },
      });
    }

    // ============================================================
    // EXCLUDE CIRCLES THAT ALREADY EMOTIONALLY MATCH THE USER
    //
    // If userTopEmotionMap is empty (user has no analyzed posts
    // yet), nothing gets excluded here — that's correct, since
    // the resonate feed would also have nothing to show for them.
    // ============================================================

    let emotionMatchedCircleIds = new Set<string>();

    if (userTopEmotionMap.size > 0) {
      const circleIds = circles.map((circle: any) => circle._id);

      const candidatePosts = await Post.find({
        circle: { $in: circleIds },

        "emotionProfile.themes": {
          $exists: true,
          $ne: [],
        },

        "emotionAnalysis.status": "completed",
      })
        .select("circle emotionProfile")
        .lean();

      const circleEmotionMaps = new Map<string, Record<string, number>>();

      for (const post of candidatePosts) {
        if (!post.circle) continue;

        const circleId = post.circle.toString();

        if (!circleEmotionMaps.has(circleId)) {
          circleEmotionMaps.set(circleId, {});
        }

        const emotionMap = circleEmotionMaps.get(circleId)!;
        const themes = (post as any).emotionProfile?.themes || [];

        for (const theme of themes) {
          if (!theme?.emotion) continue;

          const emotion = normalize(theme.emotion);
          const score = Number(theme.score) || 0;

          emotionMap[emotion] = (emotionMap[emotion] || 0) + score;
        }
      }

      for (const [circleId, emotionMap] of circleEmotionMaps.entries()) {
        let overlap = 0;

        for (const [emotion, circleScore] of Object.entries(emotionMap)) {
          const userScore = userTopEmotionMap.get(emotion) || 0;
          if (userScore <= 0) continue;

          overlap += userScore * Number(circleScore);
        }

        if (overlap > 0) {
          emotionMatchedCircleIds.add(circleId);
        }
      }
    }

    const discoveryCandidates = circles.filter(
      (circle: any) => !emotionMatchedCircleIds.has(circle._id.toString())
    );

    // ============================================================
    // SCORE EVERY CIRCLE
    // ============================================================

    const ranked = discoveryCandidates.map((circle: any) => {
      // --------------------------------------------------------
      // BUILD THE SET OF PEOPLE ALREADY IN THIS CIRCLE
      //
      // Owner/creator/admins/moderators/members all count as
      // "people in the circle" for social-signal purposes.
      // --------------------------------------------------------

      const peopleInCircle = new Set<string>();

      const addIds = (ids: any[] | undefined) => {
        for (const id of ids || []) {
          peopleInCircle.add(id.toString());
        }
      };

      addIds(circle.members);
      addIds(circle.admins);
      addIds(circle.moderators);
      if (circle.owner) peopleInCircle.add(circle.owner.toString());
      if (circle.creator) peopleInCircle.add(circle.creator.toString());

      // --------------------------------------------------------
      // MUTUAL CONNECTIONS
      //
      // How many people YOU are connected to are already here.
      // This is the strongest discovery signal — "your friends
      // are here" — so it carries the most weight.
      // --------------------------------------------------------

      let mutualConnections = 0;

      for (const personId of peopleInCircle) {
        if (connectionSet.has(personId)) {
          mutualConnections += 1;
        }
      }

      // --------------------------------------------------------
      // OBSERVERS
      //
      // How many people who observe/follow YOU are already here.
      // Weaker signal than a mutual connection, but still a
      // meaningful "people like you" indicator.
      // --------------------------------------------------------

      let observerOverlap = 0;

      for (const personId of peopleInCircle) {
        if (observerSet.has(personId)) {
          observerOverlap += 1;
        }
      }

      // --------------------------------------------------------
      // SOCIAL SCORE
      //
      // sqrt keeps large circles from automatically winning just
      // because they have more members overall — a circle with
      // 2 of your close connections should be able to compete
      // with one that has 10 random members and 1 connection.
      // --------------------------------------------------------

      const rawSocial = mutualConnections * 3 + observerOverlap * 1.5;
      const socialScore = Math.min(Math.sqrt(rawSocial) * 20, 100);

      // --------------------------------------------------------
      // CATEGORY MATCH
      // --------------------------------------------------------

      let categoryScore = 0;

      if (
        user.currentCategory &&
        circle.category &&
        normalize(user.currentCategory) === normalize(circle.category)
      ) {
        categoryScore = 100;
      }

      // --------------------------------------------------------
      // POPULARITY
      //
      // Log-scaled so a circle with 500 members doesn't
      // completely dwarf one with 40 — this is just a tiebreaker,
      // not the main signal.
      // --------------------------------------------------------

      const memberCount = peopleInCircle.size;
      const popularityScore = Math.min(
        Math.log10(memberCount + 1) * 40,
        100
      );

      // --------------------------------------------------------
      // ACTIVITY / RECENCY
      // --------------------------------------------------------

      let activityScore = 0;

      if (circle.createdAt) {
        const age = Date.now() - new Date(circle.createdAt).getTime();
        const days = age / (1000 * 60 * 60 * 24);

        if (days <= 7) {
          activityScore = 100;
        } else if (days <= 30) {
          activityScore = 60;
        } else if (days <= 90) {
          activityScore = 30;
        } else {
          activityScore = 10;
        }
      }

      // --------------------------------------------------------
      // FINAL SCORE
      //
      // Social signal dominates, category is a moderate nudge,
      // popularity/activity break ties.
      // --------------------------------------------------------

      const finalScore =
        socialScore * 0.6 +
        categoryScore * 0.15 +
        popularityScore * 0.15 +
        activityScore * 0.1;

      return {
        ...circle,

        recommendation: {
          score: Number(finalScore.toFixed(4)),
          socialScore: Number(socialScore.toFixed(4)),
          mutualConnections,
          observerOverlap,
          categoryScore,
          popularityScore: Number(popularityScore.toFixed(4)),
          activityScore,
          memberCount,
        },
      };
    });

    // ============================================================
    // SORT
    // ============================================================

    ranked.sort((a, b) => b.recommendation.score - a.recommendation.score);

    // ============================================================
    // RETURN
    // ============================================================

    const results = ranked.slice(0, limit);

    return NextResponse.json({
      success: true,

      type: "discovery",

      title: "Discover Circles",

      circles: results,

      hasMore: ranked.length > limit,

      debug: {
        dbName: mongoose.connection.name,
        totalCircleCount,
        matchedAfterExclusion: circles.length,
        excludedForEmotionMatch: emotionMatchedCircleIds.size,
        remainingForDiscovery: discoveryCandidates.length,
      },
    });
  } catch (error) {
    console.error("[CIRCLE_DISCOVERY_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load circle discovery feed",
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