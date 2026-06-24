import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Collection from "../../../../lib/models/artCollection";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";
import "../../../../lib/models/Artist";
import  "../../../../lib/models/Post";
export const runtime = "nodejs";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
console.log("MODELS IN REGISTRY:", mongoose.models);

    const { id } = await params;
    console.log("[GET] Fetching collection:", { id });

    const collection = await Collection.findById(id)
      .populate("author", "username fullName profileImage")
      .populate("posts");

    if (!collection) {
      console.log("[GET] Collection not found:", { id });
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    console.log("[GET] Collection found:", { id, collection });
    return NextResponse.json({
      success: true,
      collection,
    });
  } catch (error) {
    console.error("[GET] Error:", error);
    return NextResponse.json(
      { message: "Server error"  },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { id } = await params;

    const body = await req.json();

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

    const updated = await Collection.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      collection: updated,
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

    await collection.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Collection deleted",
    });
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}