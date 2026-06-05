import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Collection from "../../../../../lib/models/Collection";
import mongoose from "mongoose";
import "../../../../../lib/models/Artist";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid userId" },
        { status: 400 }
      );
    }

    const collections = await Collection.find({
      author: userId,
    })
      .populate("posts")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}