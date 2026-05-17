import React from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import testavetar from "../images/avatar.jpg"
import Image from 'next/image';
import userData from '@/TestDataBase/userdata';
import Link from 'next/link';


function ProfileBar({ user }: any) {
  return (
    <div className=' space-y-5 py-7 sticky top-18 z-90 w-full bg-(--color-background) dark:bg-(--background)  ) '>

     <div className="   py-1   bg-(--color-background)   )    w-full      flex items-center justify-between ">

    <div  className='flex gap-x-4 items-center'>
    <Image src={user.avatar} alt='avatar' className='w-12 h-12 rounded-full border border-(--border) dark:border-(--borderdark)'/>
    <div>
      <h1 className='text-2xl '>{user.username}</h1>
      <p className='text-xl text-(--text-muted) dark:text-(--text-muted-dark)'>{`@${user.email}`}</p>
    </div>
    </div>

    <div className='flex items-center text-xl gap-x-10'>
      <h1>{user.connections} Connections</h1>
      <h1>{user.observers} Observers </h1>
    </div>

     </div>




    <div className="  bg-(--color-background) )   w-full    flex items-center justify-between ">

    <button className='bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3  flex' > <h1 className='border rounded-full p-1 w-5 h-5 items-center flex justify-center'>+</h1>Connect</button>


    <div className='flex gap-x-3 py-2 px-2 border rounded-full text-xl items-center'>

    <Link href={`/Profile/${user.id}`}>
      <button className='rounded-full border hover:cursor-pointer  px-5 flex items-center  justify-center'>Works</button>
    </Link>
    <Link href={`/Profile/${user.id}/collections`}>
      <button className='rounded-full border hover:cursor-pointer px-5 flex items-center justify-center'>Collections</button>
    </Link>
    </div>



    <GiHamburgerMenu className="size-6" />


    </div>
    </div>
  )
}

export default ProfileBar