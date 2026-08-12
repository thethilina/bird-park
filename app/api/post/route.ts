import { NextResponse, type NextRequest } from "next/server";
import connectDB from "../../../lib/db";
import Post from "../../../lib/models/Post";
import Artist from "../../../lib/models/Artist";
import mongoose from "mongoose";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");

    const limit = Math.min(
      Number(searchParams.get("limit")) || 10,
      30
    );

    // ============================================================
    // CURRENT USER
    // ============================================================

    const userId = await getCurrentUserId();

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = await Artist.findById(userId)
      .select("observing connections")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================================
    // RELATIONSHIPS
    // ============================================================

    const observing = (user.observing || []).map(
      (id: any) =>
        new mongoose.Types.ObjectId(id)
    );

    const connections = (user.connections || []).map(
      (id: any) =>
        new mongoose.Types.ObjectId(id)
    );

    // ============================================================
    // USER'S SEMANTIC HISTORY
    // ============================================================

    const analyzedPosts = await Post.find({
      author: user._id,

      "semanticAnalysis.cluster": {
        $ne: null,
      },

      "emotionAnalysis.status": "completed",
    })
      .select(
        "semanticAnalysis.cluster createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .lean();

    const hasSemanticProfile =
      analyzedPosts.length > 0;

    const hasSocialNetwork =
      observing.length > 0 ||
      connections.length > 0;

    // ============================================================
    // FEED MODE
    // ============================================================

    let mode:
      | "discovery"
      | "social"
      | "personalized";

    if (
      !hasSemanticProfile &&
      !hasSocialNetwork
    ) {
      mode = "discovery";
    } else if (!hasSemanticProfile) {
      mode = "social";
    } else {
      mode = "personalized";
    }

    // ============================================================
    // BUILD USER THEME PROFILE
    // ============================================================

    const themeScores: Record<string, number> = {};

    for (
      let index = 0;
      index < analyzedPosts.length;
      index++
    ) {
      const post = analyzedPosts[index];

      const cluster =
        post.semanticAnalysis?.cluster;

      if (!cluster) continue;

      /*
        Recent posts matter more.

        Example:

        newest     = 20 points
        next       = 19
        next       = 18
        ...
      */

      const weight =
        analyzedPosts.length - index;

      themeScores[cluster] =
        (themeScores[cluster] || 0) +
        weight;
    }

    const topThemes = Object.entries(
      themeScores
    )
      .map(([cluster, score]) => ({
        cluster,
        score,
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 3);

    const userThemes =
      topThemes.map(
        (theme) => theme.cluster
      );

    // ============================================================
    // BASE QUERY
    // ============================================================

    const baseQuery: any = {
      // NEVER SHOW OWN POSTS
      author: {
        $ne: user._id,
      },

      // ONLY PUBLIC POSTS
      visibility: "public",

      // NEVER SHOW CIRCLE CONTENT
      circle: null,

      // NEVER SHOW ACTIVITY CONTENT
      activity: null,
    };

    // ============================================================
    // CURSOR
    // ============================================================

    if (cursor) {
      if (
        mongoose.Types.ObjectId.isValid(cursor)
      ) {
        baseQuery._id = {
          $lt:
            new mongoose.Types.ObjectId(cursor),
        };
      }
    }

    // ============================================================
    // GET CANDIDATES
    //
    // IMPORTANT:
    //
    // We don't just fetch 10 posts.
    //
    // We fetch a larger candidate pool,
    // score them, then select the best 10.
    // ============================================================

    const candidates = await Post.find(
      baseQuery
    )
      .sort({
        createdAt: -1,
      })
      .limit(
        Math.max(
          limit * 8,
          80
        )
      )
      .lean();

    // ============================================================
    // SCORE POSTS
    // ============================================================

    const scoredPosts = candidates.map(
      (post: any) => {
        const authorId =
          post.author?.toString();

        // --------------------------------------------------------
        // SEMANTIC MATCH
        // --------------------------------------------------------

        let semanticScore = 0;

        const cluster =
          post.semanticAnalysis?.cluster;

        if (
          mode === "personalized" &&
          cluster
        ) {
          const themeIndex =
            userThemes.indexOf(
              cluster
            );

          if (themeIndex === 0) {
            semanticScore = 60;
          } else if (themeIndex === 1) {
            semanticScore = 45;
          } else if (themeIndex === 2) {
            semanticScore = 30;
          }
        }

        // --------------------------------------------------------
        // OBSERVED ARTIST
        // --------------------------------------------------------

        let observingScore = 0;

        if (
          observing.some(
            (id: { toString: () => any; }) =>
              id.toString() ===
              authorId
          )
        ) {
          observingScore = 30;
        }

        // --------------------------------------------------------
        // CONNECTION
        // --------------------------------------------------------

        let connectionScore = 0;

        if (
          connections.some(
            (id: { toString: () => any; }) =>
              id.toString() ===
              authorId
          )
        ) {
          connectionScore = 25;
        }

        // --------------------------------------------------------
        // FRESHNESS
        // --------------------------------------------------------

        const createdAt =
          new Date(
            post.createdAt
          ).getTime();

        const ageHours =
          Math.max(
            0,
            (Date.now() -
              createdAt) /
              (1000 * 60 * 60)
          );

        /*
          Fresh posts receive a boost.

          0 hours  -> 20
          12 hours -> ~15
          24 hours -> ~10
          48 hours -> ~5
          older     -> gradually approaches 0
        */

        const freshnessScore =
          Math.max(
            0,
            20 -
              ageHours *
                0.42
          );

        // --------------------------------------------------------
        // LIGHT DISCOVERY BONUS
        // --------------------------------------------------------

        /*
          Every post gets a small score.

          This is important.

          Otherwise the feed becomes an echo chamber.
        */

        const discoveryScore = 5;

        // --------------------------------------------------------
        // SMALL SOCIAL ACTIVITY SCORE
        // --------------------------------------------------------

        const hearts =
          Array.isArray(
            post.hearts
          )
            ? post.hearts.length
            : 0;

        const comments =
          Array.isArray(
            post.comments
          )
            ? post.comments.length
            : 0;

        /*
          Keep this deliberately small.

          We don't want BirdPark
          to become "who has the most likes".
        */

        const activityScore =
          Math.min(
            hearts * 0.5 +
              comments * 1,
            10
          );

        // --------------------------------------------------------
        // FINAL SCORE
        // --------------------------------------------------------

        const finalScore =
          semanticScore +
          observingScore +
          connectionScore +
          freshnessScore +
          discoveryScore +
          activityScore;

        return {
          post,

          score: finalScore,

          signals: {
            semanticScore,
            observingScore,
            connectionScore,
            freshnessScore,
            discoveryScore,
            activityScore,
          },
        };
      }
    );

    // ============================================================
    // SORT BY SCORE
    // ============================================================

    scoredPosts.sort(
      (a, b) =>
        b.score - a.score
    );

    // ============================================================
    // DIVERSIFY FEED
    //
    // Don't allow the first 10 posts to all come from
    // one artist or one theme.
    // ============================================================

    const selectedPosts: any[] = [];

    const authorCounts =
      new Map<string, number>();

    const clusterCounts =
      new Map<string, number>();

    for (
      const candidate of scoredPosts
    ) {
      if (
        selectedPosts.length >=
        limit
      ) {
        break;
      }

      const post =
        candidate.post;

      const authorId =
        post.author?.toString();

      const cluster =
        post.semanticAnalysis
          ?.cluster || "unknown";

      const authorCount =
        authorCounts.get(
          authorId
        ) || 0;

      const clusterCount =
        clusterCounts.get(
          cluster
        ) || 0;

      // --------------------------------------------------------
      // AUTHOR DIVERSITY
      //
      // Don't let one artist dominate the feed.
      // --------------------------------------------------------

      if (
        authorCount >= 2
      ) {
        continue;
      }

      // --------------------------------------------------------
      // THEME DIVERSITY
      //
      // Don't fill entire feed with the same theme.
      // --------------------------------------------------------

      if (
        clusterCount >= 4
      ) {
        continue;
      }

      selectedPosts.push(
        candidate
      );

      authorCounts.set(
        authorId,
        authorCount + 1
      );

      clusterCounts.set(
        cluster,
        clusterCount + 1
      );
    }

    // ============================================================
    // FALLBACK
    //
    // If diversity rules prevented us from filling the feed,
    // continue with remaining candidates.
    // ============================================================

    if (
      selectedPosts.length <
      limit
    ) {
      for (
        const candidate of scoredPosts
      ) {
        if (
          selectedPosts.length >=
          limit
        ) {
          break;
        }

        const alreadyIncluded =
          selectedPosts.some(
            (item) =>
              item.post._id.toString() ===
              candidate.post._id.toString()
          );

        if (!alreadyIncluded) {
          selectedPosts.push(
            candidate
          );
        }
      }
    }

    // ============================================================
    // FINAL POSTS
    // ============================================================

    const posts =
      selectedPosts.map(
        (item) => item.post
      );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      mode,

      /*
        These are the user's three strongest
        themes.

        Your frontend can use these as filters:

        All
        Loss & absence
        Love & connection
        Inner conflict
      */

      topThemes,

      posts,

      hasMore:
        candidates.length >=
        limit,
    });
  } catch (error) {
    console.error(
      "[FEED_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load feed",
      },
      {
        status: 500,
      }
    );
  }
}