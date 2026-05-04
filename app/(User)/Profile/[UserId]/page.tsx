
import React from 'react'
import ProfileBar from '@/public/components/ProfileBar'
import Gallery from '@/public/components/Gallery'
import { shuffledFeedDatabase } from '@/TestDataBase/artData'
import usersData from '@/TestDataBase/usersdata'
import CollectionCArd from '@/public/components/Profile/CollectionCArd'
import { collectionsDatabase } from '@/TestDataBase/collectionData'

interface Props {
  params: Promise<{ UserId: any }>;
}

async function page({ params }: Props) {

     const { UserId } = await params;
    const userIdNum = Number(UserId);


  return (
    <div className='space-y-5 pb-10'>
    {usersData.map((user)=>{

        if( user.id === userIdNum) {

            return(   <ProfileBar user={user} />)
        }else return null

    })}

<div className='xl:px-20 lg:px-10 grid-cols-6 gap-5 px-5  w-full grid '>        
   {collectionsDatabase.map((collection)=>{

        return( <CollectionCArd collection={collection} />)
    })}
</div>

   
   
    </div>
  )
}

export default page