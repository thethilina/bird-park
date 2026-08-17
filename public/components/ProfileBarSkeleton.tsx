import React from 'react'

function ProfileBarSkeleton() {
  return (
    <div className='space-y-6 border-b-2 border-(--border) dark:border-(--borderdark) py-6 w-full bg-(--color-background) dark:bg-(--background) relative'>
      
      {/* Profile info row */}
      <div className="w-full flex flex-row items-center justify-between gap-y-4">
        <div className='flex gap-x-4 items-center'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-(--border) dark:border-(--borderdark) bg-gray-300 dark:bg-gray-700 animate-pulse shrink-0'></div>
          <div className='space-y-2'>
            <div className='h-5 sm:h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
            <div className='h-4 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          </div>
        </div>

        {/* Desktop Connections & Observers Skeleton */}
        <div className='hidden sm:flex items-center text-xl gap-x-10'>
          <div className='h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
        </div>

        {/* Mobile Hamburger Menu Icon Skeleton (Top Right) */}
        <div className="flex sm:hidden justify-end">
          <div className="size-6 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Mobile Connections & Observers Skeleton Row */}
      <div className='flex sm:hidden items-center text-lg gap-x-6 justify-start'>
        <div className='h-5 w-28 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
        <div className='h-5 w-28 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
      </div>

      {/* Profile actions and navigation tabs row */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 pt-2 relative">
        
        {/* Action Button Skeleton (Full width on mobile) */}
        <div className="w-full sm:w-auto">
          <div className='w-full sm:w-32 h-9 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full'></div>
        </div>

        {/* Works/Collections Tabs Skeleton (Full width on mobile) */}
        <div className='flex gap-x-3 py-2 px-2 border border-(--border) dark:border-(--borderdark) rounded-full items-center bg-gray-100 dark:bg-gray-800/50 animate-pulse w-full sm:w-auto justify-center'>
          <div className='flex-1 sm:flex-initial w-20 h-7 bg-gray-300 dark:bg-gray-700 rounded-full'></div>
          <div className='flex-1 sm:flex-initial w-24 h-7 bg-gray-300 dark:bg-gray-700 rounded-full'></div>
        </div>

        {/* Desktop Hamburger Icon Skeleton */}
        <div className="hidden sm:flex justify-end">
          <div className="size-6 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>

      </div>
    </div>
  )
}

export default ProfileBarSkeleton