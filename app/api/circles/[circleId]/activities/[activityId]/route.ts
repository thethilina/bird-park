import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SharedPromptActivity from "@/lib/models/SharedPromptActivity";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    await connectDB();

    const { activityId } = await params;

    const activity = await SharedPromptActivity.findById(activityId)
      .populate("creator", "username fullName profileImage")
      .populate("submissions.artist", "username fullName profileImage")
      .populate("submissions.post");

    if (!activity) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    let status = "upcoming";
    if (now > activity.endDate) status = "completed";
    else if (now >= activity.startDate) status = "active";

    return NextResponse.json({
      success: true,
      activity: {
        ...activity.toObject(),
        status,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}