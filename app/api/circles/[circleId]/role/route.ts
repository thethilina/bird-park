import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "../../../../../lib/db";
import Circle from "../../../../../lib/models/Circle";
import { getCurrentUserId } from "../../../../../lib/getCurrentUser";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ circleId: string }> }
) {

  try {

    await connectDB();


    const currentUserId = await getCurrentUserId();


    if (!currentUserId) {

      return NextResponse.json(
        {
          success:false,
          message:"Unauthorized"
        },
        {
          status:401
        }
      );

    }


    const userId = new mongoose.Types.ObjectId(currentUserId);


    const { circleId } = await params;



    const circle = await Circle.findById(circleId).select(
      "owner admins moderators members joinRequests"
    );



    if(!circle){

      return NextResponse.json(
        {
          success:false,
          message:"Circle not found"
        },
        {
          status:404
        }
      );

    }



    const isOwner =
      circle.owner.equals(userId);



    const isAdmin =
      circle.admins.some(
        (id:any)=>
          id.equals(userId)
      );



    const isModerator =
      circle.moderators.some(
        (id:any)=>
          id.equals(userId)
      );



    const isMember =
      isOwner ||
      isAdmin ||
      isModerator ||
      circle.members.some(
        (id:any)=>
          id.equals(userId)
      );




    const hasPendingRequest =
      circle.joinRequests.some(
        (request:any)=>
          request.user.equals(userId) &&
          request.status === "pending"
      );




    let role:
    "owner" |
    "admin" |
    "moderator" |
    "member" |
    "none"
    = "none";



    if(isOwner)
      role="owner";

    else if(isAdmin)
      role="admin";

    else if(isModerator)
      role="moderator";

    else if(isMember)
      role="member";





    return NextResponse.json({

      success:true,

      role,

      hasPendingRequest,

      permissions:{

        isOwner,

        isAdmin,

        isModerator,

        isMember

      }

    });



  }
  catch(error){

    console.error(error);


    return NextResponse.json(
      {
        success:false,
        message:"Server Error"
      },
      {
        status:500
      }
    );

  }

}