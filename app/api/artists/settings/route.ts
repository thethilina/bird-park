import { NextResponse } from "next/server";

import Artist from "../../../../lib/models/Artist";
import connectDB from "../../../../lib/db";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const userId =
      await getCurrentUserId();

    const {
      fullName,
      bio,
      birthday,
      profileImage,
      username,
    } = await req.json();

    if (
      fullName &&
      fullName.trim().length < 2
    ) {
      return NextResponse.json(
        {
          message:
            "Full name must be at least 2 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (username && username.trim().length < 3) {
      return NextResponse.json(
        {
          message:
            "Username must be at least 3 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        {
          message:
            "Bio cannot exceed 500 characters",
        },
        {
          status: 400,
        }
      );
    }

    const updatedArtist =
      await Artist.findByIdAndUpdate(
        userId,
        {
          ...(fullName && {
            fullName,
          }),

          ...(bio !== undefined && {
            bio,
          }),

          ...(birthday && {
            birthday,
          }),

          ...(profileImage && {
            profileImage,
          }), 

          ...(username && {
            username,
          }),
        },
        {
          new: true,
        }
      ).select("-password");

    return NextResponse.json({
      success: true,
      artist: updatedArtist,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }
}