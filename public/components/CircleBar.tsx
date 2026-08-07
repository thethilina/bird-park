"use client"
import React from "react";
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { FaUserPlus, FaCheckCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdCancel, MdDashboard } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

interface CircleBarProps {

  circle: {
    _id: string;
    name: string;
    image: string;
    icon: string;
    description: string;
    joinType: "open" | "approval";

    members: {
      _id: string;
      username: string;
      fullName: string;
      profileImage: string;
    }[];
  };

  role: Role;

  permissions: Permissions;

  hasPendingRequest: boolean;

}

type Role =
  | "none"
  | "member"
  | "moderator"
  | "admin"
  | "owner";


interface Permissions {
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
}


interface CircleBarProps {

  circle: {
    _id: string;
    name: string;
    image: string;
    icon: string;
    description: string;
    joinType: "open" | "approval";

    members: {
      _id: string;
      username: string;
      fullName: string;
      profileImage: string;
    }[];

  };

  role: Role;

  permissions: Permissions;

}

function CircleBar({ circle, role, permissions ,hasPendingRequest
 }: CircleBarProps) {

   const [menuOpen,setMenuOpen] = useState(false);

  const [joinedOpen,setJoinedOpen] = useState(false);

const router = useRouter();

const loader = useTopLoader();

// refs for outside-click handling (same pattern as NavBar)
const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
const menuDropdownRef = useRef<HTMLDivElement | null>(null);

const joinedTriggerRef = useRef<HTMLButtonElement | null>(null);
const joinedDropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;

    if (
      menuOpen &&
      menuDropdownRef.current &&
      !menuDropdownRef.current.contains(target) &&
      menuTriggerRef.current &&
      !menuTriggerRef.current.contains(target)
    ) {
      setMenuOpen(false);
    }

    if (
      joinedOpen &&
      joinedDropdownRef.current &&
      !joinedDropdownRef.current.contains(target) &&
      joinedTriggerRef.current &&
      !joinedTriggerRef.current.contains(target)
    ) {
      setJoinedOpen(false);
    }
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [menuOpen, joinedOpen]);

