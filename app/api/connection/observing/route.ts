import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ConnectionRequest from "@/lib/models/ConnectionRequest";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const requests = await ConnectionRequest.find({
      sender: userId,
      status: "pending",
    })
      .populate(
        "receiver",
        "username fullName profileImage bio currentCategory"
      )
      .sort({ createdAt: -1 });

    const observingUsers = requests.map((req) => ({
      requestId: req._id,
      user: req.receiver,
      createdAt: req.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: observingUsers.length,
      observing: observingUsers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch observing users",
      },
      { status: 500 }
    );
  }
}