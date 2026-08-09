import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Circle from "@/lib/models/Circle";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();
    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Target user ID is required" },
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

    if (circle.owner.toString() !== userId) {
      return NextResponse.json(
        { message: "Only the owner can transfer ownership" },
        { status: 403 }
      );
    }

    // Ensure the new owner is a member
    const isMember = circle.members.some((id: any) => id.toString() === targetUserId);
    if (!isMember) {
      return NextResponse.json(
        { message: "New owner must be a member of the circle" },
        { status: 400 }
      );
    }

    // Transfer logic
    // 1. Demote current owner to admin
    if (!circle.admins.includes(circle.owner)) {
      circle.admins.push(circle.owner);
    }

    // 2. Set new owner
    circle.owner = targetUserId;

    // 3. Remove new owner from admins or moderators if they are there
    circle.admins = circle.admins.filter((id: any) => id.toString() !== targetUserId);
    circle.moderators = circle.moderators.filter((id: any) => id.toString() !== targetUserId);

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Ownership transferred successfully",
    });
  } catch (error) {
    console.error("TRANSFER OWNERSHIP ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
