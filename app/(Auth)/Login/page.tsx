"use client"
import { useState } from 'react'
import React from 'react'
import Logo from "@/public/images/birdparklogo.png"
import LightLogo from "@/public/images/birdparklogodark.png"
import Image from 'next/image'
import Photoslide from '@/public/components/Loginpage/Photoslide'
import { collectionsDatabase } from '@/TestDataBase/collectionData'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTopLoader } from 'nextjs-toploader';
import { toast } from 'react-toastify';
import { useAuth } from "@/contexts/AuthContext";

function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const loader = useTopLoader();
  const { setUser } = useAuth();

  const inputClass = "w-full dark:bg-[#2D2D44] bg-[#8989A9] border-none rounded-full py-4 px-6 text-sm dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/20 transition-all";

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      loader.start()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (response.ok) {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
        toast.success('Welcome back!');
        router.push('/');
        loader.done()
      } else {
        toast.error("Authentication failed. Please verify your credentials and try again.");
        console.error('Login failed:', data.message);
        loader.done()
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('An error occurred during login:', error);
      loader.done()
    }
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen py-10 md:py-20'>

      {/* Left Panel - Image Gallery (hidden on mobile) */}
      <div className='flex-1 hidden md:flex flex-col items-center justify-center px-10 pt-10 md:pt-0 md:border-r-2 border-[var(--border)]'>
        <div className='max-w-md w-full'>
          <div className='flex items-center gap-3 mb-10'>
            <Image src={Logo} alt='logo' className='w-10 h-10 hidden dark:block object-contain' />
                        <Image src={LightLogo} alt='logo' className='w-10 h-10 dark:hidden  object-contain' />

            <h1 className='text-3xl font-light tracking-wide'>Bird Park</h1>
          </div>
          <div className='w-full'>
            {collectionsDatabase.length > 0 && <Photoslide artdata={collectionsDatabase} />}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className='flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pt-10 md:pt-0'>
        <div className='w-full max-w-sm text-center space-y-8'>

          {/* Mobile Logo */}
          <div className='flex md:hidden items-center justify-center gap-3'>
            <Image src={Logo} alt='logo' className='w-10 h-10 object-contain hidden dark:block' />
                        <Image src={LightLogo} alt='logo' className='w-10 h-10 object-contain dark:hidden' />

            <h1 className='text-xl font-light tracking-wide'>Bird Park</h1>
          </div>

          {/* Header */}
          <div className='space-y-2'>
            <h1 className='text-3xl md:text-5xl dark:text-[#DEBE83] text-[#161616] font-light'>Log In</h1>
            <Link href='/Register' className='text-lg underline underline-offset-4 dark:text-gray-300 dark:hover:text-white transition-colors'>
              Create an account
            </Link>
          </div>

          {/* Inputs */}
          <div className='flex flex-col gap-4'>
            <input
              placeholder='Email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={inputClass}
            />
            <input
              placeholder='Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={inputClass}
            />
          </div>

          {/* Enter Button */}
          <button
            onClick={handleLogin}
            className='dark:bg-white    bg-[#0B111A]  text-white    w-full font-serif dark:text-black py-2.5 rounded-full text-lg font-medium hover:cursor-pointer dark:hover:bg-gray-200 active:scale-95 transition-all'
          >
            Enter
          </button>

          {/* Footer Links */}
          <div className='flex flex-wrap justify-center gap-4 sm:gap-8 text-md text-gray-500'>
            <Link href='/terms-of-service' className='dark:hover:text-white transition-colors whitespace-nowrap'>Terms of Service</Link>
            <Link href='/privacy-policy' className='dark:hover:text-white transition-colors whitespace-nowrap'>Privacy Policy</Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Page