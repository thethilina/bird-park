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
import NotificationDropdown from "@/public/components/NotificationDropdown";
import { RiGalleryLine } from "react-icons/ri";
import { RiUserCommunityFill } from "react-icons/ri";



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
    
    <nav className="fixed py-5  bottom-0 sm:hidden   z-50 px-10 bg-(--color-background) dark:bg-(--background)  border-(--border)  lg:pt-5  w-full  border-b-2   lg:py-3   flex items-center justify-between ">

<Link href="/Create/Submitwork">
      <FaRegPlusSquare className=" dark:text-[#BEC9F4] transition-transform hover:scale-105  size-8 lg:size-7" />
    </Link>
    {/** right side */}


   <Link href={"/"}>  <RiGalleryLine  className="dark:text-[#BEC9F4]  transition-transform hover:scale-105 size-8 lg:size-7" /></Link>
      <Link href={"/Circle"}><RiUserCommunityFill className="dark:text-[#BEC9F4]  transition-transform hover:scale-105 size-8 lg:size-7" /></Link>


    {/** search bar */}

   
    
    {/** left side */}

   <Link href="/suggections">
      <FaUserFriends  className="dark:text-[#BEC9F4]  transition-transform hover:scale-105 size-8 lg:size-7" />
    </Link>


    
    



    {/** dropdown */}
  
    </nav>
  )
}

export default NavBar