"use client";
import React from "react";
import Link from "next/link";
import { IoImagesOutline } from "react-icons/io5";

function CollectionCard({ collection }: any) {
  // Cover: explicit coverImage, or first post's media, or null
  const coverSrc =
    collection.coverImage ||
    collection.posts?.find((p: any) => p?.media?.url)?.media?.url ||
    null;

  const postCount = collection.posts?.length ?? 0;

  return (
    <Link href={`/Collection/${collection._id}`}>
      <div className="w-full bg-(--colorbg) dark:bg-(--colorbgdark) rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200 border border-(--border) dark:border-(--borderdark)">
        {/* Cover */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#0d1725]">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={collection.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--text-muted)">
              <IoImagesOutline size={40} className="opacity-30" />
            </div>
          )}
          {/* Post count badge */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {postCount} {postCount === 1 ? "work" : "works"}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h2 className="text-base font-semibold truncate">{collection.title}</h2>
          {collection.description && (
            <p className="text-sm text-(--text-muted) dark:text-(--text-muted-dark) line-clamp-2">
              {collection.description}
            </p>
          )}
          
          {/* Emotions */}
          {collection.top3Emotions && collection.top3Emotions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {collection.top3Emotions.map((em: any, i: number) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium capitalize"
                >
                  {em.emotion} ({Math.round(em.score * 100)}%)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CollectionCard;