import React from 'react'
import { IoMdSearch } from "react-icons/io";
import { FaCompass } from "react-icons/fa6";
import { FaRegCircleDot } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";


function CircleSideBar() {
  return (
    <nav className='hidden lg:block w-auto p-5 bg-(--color-background) dark:bg-(--background) border-r-2  border-(--border)   flex flex-col items-center py-5 gap-y-5'>

<div className='sticky top-25 space-y-5'>

    {/** searchbar */}
    
        <div className=" hidden lg:block ">
          <IoMdSearch className="absolute right-3 top-1 size-7  " />
          <input placeholder="Search Circles" type="text" className="font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark)   rounded-full py-1 px-2" />
        </div>
    

        {/** middle buttons */}


        <div className=" flex flex-col text-xl p-2  gap-y-5">
        <button className='flex items-center align-middle gap-x-4 ) '><FaCompass className='size-5' /> Explore</button>
        <button className='flex items-center align-middle  gap-x-4 '><FaRegCircleDot className='size-5' /> Your Circles</button>
        <button className='flex items-center align-middle  gap-x-4 '><FiPlusCircle className='size-5' /> Create Circle</button>
        </div>


              {/** circles im in */}

       <div className=" flex flex-col text-xl p-2  gap-y-5">
        <div className='flex items-center  gap-x-2'> <div className='w-7 h-7 rounded-full bg-[#20417e]'/><h1>Circles You Are In</h1></div>
       
       
     
        </div>






</div>
    </nav>
  )
}

export default CircleSideBar