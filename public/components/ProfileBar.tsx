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


function ProfileBar({ User }: any) {
  const { user } = useAuth();
  const  [ connectionStatus , setconnectionStatues ] = useState('not_sent')
  const loader = useTopLoader()
  const [sentreqID , setsentreqID] = useState(null)
  const [receivedID , setreverivedID] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLButtonElement | null>(null);


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
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className=' space-y-5 border-(--border)  border-b-2 py-7  z-49 w-full bg-(--color-background) dark:bg-(--background)  ) '>
     <div className="   py-1   bg-(--color-background)   )    w-full      flex items-center justify-between ">

    <div  className='flex gap-x-4 items-center'>
    <Image src={User?.profileImage} alt='profileImage' width={100} height={100} className='w-20 h-20 object-cover rounded-full border border-(--border) dark:border-(--borderdark)'/>
    <div>
      <h1 className='text-2xl '>{User?.username}</h1>
      <p className='text-xl text-(--text-muted) dark:text-(--text-muted-dark)'>{`@${User?.email}`}</p>
    </div>
    </div>

    <div className='flex items-center text-xl gap-x-10'>
      <h1> Connections  {User?.connections?.length}</h1>
      <h1>Observers {User?.observers?.length} </h1>
    </div>

     </div>




    <div className="  bg-(--color-background) )   w-full    flex items-center justify-between ">

 

  {user?._id === User?._id ? (
   <Link
  href={`/Profile/Settings`}
  className=" bg-[#0D1725] py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex"
>
 <LuCirclePlus />
  Settings
</Link>
    ) : (
      <>
        {connectionStatus === "connected" ? ( <>
          <button  ref={avatarRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}  className='bg-(--colorbg) hover:cursor-pointer dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex'>
            <PiPlugsConnectedBold />
            Connected
          </button>

              <div ref={dropdownRef} className={`absolute z-200  space-y-2  mt-25 px-3  translate-x-2/10 bg-[#192942]  border border-(--border) dark:border-(--borderdark) rounded-b-2xl rounded-r-2xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
            <button onClick={removeconnection} className='text-xl px-2 py-1  hover:font-medium hover:bg-[#263e64] hover:cursor-pointer border-b flex gap-x-2 items-center'><TbPlugConnectedX  />Remove connection</button>

            </div>
          </>
        ) : connectionStatus === "not_sent" ? (
          <button onClick={sendrequest} className='bg-[#192942] hover:bg-[#2c456e]  hover:cursor-pointer py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex'>
            <BsSendPlusFill />
            Connect
          </button>
        ) :  connectionStatus === "observing" ? (
          <>
          <button ref={avatarRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}  className='bg-[#192942] hover:bg-[#1f314e] hover:cursor-pointer py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex'>
            <BsFillEyeFill />
            Observing
          </button>

          <div ref={dropdownRef} className={`absolute z-200   mt-25 px-5 translate-x-2/10 bg-[#192942]  border border-(--border) dark:border-(--borderdark) rounded-b-2xl rounded-r-2xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
            <button onClick={cancelsentreq} className='text-xl px-2 py-1  hover:font-medium hover:bg-[#263e64] hover:cursor-pointer border-b flex gap-x-2 items-center'><PiEyeClosedFill /> Stop observing</button>
            </div>
          </>
        ) :  connectionStatus === "observer" ? (<>
          <button  ref={avatarRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}  className='bg-[#192942] hover:cursor-pointer py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex'>
            <GrConnect  />
            Repond
          </button>
          
            <div ref={dropdownRef} className={`absolute z-200  space-y-2  mt-40 px-3  translate-x-2/10 bg-[#192942]  border border-(--border) dark:border-(--borderdark) rounded-b-2xl rounded-r-2xl shadow-lg py-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
            <button onClick={acceptrequst} className='text-xl px-2 py-1  hover:font-medium hover:bg-[#263e64] hover:cursor-pointer border-b flex gap-x-2 items-center'><PiPlugsConnectedBold /> Connect</button>
            <button onClick={deletereq} className='text-xl px-2 py-1  hover:font-medium hover:bg-[#263e64] hover:cursor-pointer border-b flex gap-x-2 items-center'><TbPlugConnectedX  /> Delete Request</button>

            </div>
            
            </>
        ): (
          <button className='bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex'>
            <LuCirclePlus />
          </button>
        )}
      </>
    )}


    <div className='flex gap-x-3 py-2 px-2 border rounded-full text-xl items-center'>

    <Link href={`/Profile/${User?._id}`}>
      <button className='rounded-full border hover:cursor-pointer  px-5 flex items-center  justify-center'>Works</button>
    </Link>
    <Link href={`/Profile/${User?._id}/collections`}>
      <button className='rounded-full border hover:cursor-pointer px-5 flex items-center justify-center'>Collections</button>
    </Link>
    </div>



    <GiHamburgerMenu className="size-6" />


    </div>
    </div>
  )
}

export default ProfileBar