"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function EmotionDashboard() {
  const { UserId } = useParams();

  const [data, setData] = useState<any>({
    posts: [],
    topClusters: [],
    timeline: [],
    totalPosts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/analytics/user/${UserId}/emotions`);

        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const json = await res.json();

        setData({
          posts: json.posts || [],
          topClusters: json.topClusters || [],
          timeline: json.timeline || [],
          totalPosts: json.totalPosts || 0,
        });
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (UserId) {
      fetchData();
    }
  }, [UserId]);

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="p-6 sm:p-10 text-(--foreground)">
        Loading creative profile...
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 text-(--foreground)">

      {/* =====================================================
          LEFT PANEL
      ===================================================== */}

      <div className="w-full md:w-1/3 space-y-4">

        <h1 className="text-xl sm:text-2xl font-bold">
          Creative Experience Profile
        </h1>

        {/* Total Posts */}

        <div className="bg-(--colorbg) border border-(--border) p-4 rounded-xl">

          <p className="text-(--text-muted) text-sm">
            Total Creations
          </p>

          <p className="text-2xl font-bold mt-1">
            {data.totalPosts}
          </p>

        </div>

        {/* Top Clusters */}

        <div className="bg-(--colorbg) border border-(--border) p-4 rounded-xl">

          <h2 className="font-semibold mb-3">
            Recurring Human Experiences
          </h2>

          {data.topClusters.length === 0 ? (

            <p className="text-(--text-muted)">
              No semantic analysis yet
            </p>

          ) : (

            <div className="space-y-2">

              {data.topClusters.map((item: any) => (

                <div
                  key={item.cluster}
                  className="flex justify-between border-b border-(--border) py-2 gap-2"
                >

                  <span className="truncate">
                    {item.cluster}
                  </span>

                  <span className="text-(--text-muted) flex-shrink-0">
                    {item.count}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          RIGHT PANEL
      ===================================================== */}

      <div className="w-full md:w-2/3 space-y-4">

        <h2 className="text-lg sm:text-xl font-bold">
          Creative Journey
        </h2>

        {data.posts.length === 0 ? (

          <p className="text-(--text-muted)">
            No creations yet
          </p>

        ) : (

          <div className="space-y-4">

            {data.posts.map((post: any) => {

              // ------------------------------------------------
              // Find timeline entry
              // ------------------------------------------------

              const timelineItem = data.timeline.find(
                (item: any) => String(item.postId) === String(post._id)
              );

              const cluster =
                timelineItem?.cluster ||
                post.semanticAnalysis?.cluster ||
                "Awaiting analysis";

              const story =
                timelineItem?.story ||
                post.semanticAnalysis?.story ||
                null;

              // ------------------------------------------------
              // Render post
              // ------------------------------------------------

              return (
                <div
                  key={post._id}
                  className="bg-(--colorbg) border border-(--border) rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4"
                >

                  {/* =================================================
                      MEDIA
                  ================================================= */}

                  {post.type === "art" && post.media?.url ? (

                    <div className="w-16 h-16 sm:w-24 sm:h-24 relative flex-shrink-0">

                      <Image
                        src={post.media.url}
                        alt={post.title}
                        fill
                        className="object-cover rounded-lg"
                      />

                    </div>

                  ) : (

                    <div
                      className="
                      w-16 h-16 sm:w-24 sm:h-24
                      flex-shrink-0
                      rounded-lg
                      bg-(--colorbgdark1)
                      flex
                      items-center
                      justify-center
                      text-(--text-muted)
                      "
                    >

                      <span className="text-xs sm:text-sm">
                        Poem
                      </span>

                    </div>

                  )}


                  {/* =================================================
                      INFO
                  ================================================= */}

                  <div className="flex flex-col justify-center min-w-0 flex-1">

                    {/* Title */}

                    <h3 className="font-semibold truncate text-sm sm:text-base">
                      {post.title}
                    </h3>


                    {/* Type + Date */}

                    <p className="text-xs sm:text-sm text-(--text-muted) mt-1">

                      {post.type === "art" ? "Artwork" : "Poem"}

                      {" · "}

                      {new Date(post.createdAt).toDateString()}

                    </p>


                    {/* Cluster */}

                    <span className="mt-2 text-blue-400 text-xs sm:text-sm truncate">
                      {cluster}
                    </span>


                    {/* AI Story */}

                    {story && (

                      <p className="text-xs sm:text-sm text-(--text-muted) mt-2 line-clamp-2">
                        {story}
                      </p>

                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}