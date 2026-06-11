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

    if (
      circle.owner.toString() !==
      userId
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const member =
      circle.members.some(
        (m: any) =>
          m.toString() ===
          targetUserId
      );

    if (!member) {
      return NextResponse.json(
        {
          message:
            "User must be a member",
        },
        { status: 400 }
      );
    }

    const alreadyAdmin =
      circle.admins.some(
        (m: any) =>
          m.toString() ===
          targetUserId
      );

    if (!alreadyAdmin) {
      circle.admins.push(
        targetUserId
      );
    }

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Admin assigned",
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

    if (
      circle.owner.toString() !==
      userId
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    circle.admins =
      circle.admins.filter(
        (id: any) =>
          id.toString() !==
          targetUserId
      );

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Admin removed",
    });
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}