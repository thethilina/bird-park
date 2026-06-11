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

    const userId = await getCurrentUserId();

    const { circleId } = await params;

    const { targetUserId } = await req.json();

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }

    const canManage =
      circle.owner.toString() === userId ||
      circle.admins.some(
        (id: any) => id.toString() === userId
      ) ||
      circle.moderators.some(
        (id: any) => id.toString() === userId
      );

    if (!canManage) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    circle.joinRequests =
      circle.joinRequests.filter(
        (r: any) =>
          r.user.toString() !== targetUserId
      );

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Request rejected",
    });
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}