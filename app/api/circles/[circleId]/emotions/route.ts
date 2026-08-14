import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import Post from "../../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";

export const runtime = "nodejs";

// GET /api/circles/[circleId]/emotions
// Returns circle emotion analytics for owners and admins.
//
// "Emotions" here are the semantic clusters (e.g. "Loss & absence",
// "Love & connection") that the AI pipeline writes into
// post.semanticAnalysis.cluster after a post is analyzed.
// We aggregate these across all circle posts to show the
// dominant creative themes of the circle community.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId).lean() as any;

    if (!circle) {
      return NextResponse.json({ message: "Circle not found" }, { status: 404 });
    }

    // Only owner or admins can access emotion analytics
    const isOwner = circle.owner?.toString() === userId;
    const isAdmin = circle.admins?.some((id: any) => id.toString() === userId);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ── Fetch all posts in this circle ──────────────────────────────────────
    const posts = await Post.find({ circle: circleId })
      .populate("author", "username fullName profileImage")
      .select("author type emotionAnalysis semanticAnalysis createdAt")
      .sort({ createdAt: -1 })
      .lean() as any[];

    // ── Aggregate clusters from semanticAnalysis.cluster ───────────────────
    // The AI pipeline writes a cluster string (e.g. "Loss & absence") to
    // post.semanticAnalysis.cluster when analysis completes.
    // We tally these up with recency weighting (newest posts count more).
    const clusterScores: Record<string, number> = {};

    const analyzedPosts = posts.filter(
      (p) => p.emotionAnalysis?.status === "completed" && p.semanticAnalysis?.cluster
    );

    analyzedPosts.forEach((post, index) => {
      const cluster = post.semanticAnalysis?.cluster;
      if (!cluster) return;
      // Recency weight: newest = highest weight
      const weight = analyzedPosts.length - index;
      clusterScores[cluster] = (clusterScores[cluster] || 0) + weight;
    });

    // Normalise to 0–100 scale so scores are readable
    const maxRaw = Math.max(...Object.values(clusterScores), 1);
    const topEmotions = Object.entries(clusterScores)
      .map(([emotion, raw]) => ({
        emotion,
        score: parseFloat(((raw / maxRaw) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // ── Per-member stats ────────────────────────────────────────────────────
    const memberMap = new Map<
      string,
      {
        _id: string;
        fullName: string;
        username: string;
        profileImage?: string;
        totalPosts: number;
        analyzed: number;
        pending: number;
        failed: number;
        topCluster?: string;
      }
    >();

    for (const post of posts) {
      const author = post.author;
      if (!author || !author._id) continue;

      const authorId = author._id.toString();
      const status = post.emotionAnalysis?.status ?? "pending";

      if (!memberMap.has(authorId)) {
        memberMap.set(authorId, {
          _id: authorId,
          fullName: author.fullName || author.username || "Unknown",
          username: author.username || "",
          profileImage: author.profileImage,
          totalPosts: 0,
          analyzed: 0,
          pending: 0,
          failed: 0,
        });
      }

      const entry = memberMap.get(authorId)!;
      entry.totalPosts += 1;

      if (status === "completed") {
        entry.analyzed += 1;
        // Track the most recent cluster for this member
        if (!entry.topCluster && post.semanticAnalysis?.cluster) {
          entry.topCluster = post.semanticAnalysis.cluster;
        }
      } else if (status === "failed") {
        entry.failed += 1;
      } else {
        entry.pending += 1;
      }
    }

    const memberStats = Array.from(memberMap.values()).sort(
      (a, b) => b.totalPosts - a.totalPosts
    );

    // ── Summary counts ──────────────────────────────────────────────────────
    const totalAnalyzed = posts.filter(
      (p) => p.emotionAnalysis?.status === "completed"
    ).length;
    const totalPending = posts.filter(
      (p) =>
        p.emotionAnalysis?.status === "pending" ||
        p.emotionAnalysis?.status === "processing"
    ).length;
    const totalFailed = posts.filter(
      (p) => p.emotionAnalysis?.status === "failed"
    ).length;

    return NextResponse.json({
      success: true,
      topEmotions,
      emotionHistory: (circle.emotionHistory ?? [])
        .slice()
        .reverse()
        .slice(0, 30),
      memberStats,
      summary: {
        totalPosts: posts.length,
        totalAnalyzed,
        totalPending,
        totalFailed,
      },
    });
  } catch (error) {
    console.error("[CIRCLE_EMOTIONS_ERROR]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
