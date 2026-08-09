import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

// Ensure all models are registered before populate is called
import "@/lib/models/Artist";
import "@/lib/models/Post";
import "@/lib/models/Comment";
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
      .populate("submissions.post")
      .populate({
        path: "comments",
        populate: [
          { path: "author", select: "username fullName profileImage" },
          { path: "parentComment" },
        ],
      });

    if (!activity) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    let status = "upcoming";
    if (now > activity.endDate) status = "ended";
    else if (now >= activity.startDate) status = "active";

    // Dynamically calculate aggregated topEmotions from all valid submissions
    const emotionScores: Record<string, number> = {};
    activity.submissions.forEach((sub: any) => {
      if (sub.post && Array.isArray(sub.post.top3Emotions)) {
        sub.post.top3Emotions.forEach((e: any) => {
          if (e.emotion && e.score) {
            emotionScores[e.emotion] = (emotionScores[e.emotion] || 0) + e.score;
          }
        });
      }
    });

    const aggregatedEmotions = Object.entries(emotionScores)
      .map(([emotion, score]) => ({ emotion, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      activity: {
        ...activity.toObject(),
        status,
        topEmotions: aggregatedEmotions,
      },
    });
  } catch (err) {
    console.error("[activity detail route]", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}