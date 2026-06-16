import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import ConnectionRequest from "../../../../lib/models/ConnectionRequest";
import createNotification from "../../../../lib/createNotification";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { message: "requestId required" },
        { status: 400 }
      );
    }

    const request =
      await ConnectionRequest.findById(requestId);

    if (!request) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { message: "Request already processed" },
        { status: 400 }
      );
    }

    if (
      request.receiver.toString() !== userId
    ) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    const senderId = request.sender;

    await Artist.findByIdAndUpdate(userId, {
      $pull: { observers: senderId },
      $addToSet: { connections: senderId },
    });

    await Artist.findByIdAndUpdate(senderId, {
      $addToSet: { connections: userId },
    });

    request.status = "accepted";
    await request.save();

    const receiver = await Artist.findById(
      userId,
      "username fullName"
    );

    await createNotification({
      recipient: senderId,
      sender: userId,
      type: "connection_accepted",
      message: `${receiver?.fullName || receiver?.username || "Someone"} accepted your connection request.`,
      entityId: request._id,
    });

    return NextResponse.json({
      success: true,
      message: "Connection accepted",
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}