import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Post from "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";



export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const body = await req.json();

    const {
      title,
      media,
      top3Emotions,
      collection,
      visibility,
      circle, 
    } = body;

    if (!title || !media?.url) {
      return NextResponse.json(
        { message: "title and image required" },
        { status: 400 }
      );
    }

    const isCirclePost = !!circle;

    const post = await Post.create({
      author: userId,
      type: "art",
      title,
      media,
      top3Emotions,
      collection: collection || null,
      circle: circle || null,
      visibility: isCirclePost ? "circle" : "public",
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error creating art" },
      { status: 500 }
    );
  }
}