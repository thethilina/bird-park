import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Post from "../../../../../lib/models/Post";


export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string }>;
  }
) {
  await connectDB();

  const { userId } = await params;

 console.log("Fetching posts for user:", userId);

    const posts = await Post.find({
    author: userId,
  })
    .sort({
      createdAt: -1,
    });

  return NextResponse.json({
    success: true,
    posts,
  });
}