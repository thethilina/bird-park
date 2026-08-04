import { NextResponse, type NextRequest } from "next/server";
import connectDB from "../../../lib/db";
import Post from "../../../lib/models/Post";
import mongoose from "mongoose";


export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit")) || 10;

  let query = {};

  if (cursor) {
    query = {
      _id: {
        $lt: new mongoose.Types.ObjectId(cursor),
      },
    };
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit);

  return NextResponse.json({
    success: true,
    posts,
    hasMore: posts.length === limit,
  });
}