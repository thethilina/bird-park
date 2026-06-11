import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  await connectDB();

  const userId = await getCurrentUserId();
  const { circleId } = await params;

  const circle = await Circle.findById(circleId);

  if (!circle) {
    return NextResponse.json(
      { message: "Circle not found" },
      { status: 404 }
    );
  }

  if (circle.members.includes(userId)) {
    return NextResponse.json(
      { message: "Already a member" },
      { status: 400 }
    );
  }

  // OPEN JOIN
  if (circle.joinType === "open") {
    circle.members.push(userId);
    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Joined circle",
    });
  }

  // APPROVAL JOIN
  const exists = circle.joinRequests.find(
    (r : any) => r.user.toString() === userId
  );

  if (exists) {
    return NextResponse.json(
      { message: "Request already sent" },
      { status: 400 }
    );
  }

  circle.joinRequests.push({
    user: userId,
    status: "pending",
  });

  await circle.save();

  return NextResponse.json({
    success: true,
    message: "Request sent",
  });
}