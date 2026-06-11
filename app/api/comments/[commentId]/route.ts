import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Comment from "../../../../lib/models/Comment";
import Post from "../../../../lib/models/Post";

import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      commentId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const userId =
      await getCurrentUserId();

    const { commentId } =
      await params;

    const { body } =
      await req.json();

    const comment =
      await Comment.findById(
        commentId
      );

    if (!comment) {
      return NextResponse.json(
        {
          message:
            "Comment not found",
        },
        { status: 404 }
      );
    }

    if (
      comment.author.toString() !==
      userId
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    comment.body = body.trim();

    await comment.save();

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

async function deleteChildren(
  commentId: string
) {
  const children =
    await Comment.find({
      parentComment: commentId,
    });

  for (const child of children) {
    await deleteChildren(
      child._id.toString()
    );
  }

  await Comment.deleteOne({
    _id: commentId,
  });
}


export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      commentId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const userId =
      await getCurrentUserId();

    const { commentId } =
      await params;

    const comment =
      await Comment.findById(
        commentId
      );

    if (!comment) {
      return NextResponse.json(
        {
          message:
            "Comment not found",
        },
        { status: 404 }
      );
    }

    if (
      comment.author.toString() !==
      userId
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await deleteChildren(
      commentId
    );

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}