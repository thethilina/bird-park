import React from "react";

interface ConnectionCardSkeletonProps {
  buttonCount?: number;
}

export default function ConnectionCardSkeleton({ buttonCount = 1 }: ConnectionCardSkeletonProps) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/20 animate-pulse shadow-sm">
      {/* Profile Image Skeleton */}
      <div className="w-full h-50 bg-neutral-200 dark:bg-neutral-800" />
      
      {/* Content Skeleton */}
      <div className="space-y-4 px-4 py-4">
        {/* Username line */}
        <div className="h-6 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        
        {/* Buttons */}
        <div className="space-y-2 pt-2">
          {Array.from({ length: buttonCount }).map((_, idx) => (
            <div 
              key={idx} 
              className="h-10 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