const cancelRequest = async () => {

  loader.start();

  try {

    // get current user id if you already store it somewhere
    const res = await fetch(
      `/api/circles/${circle._id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: "CURRENT_USER_ID",
        }),
      }
    );


    const data = await res.json();


    if (!res.ok) {

      throw new Error(data.message);

    }


    toast.success(data.message);


    window.location.reload();


  } catch (err:any) {

    toast.error(
      err.message || "Failed to cancel request"
    );

  } finally {

    loader.done();

  }

};


const joinCircle = async()=>{

loader.start();

try{

const res = await fetch(
`/api/circles/${circle._id}/join`,
{
method:"POST"
}
);


const data = await res.json();


if(!res.ok){

throw new Error(data.message);

}


toast.success(data.message);


window.location.reload();

}
catch(err:any){

toast.error(
err.message || "Failed to join circle"
);

}
finally{

loader.done();

}

};




const leaveCircle = async()=>{

loader.start();


try{


const res = await fetch(
`/api/circles/${circle._id}/leave`,
{
method:"POST"
}
);



const data = await res.json();



if(!res.ok){

throw new Error(data.message);

}



toast.success(data.message);


window.location.reload();



}
catch(err:any){

toast.error(
err.message || "Failed to leave circle"
);

}
finally{

loader.done();

}

};








  return (
    <nav className='   z-99 lg:block w-full  bg-(--color-background) dark:bg-(--background)  border-(--border)   flex flex-col items-center    gap-y-5'>
  
  <div className='   space-y-5'>
  
   {/**circle bannar */}
   <Image src={circle?.image} alt='bannar' width={800} height={400} className='sticky  w-full lg:h-40 xl:h-50  object-cover' />

   
  <div className='mx-10 py-5 sticky space-y-5 border-b-2 border-(--border)'>
    {/**circle name */}
    <div className='flex gap-x-5  items-center'>
      <Image src={circle?.icon} width={100} height={100} alt='grpicon' className='w-20 h-20 object-cover rounded-xl' />
      <h1 className='text-2xl  text-center'>{circle?.name}</h1>
    </div>

    {/**buttons */}
      <div className='flex text-2xl items-center justify-between'>

        <div className='flex gap-x-5 items-center'>
          <h1>{circle?.members?.length} Members</h1>
          <div className='flex'>
            {circle?.members?.slice(0, 5).map((user) => ( 
              <Image key={user._id} src={user.profileImage} width={40} height={40} alt='avatar' className=' object-cover rounded-full border border-(--border) dark:border-(--borderdark) -ml-2' />   
            ))}
          </div>
        </div>

        <div className='flex items-center gap-x-5'>
    {/* JOIN BUTTON */}

        {
          role === "none" && circle?.joinType === "open" && (

            <button

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"
              onClick={joinCircle}
            >

              <FaUserPlus size={18} />

              Join

            </button>

          )
        }
{ role === "none" && circle?.joinType === "approval" &&
!hasPendingRequest && ( <button className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)" onClick={joinCircle} > <FaUserPlus size={18} /> Request </button> ) }
        {
        
role==="none" &&
circle?.joinType==="approval" &&
hasPendingRequest && (

<div className="relative">

<button

ref={joinedTriggerRef}

onClick={()=>setJoinedOpen(!joinedOpen)}

className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl flex items-center gap-x-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"

>

Pending ▼

</button>


{
joinedOpen && (

<div ref={joinedDropdownRef} className="absolute right-0 mt-2 text-lg bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg p-2 text-md z-50 w-48">


<button

onClick={cancelRequest}

className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded"

>

<MdCancel className="inline mr-2" size={20} />Cancel Request

</button>


</div>

)

}


</div>

)
}
        

        {/* MEMBER BUTTON */}

        {
          role === "member" && (

            <div className="relative">


              <button

                ref={joinedTriggerRef}

                onClick={()=>setJoinedOpen(!joinedOpen)}

                className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"

              >

                Joined ▼

              </button>



              {
                joinedOpen && (

                  <div ref={joinedDropdownRef} className="text-lg  absolute right-0 mt-2 bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg p-2  z-50 w-48">


                    <button className="block w-full text-left px-4 py-2  transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">

                      <FaCheckCircle className="inline mr-2" size={18} />Joined

                    </button>


                    <button  onClick={leaveCircle} className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">
 
                      <IoLogOut className="inline mr-2" size={20} />Leave Circle

                    </button>


                  </div>

                )
              }


            </div>

          )
        }
        
         {/* STAFF BUTTON */}

        {
          (
            role === "moderator" ||
            role === "admin" ||
            role === "owner"

          ) && (

            <button

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-4 rounded-full text-xl items-center gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"

            >

              <FaUserPlus size={18} />

              Invite

            </button>


          )
        }
 {/* MENU */}

        <div className="relative text-lg ">


          <button

            ref={menuTriggerRef}

            onClick={()=>setMenuOpen(!menuOpen)}

            className=" rounded-full text-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) p-2"

          >

            <GiHamburgerMenu/>

          </button>




          {
            menuOpen && (

              <div ref={menuDropdownRef} className="absolute right-0 mt-2 bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg p-2 text-md z-50 w-52">


                {/* everyone */}

                <button className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">

                  <HiOutlineDocumentText className="inline mr-2" size={20} />View Rules

                </button>


              



                {/* members */}

                {
                  permissions.isMember && (

                    <>

                    <button className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">

                      <FaCloudUploadAlt className="inline mr-2" size={20} />Upload Artwork

                    </button>


                    </>

                  )
                }




                {/* moderators/admin */}

                {
                  (
                    permissions.isModerator ||
                    permissions.isAdmin ||
                    permissions.isOwner

                  ) && (

                    <>


                    <button className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">

                      <MdDashboard className="inline mr-2" size={20} />Dashboard

                    </button>


                    <button className="block w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded">

                      <IoMdAddCircle className="inline mr-2" size={20} />Create Activity

                    </button>


                    </>

                  )
                }




           


              </div>

            )

          }


        </div>
        </div>


   

      </div>

  </div>
  </div>
      </nav>
      )
}

export default CircleBar