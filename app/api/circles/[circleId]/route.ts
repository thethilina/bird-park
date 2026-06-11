import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Circle from "../../../../lib/models/Circle";
import "../../../../lib/models/Artist"
import "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  await connectDB();

  const { circleId } = await params;

  const circle = await Circle.findById(circleId)
    .populate("owner", "username fullName")
    .populate("members", "username fullName profileImage")
    .populate("admins", "username fullName")
    .populate("moderators", "username fullName")
    .populate("posts");

  if (!circle) {
    return NextResponse.json(
      { message: "Circle not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    circle,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    if (circle.owner.toString() !== userId) {
      return NextResponse.json({ message: "Only owner can delete circle" }, { status: 403 });
    }

    await circle.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Circle deleted",
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}