import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


function Coment({ comment , user }: any) {
  return (
    <div className='font-sans space-y-3 lg:space-y-5 '>

    <div className='flex w-full justify-between items-center lg:text-xl'>

    <div className='flex gap-x-3 lg:gap-x-5 items-center lg:text-xl'>    
    <Link href={`/Profile/${user?.id}`} className='flex items-center gap-x-3'>
      <Image src={user?.avatar} alt="User's avatar" className='rounded-full h-8 w-8 lg:h-13 lg:w-13' />
    
    <h1>{user.username}</h1>
    </Link></div>

    <p>{comment?.date}</p>        
    </div>

    <h1 className='dark:bg-[#0F0E17] bg-[#e2e0ec] p-2 lg:p-4 rounded-xl'>{comment?.comment}</h1>

    </div>
  )
}

export default Coment