"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Gallery from "@/public/components/Gallery";
import { useAuth } from "@/contexts/AuthContext";


interface Post {
  _id: string;
  type: "art" | "poem";
  title: string;
  body?: string;
  media?: {
    url: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
const {user, loading: authLoading} = useAuth();

console.log("HOME AUTH:", {
  user,
  authLoading
});
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const lastPost = posts[posts.length - 1];

      const url = lastPost
        ? `/api/post?cursor=${lastPost._id}&limit=10`
        : `/api/post?limit=5`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
setPosts((prev) => {
  const map = new Map();

  [...prev, ...data.posts].forEach((post) => {
    map.set(post._id, post);
  });

  return Array.from(map.values());
});        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [posts, loading, hasMore]);

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
    <div className="flex flex-col flex-1 items-center pt-5 px-2 w-full">
      {initialLoading ? (
        <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10 w-full">
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
      ) : (
        <>
          <Gallery posts={posts} />

          {/* Bottom Loader */}
          <div
            ref={loaderRef}
            className="w-full flex justify-center py-8"
          >
            {loading && (
              <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10 w-full">
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

            {!hasMore && (
              <p className="text-sm text-gray-500 py-5">
                You've reached the end.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}