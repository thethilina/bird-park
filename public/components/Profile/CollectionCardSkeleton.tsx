import React from "react";

export default function CollectionCardSkeleton() {
  return (
    <div className="w-full bg-(--colorbg) dark:bg-(--colorbgdark)  overflow-hidden animate-pulse border border-(--border) dark:border-(--borderdark) shadow-sm">
      {/* Cover image placeholder */}
      <div className="w-full aspect-square bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Info placeholder */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        {/* Description line 1 */}
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        {/* Description line 2 */}
        <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
      </div>
    </div>
  );
}
