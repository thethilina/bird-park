"use client"
import React from 'react'
import ProfileBar from '@/public/components/ProfileBar'
import Gallery from '@/public/components/Gallery'
import { shuffledFeedDatabase } from '@/TestDataBase/artData'
import usersData from '@/TestDataBase/usersdata'
import CollectionCArd from '@/public/components/Profile/CollectionCArd'
import { collectionsDatabase } from '@/TestDataBase/collectionData'
import Buttonwhite from '@/public/components/Tn/Buttonwhite'
import Image from 'next/image'
import InputFiled from '@/public/components/Tn/InputFiled'
interface Props {
  params: Promise<{ UserId: any }>;
}

async function page({ params }: Props) {

     const { UserId } = await params;
    const userIdNum = Number(UserId);
    const user = usersData.find((user) => user.id === userIdNum);

  return (
    <div className='space-y-15 xl:px-20 lg:px-10 py-10 font-sans'>
   
   {/** top section */}
   <div className='flex justify-between items-center border-b-2 border-(--border) pb-5'>

    <div className='space-y-3'>
    <h1 className='font-semibold text-2xl'>Choose how you appear  on Bird Park</h1>    
    <h2>Signed as {user?.email}</h2>
    </div>

    <div className='space-x-4'>
    <button className='px-4 py-1 bg-[#385893] text-white rounded-md'>Save</button>
    <button className='px-4 py-1 bg-[#f0f0f0] text-black rounded-md'>Cancel</button>
    </div>

   </div>


  {/** middle section */}
    <div className='flex  items-start  gap-x-10'>



{/** avatar */}
<div className='space-y-3 w-1/2'>
    <h2 className='text-xl'>Avatar</h2>
    <p>Your avatar will appear throughout Bird Park next to your posts, comments, and anywhere your presence is seen.</p>
    <div className='flex space-x-10 '>
    {user?.avatar && (
      <Image src={user.avatar} alt='avatar'  className='rounded-lg w-50 h-50' />
    )}
    <div className='space-x-5 flex flex-col justify-around'>
    <p>Use an image that’s at least 98 × 98 pixels and under 4MB. PNG or GIF formats are supported (no animations). Make sure your avatar follows Bird Park’s community guidelines.</p>   
    <div className='space-x-5'>
        <button className='px-4 py-1 bg-[#385893] text-white rounded-md'>Change</button>
        <button className='px-4 py-1 bg-[#f0f0f0] text-black rounded-md'>Remove</button>
    </div>
    </div>
    </div>
</div>


{/** Full Name*/}
<div className='w-1/2 space-y-3'>
<h1 className='text-xl'>Full Name</h1>
<p>Add your full name for Bird Park crew identification—it helps the community recognize and trust who’s behind the work.</p>
<InputFiled placeholder={user?.fullName} value={user?.fullName || ''} onChange={() => {}}  />

</div>



    </div>      


  {/** bottom section */}

  <div className='flex  items-start  gap-x-10'>


  {/** User Name */}
    <div className='space-y-3 w-1/2 '>
        <h1 className='text-xl'>User Name</h1>
        <p>Choose a name that reflects you and your work. This name will be visible across Bird Park wherever your presence appears.</p>
        <InputFiled placeholder={user?.username} value={user?.username || ''} onChange={() => {}} />
    </div>    

  {/**birthday */}

  <div className='space-y-3 w-1/2'>
    <h1 className='text-xl'>Birthday</h1>
    <p>Add your birthdate to help us understand your age and keep the Bird Park community safe and appropriate for everyone.</p>
    <InputFiled placeholder={user?.birthDate} value={user?.birthDate || ''} onChange={() => {}} />
  </div>




  </div>


    </div>
  )
}

export default page