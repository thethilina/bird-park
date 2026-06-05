import { NextResponse } from "next/server";

import Artist from "../../../../lib/models/Artist";
import connectDB from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    const artist = await Artist.findById(id)
      .select(
        "username fullName bio profileImage currentCategory currentTop3Emotions createdAt"
      )
      .populate("connections", "username fullName profileImage");

    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      artist,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }
}