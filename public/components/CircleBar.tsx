import React from 'react'
import Image from 'next/image'
import Back from "../../public/images/back.jpg"
import { circleData } from '../../TestDataBase/circleData'
import { GiHamburgerMenu } from "react-icons/gi";
import usersData from '@/TestDataBase/usersdata';

function CircleBar() {
  return (
    <nav className='hidden  z-99 lg:block w-auto  bg-(--color-background) dark:bg-(--background) border-r-2  border-(--border)   flex flex-col items-center    gap-y-5'>
  
  <div className='   space-y-5'>
  
   {/**circle bannar */}
   <Image src={Back} alt='bannar' className='sticky  w-full lg:h-40 xl:h-50  object-cover' />

   
  <div className='mx-10 py-5 sticky space-y-5 border-b-2 border-(--border)'>
    {/**circle name */}
    <div className='flex gap-x-5  items-center'>
      <Image src={circleData[0].image} alt='grpicon' className='w-20 h-20 rounded-xl' />
      <h1 className='text-2xl  text-center'>{circleData[0].name}</h1>
    </div>

    {/**buttons */}
      <div className='flex text-2xl items-center justify-between'>

        <div className='flex gap-x-5 items-center'>
          <h1>{circleData[0].membors} Members</h1>
          <div className='flex'>
            {usersData.slice(0, 5).map((user) => ( 
              <Image key={user.id} src={user.avatar} alt='avatar' className='w-7 h-7 rounded-full border border-(--border) dark:border-(--borderdark) -ml-2' />   
            ))}
          </div>
        </div>

        <div className='flex items-center gap-x-5'>
    <button className='bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3  flex' > <h1 className='border rounded-full p-1 w-5 h-5 items-center flex justify-center'>+</h1>Invite</button>
        <button className='bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3  flex' > <h1 className='border rounded-full p-1 w-5 h-5 items-center flex justify-center'>+</h1>Invite</button>
 <GiHamburgerMenu className="size-6" />
        </div>


   

      </div>

  </div>
  </div>
      </nav>
      )
}

export default CircleBar