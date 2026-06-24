import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Post from "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";
import mongoose from "mongoose";
import "../../../../lib/models/artCollection"
import "../../../../lib/models/Artist"
export const runtime = "nodejs";

/* -------------------- GET POST -------------------- */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid post id" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id)
      .populate(
        "author",
        "username fullName profileImage currentCategory"
      )
      .populate(
        "artCollection",
        "title coverImage"
      );

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("[GET_POST_ERROR]", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

/* -------------------- DELETE POST -------------------- */
export async function DELETE(
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

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.error("[DELETE_POST_ERROR]", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

/* -------------------- UPDATE POST -------------------- */
export async function PATCH(
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

    const body = await req.json();

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
      .populate("author", "username fullName profileImage")
      .populate("artCollection", "title coverImage");

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("[PATCH_POST_ERROR]", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}