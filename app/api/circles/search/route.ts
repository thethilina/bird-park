import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Circle from "@/lib/models/Circle";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";



export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const query = (searchParams.get("q") || "").trim();

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      50
    );

    if (!query) {
      return NextResponse.json({
        success: true,
        query: "",
        circles: [],
      });
    }



    const userId = await getCurrentUserId();

    const userObjectId =
      userId && mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;



    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedQuery, "i");


    const circles = await Circle.find({
      $or: [{ name: searchRegex }, { description: searchRegex }],
    })
      .select(
        "_id name description image icon creator owner admins moderators members joinType category createdAt"
      )
      .limit(limit)
      .lean();


    const results = circles.map((circle: any) => {
      let isMember = false;

      if (userObjectId) {
        const idStr = userObjectId.toString();

        isMember = [
          circle.owner,
          circle.creator,
          ...(circle.admins || []),
          ...(circle.moderators || []),
          ...(circle.members || []),
        ]
          .filter(Boolean)
          .some((id: any) => id.toString() === idStr);
      }

      const memberCount = new Set(
        [
          circle.owner,
          circle.creator,
          ...(circle.admins || []),
          ...(circle.moderators || []),
          ...(circle.members || []),
        ]
          .filter(Boolean)
          .map((id: any) => id.toString())
      ).size;

      return {
        ...circle,
        isMember,
        memberCount,
      };
    });

    return NextResponse.json({
      success: true,
      query,
      circles: results,
    });
  } catch (error) {
    console.error("[CIRCLE_SEARCH_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search circles",
      },
      {
        status: 500,
      }
    );
  }
}