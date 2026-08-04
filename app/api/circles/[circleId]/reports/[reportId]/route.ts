import { NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import Circle from "../../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../../lib/getCurrentUser";

// PATCH /api/circles/[circleId]/reports/[reportId]  — resolve a report
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ circleId: string; reportId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId, reportId } = await params;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const allowed =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId);

    if (!allowed) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const report = circle.reports.id(reportId);
    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    report.status = "resolved";
    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Report resolved",
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
