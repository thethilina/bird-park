"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Circle {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  category?: string;
  topEmotions?: {
    emotion: string;
    score: number;
  }[];
  members?: string[];
  isMember?: boolean;
  memberCount?: number;
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/circles/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.circles || []);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const openCircle = (circleId: string) => {
    router.push(`/Circle/${circleId}`);
  };

  return (
    <div className="pt-5 px-10 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-white">
          Search Results
        </h1>
        <p className="mt-2 text-gray-400">
          Showing results for <span className="text-white font-medium">"{query}"</span>
        </p>
      </div>

      <section>
        {loading ? (
          <CircleSkeleton />
        ) : results.length === 0 ? (
          <EmptyState text={query ? "No circles found for this search." : "Enter a search term to find circles."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {results.map((circle) => (
              <CircleCard
                key={circle._id}
                circle={circle}
                onClick={() => openCircle(circle._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

/* ============================================================
   CIRCLE CARD
============================================================ */

function CircleCard({
  circle,
  onClick,
}: {
  circle: Circle;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-[#111111]
        transition-all
        duration-300
        hover:border-white/20
        hover:bg-[#161616]
        hover:-translate-y-1
      "
    >
      {/* COVER */}
      <div className="relative h-36 w-full overflow-hidden bg-[#1c1c1c]">
        {circle.image ? (
          <img
            src={circle.image}
            alt={circle.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              h-full
              w-full
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#242424]
              to-[#101010]
            "
          >
            <span className="text-4xl">◌</span>
          </div>
        )}

        {/* ICON */}
        {circle.icon && (
          <div
            className="
              absolute
              bottom-[-18px]
              left-5
              h-14
              w-14
              overflow-hidden
              rounded-xl
              border-4
              border-[#111111]
              bg-[#222]
            "
          >
            <img
              src={circle.icon}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className={circle.icon ? "mt-3" : ""}>
          <h3 className="text-lg font-semibold text-white">
            {circle.name}
          </h3>
          {circle.category && (
            <span className="mt-1 inline-block text-xs text-gray-500">
              {circle.category}
            </span>
          )}
        </div>

        {circle.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400">
            {circle.description}
          </p>
        )}

        {/* EMOTIONS */}
        {circle.topEmotions && circle.topEmotions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {circle.topEmotions.slice(0, 3).map((emotion) => (
              <span
                key={emotion.emotion}
                className="
                  rounded-full
                  bg-white/5
                  px-3
                  py-1
                  text-xs
                  text-gray-400
                "
              >
                {emotion.emotion}
              </span>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {circle.memberCount ?? circle.members?.length ?? 0} members
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="
              rounded-lg
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-black
              transition
              hover:bg-gray-200
            "
          >
            {circle.isMember ? "View" : "Explore"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function CircleSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-white/5
            bg-[#111111]
            animate-pulse
          "
        >
          <div className="h-36 bg-white/5" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-1/2 rounded bg-white/5" />
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-4/5 rounded bg-white/5" />
            <div className="h-8 w-20 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/5
        bg-[#111111]
        px-6
        py-12
        text-center
      "
    >
      <p className="text-sm text-gray-500">
        {text}
      </p>
    </div>
  );
}