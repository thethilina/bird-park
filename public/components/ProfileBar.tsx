"use client"
import React from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import testavetar from "../images/avatar.jpg"
import Image from 'next/image';
import userData from '@/TestDataBase/userdata';
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext";
import { useState , useEffect } from 'react';
import { LuCirclePlus } from "react-icons/lu";
import { PiPlugsConnectedBold } from "react-icons/pi";
import { BsSendPlusFill } from "react-icons/bs";
import { BsFillEyeFill } from "react-icons/bs";
import { GrConnect } from "react-icons/gr";
import { useTopLoader } from 'nextjs-toploader';
import { ToastContainer, toast } from 'react-toastify';
import { useRef } from 'react';
import { PiEyeClosedFill } from "react-icons/pi";
import { TbPlugConnectedX } from "react-icons/tb";
import { usePathname } from 'next/navigation';

function ProfileBar({ User }: any) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [ connectionStatus , setconnectionStatues ] = useState('not_sent')
  const loader = useTopLoader()
  const [sentreqID , setsentreqID] = useState(null)
  const [receivedID , setreverivedID] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const hamburgerMenuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement | null>(null);

  const success = (msg: string) =>
    toast(msg, {
      position: "top-right",
      autoClose: 2000,
      type: "success",
    });

  const errorToast = (msg: string) =>
    toast(msg, {
      position: "top-right",
      autoClose: 2000,
      type: "error",
    });

  const acceptrequst = async()=>{
    try{
       loader.start()
       const response = await fetch('/api/connection/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "requestId": receivedID
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error accepting the request")
        loader.done()
        return;
      }

      success(`Connected with ${User?.username} sucessfully!`)   
      loader.done()
      setconnectionStatues("connected")
    }catch(error){
        errorToast("Error accepting the request")
        loader.done()
    }
  }

  const cancelsentreq = async()=>{
    try{
       loader.start()
       const response = await fetch(`/api/connection/request/${sentreqID}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "requestId": sentreqID
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error removing the request")
        loader.done()
        return;
      }

      success(`Stop observing ${User?.username} sucessfully!`)
      loader.done()
      setconnectionStatues("not_sent")
    }catch(error){
       errorToast("Error removing the request")
       loader.done()
    }
  }

  const deletereq = async()=>{
    try{
       loader.start()
       const response = await fetch(`/api/connection/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "requestId": receivedID
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error declining the request")
        loader.done()
        return;
      }

      success(`Request from ${User?.username} has declined sucessfully!`)
      loader.done()
      setconnectionStatues("not_sent")
    }catch(error){
       errorToast("Error declining the request")
       loader.done()
    }
  }

  const removeconnection = async()=>{
    try{
       loader.start()
       const response = await fetch(`/api/connection/${User._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error removing the connection")
        loader.done()
        return;
      }

      success("Connection removed successfully!")
      loader.done()
      setconnectionStatues("not_sent")
    }catch(error){
       errorToast("Error removing the connection")
       loader.done()
    }
  }

  const sendrequest = async()=>{
    try{
       loader.start()
       const response = await fetch('/api/connection/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "receiverId": User._id
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error sending the request")
        loader.done()
        return;
      }

      setsentreqID(data.request._id)
      success("Request sent successfully!")
      loader.done()
      setconnectionStatues("observing")
    }catch(error){
       errorToast("Error sending the request")
       loader.done()
    }
  }

  useEffect(() => {
    const getStatus = async () => {
      if (!user?._id || !User?._id) return;
      if (user._id === User._id) return;

      try {
        const res = await fetch(
          `/api/connection/status/${User._id}`
        );

        const data = await res.json();
        if (data.status === "observer") {
          setreverivedID(data.requestId)
        }

        if (data.status === "observing"){
          setsentreqID(data.requestId)
        }
        setconnectionStatues(data.status);
      } catch (err) {
        console.error(err);
      }
    };

    getStatus();
  }, [user?._id, User?._id]);

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
        showHamburgerMenu &&
        hamburgerMenuRef.current &&
        !hamburgerMenuRef.current.contains(target) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(target)
      ) {
        setShowHamburgerMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, showHamburgerMenu]);

  const isWorksActive = pathname === `/Profile/${User?._id}`;
  const isCollectionsActive = pathname === `/Profile/${User?._id}/collections`;

  return (
    <div className='space-y-2 border-b-2 border-(--border) dark:border-(--borderdark) sm:py-6 w-full bg-(--color-background) dark:bg-(--background) relative'>
      
      {/* Profile info row */}
      <div className="w-full flex flex-row items-center justify-between gap-y-4">
        <div className='flex gap-x-4 items-center'>
          <Image 
            src={User?.profileImage || testavetar} 
            alt='profileImage' 
            width={80} 
            height={80} 
            className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border border-(--border) dark:border-(--borderdark)'
          />
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold'>{User?.username}</h1>
            <p className='text-sm sm:text-base text-(--text-muted) dark:text-(--text-muted-dark)'>{`@${User?.email}`}</p>
          </div>
        </div>

        {/* Desktop Connections & Observers */}
        <div className='hidden sm:flex items-center text-xl gap-x-10'>
          <h1> Connections  {User?.connections?.length || 0}</h1>
          <h1>Observers {User?.observers?.length || 0} </h1>
        </div>

        {/* Mobile Hamburger Menu Icon (Top Right) */}
        <div className="relative flex sm:hidden justify-end">
          <button
            ref={hamburgerButtonRef}
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center hover:cursor-pointer"
          >
            <GiHamburgerMenu className="size-6 text-neutral-500 hover:text-neutral-800 dark:hover:text-white" />
          </button>

          {/* Hamburger Dropdown Menu */}
          {showHamburgerMenu && (
            <div 
              ref={hamburgerMenuRef} 
              className="absolute right-0 top-8 mt-2 z-200 w-52 bg-white dark:bg-[#0c0c14] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-xl py-2 font-sans"
            >
              {user?._id === User?._id ? (
                <>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success("Profile link copied to clipboard!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2"
                  >
                    Share Profile
                  </button>
                  <Link href={`/Profile/${User?._id}/emotion-dashboard`} onClick={() => setShowHamburgerMenu(false)}>
                    <div className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2">
                      Emotion Dashboard
                    </div>
                  </Link>
                  <Link href="/Profile/Settings" onClick={() => setShowHamburgerMenu(false)}>
                    <div className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2">
                      Settings
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success("Profile link copied to clipboard!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2"
                  >
                    Share Profile
                  </button>
                  <button 
                    onClick={() => {
                      success("Artist reported successfully. Thank you!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 transition-colors hover:cursor-pointer flex items-center gap-x-2 font-medium"
                  >
                    Report Artist
                  </button>
                  <button 
                    onClick={() => {
                      success("Artist blocked successfully.");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 transition-colors hover:cursor-pointer flex items-center gap-x-2 font-medium"
                  >
                    Block Artist
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Connections & Observers Row */}
      <div className='flex sm:hidden items-center text-lg gap-x-6 justify-start'>
        <h1> Connections {User?.connections?.length || 0}</h1>
        <h1> Observers {User?.observers?.length || 0}</h1>
      </div>

      {/* Profile actions and navigation tabs row */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 pt-2 relative">
        
        {/* Action Buttons (Full width on mobile) */}
        <div className="flex items-center gap-x-3 w-full sm:w-auto justify-center sm:justify-start">
          {user?._id === User?._id ? (
            <Link
              href={`/Profile/Settings`}
              className="w-full sm:w-auto justify-center bg-[#0D1725] hover:bg-[#1a2c47] border border-(--border) dark:border-(--borderdark) px-4 py-1.5 rounded-full text-base sm:text-lg items-center gap-x-2 flex transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <LuCirclePlus />
              <span>Settings</span>
            </Link>
          ) : (
            <div className="relative w-full sm:w-auto">
              {connectionStatus === "connected" ? (
                <>
                  <button 
                    ref={avatarRef} 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}  
                    className='w-full sm:w-auto justify-center bg-(--colorbg) hover:cursor-pointer dark:bg-(--colorbgdark) py-1.5 border border-(--border) dark:border-(--borderdark) px-4 rounded-full text-base sm:text-lg items-center gap-x-2 flex hover:scale-105 active:scale-95 transition-all duration-200'
                  >
                    <PiPlugsConnectedBold />
                    <span>Connected</span>
                  </button>

                  <div ref={dropdownRef} className={`absolute left-0 mt-2 z-50 w-48 bg-[#192942] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                    <button 
                      onClick={removeconnection} 
                      className='w-full text-left text-sm px-4 py-2 hover:bg-[#263e64] hover:text-white transition-colors flex gap-x-2 items-center hover:cursor-pointer'
                    >
                      <TbPlugConnectedX />
                      <span>Remove connection</span>
                    </button>
                  </div>
                </>
              ) : connectionStatus === "not_sent" ? (
                <button 
                  onClick={sendrequest} 
                  className='w-full sm:w-auto justify-center bg-[#192942] hover:bg-[#2c456e] hover:cursor-pointer py-1.5 border border-(--border) dark:border-(--borderdark) px-4 rounded-full text-base sm:text-lg items-center gap-x-2 flex hover:scale-105 active:scale-95 transition-all duration-200'
                >
                  <BsSendPlusFill />
                  <span>Connect</span>
                </button>
              ) : connectionStatus === "observing" ? (
                <>
                  <button 
                    ref={avatarRef} 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}  
                    className='w-full sm:w-auto justify-center bg-[#192942] hover:bg-[#1f314e] hover:cursor-pointer py-1.5 border border-(--border) dark:border-(--borderdark) px-4 rounded-full text-base sm:text-lg items-center gap-x-2 flex hover:scale-105 active:scale-95 transition-all duration-200'
                  >
                    <BsFillEyeFill />
                    <span>Observing</span>
                  </button>

                  <div ref={dropdownRef} className={`absolute left-0 mt-2 z-20 w-48 bg-[#192942] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                    <button 
                      onClick={cancelsentreq} 
                      className='w-full text-left text-sm px-4 py-2 hover:bg-[#263e64] hover:text-white transition-colors flex gap-x-2 items-center hover:cursor-pointer'
                    >
                      <PiEyeClosedFill />
                      <span>Stop observing</span>
                    </button>
                  </div>
                </>
              ) : connectionStatus === "observer" ? (
                <>
                  <button  
                    ref={avatarRef} 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}  
                    className='w-full sm:w-auto justify-center bg-[#192942] hover:cursor-pointer py-1.5 border border-(--border) dark:border-(--borderdark) px-4 rounded-full text-base sm:text-lg items-center gap-x-2 flex hover:scale-105 active:scale-95 transition-all duration-200'
                  >
                    <GrConnect />
                    <span>Respond</span>
                  </button>
                  
                  <div ref={dropdownRef} className={`absolute left-0 mt-2 z-20 w-48 bg-[#192942] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                    <button 
                      onClick={acceptrequst} 
                      className='w-full text-left text-sm px-4 py-2 hover:bg-[#263e64] hover:text-white transition-colors flex gap-x-2 items-center hover:cursor-pointer border-b border-white/5 pb-2'
                    >
                      <PiPlugsConnectedBold />
                      <span>Connect</span>
                    </button>
                    <button 
                      onClick={deletereq} 
                      className='w-full text-left text-sm px-4 py-2 hover:bg-[#263e64] hover:text-white transition-colors flex gap-x-2 items-center hover:cursor-pointer pt-2'
                    >
                      <TbPlugConnectedX />
                      <span>Delete Request</span>
                    </button>
                  </div>
                </>
              ) : (
                <button className='w-full sm:w-auto justify-center bg-(--colorbg) dark:bg-(--colorbgdark) py-1.5 border border-(--border) dark:border-(--borderdark) px-4 rounded-full text-base sm:text-lg items-center gap-x-2 flex hover:scale-105 active:scale-95 transition-all duration-200'>
                  <LuCirclePlus />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Works/Collections Tabs */}
        <div className='flex gap-x-3 py-2 px-2 border border-(--border) dark:border-(--borderdark) rounded-full text-xl items-center bg-transparent justify-center w-full sm:w-auto'>
          <Link href={`/Profile/${User?._id}`} className='flex-1 sm:flex-initial'>
            <button className={`w-full rounded-full border hover:cursor-pointer px-5 flex items-center justify-center transition-all duration-200 ${
              isWorksActive 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold border-transparent shadow-sm' 
                : 'border-(--border) text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}>
              Works
            </button>
          </Link>
          <Link href={`/Profile/${User?._id}/collections`} className='flex-1 sm:flex-initial'>
            <button className={`w-full rounded-full border hover:cursor-pointer px-5 flex items-center justify-center transition-all duration-200 ${
              isCollectionsActive 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold border-transparent shadow-sm' 
                : 'border-(--border) text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}>
              Collections
            </button>
          </Link>
        </div>
        
        {/* Desktop Hamburger Menu Trigger */}
        <div className="relative hidden sm:flex justify-end">
          <button
            ref={hamburgerButtonRef}
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center hover:cursor-pointer"
          >
            <GiHamburgerMenu className="size-6 text-neutral-500 hover:text-neutral-800 dark:hover:text-white" />
          </button>

          {/* Hamburger Dropdown Menu */}
          {showHamburgerMenu && (
            <div 
              ref={hamburgerMenuRef} 
              className="absolute right-0 top-6 mt-2 z-200 w-52 bg-white dark:bg-[#0c0c14] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-xl py-2 font-sans"
            >
              {user?._id === User?._id ? (
                <>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success("Profile link copied to clipboard!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2"
                  >
                    Share Profile
                  </button>
                  <Link href={`/Profile/${User?._id}/emotion-dashboard`} onClick={() => setShowHamburgerMenu(false)}>
                    <div className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2">
                      Emotion Dashboard
                    </div>
                  </Link>
                  <Link href="/Profile/Settings" onClick={() => setShowHamburgerMenu(false)}>
                    <div className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2">
                      Settings
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      success("Profile link copied to clipboard!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors hover:cursor-pointer flex items-center gap-x-2"
                  >
                    Share Profile
                  </button>
                  <button 
                    onClick={() => {
                      success("Artist reported successfully. Thank you!");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 transition-colors hover:cursor-pointer flex items-center gap-x-2 font-medium"
                  >
                    Report Artist
                  </button>
                  <button 
                    onClick={() => {
                      success("Artist blocked successfully.");
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full text-left text-sm px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 transition-colors hover:cursor-pointer flex items-center gap-x-2 font-medium"
                  >
                    Block Artist
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileBar;