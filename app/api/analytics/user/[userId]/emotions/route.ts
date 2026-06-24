import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/lib/models/Post";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;

    const posts = await Post.find({
      author: userId,
    }).sort({ createdAt: 1 });

    if (!posts.length) {
      return NextResponse.json({
        success: true,
        totalPosts: 0,
        topEmotions: [],
        timeline: [],
      });
    }

    const emotionMap: Record<string, number> = {};

    const timeline = posts.map((post) => {
      const mainEmotion =
        post.top3Emotions?.[0]?.emotion || "unknown";

      emotionMap[mainEmotion] =
        (emotionMap[mainEmotion] || 0) + 1;

      return {
        postId: post._id,
        title: post.title,
        emotion: mainEmotion,
        date: post.createdAt,
      };
    });

    const topEmotions = Object.entries(emotionMap)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      totalPosts: posts.length,

      topEmotions,

      timeline,

      posts: posts.map((post) => ({
        _id: post._id,
        title: post.title,
        createdAt: post.createdAt,
        top3Emotions: post.top3Emotions,
        media: post.media,
      })),
    });
  } catch (error) {
    console.error("[USER_EMOTION_ANALYTICS]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}