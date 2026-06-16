import { NextResponse } from "next/server";

import connectDB from "../../../lib/db";
import Artist from "../../../lib/models/Artist";
import Post from "../../../lib/models/Post";
import Comment from "../../../lib/models/Comment";
import createNotification from "../../../lib/createNotification";

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

    const currentUser = await Artist.findById(
      userId,
      "username fullName"
    );
    const senderName =
      currentUser?.fullName || currentUser?.username || "Someone";

    if (!parentComment) {
      if (post.author.toString() !== userId) {
        await createNotification({
          recipient: post.author,
          sender: userId,
          type: "comment",
          message: `${senderName} commented on your post.`,
          entityId: post._id,
        });
      }
    } else {
      const parent = await Comment.findById(parentComment);

      if (parent) {
        const recipients = new Set<string>();

        const parentAuthor = parent.author.toString();

        if (parentAuthor !== userId) {
          recipients.add(parentAuthor);
        }

        if (parent.parentComment) {
          const targetComment = await Comment.findById(
            parent.parentComment
          );

          if (
            targetComment &&
            targetComment.author.toString() !== userId &&
            targetComment.author.toString() !== parentAuthor
          ) {
            recipients.add(targetComment.author.toString());
          }
        }

        await Promise.all(
          Array.from(recipients).map((recipientId) =>
            createNotification({
              recipient: recipientId,
              sender: userId,
              type: "reply",
              message: `${senderName} replied to your comment.`,
              entityId: comment._id,
            })
          )
        );
      }
    }

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