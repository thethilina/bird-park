import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Circle from "../../../lib/models/Circle";
import { getCurrentUserId } from "../../../lib/getCurrentUser";
import '../../../lib/models/Artist'

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();

    const { name, description, image, joinType, rules, category } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name required" },
        { status: 400 }
      );
    }

    const circle = await Circle.create({
      name,
      description,
      image,
      creator: userId,
      owner: userId,
      joinType: joinType || "open",
      rules: rules || [],
      category,
      members: [userId],
      admins: [userId],
    });

    return NextResponse.json({
      success: true,
      circle,
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  const circles = await Circle.find()
    .populate("owner", "username fullName profileImage")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    circles,
  });
}