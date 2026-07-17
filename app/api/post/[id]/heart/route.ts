import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Post from "../../../../../lib/models/Post";
import Artist from "../../../../../lib/models/Artist";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";
import createNotification from "../../../../../lib/createNotification";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid post id" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    const alreadyHearted = post.hearts.some(
      (h: any) => h.toString() === userId
    );

    if (alreadyHearted) {
      post.hearts = post.hearts.filter(
        (h: any) => h.toString() !== userId
      );
    } else {
      post.hearts.push(userId);

      // Notify post author (don't notify yourself)
      if (post.author.toString() !== userId) {
        const currentUser = await Artist.findById(
          userId,
          "username fullName"
        );
        const senderName =
          currentUser?.fullName ||
          currentUser?.username ||
          "Someone";

        await createNotification({
          recipient: post.author.toString(),
          sender: userId,
          type: "heart",
          message: `${senderName} hearted your post.`,
          entityId: post._id.toString(),
        });
      }
    }

    await post.save();

    return NextResponse.json({
      success: true,
      hearted: !alreadyHearted,
      heartCount: post.hearts.length,
    });
  } catch (error) {
    console.error("[HEART_TOGGLE_ERROR]", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
