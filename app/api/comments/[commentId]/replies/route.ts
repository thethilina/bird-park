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
      commentId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { commentId } =
      await params;

      console.log(commentId)

    const replies =
      await Comment.find({
        parentComment: commentId,
      })
        .populate(
          "author",
          "username fullName profileImage"
        )
        .sort({
          createdAt: 1,
        });

    return NextResponse.json({
      success: true,
      replies,
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