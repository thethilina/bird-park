import { NextResponse } from "next/server";
import Artist from "@/lib/models/Artist";
import ConnectionRequest from "@/lib/models/ConnectionRequest";
import connectDB from "@/lib/db";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    await connectDB();

    const myId = await getCurrentUserId();
    const { artistId } = await params;

    if (!myId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (myId === artistId) {
      return NextResponse.json({
        status: "self",
      });
    }

    const [me, other] = await Promise.all([
      Artist.findById(myId).select("connections observers"),
      Artist.findById(artistId).select("connections observers"),
    ]);

    if (!me || !other) {
      return NextResponse.json(
        {
          message: "Artist not found",
        },
        { status: 404 }
      );
    }

    const isConnected = me.connections.some(
      (id: any) => id.toString() === artistId
    );

    if (isConnected) {
      return NextResponse.json({
        status: "connected",
      });
    }

    const request = await ConnectionRequest.findOne({
      $or: [
        {
          sender: myId,
          receiver: artistId,
        },
        {
          sender: artistId,
          receiver: myId,
        },
      ],
      status: "pending",
    });

    if (request) {
      const isMyRequest =
        request.sender.toString() === myId;

      return NextResponse.json({
        status: isMyRequest
          ? "observing"
          : "observer",

        requestId: request._id,
        senderId: request.sender,
        receiverId: request.receiver,
      });
    }

    return NextResponse.json({
      status: "not_sent",
    });
  } catch (error) {
    console.error(
      "Failed to get connection status:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to get connection status",
      },
      { status: 500 }
    );
  }
}