import React from 'react'

function ProfileBarSkeleton() {
  return (
    <div className='space-y-5 border-(--border) border-b-2 py-7 z-49 w-full bg-(--color-background) dark:bg-(--background)'>
      <div className="py-1 bg-(--color-background) w-full flex items-center justify-between">
        
        <div className='flex gap-x-4 items-center'>
          <div className='w-20 h-20 rounded-full border border-(--border) dark:border-(--borderdark) bg-gray-300 dark:bg-gray-700 animate-pulse'></div>
          <div className='space-y-2'>
            <div className='h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
            <div className='h-4 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          </div>
        </div>

        <div className='flex items-center text-xl gap-x-10'>
          <div className='h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
        </div>

      </div>

      <div className="bg-(--color-background) w-full flex items-center justify-between">
        
        <div className='w-32 h-10 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full'></div>

        <div className='flex gap-x-3 py-2 px-2 border rounded-full text-xl items-center bg-gray-100 dark:bg-gray-800 animate-pulse'>
          <div className='w-20 h-8 rounded-full'></div>
          <div className='w-24 h-8 rounded-full'></div>
        </div>

        <div className="size-6 bg-gray-300 dark:bg-gray-700 animate-pulse rounded"></div>

      </div>
    </div>
  )
}

export default ProfileBarSkeleton
