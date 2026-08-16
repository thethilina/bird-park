"use client"
import React from "react";
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { FaUserPlus, FaCloudUploadAlt, FaRegListAlt, FaUsers, FaUserShield, FaCog, FaExchangeAlt, FaTrash, FaFlag, FaUserCheck } from "react-icons/fa";
import { IoLogOut, IoInformationCircleOutline } from "react-icons/io5";
import { MdCancel, MdDashboard, MdReport } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoMdAddCircle } from "react-icons/io";

interface CircleRule {
  title: string;
  description: string;
  _id: string;
}

interface CircleBarProps {

  circle: {
    _id: string;
    name: string;
    image: string;
    icon: string;
    description: string;
    joinType: "open" | "approval";
    rules?: CircleRule[];

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
  postCreateOpen : (isOpen: boolean) => void;
  onCreateActivity?: () => void;

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

function CircleBar({ circle, role, permissions ,hasPendingRequest ,postCreateOpen, onCreateActivity
 }: CircleBarProps) {

   const [menuOpen,setMenuOpen] = useState(false);

  const [joinedOpen,setJoinedOpen] = useState(false);

const router = useRouter();

const loader = useTopLoader();

// refs for outside-click handling (same pattern as NavBar)
const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
const menuDropdownRef = useRef<HTMLDivElement | null>(null);

// rules / about modal state
const [rulesModalOpen, setRulesModalOpen] = useState(false);
const [rulesModalMode, setRulesModalMode] = useState<"view" | "join">("view");
const [agreedToRules, setAgreedToRules] = useState(false);

const [aboutModalOpen, setAboutModalOpen] = useState(false);

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
      setJoinedOpen(false);
    }
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [menuOpen]);

const cancelRequest = async () => {

  loader.start();

  try {

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

// navigation handlers
const goToDashboard = () => {
  loader.start();
  router.push(`/Circle/${circle._id}/dashboard`);
};

const goToCreatePost = () => {
  loader.start();
  setMenuOpen(false);
  router.push(`/Circle/${circle._id}/create-post`);
};

const goToUploadArtwork = () => {
  loader.start();
  setMenuOpen(false);
  router.push(`/Circle/${circle._id}/upload`);
};

const goToMyPosts = () => {
  loader.start();
  setMenuOpen(false);
  router.push(`/Circle/${circle._id}/my-posts`);
};

// rules modal handlers
const openRulesModal = () => {
  setRulesModalMode("view");
  setMenuOpen(false);
  setRulesModalOpen(true);
};

const openJoinRulesModal = () => {
  setAgreedToRules(false);
  setRulesModalMode("join");
  setRulesModalOpen(true);
};

const confirmJoin = () => {
  if (!agreedToRules) return;
  setRulesModalOpen(false);
  joinCircle();
};

const closeRulesModal = () => {
  setRulesModalOpen(false);
  setAgreedToRules(false);
};

const openAboutModal = () => {
  setMenuOpen(false);
  setAboutModalOpen(true);
};

const hasRules = circle?.rules && circle.rules.length > 0;

const dropdownItemClass = "flex items-center w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) rounded";

  return (
    <nav className='z-99 lg:block w-full bg-(--color-background) dark:bg-(--background) border-(--border) flex flex-col items-center gap-y-3 sm:gap-y-5'>
  
  <div className='w-full space-y-3 sm:space-y-5'>
  
   {/**circle bannar */}
   <Image src={circle?.image} alt='bannar' width={800} height={400} className='sticky w-full h-28 sm:h-32 md:h-36 lg:h-40 xl:h-50 object-cover' />

   
  <div className='mx-4 sm:mx-6 lg:mx-10 py-3 sm:py-5 sticky space-y-3 sm:space-y-5 border-b-2 border-(--border)'>
    {/**circle name */}
    <div className='flex gap-x-3 sm:gap-x-5 items-center'>
      <Image src={circle?.icon} width={100} height={100} alt='grpicon' className='w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-xl flex-shrink-0' />
      <h1 className='text-lg sm:text-xl lg:text-2xl break-words'>{circle?.name}</h1>
    </div>

    {/**buttons */}
      <div className='flex flex-wrap gap-y-3 text-base sm:text-lg lg:text-2xl items-center justify-between'>

        <div className='flex gap-x-3 sm:gap-x-5 items-center'>
          <h1 className='whitespace-nowrap'>{circle?.members?.length} Members</h1>
          <div className='flex'>
            {circle?.members?.slice(0, 5).map((user) => ( 
              <Image key={user._id} src={user.profileImage} width={40} height={40} alt='avatar' className='w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-cover rounded-full border border-(--border) dark:border-(--borderdark) -ml-2' />   
            ))}
          </div>
        </div>

        <div className='flex items-center gap-x-2 sm:gap-x-5'>

    {/* ===== MAIN BUTTON (role-based) ===== */}

        {
          role === "none" && circle?.joinType === "open" && (

            <button

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-3 sm:px-4 rounded-full text-sm sm:text-base lg:text-xl items-center gap-x-2 sm:gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) whitespace-nowrap"
              onClick={openJoinRulesModal}
            >

              <FaUserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />

              Join

            </button>

          )
        }

        {
          role === "none" && circle?.joinType === "approval" && !hasPendingRequest && (

            <button
              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-3 sm:px-4 rounded-full text-sm sm:text-base lg:text-xl items-center gap-x-2 sm:gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) whitespace-nowrap"
              onClick={openJoinRulesModal}
            >
              <FaUserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
              Request
            </button>

          )
        }

        {
          role === "none" && circle?.joinType === "approval" && hasPendingRequest && (

            <button

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-3 sm:px-4 rounded-full text-sm sm:text-base lg:text-xl flex items-center gap-x-2 cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) whitespace-nowrap"
              onClick={()=>setMenuOpen(!menuOpen)}
              ref={menuTriggerRef}

            >

              Pending ▼

            </button>

          )
        }

