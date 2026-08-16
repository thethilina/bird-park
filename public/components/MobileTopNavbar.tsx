"use client"
import logo from "../images/birdparklogo.png"
import logolight from "../images/birdparklogodark.png"
import avatar from "../images/avatar.jpg"
import Image from "next/image"
import { IoMdSearch } from "react-icons/io";
import { FaRegPlusSquare } from "react-icons/fa";
import { IoMailSharp } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
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

function MobileTopNavbar() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  }

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLImageElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

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
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isMenuOpen]);

  return (
    <nav className="sticky sm:hidden z-50 py-2 px-4  xs:px-4 bg-(--color-background) dark:bg-(--background) border-(--border) w-full top-0 border-b-2 flex items-center gap-x-2 justify-between">

      {/* left: hamburger + logo */}
      <div className="flex items-center gap-x-2 shrink-0">
  
        <Image src={logo} alt="birdpark logo" className="w-7 hidden dark:block shrink-0" />
        <Image src={logolight} alt="birdpark logo" className="w-7 dark:hidden shrink-0" />
      </div>

      {/* center: search - flexes, never overflows */}
      <form
        className="relative flex-1 min-w-0 max-w-[150px] xs:max-w-none"
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          }
        }}
      >
        <IoMdSearch className="absolute right-3 top-1/2 -translate-y-1/2 size-5 cursor-pointer" onClick={() => { if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} />
        <input
          id="mobile-navbar-search-input"
          placeholder="Explore..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark) rounded-full py-1.5 pl-4 pr-9 w-full min-w-0 text-sm"
        />
      </form>

      {/* right: notifications + avatar */}
      <div className="flex items-center gap-x-2.5 shrink-0 color-(--primary) dark:color-(--primarydark)">
        <NotificationDropdown />

        <Image
          ref={avatarRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          src={user?.profileImage || userData.avatar}
          width={34}
          height={34}
          alt="user avatar"
          className="w-8 h-8 object-cover rounded-full border border-white cursor-pointer shrink-0"
        />
      </div>

      {/* mobile links menu (Board / Circles) */}
      <div
        ref={menuRef}
        className={`absolute z-200 top-full left-0 mt-2 ml-2 font-sans w-48 max-w-[calc(100vw-1rem)] bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg py-2 text-lg ${isMenuOpen ? 'block' : 'hidden'}`}
      >
        <Link href={"/"} onClick={() => setIsMenuOpen(false)}>
          <div className="px-4 py-2 hover:bg-(--hover) dark:hover:bg-(--hoverdark)">Board</div>
        </Link>
        <Link href={"/Circle"} onClick={() => setIsMenuOpen(false)}>
          <div className="px-4 py-2 hover:bg-(--hover) dark:hover:bg-(--hoverdark)">Circles</div>
        </Link>
      </div>

      {/* avatar dropdown */}
      <div
        ref={dropdownRef}
        className={`absolute z-200 top-full mt-2 right-2 font-sans w-56 max-w-[calc(100vw-1rem)] bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}
      >
        <Link href={`/Profile/${user?._id}`} onClick={() => setIsDropdownOpen(false)}>
          <div className="flex gap-x-3 items-center font-medium text-base px-4 py-3 mx-2 border-b border-(--border) dark:border-(--borderdark)">
            <Image
              src={user?.profileImage || userData.avatar}
              width={20}
              height={20}
              alt="user avatar"
              className="w-8 h-8 transition-transform hover:scale-105 rounded-full border border-white"
            />
            <p className="truncate">{user?.fullName || "Guest User"}</p>
          </div>
        </Link>

        <div className="px-2 py-2 text-sm">
          <Link onClick={() => setIsDropdownOpen(false)} href="/Profile/Settings" className="block px-4 py-2 hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">
            <IoIosSettings className="inline mr-2" size={18} />Settings
          </Link>
          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-(--hover) hover:cursor-pointer dark:hover:bg-(--hoverdark) rounded">
            <IoLogOut className="inline mr-2" size={18} />Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default MobileTopNavbar