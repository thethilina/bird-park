import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Comment from "../../../../../lib/models/Comment";
import '../../../../../lib/models/Artist'



export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      postId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { postId } =
      await params;

    const comments =
      await Comment.find({
        post: postId,
        parentComment: null,
      })
        .populate(
          "author",
          "username fullName profileImage"
        )
        .sort({
          createdAt: -1,
        });

    return NextResponse.json({
      success: true,
      comments,
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