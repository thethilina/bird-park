import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SharedPromptActivity from "@/lib/models/SharedPromptActivity";
import Circle from "@/lib/models/Circle";
import Post from "@/lib/models/Post";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { activityId } = await params;

    const { postId } = await req.json();

    const activity = await SharedPromptActivity.findById(activityId);

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    if (now < activity.startDate || now > activity.endDate) {
      return NextResponse.json(
        { message: "Activity not active" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "Not your post" },
        { status: 403 }
      );
    }

    if (post.type !== "art") {
      return NextResponse.json(
        { message: "Only art allowed" },
        { status: 400 }
      );
    }

    const alreadySubmitted = activity.submissions.some(
      (s: any) => s.artist.toString() === userId
    );

    if (alreadySubmitted) {
      return NextResponse.json(
        { message: "Already submitted" },
        { status: 400 }
      );
    }

    activity.submissions.push({
      artist: userId,
      post: postId,
    });

    await activity.save();

    return NextResponse.json({
      success: true,
      message: "Submitted successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}