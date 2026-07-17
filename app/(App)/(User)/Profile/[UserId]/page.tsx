"use client";

import ProfileBar from "@/public/components/ProfileBar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";


function Page() {

  const { UserId } = useParams();

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);


  useEffect(() => {

    if (!UserId) return;


    const fetchData = async () => {

      try {

        const [userResponse, postsResponse] = await Promise.all([
          fetch(`/api/artists/${UserId}`),
          fetch(`/api/post/user/${UserId}`)
        ]);


        const userData = await userResponse.json();
        const postsData = await postsResponse.json();


        if(userData.success){
          setUser(userData.artist);
        }


        if(postsData.success){
          setPosts(postsData.posts);
        }


      } catch(error){

        console.error(
          "Profile loading error:",
          error
        );

      }

    };


    fetchData();


  }, [UserId]);



  return (

    <div className="space-y-5">


      <ProfileBar User={user}/>



      <div
        className="
        grid 
        xl:grid-cols-4
        lg:grid-cols-3
        md:grid-cols-2
        grid-cols-2
        md:gap-5
        gap-3
        w-full
        "
      >


      {
        posts.map((post)=>{


          return (

          <Link
            key={post._id}
            href={`/Art/${post._id}`}
          >


          {
            post.type === "art" ? (

              <div
                className="
                overflow-hidden
                bg-(--colorbg)
                border
                border-(--border)
                "
              >

                <img
                  src={post.media?.url}
                  alt={post.title}
                  className="
                  object-cover
                  h-100
                  w-full
                  "
                />

              </div>


            ) : (


              <div
                className="
                h-100
                border
                border-(--border)
                p-5
                flex
                flex-col
                justify-center
                overflow-hidden
                "
                style={{
                  backgroundColor:
                    post.poemStyle?.backgroundColor || "#fff",
                  color:
                    post.poemStyle?.fontColor || "#000",
                  fontFamily:
                    post.poemStyle?.fontFamily || "Georgia"
                }}
              >


                <h2
                  className="
                  font-bold
                  text-xl
                  mb-4
                  "
                >
                  {post.title}
                </h2>



                <p
                  className="
                  line-clamp-8
                  whitespace-pre-line
                  "
                  style={{
                    fontSize:
                      post.poemStyle?.fontSize || "16px"
                  }}
                >
                  {post.body}
                </p>


              </div>


            )

          }


          </Link>

          )


        })
      }


      </div>


    </div>

  );
}


export default Page;