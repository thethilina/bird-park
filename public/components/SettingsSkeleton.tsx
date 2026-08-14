import React from 'react';

function SettingsSkeleton() {
  return (
    <div className='space-y-15 font-sans p-6'>
      {/* top section */}
      <div className='flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-800 pb-5'>
        <div className='space-y-3'>
          <div className='h-8 w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-5 w-48 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
        </div>

        <div className='space-x-4 flex'>
          <div className='w-20 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
          <div className='w-20 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
        </div>
      </div>

      {/* middle section */}
      <div className='flex items-start gap-x-10'>
        {/* avatar */}
        <div className='space-y-3 w-1/2'>
          <div className='h-7 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-16 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='flex space-x-10'>
            <div className='w-32 h-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg'></div>
            <div className='space-y-5 flex flex-col justify-around w-full'>
              <div className='h-20 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
              <div className='flex space-x-5'>
                <div className='w-24 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
                <div className='w-24 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className='w-1/2 space-y-3'>
          <div className='h-7 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>
      </div>

      {/* bottom section */}
      <div className='flex items-start gap-x-10 mt-10'>
        {/* User Name */}
        <div className='space-y-3 w-1/2'>
          <div className='h-7 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>

        {/* Birthday */}
        <div className='space-y-3 w-1/2'>
          <div className='h-7 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>
      </div>
    </div>
  );
}

export default SettingsSkeleton;
