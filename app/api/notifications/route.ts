import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username fullName profileImage");

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
