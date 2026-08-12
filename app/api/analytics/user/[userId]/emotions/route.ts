import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string }>;
  }
) {
  try {
    await connectDB();

    const { userId } = await params;

    // --------------------------------------------------------
    // Get user's posts
    // --------------------------------------------------------

    const posts = await Post.find({
      author: userId,
    }).sort({
      createdAt: 1,
    });

    // --------------------------------------------------------
    // No posts
    // --------------------------------------------------------

    if (!posts.length) {
      return NextResponse.json({
        success: true,

        totalPosts: 0,

        topClusters: [],

        timeline: [],

        posts: [],
      });
    }

    // --------------------------------------------------------
    // Count semantic clusters
    // --------------------------------------------------------

    const clusterMap: Record<
      string,
      number
    > = {};

    // --------------------------------------------------------
    // Build timeline
    // --------------------------------------------------------

    const timeline = posts.map(
      (post) => {
        const cluster =
          post.semanticAnalysis?.cluster ||
          "unknown";

        // Count cluster
        clusterMap[cluster] =
          (clusterMap[cluster] || 0) + 1;

        return {
          postId: post._id,

          title: post.title,

          type: post.type,

          cluster,

          story:
            post.semanticAnalysis?.story ||
            null,

          date: post.createdAt,
        };
      }
    );

    // --------------------------------------------------------
    // Sort clusters by frequency
    // --------------------------------------------------------

    const topClusters =
      Object.entries(clusterMap)
        .map(
          ([cluster, count]) => ({
            cluster,
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        );

    // --------------------------------------------------------
    // Return analytics
    // --------------------------------------------------------

    return NextResponse.json({
      success: true,

      totalPosts: posts.length,

      topClusters,

      timeline,

      posts: posts.map(
        (post) => ({
          _id: post._id,

          title: post.title,

          type: post.type,

          createdAt:
            post.createdAt,

          semanticAnalysis:
            post.semanticAnalysis,

          media:
            post.media,
        })
      ),
    });

  } catch (error) {

    console.error(
      "[USER_SEMANTIC_ANALYTICS]",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Server error",
      },
      {
        status: 500,
      }
    );
  }
}