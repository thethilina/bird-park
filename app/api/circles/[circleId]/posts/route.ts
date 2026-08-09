import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import Post from "../../../../../lib/models/Post";
import Artist from "../../../../../lib/models/Artist";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

// GET /api/circles/[circleId]/posts  — fetch all posts in this circle
export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    // Only members (or admins/mods) can view circle posts
    const isMember =
      circle.members.some((id: any) => id.toString() === userId) ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId) ||
      circle.owner.toString() === userId;

    if (!isMember) {
      return NextResponse.json({ message: "Not a member" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query: any = { circle: circleId, activity: null };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .populate("author", "username fullName profileImage")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const result = hasMore ? posts.slice(0, limit) : posts;

    return NextResponse.json({
      success: true,
      posts: result,
      hasMore,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/circles/[circleId]/posts  — submit art/poem to this circle
export async function POST(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const isMember = circle.members.some((id: any) => id.toString() === userId);

    if (!isMember) {
      return NextResponse.json({ message: "You must be a member to post" }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, media, poemStyle, body: postBody, visibility, activityId } = body;

    if (!title || !type) {
      return NextResponse.json({ message: "Title and type required" }, { status: 400 });
    }

    const post = await Post.create({
      author: userId,
      title,
      type,
      body: postBody,
      media,
      poemStyle,
      circle: circleId,
      activity: activityId || null,
      visibility: visibility === "public" ? "public" : "circle",
    });

    // Add post to circle's posts array
    circle.posts.push(post._id);
    await circle.save();

    const populated = await post.populate("author", "username fullName profileImage");

    return NextResponse.json({
      success: true,
      post: populated,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
