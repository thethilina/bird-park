import { NextResponse } from "next/server";

import Artist from "../../../../lib/models/Artist";
import connectDB from "../../../../lib/db";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const artist = await Artist.findById(userId)
      .select("-password")
      .populate("connections", "username fullName profileImage")
      .populate("observers", "username fullName profileImage");

    if (!artist) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      artist,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}