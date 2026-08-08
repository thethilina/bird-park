"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaFeatherAlt } from "react-icons/fa";
import GalleryC from "./GalleryC";

interface Post {
  _id: string;
  type: "art" | "poem";
  title: string;
  body?: string;
  media?: {
    url: string;
  };
}

interface CircleGalleryProps {
  circleId: string;
}

export default function CircleGallery({
  circleId,
}: CircleGalleryProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || !circleId) return;

    setLoading(true);

    try {
      const lastPost = posts[posts.length - 1];

      const params = new URLSearchParams();

      params.set("limit", "10");

      if (lastPost) {
        params.set("cursor", lastPost._id);
      }

      const url = `/api/circles/${circleId}/posts?${params.toString()}`;

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        console.error(
          "Failed to fetch circle posts:",
          errorData
        );

        return;
      }

      const data = await res.json();

      if (data.success) {
        setPosts((prev) => {
          const map = new Map<string, Post>();

          [...prev, ...data.posts].forEach((post: Post) => {
            map.set(post._id, post);
          });

          return Array.from(map.values());
        });

        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching circle posts:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [circleId, posts, loading, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchPosts();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchPosts]);

  return (
    <div className="px-10">
      <h1 className="text-2xl">
        Community works
      </h1>

      <div className="flex flex-col flex-1 items-center pt-5 px-2 w-full">

        {/* INITIAL LOADING */}
        {initialLoading ? (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-md overflow-hidden animate-pulse bg-gray-200 dark:bg-neutral-800"
              >
                <div
                  className="w-full bg-gray-300 dark:bg-neutral-700"
                  style={{
                    height: `${200 + (i % 4) * 80}px`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (

          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center w-full min-h-[400px] text-center">

            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 mb-5">
              <FaFeatherAlt
                className="text-3xl text-gray-400 dark:text-neutral-500"
              />
            </div>

            <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">
              No works yet
            </h2>

            <p className="mt-2 max-w-md text-lg text-gray-500 dark:text-neutral-500">
              This circle hasn't shared any creative works yet.
              Be the first to contribute something.
            </p>

          </div>

        ) : (

          /* POSTS */
          <>
            <GalleryC posts={posts} />

            {/* BOTTOM LOADER */}
            <div
              ref={loaderRef}
              className="w-full flex justify-center py-8"
            >
              {loading && (
                <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-3 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10 w-full">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="break-inside-avoid rounded-md overflow-hidden animate-pulse bg-gray-200 dark:bg-neutral-800"
                    >
                      <div
                        className="w-full bg-gray-300 dark:bg-neutral-700"
                        style={{
                          height: `${180 + (i % 3) * 80}px`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {!hasMore && !loading && (
                <p className="text-sm text-gray-500 py-5">
                  You've reached the end.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}