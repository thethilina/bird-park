import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";
import "../../../../../lib/models/Artist"
import "../../../../../lib/models/Post";


export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId)
      .populate("reports.post")
      .populate("reports.reporter", "username fullName");

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const allowed =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId);

    if (!allowed) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      reports: circle.reports,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}