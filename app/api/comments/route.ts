import { NextResponse } from "next/server";

import connectDB from "../../../lib/db";
import Post from "../../../lib/models/Post";
import Comment from "../../../lib/models/Comment";

import { getCurrentUserId } from "../../../lib/getCurrentUser";

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId =
      await getCurrentUserId();

    const {
      postId,
      body,
      parentComment,
      mentionedUsers,
    } = await req.json();

    if (!postId || !body?.trim()) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const post =
      await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (parentComment) {
      const parent =
        await Comment.findById(
          parentComment
        );

      if (!parent) {
        return NextResponse.json(
          {
            message:
              "Parent comment not found",
          },
          { status: 404 }
        );
      }
    }

    const comment =
      await Comment.create({
        post: postId,
        author: userId,
        body,
        parentComment:
          parentComment || null,
        mentionedUsers:
          mentionedUsers || [],
      });

    return NextResponse.json(
      {
        success: true,
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}