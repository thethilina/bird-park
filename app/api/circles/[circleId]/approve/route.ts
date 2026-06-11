import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";




export async function POST(req: Request, { params }: any) {
  await connectDB();

  const userId = await getCurrentUserId();
  const { circleId } = await params;

  const { targetUserId } = await req.json();

  const circle = await Circle.findById(circleId);

  if (!circle) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const isAdmin =
    circle.owner.toString() === userId ||
    circle.admins.includes(userId) ||
    circle.moderators.includes(userId);

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Not allowed" },
      { status: 403 }
    );
  }

  const request = circle.joinRequests.find(
    (r : any) => r.user.toString() === targetUserId
  );

  if (!request) {
    return NextResponse.json(
      { message: "No request" },
      { status: 404 }
    );
  }

  circle.members.push(targetUserId);

  circle.joinRequests = circle.joinRequests.filter(
    (r : any) => r.user.toString() !== targetUserId
  );

  await circle.save();

  return NextResponse.json({
    success: true,
    message: "User approved",
  });
}