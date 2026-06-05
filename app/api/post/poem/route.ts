import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Post from "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const {
      title,
      body,
      poemStyle,
      top3Emotions,
      collection,
      visibility,
    } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { message: "title and body required" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: userId,
      type: "poem",
      title,
      body,
      poemStyle,
      top3Emotions,
      collection,
      visibility,
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch {
    return NextResponse.json(
      { message: "Error creating poem" },
      { status: 500 }
    );
  }
}