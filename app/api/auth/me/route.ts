import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const token = (await cookies()).get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    const user = await Artist.findById(decoded.id)
      .select("-password");

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });

  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}