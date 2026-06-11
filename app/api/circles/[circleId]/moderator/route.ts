import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";

import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ circleId: string }>;
  }
) {
  try {
    await connectDB();

    const userId =
      await getCurrentUserId();

    const { circleId } =
      await params;

    const { targetUserId } =
      await req.json();

    const circle =
      await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }

    const allowed =
      circle.owner.toString() ===
        userId ||
      circle.admins.some(
        (id: any) =>
          id.toString() === userId
      );

    if (!allowed) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const already =
      circle.moderators.some(
        (id: any) =>
          id.toString() ===
          targetUserId
      );

    if (!already) {
      circle.moderators.push(
        targetUserId
      );
    }

    await circle.save();

    return NextResponse.json({
      success: true,
      message:
        "Moderator assigned",
    });
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const { targetUserId } = await req.json();

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const allowed =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId);

    if (!allowed) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    circle.moderators = circle.moderators.filter(
      (id: any) => id.toString() !== targetUserId
    );

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Moderator removed",
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}