import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import ConnectionRequest from "../../../../lib/models/ConnectionRequest";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const requests =
      await ConnectionRequest.find({
        receiver: userId,
        status: "pending",
      })
        .populate(
          "sender",
          "username fullName profileImage"
        )
        .sort({
          createdAt: -1,
        });

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch connection requests",
      },
      {
        status: 500,
      }
    );
  }
}