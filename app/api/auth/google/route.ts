import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";

export const runtime = "nodejs";

/**
 * POST /api/auth/google
 * Receives a Google ID token from the frontend, verifies it,
 * and either logs in the existing user or creates a new one.
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { message: "Missing Google credential" },
        { status: 400 }
      );
    }

    // Verify the Google ID token using Google's tokeninfo endpoint
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!googleRes.ok) {
      return NextResponse.json(
        { message: "Invalid Google token" },
        { status: 401 }
      );
    }

    const googleUser = await googleRes.json();
    const { sub: googleId, email, name, picture } = googleUser;

    if (!email) {
      return NextResponse.json(
        { message: "Google account has no email" },
        { status: 400 }
      );
    }

    // Try to find existing artist by googleId or email
    let artist = await Artist.findOne({
      $or: [{ googleId }, { email }],
    });

    if (artist) {
      // Link googleId if not already set
      if (!artist.googleId) {
        artist.googleId = googleId;
        await artist.save();
      }
    } else {
      // Create a new artist from Google profile
      // Generate a unique username from the email prefix
      let baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (await Artist.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      artist = await Artist.create({
        username,
        fullName: name || username,
        email,
        googleId,
        profileImage: picture || undefined,
        birthday: undefined,
      });
    }

    // Issue JWT (same as normal login)
    const token = jwt.sign(
      { id: artist._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({
      success: true,
      artist: {
        _id: artist._id,
        username: artist.username,
        fullName: artist.fullName,
        email: artist.email,
        profileImage: artist.profileImage,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("logged_in", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
