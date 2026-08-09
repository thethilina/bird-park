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

    const {
      activityType = "art_jam",
      title,
      prompt,
      promptA,
      promptB,
      description,
      startDate,
      endDate,
      maxParticipants,
      coverImage,
    } = await req.json();


    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (activityType === "art_jam" && !prompt) {
      return NextResponse.json(
        { message: "Art Jam requires a prompt" },
        { status: 400 }
      );
    }

    if (activityType === "prompt_battle" && (!promptA || !promptB)) {
      return NextResponse.json(
        { message: "Prompt Battle requires two prompts" },
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
      activityType,
      title,
      description: description || "",
      prompt: activityType === "art_jam" ? prompt : undefined,
      promptA: activityType === "prompt_battle" ? promptA : undefined,
      promptB: activityType === "prompt_battle" ? promptB : undefined,
      startDate,
      endDate,
      maxParticipants: maxParticipants || null,
      coverImage: coverImage || null,
    });


    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (err) {
    console.error(err);
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
    })
      .populate("submissions.artist", "username fullName profileImage")
      .sort({ createdAt: -1 });

    const now = new Date();

    const enriched = activities.map((a) => {
      let status = "upcoming";

      if (now > a.endDate) status = "ended";
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
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}