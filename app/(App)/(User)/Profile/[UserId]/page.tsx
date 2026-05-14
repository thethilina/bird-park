
import React from 'react'
import ProfileBar from '@/public/components/ProfileBar'
import Gallery from '@/public/components/Gallery'
import { shuffledFeedDatabase } from '@/TestDataBase/artData'
import usersData from '@/TestDataBase/usersdata'

interface Props {
  params: Promise<{ UserId: any }>;
}

async function page({ params }: Props) {

     const { UserId } = await params;
    const userIdNum = Number(UserId);


  return (
    <div className='space-y-5'>
    {usersData.map((user)=>{

        if( user.id === userIdNum) {

            return(   <ProfileBar user={user} />)
        }else return null

    })}

        
    <Gallery artbase={shuffledFeedDatabase.filter((a)=> a.userId === userIdNum)} />
   
    </div>
  )
}

export default page