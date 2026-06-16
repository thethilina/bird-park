import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