        {
          role === "member" && (

            <button

              onClick={postCreateOpen.bind(null,true)}

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-3 sm:px-4 rounded-full text-sm sm:text-base lg:text-xl items-center gap-x-2 sm:gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) whitespace-nowrap"

            >

              <IoMdAddCircle size={16} className="sm:w-[18px] sm:h-[18px]" />

              <span className="hidden xs:inline">Create Post</span>
              <span className="xs:hidden">Post</span>

            </button>

          )
        }

        {
          (role === "moderator" || role === "admin" || role === "owner") && (

            <button

              onClick={goToDashboard}

              className="bg-(--colorbg) dark:bg-(--colorbgdark) py-1 border px-3 sm:px-4 rounded-full text-sm sm:text-base lg:text-xl items-center gap-x-2 sm:gap-x-3 flex cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) whitespace-nowrap"

            >

              <MdDashboard size={16} className="sm:w-[18px] sm:h-[18px]" />

              Dashboard

            </button>

          )
        }

 {/* ===== DROPDOWN MENU TRIGGER (hamburger) ===== */}

        <div className="relative text-base sm:text-lg">


          <button

            ref={role === "none" && circle?.joinType === "approval" && hasPendingRequest ? undefined : menuTriggerRef}

            onClick={()=>setMenuOpen(!menuOpen)}

            className="rounded-full text-lg sm:text-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) p-2"

          >

            <GiHamburgerMenu/>

          </button>




          {
            menuOpen && (

              <div ref={menuDropdownRef} className="absolute right-0 mt-2 bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg p-2 text-sm sm:text-md z-50 w-48 sm:w-56 max-w-[calc(100vw-2rem)]">

                {/* ---- VISITOR (none, no pending) ---- */}
                {
                  role === "none" && !hasPendingRequest && (
                    <>
                      <button onClick={openRulesModal} className={dropdownItemClass}>
                        <HiOutlineDocumentText className="mr-2" size={20} />View Rules
                      </button>
                      <button onClick={openAboutModal} className={dropdownItemClass}>
                        <IoInformationCircleOutline className="mr-2" size={20} />About Circle
                      </button>
                      <button className={dropdownItemClass}>
                        <MdReport className="mr-2" size={20} />Report Circle
                      </button>
                    </>
                  )
                }

                {/* ---- PENDING REQUEST ---- */}
                {
                  role === "none" && circle?.joinType === "approval" && hasPendingRequest && (
                    <>
                      <button onClick={cancelRequest} className={dropdownItemClass}>
                        <MdCancel className="mr-2" size={20} />Cancel Request
                      </button>
                      <button onClick={openRulesModal} className={dropdownItemClass}>
                        <HiOutlineDocumentText className="mr-2" size={20} />View Rules
                      </button>
                      <button onClick={openAboutModal} className={dropdownItemClass}>
                        <IoInformationCircleOutline className="mr-2" size={20} />About Circle
                      </button>
                      <button className={dropdownItemClass}>
                        <MdReport className="mr-2" size={20} />Report Circle
                      </button>
                    </>
                  )
                }

                {/* ---- MEMBER ---- */}
                {
                  role === "member" && (
                    <>
                    
                      <button onClick={goToMyPosts} className={dropdownItemClass}>
                        <FaRegListAlt className="mr-2" size={16} />My Posts
                      </button>

                      <button onClick={()=>setJoinedOpen(!joinedOpen)} className={dropdownItemClass}>
                        <FaUserCheck className="mr-2" size={16} />Joined ▼
                      </button>

                      {
                        joinedOpen && (
                          <button onClick={leaveCircle} className={dropdownItemClass + " pl-8"}>
                            <IoLogOut className="mr-2" size={18} />Leave Circle
                          </button>
                        )
                      }

                      <button onClick={openRulesModal} className={dropdownItemClass}>
                        <HiOutlineDocumentText className="mr-2" size={20} />View Rules
                      </button>
                      <button className={dropdownItemClass}>
                        <MdReport className="mr-2" size={20} />Report Circle
                      </button>
                    </>
                  )
                }

                {/* ---- MODERATOR ---- */}
                {
                  role === "moderator" && (
                    <>
                      <button onClick={openRulesModal} className={dropdownItemClass}>
                        <HiOutlineDocumentText className="mr-2" size={20} />View Rules
                      </button>
                    </>
                  )
                }

                {/* ---- ADMIN ---- */}
                {
                  role === "admin" && (
                    <>
                      <button onClick={() => { setMenuOpen(false); router.push(`/Circle/${circle._id}/dashboard?tab=settings`); }} className={dropdownItemClass}>
                        <FaCog className="mr-2" size={16} />Circle Settings
                      </button>
                    </>
                  )
                }

                {/* ---- OWNER ---- */}
                {
                  role === "owner" && (
                    <>
                      <button onClick={() => { setMenuOpen(false); router.push(`/Circle/${circle._id}/dashboard?tab=settings`); }} className={dropdownItemClass}>
                        <FaCog className="mr-2" size={16} />Circle Settings
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

  {/* ===== RULES MODAL (view rules & join preview, shared) ===== */}
  {
    rulesModalOpen && (

      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">

        <div className="bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">

          <h2 className="text-xl sm:text-2xl font-semibold">Circle Rules</h2>

          <div className="max-h-56 sm:max-h-72 overflow-y-auto space-y-3 sm:space-y-4">

            {
              hasRules ? (

                circle.rules!.map((rule, idx) => (

                  <div key={rule._id} className="border border-(--border) dark:border-(--borderdark) rounded-lg p-3">
                    <p className="font-semibold text-base sm:text-lg">{idx + 1}. {rule.title}</p>
                    <p className="text-sm sm:text-md opacity-80 mt-1">{rule.description}</p>
                  </div>

                ))

              ) : (

                <p className="text-sm sm:text-md opacity-70">This circle has no rules yet.</p>

              )
            }

          </div>

          {
            rulesModalMode === "join" && (

              <label className="flex items-start sm:items-center gap-x-3 text-base sm:text-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-5 h-5 cursor-pointer mt-0.5 sm:mt-0 flex-shrink-0"
                />
                I have read and agree to the circle rules
              </label>

            )
          }

          <div className="flex justify-end gap-x-3 text-base sm:text-lg">

            <button
              onClick={closeRulesModal}
              className="px-4 py-2 rounded-full border cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"
            >
              {rulesModalMode === "join" ? "Cancel" : "Close"}
            </button>

            {
              rulesModalMode === "join" && (

                <button
                  onClick={confirmJoin}
                  disabled={!agreedToRules}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    agreedToRules
                      ? "cursor-pointer bg-(--colorbg) dark:bg-(--colorbgdark) hover:bg-(--hover) dark:hover:bg-(--hoverdark)"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Agree & Continue
                </button>

              )
            }

          </div>

        </div>

      </div>

    )
  }

  {/* ===== ABOUT CIRCLE MODAL ===== */}
  {
    aboutModalOpen && (

      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">

        <div className="bg-(--color-background) dark:bg-(--background) border border-(--border) dark:border-(--borderdark) rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">

          <h2 className="text-xl sm:text-2xl font-semibold">About {circle?.name}</h2>

          <p className="text-sm sm:text-md opacity-80 max-h-60 overflow-y-auto">
            {circle?.description || "No description provided for this circle."}
          </p>

          <div className="flex justify-end text-base sm:text-lg">

            <button
              onClick={()=>setAboutModalOpen(false)}
              className="px-4 py-2 rounded-full border cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    )
  }

      </nav>
      )
}

export default CircleBar