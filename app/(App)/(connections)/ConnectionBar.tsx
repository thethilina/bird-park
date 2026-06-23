import React from 'react'
import { IoMdSearch } from "react-icons/io";
import { FaCompass } from "react-icons/fa6";
import { FaRegCircleDot } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";
import Link from 'next/link';
import { BsFillEyeFill } from 'react-icons/bs';

function ConnectionBar() {
  return (
    <nav className='hidden lg:block w-auto   fixed  top-10  h-screen  pr-5 bg-(--color-background) dark:bg-(--background) border-r-2  border-(--border)    flex-col items-center py-5 gap-y-5'>

<div className='sticky top-30 mr-10 space-y-10'>


    <h1 className='text-3xl'>Connections</h1>
        {/** middle buttons */}


        <div className=" flex flex-col text-2xl   gap-y-5">
        <Link href="/suggections"> <button  className='flex items-center hover:cursor-pointer align-middle gap-x-4 ) '><FaCompass className='size-5' /> Suggestions</button></Link>
         <Link href="/suggections/connections"> <button className='flex items-center hover:cursor-pointer  align-middle  gap-x-4 '><FaRegCircleDot className='size-5' /> Connections</button></Link>
        <Link href="/suggections/requests"> <button className='flex items-center  hover:cursor-pointer  align-middle  gap-x-4 '><FiPlusCircle className='size-5' /> Observers</button></Link>  
        <Link href="/suggections/observing"> <button className='flex items-center  hover:cursor-pointer  align-middle  gap-x-4 '><   BsFillEyeFill  className='size-5' /> Observing</button></Link>  

        </div>

            
       
     






</div>
    </nav>
  )
}

export default ConnectionBar