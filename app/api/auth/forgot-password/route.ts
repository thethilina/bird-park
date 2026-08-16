import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * POST /api/auth/forgot-password
 * Generates a reset token, stores it on the user, and emails a reset link.
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const artist = await Artist.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!artist) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Check if user is Google-only (no password set)
    if (artist.googleId && !artist.password) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Store hashed token with 1-hour expiry
    artist.resetPasswordToken = hashedToken;
    artist.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await artist.save();

    // Build the reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/ResetPassword?token=${resetToken}`;

    // Send the email
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
