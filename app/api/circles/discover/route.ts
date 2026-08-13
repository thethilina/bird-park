import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import Circle from "@/lib/models/Circle";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

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

    const user = await Artist.findById(userObjectId)
      .select("_id currentCategory circles")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // PAGINATION
    // ============================================================

    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 10,
        1
      ),
      30
    );

    // ============================================================
    // CIRCLES USER ALREADY BELONGS TO
    //
    // These MUST NEVER appear.
    // ============================================================

    const joinedCircleIds = (user.circles || []).map(
      (id: any) => new mongoose.Types.ObjectId(id)
    );

    // ============================================================
    // GET CIRCLES
    //
    // No emotional matching here.
    // This endpoint is purely for discovery.
    // ============================================================

    const circles = await Circle.find({
      _id: {
        $nin: joinedCircleIds,
      },
    })
      .select(
        "_id name description image icon creator owner admins moderators members joinType category createdAt"
      )
      .lean();

    // ============================================================
    // SCORE FOR DISCOVERY
    //
    // This is NOT a recommendation based on emotions.
    //
    // We simply give small boosts to:
    // - populated circles
    // - newer circles
    // - user's artist category
    // ============================================================

    const ranked = circles.map((circle: any) => {
      let popularityScore = 0;
      let activityScore = 0;
      let categoryScore = 0;

      // ----------------------------------------------------------
      // POPULARITY
      // ----------------------------------------------------------

      const memberCount = Array.isArray(circle.members)
        ? circle.members.length
        : 0;

      if (memberCount >= 100) {
        popularityScore = 20;
      } else if (memberCount >= 50) {
        popularityScore = 16;
      } else if (memberCount >= 20) {
        popularityScore = 12;
      } else if (memberCount >= 10) {
        popularityScore = 8;
      } else if (memberCount >= 5) {
        popularityScore = 5;
      } else if (memberCount > 0) {
        popularityScore = 2;
      }

      // ----------------------------------------------------------
      // RECENCY
      // ----------------------------------------------------------

      if (circle.createdAt) {
        const age =
          Date.now() -
          new Date(circle.createdAt).getTime();

        const days =
          age / (1000 * 60 * 60 * 24);

        if (days <= 7) {
          activityScore = 15;
        } else if (days <= 30) {
          activityScore = 10;
        } else if (days <= 90) {
          activityScore = 5;
        } else {
          activityScore = 1;
        }
      }

      // ----------------------------------------------------------
      // CATEGORY
      //
      // Small boost only.
      // This is not emotional matching.
      // ----------------------------------------------------------

      if (
        user.currentCategory &&
        circle.category &&
        normalize(user.currentCategory) ===
          normalize(circle.category)
      ) {
        categoryScore = 5;
      }

      // ----------------------------------------------------------
      // FINAL DISCOVERY SCORE
      // ----------------------------------------------------------

      const finalScore =
        popularityScore +
        activityScore +
        categoryScore;

      return {
        ...circle,

        recommendation: {
          score: finalScore,

          popularityScore,
          activityScore,
          categoryScore,

          memberCount,
        },
      };
    });

    // ============================================================
    // SORT
    // ============================================================

    ranked.sort((a, b) => {
      // Primary: discovery score
      if (
        b.recommendation.score !==
        a.recommendation.score
      ) {
        return (
          b.recommendation.score -
          a.recommendation.score
        );
      }

      // Secondary: newest
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    // ============================================================
    // RETURN
    // ============================================================

    const results = ranked.slice(0, limit);

    return NextResponse.json({
      success: true,

      type: "discovery",

      title: "Discover Circles",

      circles: results,

      hasMore: ranked.length > limit,
    });
  } catch (error) {
    console.error(
      "[CIRCLE_DISCOVERY_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to discover circles",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// NORMALIZE
// ============================================================

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}