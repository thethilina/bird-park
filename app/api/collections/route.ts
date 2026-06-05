import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Collection from "../../../lib/models/Collection";
import { getCurrentUserId } from "../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, coverImage, artistCategory } =
      await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title required" },
        { status: 400 }
      );
    }

    const collection = await Collection.create({
      author: userId,
      title,
      description,
      coverImage,
      artistCategory,
      posts: [],
    });

    return NextResponse.json({
      success: true,
      collection,
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}