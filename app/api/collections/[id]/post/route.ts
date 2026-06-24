import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Collection from "../../../../../lib/models/artCollection";
import Post from "../../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    const { postId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.author?.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    await Collection.findByIdAndUpdate(id, {
      $addToSet: { posts: postId },
    });

    return NextResponse.json({
      success: true,
      message: "Post added to collection",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    const { postId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }

    if (collection.author?.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await Collection.findByIdAndUpdate(id, {
      $pull: { posts: postId },
    });

    return NextResponse.json({
      success: true,
      message: "Post removed from collection",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}