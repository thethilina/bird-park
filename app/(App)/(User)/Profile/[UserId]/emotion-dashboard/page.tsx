"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function EmotionDashboard() {
  const { UserId } = useParams();

  const [data, setData] = useState<any>({
    posts: [],
    topEmotions: [],
    timeline: [],
    totalPosts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/analytics/user/${UserId}/emotions`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const json = await res.json();

        setData({
          posts: json.posts || [],
          topEmotions: json.topEmotions || [],
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

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading emotion dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6">

      {/* LEFT PANEL */}
      <div className="w-1/3 space-y-4">

        <h1 className="text-2xl font-bold">
          Emotion Profile
        </h1>

        <div className="bg-gray-900 p-4 rounded-xl">
          <p>Total Posts: {data.totalPosts}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          <h2 className="font-semibold mb-2">
            Top Emotions
          </h2>

          {data.topEmotions.length === 0 ? (
            <p className="text-gray-400">
              No emotion data yet
            </p>
          ) : (
            data.topEmotions.map((e: any) => (
              <div
                key={e.emotion}
                className="flex justify-between border-b border-gray-700 py-1"
              >
                <span>{e.emotion}</span>
                <span>{e.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 space-y-4">

        <h2 className="text-xl font-bold">
          Emotion Timeline
        </h2>

        {data.posts.length === 0 ? (
          <p className="text-gray-400">
            No posts yet
          </p>
        ) : (
          <div className="space-y-4">

            {data.posts.map((post: any) => {
              const emotion =
                data.timeline.find(
                  (t: any) =>
                    t.postId === post._id
                )?.emotion || "unknown";

              return (
                <div
                  key={post._id}
                  className="bg-gray-900 rounded-xl p-4 flex gap-4"
                >

                  {/* IMAGE */}
                  <div className="w-24 h-24 relative">
                    <Image
                      src={post.media?.url}
                      alt={post.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold">
                      {post.title}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {new Date(
                        post.createdAt
                      ).toDateString()}
                    </p>

                    <span className="mt-1 text-blue-400">
                      {emotion}
                    </span>
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