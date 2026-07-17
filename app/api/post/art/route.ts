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
      collection,
      circle,
    } = body;

    if (!title || !media?.url) {
      return NextResponse.json(
        { message: "Title and image are required" },
        { status: 400 }
      );
    }

    const isCirclePost = !!circle;

    const post = await Post.create({
      author: userId,
      type: "art",
      title,
      media,

      // Will be updated after AI finishes
      top3Emotions: [],

      collection: collection || null,

      circle: circle || null,

      visibility: isCirclePost ? "circle" : "public",

      // Only if you've added this field to the schema
      analysis: {
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (err) {
    console.error("[CREATE_ART_ERROR]", err);

    return NextResponse.json(
      {
        message: "Error creating artwork",
      },
      {
        status: 500,
      }
    );
  }
}