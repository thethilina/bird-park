"use client";
import ProfileBar from "@/public/components/ProfileBar";
import Gallery from "@/public/components/Gallery";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";


function Page() {
  const { UserId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setposts] = useState<any[]>([]);


  const fetchposts = async()=>{

    try{

        const response = await fetch(`/api/post/user/${UserId}`)
         if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

                const data = await response.json();
                setposts(data.posts)
    }
       catch (error) {
        console.error("An error occurred while fetching user data:", error);
      }
    

    




  } 

  useEffect(() => {
    

    if (UserId) {
      fetchposts();
    }
  }, []);



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/artists/${UserId}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data.artist);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/post/user/${UserId}`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        if (data.success) setposts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
      }
    };

    if (UserId) {
      fetchUser();
      fetchPosts();
    }
  }, [UserId]);

  return (
    <div className="space-y-5">
      <ProfileBar User={user} />

      <div className="grid xl:grid-cols-4  md:grid-cols-2 grid-cols-2  lg:grid-cols-3 md:gap-3 gap-2 sm:gap-3 lg:gap-5 xl:gap-10 w-full">
      {posts.map((art)=>{
        return( <div> 
       <Link href={`/Art/${art?._id}`} >   <img src={art?.media.url} alt="sdfdsf"  className="object-cover md:h-100  h-100 xl:h-100 w-full " /></Link>
          </div>)

      })


      }
     
      </div>
    </div>
  );
}

export default Page;