import React from 'react'
import Link from 'next/link'

function SubmitworkNav() {
  return (

    <div className=' space-y-5 sm:space-y-10 py-5 md:py-10  px-3 sm:px-0'>

        <h1 className='text-2xl md:text-3xl'>Submit work </h1>

        <div className='flex text-xl sm:text-2xl  gap-x-10'>
        <Link href="/Create/Submitwork">
          <h1 className='cursor-pointer hover:text-blue-500'>Artwork</h1>
        </Link>
        <Link href="/Create/Submitwork/Poetry">
          <h1 className='cursor-pointer hover:text-blue-500'>Poetry</h1>
        </Link>
        </div>
        

    </div>
  )
}

export default SubmitworkNav