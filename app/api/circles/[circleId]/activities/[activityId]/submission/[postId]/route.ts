import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SharedPromptActivity from "@/lib/models/SharedPromptActivity";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ activityId: string; postId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { activityId, postId } = await params;

    const activity = await SharedPromptActivity.findById(activityId);

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      );
    }

    const submission = activity.submissions.find(
      (s: any) => s.post.toString() === postId
    );

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    const isAllowed =
      submission.artist.toString() === userId;

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    activity.submissions = activity.submissions.filter(
      (s: any) => s.post.toString() !== postId
    );

    await activity.save();

    return NextResponse.json({
      success: true,
      message: "Removed",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}