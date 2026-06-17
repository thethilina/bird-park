
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Artist from "../../../../lib/models/Artist";
import connectDB from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { username, fullName, email, password, birthday, profileImage } =
      await req.json();

    if (!username || !fullName || !email || !password || !birthday || !profileImage) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await Artist.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email or Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const artist = await Artist.create({
      username,
      fullName,
      email,
      password: hashedPassword,
      birthday,
      profileImage,
    });

    const safeArtist = {
      _id: artist._id,
      username: artist.username,
      fullName: artist.fullName,
      email: artist.email,
      birthday: artist.birthday,
      profileImage: artist.profileImage,
    };

    const token = jwt.sign(
      { id: artist._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        artist: safeArtist,
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}