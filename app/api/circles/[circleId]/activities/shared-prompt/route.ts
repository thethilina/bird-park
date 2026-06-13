import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Circle from "@/lib/models/Circle";
import SharedPromptActivity from "@/lib/models/SharedPromptActivity";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const { title, prompt, startDate, endDate } = await req.json();

    if (!title || !prompt || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }

    const isAllowed =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId);

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const activity = await SharedPromptActivity.create({
      circle: circleId,
      creator: userId,
      title,
      prompt,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const { circleId } = await params;

    const activities = await SharedPromptActivity.find({
      circle: circleId,
    }).sort({ createdAt: -1 });

    const now = new Date();

    const enriched = activities.map((a) => {
      let status = "upcoming";

      if (now > a.endDate) status = "completed";
      else if (now >= a.startDate) status = "active";

      return {
        ...a.toObject(),
        status,
      };
    });

    return NextResponse.json({
      success: true,
      activities: enriched,
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}