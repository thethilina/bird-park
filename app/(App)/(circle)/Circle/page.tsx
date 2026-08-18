"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
}

export default function Page() {
  const router = useRouter();

  const [recommended, setRecommended] = useState<Circle[]>([]);
  const [suggestions, setSuggestions] = useState<Circle[]>([]);

  const [loadingRecommended, setLoadingRecommended] =
    useState(true);

  const [loadingSuggestions, setLoadingSuggestions] =
    useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const [recommendedRes, suggestionsRes] =
          await Promise.all([
            fetch("/api/circles/recommended"),
            fetch("/api/circles/discover"),
          ]);

        if (recommendedRes.ok) {
          const data = await recommendedRes.json();

          setRecommended(
            data.circles || []
          );
        }

        if (suggestionsRes.ok) {
          const data = await suggestionsRes.json();

          setSuggestions(
            data.circles || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch circles:",
          error
        );
      } finally {
        setLoadingRecommended(false);
        setLoadingSuggestions(false);
      }
    };

    fetchCircles();
  }, []);

  const openCircle = (circleId: string) => {
    router.push(`/Circle/${circleId}`);
  };

  return (
    <div className="pt-5  px-3 md:px-5 pb-15 ">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-(--foreground)">
          Discover Circles
        </h1>

        <p className="mt-2 text-(--text-muted)">
          Find creative spaces where your interests,
          emotions and people intersect.
        </p>
      </div>


      {/* =====================================================
          RECOMMENDED FOR YOU
      ===================================================== */}

      <section className="mb-12">

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-(--foreground)">
            Circles for You
          </h2>

          <p className="text-sm text-(--text-muted) mt-1">
            Communities that resonate with your creative
            interests and emotional profile.
          </p>
        </div>


        {loadingRecommended ? (
          <CircleSkeleton />
        ) : recommended.length === 0 ? (
          <EmptyState
            text="No personalized circles yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {recommended.map((circle) => (
              <CircleCard
                key={circle._id}
                circle={circle}
                onClick={() =>
                  openCircle(circle._id)
                }
              />
            ))}

          </div>
        )}

      </section>


      {/* =====================================================
          MORE SUGGESTIONS
      ===================================================== */}

      <section>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-(--foreground)">
            More Circles to Explore
          </h2>

          <p className="text-sm text-(--text-muted) mt-1">
            Discover communities connected to people
            around you.
          </p>
        </div>


        {loadingSuggestions ? (
          <CircleSkeleton />
        ) : suggestions.length === 0 ? (
          <EmptyState
            text="No more circles to discover."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {suggestions.map((circle) => (
              <CircleCard
                key={circle._id}
                circle={circle}
                onClick={() =>
                  openCircle(circle._id)
                }
              />
            ))}

          </div>
        )}

      </section>

    </div>
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
        border border-(--border)
        bg-(--colorbg)
        transition-all
        duration-300
        hover:bg-(--hover)
        hover:-translate-y-1
      "
    >

      {/* COVER */}

      <div className="relative h-36 w-full overflow-hidden bg-(--colorbgdark1)">

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
              from-(--colorbg)
              to-(--colorbgdark1)
            "
          >
            <span className="text-4xl">
              ◌
            </span>
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
              border-(--colorbg)
              bg-(--colorbgdark1)
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

          <h3 className="text-lg font-semibold text-(--foreground)">
            {circle.name}
          </h3>

          {circle.category && (
            <span className="mt-1 inline-block text-xs text-gray-500">
              {circle.category}
            </span>
          )}

        </div>


        {circle.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-(--text-muted)">
            {circle.description}
          </p>
        )}


        {/* EMOTIONS */}

        {circle.topEmotions &&
          circle.topEmotions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">

              {circle.topEmotions
                .slice(0, 3)
                .map((emotion) => (
                  <span
                    key={emotion.emotion}
                    className="
                      rounded-full
                      bg-(--colorbgdark1)
                      px-3
                      py-1
                      text-xs
                      text-(--text-muted)
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
            {circle.members?.length || 0} members
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="
              rounded-lg
              bg-(--primary)
              px-4
              py-2
              text-sm
              font-medium
              text-(--background)
              transition
              hover:opacity-90
            "
          >
            Explore
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

function EmptyState({
  text,
}: {
  text: string;
}) {
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