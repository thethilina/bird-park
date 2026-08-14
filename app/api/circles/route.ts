import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Circle from "@/lib/models/Circle";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

// ============================================================
// MY CIRCLES
//
// Returns only circles the current user actually belongs to,
// in ANY role: owner, creator, admin, moderator, or member.
//
// This is what powers "Circles you are in" in the sidebar.
// It should NEVER return circles the user hasn't joined —
// that's what the discover/resonate endpoints are for.
//
// Suggested path: /api/circles/route.ts (GET /api/circles)
// ============================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ============================================================
    // CURRENT USER
    // ============================================================

    const userId = await getCurrentUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ============================================================
    // GET CIRCLES WHERE THE USER HOLDS ANY ROLE
    //
    // $or across every role field — owner, creator, admins,
    // moderators, members. This is the mirror image of the
    // exclusion query used in discover/resonate (those use $ne
    // on all five fields to keep these OUT; this uses $or to
    // pull only these back IN).
    // ============================================================

    const circleQuery = {
      $or: [
        { owner: userObjectId },
        { creator: userObjectId },
        { admins: userObjectId },
        { moderators: userObjectId },
        { members: userObjectId },
      ],
    };

    const circles = await Circle.find(circleQuery)
      .select(
        "_id name description image icon creator owner admins moderators members joinType category createdAt"
      )
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      circles,
    });
  } catch (error) {
    console.error("[MY_CIRCLES_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load your circles",
      },
      {
        status: 500,
      }
    );
  }
}