import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Artist from "../../../../lib/models/Artist"
import connectDB from "../../../../lib/db";




export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } =
      await req.json();

    const artist =
      await Artist.findOne({ email });

    if (!artist) {
      return NextResponse.json(
        {
          message:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        artist.password
      );

    if (!isMatch) {
      return NextResponse.json(
        {
          message:
            "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const token = jwt.sign(
      {
        id: artist._id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set(
      "auth_token",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "strict",
        maxAge:
          60 * 60 * 24 * 30,
      }
    );

    response.cookies.set(
      "logged_in",
      "true",
      {
        httpOnly: false,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "strict",
        maxAge:
          60 * 60 * 24 * 30,
      }
    );

    return response;
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message:
          "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}