import { NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import Circle from "../../../../../../lib/models/Circle";
import Post from "../../../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../../../lib/getCurrentUser";

// PATCH /api/circles/[circleId]/posts/[postId]  — edit a circle post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ circleId: string; postId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId, postId } = await params;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Allow edit: post author, or admin/mod/owner of circle
    const isAuthor = post.author.toString() === userId;
    const isPrivileged =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId);

    if (!isAuthor && !isPrivileged) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, body } = await req.json();

    if (title !== undefined) post.title = title;
    if (body !== undefined) post.body = body;

    await post.save();

    return NextResponse.json({
      success: true,
      post,
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/circles/[circleId]/posts/[postId]  — delete a circle post
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ circleId: string; postId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId, postId } = await params;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const isAuthor = post.author.toString() === userId;
    const isPrivileged =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId) ||
      circle.moderators.some((id: any) => id.toString() === userId);

    if (!isAuthor && !isPrivileged) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Remove from circle's posts array
    circle.posts = circle.posts.filter((id: any) => id.toString() !== postId);
    await circle.save();

    await post.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Post deleted",
    });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
