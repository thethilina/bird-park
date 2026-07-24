import { NextResponse } from "next/server";

import Artist from "../../../../../lib/models/Artist";
import connectDB from "../../../../../lib/db";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const currentUserId =
      await getCurrentUserId();

    const { id } = await params;

    if (currentUserId !== id) {
      return NextResponse.json(
        {
          message:
            "You can only delete your own account",
        },
        {
          status: 403,
        }
      );
    }

    const artist =
      await Artist.findById(id);

    if (!artist) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    await Artist.findByIdAndDelete(id);

    const response =
      NextResponse.json({
        success: true,
        message:
          "Account deleted successfully",
      });

    response.cookies.set(
      "auth_token",
      "",
      {
        expires: new Date(0),
        path: "/",
      }
    );

    response.cookies.set(
      "logged_in",
      "",
      {
        expires: new Date(0),
        path: "/",
      }
    );

    return response;
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