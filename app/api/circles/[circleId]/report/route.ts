import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const { postId, reason } = await req.json();

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    circle.reports.push({
      post: postId,
      reporter: userId,
      reason,
      status: "pending",
    });

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Report submitted",
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}