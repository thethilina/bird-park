import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import ConnectionRequest from "../../../../lib/models/ConnectionRequest";
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

    await Artist.findByIdAndUpdate(userId, {
      $pull: { observers: request.sender },
    });

    request.status = "declined";
    await request.save();

    return NextResponse.json({
      success: true,
      message: "Request declined",
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}