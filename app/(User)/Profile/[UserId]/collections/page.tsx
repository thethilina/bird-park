
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
    <div className='space-y-5'>
    {usersData.map((user)=>{

        if( user.id === userIdNum) {

            return(   <ProfileBar user={user} />)
        }else return null

    })}

        
    <div className='grid lg:px-10 xl:px-20  grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-5'>
    {collectionsDatabase.filter((c) => c.creatorId === userIdNum).map((collection) => {
        return <CollectionCArd collection={collection} />
    })}
    </div>

    </div>
  )
}

export default page