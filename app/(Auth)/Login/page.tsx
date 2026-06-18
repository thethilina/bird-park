"use client"
import { useState } from 'react'
import React from 'react'
import Logo from "@/public/images/birdparklogo.png"
import Image from 'next/image'
import { feedDatabase } from '@/TestDataBase/artData'
import Photoslide from '@/public/components/Loginpage/Photoslide'
import InputFiled from '@/public/components/Tn/InputFiled'
import { collectionsDatabase } from '@/TestDataBase/collectionData'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTopLoader } from 'nextjs-toploader';
  import { ToastContainer, toast } from 'react-toastify';
import { useTheme } from "next-themes";









function Page() {
  const [activeLayout, setActiveLayout] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const loader = useTopLoader();
  const { theme, resolvedTheme } = useTheme();



    const wrongcredecials = () => toast("Authentication failed. Please verify your credentials and try again.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      type: "error",
      });



  const handleLogin = async () => {
    try {
        

      loader.start()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login (e.g., redirect to dashboard)
        console.log('Login successful');
        router.push('/');
        loader.done()
      } else {
        // Handle login error (e.g., show error message)
        wrongcredecials();
        console.error('Login failed:', data.message);
        loader.done()
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
      loader.done()
    }
  }






  return (
    <div className='flex flex-col md:flex-row min-h-screen py-10 md:py-20'>

      {/* Left Panel - Image Gallery */}


        <ToastContainer />


      <div className='flex-1 hidden md:flex flex-col items-center justify-center px-10 sm:px-10 pt-10 md:pt-0 md:border-b-0 md:border-r-2 border-[var(--border)]'>
        <div className='max-w-md w-full'>
          
          {/* Logo and title section */}
          <div className='flex items-center gap-3 mb-10'>
            <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />
            <h1 className='text-3xl font-light tracking-wide'>Bird Park</h1>
          </div>

          {/* Photoslide Component */}
          <div className=' w-full'>
            {collectionsDatabase.length > 0 && <Photoslide artdata={collectionsDatabase} />}
          </div>

        </div>
      </div>

      {/* Right Panel - Login Form */}

      <div className='flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pt-10 md:pt-0'>
        <div className='w-full max-w-sm text-center space-y-10'>
          
          

                  <div className='flex md:hidden items-center justify-center gap-3 mb-10'>

  <Image src={Logo} alt='logo' className='w-10 h-10 object-contain' />

  <h1 className='text-xl font-light tracking-wide'>Bird Park</h1>

</div>




          {/* Header */}
          <div className='space-y-2'>



            <h1 className='text-3xl md:text-5xl text-[#DEBE83] font-light'>Log In</h1>


            <Link href='/Register' className='text-xl underline underline-offset-4 text-gray-300 hover:text-white transition-colors'>
                Create an account
            </Link>
            
          </div>

          {/* Inputs */}
          <div className='flex flex-col gap-4'>
            <InputFiled 
                placeholder='Email' 
                type='email' 
                value={email}
                onChange={(e:any) => setEmail(e.target.value)}
                className="w-full bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
            
            
            <InputFiled 
                placeholder='Password' 
                type='password' 
                value={password}
                onChange={(e:any) => setPassword(e.target.value)}
                className="w-full bg-[#2D2D44] border-none rounded-full py-4 px-6 text-sm placeholder:text-gray-400"
            />
            <button className='text-sm text-gray-300 hover:text-white transition-colors mt-2 self-center md:self-auto'>
                Forget Password
            </button>
          </div>

          {/* Enter Button */}
          <button onClick={handleLogin}  className='bg-white w-full font-serif text-black py-1 md:py-2 rounded-full text-lg font-medium hover:bg-gray-200 transition-all'>
            Enter
          </button>
          
          
          {/* Footer Links */}
          <div className='flex flex-wrap justify-center gap-4 sm:gap-8 text-xl text-gray-500'>
            <button className='hover:text-white whitespace-nowrap'>Terms of Service</button>
            <button className='hover:text-white whitespace-nowrap'>Privacy policy</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page