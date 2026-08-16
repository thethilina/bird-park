import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";

/**
 * GET /api/auth/check-username?username=xxx
 * Returns { available: true/false } for real-time username validation.
 */
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { available: false, message: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Validate format: alphanumeric + underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { available: false, message: "Only letters, numbers, and underscores allowed" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Artist.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    return NextResponse.json({
      available: !existing,
      message: existing ? "Username is already taken" : "Username is available",
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json(
      { available: false, message: "Server error" },
      { status: 500 }
    );
  }
}
