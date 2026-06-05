import { NextResponse } from "next/server";

import connectDB from "../../../../../lib/db";
import Artist from "../../../../../lib/models/Artist";
import ConnectionRequest from "../../../../../lib/models/ConnectionRequest";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

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

    const { id: requestId } = await params;

    console.log(
      "Cancelling request",
      requestId,
      "by user",
      userId
    );

    const request =
      await ConnectionRequest.findById(
        requestId
      );

    if (!request) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        {
          message:
            "Cannot cancel processed request",
        },
        { status: 400 }
      );
    }

    if (
      request.sender.toString() !== userId
    ) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    await Artist.findByIdAndUpdate(
      request.receiver,
      {
        $pull: { observers: userId },
      }
    );

    await request.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Request cancelled",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}