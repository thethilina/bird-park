import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Circle from "../../../../lib/models/Circle";
import "../../../../lib/models/Artist";
import "../../../../lib/models/Post";
import { getCurrentUserId } from "../../../../lib/getCurrentUser";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();

    const { circleId } = await params;

    const currentUserId = await getCurrentUserId();

    const circle = await Circle.findById(circleId)
      .populate("owner", "username fullName")
      .populate("members", "username fullName profileImage")
      .populate("admins", "username fullName")
      .populate("moderators", "username fullName");

    if (!circle) {
      return NextResponse.json(
        {
          success: false,
          message: "Circle not found",
        },
        {
          status: 404,
        }
      );
    }


    // check pending request
    const hasPendingRequest =
      circle.joinRequests?.some(
        (request: any) =>
          request.user.toString() === currentUserId &&
          request.status === "pending"
      ) || false;


    return NextResponse.json({
      success: true,
      circle,
      hasPendingRequest,
    });


  } catch (error) {

    console.error("GET CIRCLE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      }
    );

  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ circleId: string }> }
) {
  try {
    await connectDB();
    const userId = await getCurrentUserId();
    const { circleId } = await params;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return NextResponse.json(
        { message: "Circle not found" },
        { status: 404 }
      );
    }

    // Only Admin or Owner can edit settings
    const isAdmin =
      circle.owner.toString() === userId ||
      circle.admins.some((id: any) => id.toString() === userId);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { name, description, joinType, rules } = await req.json();

    if (name) circle.name = name;
    if (description !== undefined) circle.description = description;
    if (joinType) circle.joinType = joinType;
    if (rules) circle.rules = rules;

    await circle.save();

    return NextResponse.json({
      success: true,
      message: "Circle settings updated",
      circle,
    });
  } catch (error) {
    console.error("PATCH CIRCLE ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(
req: Request,
{ params }: { params: Promise<{ circleId: string }> }
) {
try {

await connectDB();

const userId = await getCurrentUserId();

const { circleId } = await params;


const circle = await Circle.findById(circleId);


if (!circle) {
return NextResponse.json(
{
message:"Circle not found"
},
{
status:404
}
);
}


if(circle.owner.toString() !== userId){

return NextResponse.json(
{
message:"Only owner can delete circle"
},
{
status:403
}
);

}


await circle.deleteOne();


return NextResponse.json({

success:true,
message:"Circle deleted"

});


}
catch(error){

console.error(error);

return NextResponse.json(
{
message:"Server error"
},
{
status:500
}
);

}

}








