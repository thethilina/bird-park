import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import Post from "@/lib/models/Post";
import ConnectionRequest from "@/lib/models/ConnectionRequest";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    await connectDB();

    // ============================================================
    // CURRENT USER
    // ============================================================

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // CURRENT USER
    // ============================================================

    const currentUser = await Artist.findById(userId)
      .select(
        "connections observing"
      )
      .lean();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const connections = (
      currentUser.connections || []
    ).map((id: any) => id.toString());

    const observing = (
      currentUser.observing || []
    ).map((id: any) => id.toString());

    // ============================================================
    // CONNECTION REQUESTS
    //
    // We don't want to recommend someone if a connection
    // request already exists between the two users.
    // ============================================================

    const requests =
      await ConnectionRequest.find({
        $or: [
          {
            sender: userId,
          },
          {
            receiver: userId,
          },
        ],
      })
        .select("sender receiver")
        .lean();

    const blockedIds = new Set<string>();

    blockedIds.add(userId.toString());

    // Already connected
    for (const id of connections) {
      blockedIds.add(id);
    }

    // Already observing
    for (const id of observing) {
      blockedIds.add(id);
    }

    // Pending / existing connection requests
    for (const request of requests) {
      blockedIds.add(
        request.sender.toString()
      );

      blockedIds.add(
        request.receiver.toString()
      );
    }

    // ============================================================
    // GET CURRENT USER'S SEMANTIC PROFILE
    // ============================================================

    const userPosts = await Post.find({
      author: userId,

      "semanticAnalysis.cluster": {
        $ne: null,
      },

      "emotionAnalysis.status":
        "completed",
    })
      .select(
        "semanticAnalysis.cluster createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .lean();

    // ============================================================
    // BUILD USER THEME PROFILE
    // ============================================================

    const userThemeScores: Record<
      string,
      number
    > = {};

    userPosts.forEach(
      (post, index) => {
        const cluster =
          post.semanticAnalysis?.cluster;

        if (!cluster) return;

        /*
          Recent posts get slightly more importance.
        */

        const weight =
          Math.max(
            1,
            userPosts.length - index
          );

        userThemeScores[cluster] =
          (userThemeScores[cluster] || 0) +
          weight;
      }
    );

    const userThemes = Object.entries(
      userThemeScores
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 3)
      .map(([cluster]) => cluster);

    // ============================================================
    // GET ALL ELIGIBLE ARTISTS
    // ============================================================

    const artists =
      await Artist.find({
        _id: {
          $nin: Array.from(
            blockedIds
          ),
        },
      })
        .select(
          "_id username fullName profileImage bio currentCategory connections"
        )
        .lean();

    if (!artists.length) {
      return NextResponse.json({
        success: true,
        userThemes,
        users: [],
      });
    }

    // ============================================================
    // GET SEMANTIC POSTS FOR CANDIDATE ARTISTS
    // ============================================================

    const artistIds =
      artists.map(
        (artist) => artist._id
      );

    const candidatePosts =
      await Post.find({
        author: {
          $in: artistIds,
        },

        "semanticAnalysis.cluster": {
          $ne: null,
        },

        "emotionAnalysis.status":
          "completed",
      })
        .select(
          "author semanticAnalysis.cluster"
        )
        .lean();

    // ============================================================
    // BUILD THEME PROFILE FOR EACH ARTIST
    // ============================================================

    const artistThemes =
      new Map<string, Set<string>>();

    for (const post of candidatePosts) {
      const artistId =
        post.author.toString();

      const cluster =
        post.semanticAnalysis?.cluster;

      if (!cluster) continue;

      if (!artistThemes.has(artistId)) {
        artistThemes.set(
          artistId,
          new Set()
        );
      }

      artistThemes
        .get(artistId)!
        .add(cluster);
    }

    // ============================================================
    // RANK ARTISTS
    // ============================================================

    const rankedUsers =
      artists.map((artist) => {
        const artistId =
          artist._id.toString();

        const themes =
          artistThemes.get(
            artistId
          ) || new Set<string>();

        // --------------------------------------------------------
        // 1. EMOTIONAL / SEMANTIC MATCH
        // --------------------------------------------------------

        let emotionScore = 0;

        for (
          let i = 0;
          i < userThemes.length;
          i++
        ) {
          const userTheme =
            userThemes[i];

          if (
            themes.has(userTheme)
          ) {
            /*
              Higher-ranked user themes
              are worth more.
            */

            emotionScore +=
              3 - i;
          }
        }

        /*
          Maximum possible:

          first theme  = 3
          second theme = 2
          third theme  = 1

          total = 6
        */

        const normalizedEmotionScore =
          (emotionScore / 6) * 100;

        // --------------------------------------------------------
        // 2. MUTUAL CONNECTIONS
        // --------------------------------------------------------

        const artistConnections =
          (
            artist.connections ||
            []
          ).map(
            (id: any) =>
              id.toString()
          );

        let mutualConnections = 0;

        for (
          const connectionId
          of connections
        ) {
          if (
            artistConnections.includes(
              connectionId
            )
          ) {
            mutualConnections++;
          }
        }

        /*
          Cap mutual score so someone with
          many connections doesn't completely
          overpower semantic compatibility.
        */

        const mutualScore =
          Math.min(
            mutualConnections,
            5
          ) * 10;

        // --------------------------------------------------------
        // 3. DISCOVERY
        // --------------------------------------------------------

        /*
          Everyone gets a small base score.

          This prevents the system from becoming
          an emotional echo chamber where only
          people with matching themes appear.
        */

        const discoveryScore = 10;

        // --------------------------------------------------------
        // FINAL SCORE
        // --------------------------------------------------------

        const finalScore =
          normalizedEmotionScore * 0.60 +
          mutualScore * 0.30 +
          discoveryScore * 0.10;

        return {
          ...artist,

          recommendation: {
            score: Number(
              finalScore.toFixed(2)
            ),

            emotionMatch:
              Number(
                normalizedEmotionScore.toFixed(
                  2
                )
              ),

            mutualConnections,

            mutualScore,

            matchedThemes:
              userThemes.filter(
                (theme) =>
                  themes.has(theme)
              ),
          },
        };
      });

    // ============================================================
    // SORT
    // ============================================================

    rankedUsers.sort(
      (a, b) =>
        b.recommendation.score -
        a.recommendation.score
    );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      userThemes,

      users: rankedUsers,
    });
  } catch (error) {
    console.error(
      "[ARTIST_SUGGESTIONS_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch artist suggestions",
      },
      {
        status: 500,
      }
    );
  }
}