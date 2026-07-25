import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Collection from "../../../../../lib/models/artCollection";
import Post from "../../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";
import mongoose from "mongoose";

/**
 * Recalculate a collection's top3Emotions by aggregating from all its posts.
 */
async function recalculateCollectionEmotions(collectionId: string) {
  const collection = await Collection.findById(collectionId).populate("posts");
  if (!collection) return;

  const emotionMap: Record<string, { total: number; count: number }> = {};

  for (const post of collection.posts) {
    if (post.top3Emotions && post.top3Emotions.length > 0) {
      for (const em of post.top3Emotions) {
        if (!em.emotion) continue;
        if (!emotionMap[em.emotion]) {
          emotionMap[em.emotion] = { total: 0, count: 0 };
        }
        emotionMap[em.emotion].total += em.score || 0;
        emotionMap[em.emotion].count += 1;
      }
    }
  }

  const averaged = Object.entries(emotionMap)
    .map(([emotion, { total, count }]) => ({
      emotion,
      score: Math.round((total / count) * 100) / 100,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  await Collection.findByIdAndUpdate(collectionId, {
    $set: { top3Emotions: averaged },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    const { postId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.author?.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    await Collection.findByIdAndUpdate(id, {
      $addToSet: { posts: postId },
    });

    // Also link the post back to this collection
    await Post.findByIdAndUpdate(postId, {
      $set: { artCollection: id },
    });

    // Recalculate emotions
    await recalculateCollectionEmotions(id);

    return NextResponse.json({
      success: true,
      message: "Post added to collection",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    const { postId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { message: "Invalid IDs" },
        { status: 400 }
      );
    }

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }

    if (collection.author?.toString() !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await Collection.findByIdAndUpdate(id, {
      $pull: { posts: postId },
    });

    // Unlink the post from this collection
    await Post.findByIdAndUpdate(postId, {
      $set: { artCollection: null },
    });

    // Recalculate emotions
    await recalculateCollectionEmotions(id);

    return NextResponse.json({
      success: true,
      message: "Post removed from collection",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}