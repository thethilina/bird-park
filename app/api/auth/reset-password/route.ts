import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import { isPasswordAcceptable } from "@/lib/passwordStrength";

export const runtime = "nodejs";

/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Check password strength
    if (!isPasswordAcceptable(password)) {
      return NextResponse.json(
        { message: "Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols." },
        { status: 400 }
      );
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const artist = await Artist.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!artist) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update password and clear reset fields
    artist.password = await bcrypt.hash(password, 10);
    artist.resetPasswordToken = undefined;
    artist.resetPasswordExpires = undefined;
    await artist.save();

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
