"use client"

import React from 'react'
import Logo from "@/public/images/birdparklogo.png"
import Image from 'next/image'
import { feedDatabase } from '@/TestDataBase/artData'
import InputFiled from '@/public/components/Tn/InputFiled'

function Page() {
  return (
    <div className='flex  flex-col  py-20  '>

   
          
          {/* Logo and title section */}
  
    
      {/* Right Panel - Login Form */}
      <div className='flex-1 flex flex-col items-center justify-center px-10'>
        <div className='w-full max-w-md text-center space-y-10'>
          
          {/* Header */}
          <div className='space-y-2'>
            <h1 className='text-5xl text-[#DEBE83] font-light'>Welcome to Bird Park</h1>
            <button className=' text-xl underline underline-offset-4 text-gray-300 hover:text-white transition-colors'>
Create your account
            </button>
          </div>

          {/* Inputs */}
          <div className='flex flex-col gap-4  '>
            <InputFiled 
                placeholder='Email Address' 
                type='email' 
                className="bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
    
          </div>

          {/* Enter Button */}
          <button className='bg-white w-full font-serif text-black py-3 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'>
            Next
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