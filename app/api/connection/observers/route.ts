import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const user = await Artist.findById(userId)
      .select("observers")
      .populate(
        "observers",
        "username fullName profileImage bio"
      );

    return NextResponse.json({
      success: true,
      observers: user?.observers || [],
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}