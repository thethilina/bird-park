import { NextResponse } from "next/server";

import connectDB from "../../../lib/db";
import Artist from "../../../lib/models/Artist";
import { getCurrentUserId } from "../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const user = await Artist.findById(userId)
      .select("connections")
      .populate(
        "connections",
        "username fullName profileImage bio currentCategory"
      );

    return NextResponse.json({
      success: true,
      connections: user?.connections || [],
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}