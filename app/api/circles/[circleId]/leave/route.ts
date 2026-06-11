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

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }

    if (
      circle.owner.toString() === userId
    ) {
      return NextResponse.json(
        {
          message:
            "Owner cannot leave circle",
        },
        { status: 400 }
      );
    }

    circle.members =
      circle.members.filter(
        (m: any) =>
          m.toString() !== userId
      );

    circle.admins =
      circle.admins.filter(
        (m: any) =>
          m.toString() !== userId
      );

    circle.moderators =
      circle.moderators.filter(
        (m: any) =>
          m.toString() !== userId
      );

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Left circle",
    });
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}