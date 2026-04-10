import React from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import testavetar from "../images/avatar.jpg"
import Image from 'next/image';
import userData from '@/TestDataBase/userdata';



function ProfileBar() {
  return (
    <div className='space-y-5 py-7 sticky top-18 z-90 w-full bg-(--color-background) dark:bg-(--background)  ) '>

     <div className=" px-5 lg:px-5 py-1   bg-(--color-background)   )    w-full      flex items-center justify-between ">

    <div  className='flex gap-x-4 items-center'>
    <Image src={userData.avatar} alt='avatar' className='w-15 rounded-full border border-(--border) dark:border-(--borderdark)'/>
    <div>
      <h1 className='text-2xl '>{userData.username}</h1>
      <p className='text-xl text-(--text-muted) dark:text-(--text-muted-dark)'>{`@${userData.email}`}</p>
    </div>
    </div>

    <div className='flex items-center text-xl gap-x-10'>
      <h1>{userData.connections} Connections</h1>
      <h1>{userData.observers} Observers </h1>
    </div>

     </div>




    <div className="  px-5 lg:px-5  bg-(--color-background) )   w-full    flex items-center justify-between ">

    <button className='bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3  flex' > <h1 className='border rounded-full p-1 w-5 h-5 items-center flex justify-center'>+</h1>Connect</button>


    <div className='flex gap-x-3 py-2 px-2 border rounded-full text-xl items-center'>

    <button className='rounded-full border  px-5 flex items-center justify-center'>Works</button>
    <button className='rounded-full border px-5 flex items-center justify-center'>Collections</button>
    <button className='rounded-full border  px-5 flex items-center justify-center'>Collaborations</button>
    </div>



    <GiHamburgerMenu className="size-6" />


    </div>
    </div>
  )
}

export default ProfileBar