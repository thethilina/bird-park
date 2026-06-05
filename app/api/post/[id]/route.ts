import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Post from "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const post = await Post.findById(id)
      .populate(
        "author",
        "username fullName profileImage currentCategory"
      )
      .populate(
        "collection",
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
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
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

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (
      post.author.toString() !== userId
    ) {
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
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const { id } = await params;

    const body = await req.json();

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (
      post.author.toString() !== userId
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const updatedPost =
      await Post.findByIdAndUpdate(
        id,
        {
          $set: body,
        },
        {
          new: true,
        }
      );

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}