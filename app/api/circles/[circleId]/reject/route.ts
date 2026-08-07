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

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { circleId } = await params;

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }


    // Find current user's join request
    const request = circle.joinRequests.find(
      (r: any) =>
        r.user.toString() === userId
    );


    if (!request) {
      return NextResponse.json(
        {
          message: "No pending request found"
        },
        {
          status: 404
        }
      );
    }


    // Remove request
    circle.joinRequests =
      circle.joinRequests.filter(
        (r: any) =>
          r.user.toString() !== userId
      );


    await circle.save();


    return NextResponse.json({
      success: true,
      message: "Request cancelled",
    });


  } catch (error) {

    console.error("CANCEL REQUEST ERROR:", error);

    return NextResponse.json(
      {
        message: "Server Error"
      },
      {
        status: 500
      }
    );
  }
}