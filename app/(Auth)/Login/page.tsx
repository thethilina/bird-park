"use client"

import React from 'react'
import Logo from "@/public/images/birdparklogo.png"
import Image from 'next/image'
import { feedDatabase } from '@/TestDataBase/artData'
import Photoslide from "../../../public/components/Loginpage/Photoslide"
import InputFiled from '@/public/components/Tn/InputFiled'
import { collectionsDatabase } from '@/TestDataBase/collectionData'

function Page() {
  return (
    <div className='flex w-screen  h-screen py-20  '>

      {/* Left Panel - Image Gallery */}
      <div className='flex-1 flex flex-col items-center justify-center px-10  border-r-2   border-(--border)   '>
        <div className='max-w-md w-full'>
          
          {/* Logo and title section */}
          <div className='flex items-center gap-3 mb-10'>
            <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
            <h1 className='text-3xl font-light tracking-wide'>Bird Park</h1>
          </div>

          {/* Photoslide Component */}
          <div className='w-full'>
            {collectionsDatabase.length > 0 && <Photoslide artdata={collectionsDatabase} />}
          </div>

      
        </div>
      </div>


    
      {/* Right Panel - Login Form */}
      <div className='flex-1 flex flex-col items-center justify-center px-10'>
        <div className='w-full max-w-sm text-center space-y-10'>
          
          {/* Header */}
          <div className='space-y-2'>
            <h1 className='text-5xl text-[#DEBE83] font-light'>Log In</h1>
            <button className=' text-xl underline underline-offset-4 text-gray-300 hover:text-white transition-colors'>
              Create an account
            </button>
          </div>

          {/* Inputs */}
          <div className='flex flex-col gap-4  '>
            <InputFiled 
                placeholder='User name or Email' 
                type='email' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
            <InputFiled 
                placeholder='Password' 
                type='password' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
            <button className='text-sm text-gray-300 hover:text-white transition-colors mt-2'>
                Forget Password
            </button>
          </div>

          {/* Enter Button */}
          <button className='bg-white w-full font-serif text-black py-3 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'>
            Enter
          </button>
          
          {/* Footer Links */}
          <div className='flex justify-center gap-8 text-xl text-gray-500'>
            <button className='hover:text-white'>Terms of Service</button>
            <button className='hover:text-white'>
                Privacy policy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page