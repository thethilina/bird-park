import React from 'react';

function SettingsSkeleton() {
  return (
    <div className='space-y-10 sm:space-y-15 font-sans p-4 sm:p-6'>
      {/* top section */}
      <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-2 border-gray-200 dark:border-gray-800 pb-5'>
        <div className='space-y-3'>
          <div className='h-8 w-48 sm:w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-5 w-36 sm:w-48 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
        </div>

        <div className='space-x-4 flex'>
          <div className='w-20 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
          <div className='w-20 h-8 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md'></div>
        </div>
      </div>

      {/* middle section */}
      <div className='flex flex-col md:flex-row items-start gap-x-10 gap-y-8'>
        {/* avatar */}
        <div className='space-y-3 w-full md:w-1/2'>
          <div className='h-7 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-16 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-10'>
            <div className='w-32 h-32 mx-auto sm:mx-0 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg'></div>
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
        <div className='w-full md:w-1/2 space-y-3'>
          <div className='h-7 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>
      </div>

      {/* bottom section */}
      <div className='flex flex-col md:flex-row items-start gap-x-10 gap-y-8 mt-10'>
        {/* User Name */}
        <div className='space-y-3 w-full md:w-1/2'>
          <div className='h-7 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>

        {/* Birthday */}
        <div className='space-y-3 w-full md:w-1/2'>
          <div className='h-7 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-10 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded'></div>
          <div className='h-12 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mt-4'></div>
        </div>
      </div>
    </div>
  );
}

export default SettingsSkeleton;