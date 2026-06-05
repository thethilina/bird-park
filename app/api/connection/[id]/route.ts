import { NextResponse } from "next/server";

import connectDB from "../../../../lib/db";
import Artist from "../../../../lib/models/Artist";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

        const { id: targetId } = await params;


    const user = await Artist.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isConnected =
      user.connections.includes(targetId);

    if (!isConnected) {
      return NextResponse.json(
        { message: "Not connected" },
        { status: 400 }
      );
    }

    await Artist.findByIdAndUpdate(userId, {
      $pull: { connections: targetId },
    });

    await Artist.findByIdAndUpdate(targetId, {
      $pull: { connections: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Connection removed",
    });
  } catch {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}