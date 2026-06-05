import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import ConnectionRequest from "../../../../lib/models/ConnectionRequest";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const senderId = await getCurrentUserId();
    const { receiverId } = await req.json();

    if (!receiverId) {
      return NextResponse.json(
        { message: "receiverId required" },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { message: "Cannot connect to yourself" },
        { status: 400 }
      );
    }

    const receiver = await Artist.findById(receiverId);

    if (!receiver) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (
      receiver.connections.includes(senderId)
    ) {
      return NextResponse.json(
        { message: "Already connected" },
        { status: 400 }
      );
    }

    const existing =
      await ConnectionRequest.findOne({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });

    if (existing) {
      return NextResponse.json(
        { message: "Request already exists" },
        { status: 409 }
      );
    }

    const request =
      await ConnectionRequest.create({
        sender: senderId,
        receiver: receiverId,
      });

    receiver.observers.addToSet(senderId);
    await receiver.save();

    return NextResponse.json({
      success: true,
      request,
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}