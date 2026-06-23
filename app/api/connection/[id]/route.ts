import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import ConnectionRequest from "../../../../lib/models/ConnectionRequest";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    // ✅ FIX: unwrap params
    const { id: targetId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (userId === targetId) {
      return NextResponse.json(
        { message: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    const user = await Artist.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isConnected = user.connections.some(
      (id: any) => id.toString() === targetId
    );

    if (!isConnected) {
      return NextResponse.json(
        { message: "Not connected" },
        { status: 400 }
      );
    }

    // remove connection both sides (and clean up observers)
    await Artist.findByIdAndUpdate(userId, {
      $pull: { connections: targetId, observers: targetId },
    });

    await Artist.findByIdAndUpdate(targetId, {
      $pull: { connections: userId, observers: userId },
    });

    // remove request (VERY IMPORTANT)
    await ConnectionRequest.deleteOne({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("DELETE connection error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}