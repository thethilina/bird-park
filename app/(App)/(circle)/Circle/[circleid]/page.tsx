"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Gallery from "@/public/components/Gallery";
import CircleBar from "@/public/components/CircleBar";
import { shuffledFeedDatabase } from "@/TestDataBase/artData";

interface Circle {
  _id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  owner: {
    _id: string;
    username: string;
    fullName: string;
  };
      joinType: "open" | "approval";

  members: {
    _id: string;
    username: string;
    fullName: string;
    profileImage: string;
  }[];
  category: string;
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


export default function Page() {

  const { circleid } = useParams();
const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);

  const [role, setRole] = useState<Role>("none");

  const [permissions, setPermissions] = useState<Permissions>({
    isOwner:false,
    isAdmin:false,
    isModerator:false,
    isMember:false,
  });


  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    if(!circleid) return;


    const fetchData = async()=>{

      try{

        const [circleRes, roleRes] = await Promise.all([

          fetch(`/api/circles/${circleid}`),

          fetch(`/api/circles/${circleid}/role`)

        ]);


        const circleData = await circleRes.json();

        const roleData = await roleRes.json();



        setCircle(circleData.circle);
        setHasPendingRequest(
  circleData.hasPendingRequest || false
);


        if(roleData.success){

          setRole(roleData.role);

          setPermissions(roleData.permissions);

        }


      }
      catch(err){

        console.error(err);

      }
      finally{

        setLoading(false);

      }

    };


    fetchData();


  },[circleid]);



  if(loading) return <div>Loading...</div>;

  if(!circle) return <div>Circle not found</div>;



  return (

    <>

      <CircleBar

        circle={circle}

        role={role}

        permissions={permissions}
hasPendingRequest={hasPendingRequest}

      />




    </>

  );
}