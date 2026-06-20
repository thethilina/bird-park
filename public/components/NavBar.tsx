"use client"
import logo from "../images/birdparklogo.png"
import logolight from "../images/birdparklogodark.png"
import avatar from "../images/avatar.jpg"
import Image from "next/image"
import { IoMdSearch } from "react-icons/io";
import { FaRegPlusSquare } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import userData from "@/TestDataBase/userdata";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { useRouter } from 'next/navigation'
import { FaUserFriends } from "react-icons/fa";
import { FaConnectdevelop } from "react-icons/fa";



function NavBar() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  const handleLogout = async () => {
    try {


      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Logout successful');
        setIsDropdownOpen(false);
        router.push('/Login');
      } else {
        const data = await response.json();
        console.error('Logout failed:', data.message);
      }
    }catch (error) {
      console.error('An error occurred during logout:', error);
    } }








  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        avatarRef.current &&
        !avatarRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    
    <nav className="sticky  z-50 xl:px-20  lg:px-10  py-1  bg-(--color-background) dark:bg-(--background)  border-(--border)  lg:pt-5  w-full top-0 border-b-2   lg:py-3   flex items-center justify-between ">


    {/** right side */}
    <div className="flex  items-center  gap-x-4 lg:gap-x-8">
    <GiHamburgerMenu className="lg:hidden" />

    <Image src={logo} alt="birdpark logo" className="lg:w-9 w-7 hidden dark:block " />     
    <Image src={logolight} alt="birdpark logo" className="lg:w-10 w-7 dark:hidden " />

    <ul className=" items-center gap-x-5 text-2xl hidden lg:flex">
   <Link href={"/"}><li>Board</li></Link>
      <Link href={"/Circle"}><li>Circles</li></Link>
    </ul>

    </div>

    {/** search bar */}

    <div className="relative hidden lg:block">
      <IoMdSearch className="absolute right-3 top-1 size-7  " />
      <input placeholder="Explore..." type="text" className="font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark)   rounded-xl py-1.5 px-4" />
    </div>

    {/** left side */}
    <div className="flex items-center gap-x-5 lg:gap-x-7 color-(--primary) dark:color-(--primarydark) ">

   <Link href="/suggections">
      <FaUserFriends  className="dark:text-[#BEC9F4] size-6 lg:size-7" />
    </Link>


    <Link href="/Create/Submitwork">
      <FaRegPlusSquare className=" dark:text-[#BEC9F4]  size-6 lg:size-7" />
    </Link>
    <IoMailSharp  className="dark:text-[#BEC9F4]  size-7 lg:size-8" />
    <Image ref={avatarRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)} src={user?.profileImage || userData.avatar} width={36} height={36} alt="user avatar" className="w-7 lg:w-9 rounded-full border border-white cursor-pointer" />
    </div>

    {/** dropdown */}
    <div ref={dropdownRef} className={`absolute z-200 top-full mr-2 mt-2 right-0 font-sans  w-60  bg-(--color-background) dark:bg-(--background)     border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>

    <Link href={`/Profile/${user?._id}`}  onClick={()=>{setIsDropdownOpen(false)}}   >  <div  className=" flex gap-x-4  items-center   font-medium text-lg px-4 py-4 mx-2 border-b border-(--border) dark:border-(--borderdark)">
        <Image src={user?.profileImage || userData.avatar} width={20} height={20} alt="user avatar" className="w-8 h-8 rounded-full border border-white " />
        <p className="  ">{user?.fullName || "Guest User"}</p>
      </div>          </Link> 

     <div className="px-2 py-2 text-md  " >
      <Link onClick={()=>{setIsDropdownOpen(false)}} href="/Profile/Settings" className="block px-4 py-2  hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded"> 
        <IoIosSettings className="inline mr-2" size={20}  />Settings</Link>
      <button onClick={handleLogout} className="block px-4 py-2  hover:bg-(--hover) hover:cursor-pointer dark:hover:bg-(--hoverdark) rounded">
        <IoLogOut className="inline mr-2 " size={20} />Logout</button>
    </div>
    </div>
    </nav>
  )
}

export default NavBar