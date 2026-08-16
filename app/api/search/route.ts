import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Artist from "@/lib/models/Artist";
import Post from "@/lib/models/Post";
import artCollection from "@/lib/models/artCollection";
import Circle from "@/lib/models/Circle";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({
        success: true,
        query: "",
        users: [],
        posts: [],
        collections: [],
        circles: [],
      });
    }

    const currentUserId = await getCurrentUserId();

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedQuery, "i");

    // ============================================================
    // USERS
    // ============================================================

    const users = await Artist.find({
      $or: [
        { fullName: searchRegex },
        { username: searchRegex },
        { bio: searchRegex },
      ],
    })
      .select("_id fullName username profileImage bio currentCategory connections")
      .limit(20)
      .lean();

    const usersWithMeta = users.map((user: any) => ({
      ...user,
      connectionCount: (user.connections || []).length,
      isCurrentUser: currentUserId
        ? user._id.toString() === currentUserId.toString()
        : false,
    }));

    // ============================================================
    // POSTS
    // ============================================================

    const posts = await Post.find({
      $or: [{ title: searchRegex }, { body: searchRegex }],
      visibility: "public",
    })
      .select("_id title body type media poemStyle author hearts createdAt")
      .populate("author", "_id fullName username profileImage")
      .limit(20)
      .lean();

    // ============================================================
    // COLLECTIONS
    // ============================================================

    const collections = await artCollection.find({
      $or: [{ title: searchRegex }, { description: searchRegex }],
    })
      .select("_id title description coverImage author artistCategory top3Emotions createdAt posts")
      .populate("author", "_id fullName username profileImage")
      .limit(20)
      .lean();

    const collectionsWithMeta = collections.map((col: any) => ({
      ...col,
      postCount: (col.posts || []).length,
    }));

    // ============================================================
    // CIRCLES
    // ============================================================

    const userObjectId =
      currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)
        ? new mongoose.Types.ObjectId(currentUserId)
        : null;

    const circles = await Circle.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    })
      .select("_id name description image icon category members admins moderators owner creator joinType")
      .limit(20)
      .lean();

    const circlesWithMeta = circles.map((circle: any) => {
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
      return { ...circle, isMember, memberCount };
    });

    return NextResponse.json({
      success: true,
      query,
      users: usersWithMeta,
      posts,
      collections: collectionsWithMeta,
      circles: circlesWithMeta,
    });
  } catch (error) {
    console.error("[GLOBAL_SEARCH_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to search" },
      { status: 500 }
    );
  }
}
