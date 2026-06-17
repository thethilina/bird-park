"use client"
import React from 'react'
import ProfileBar from '@/public/components/ProfileBar'
import Gallery from '@/public/components/Gallery'
import { shuffledFeedDatabase } from '@/TestDataBase/artData'
import CollectionCArd from '@/public/components/Profile/CollectionCArd'
import { collectionsDatabase } from '@/TestDataBase/collectionData'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";



interface Props {
  params: Promise<{ UserId: any }>;
}

 function page({ params }: Props) {


const { UserId } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/artists/${UserId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data.artist);
      } catch (error) {
        console.error("An error occurred while fetching user data:", error);
      }
    };

    if (UserId) {
      fetchUser();
    }
  }, [UserId]);




  return (
    <div className='space-y-5'>
   

             <ProfileBar User={user} />
      

  

        
    <div className='grid   grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-5'>
    {collectionsDatabase.filter((c) => c.creatorId === user?._id ).map((collection) => {
        return <CollectionCArd collection={collection} />
    })}
    </div>

    </div>
  )
}

export default page