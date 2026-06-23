import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
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

    // 1. Get all connection requests involving user
    const requests = await ConnectionRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    const blockedIds = new Set<string>();

    // 2. Add connected + pending users to block list
    for (const req of requests) {
      blockedIds.add(req.sender.toString());
      blockedIds.add(req.receiver.toString());
    }

    blockedIds.add(userId); // exclude self

    // 3. Fetch users not in blocked list
    const users = await Artist.find({
      _id: { $nin: Array.from(blockedIds) },
    })
      .select("username fullName profileImage bio currentCategory")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}