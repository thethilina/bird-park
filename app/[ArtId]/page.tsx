import { feedDatabase } from "@/TestDataBase/artData";
import usersData from "@/TestDataBase/usersdata";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { GoComment } from "react-icons/go";
import { commentData } from "@/TestDataBase/commentData";
import Coment from "@/public/components/Tn/Coment";

interface Props {
  params: Promise<{ ArtId: any }>;
}

export default async function Page({ params }: Props) {
  const { ArtId } = await params;

  return (
    <div className="lg:flex  min-h-screen  px-3   gap-x-10  xl:mx-30 lg:mx-10  justify-center   ">
      
    {/** left div */}

    <div className="flex-1 lg:border-r-2  lg:pr-10 py-3  lg:py-10  border-(--border) gap-y-2  flex flex-col lg:gap-y-5">
      {feedDatabase.map((item) => {
        if (item.id === ArtId) {
          const user = usersData.find((u) => u.id === item.userId);
          return (
              <>

              {/** user avatar and name and collection */}
              <div className="flex items-center lg:text-xl gap-x-3"> 
                <Image src={user?.avatar as any} alt={user?.fullName as string} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" width={48} height={48} />
                <span>{user?.fullName}</span>
              </div>
              
              {/** art title */}
              <h1 className="lg:text-2xl">{item.title}</h1>

              {/** art image */}
{item.image && ( <div>
    <div className="w-full border-(--border)  block lg:hidden border-2 rounded-sm  " >
    <img 
      src={typeof item.image === 'string' ? item.image : (item.image as any).src} 
      alt={item.title}
      className="w-full  h-full object-contain object-center"
      style={{ 
        backgroundColor: "transparent",
        borderRadius: "0px" 
      }} 
    />
  </div>
  <div className="w-full border-(--border)  lg:block hidden border-2 rounded-sm  " style={{height: "calc(100vh - 300px)" }}>
    <img 
      src={typeof item.image === 'string' ? item.image : (item.image as any).src} 
      alt={item.title}
      className="w-full  h-full object-contain object-center"
      style={{ 
        backgroundColor: "transparent",
        borderRadius: "0px" 
      }} 
    />
  </div></div>
)}       </>
          );
        }
        return null;
      })}
    </div>

  {/* right div */}

<div 
  className="lg:my-10 lg:w-1/3 lg:px-5 rounded-sm overflow-y-auto   bg-(--color-background) dark:bg-(--background)
             [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
  style={{ height: "calc(100vh - 100px)" }} 
>
  {feedDatabase.map((item) => {
    if (item.id === ArtId) {
      const user = usersData.find((u) => u.id === item.userId);
      
      return (
        <div key={item.id} className="flex flex-col">
          
          {/** Header */}
          <div className="lg:sticky top-0  bg-(--color-background) dark:bg-(--background) w-auto z-99 ">
          <div className="   flex lg:gap-x-5 gap-x-2 items-center border-(--border) lg:pb-4 pb-2 border-b-2">
            <CiHeart className="size-5 lg:size-7" />
            <span className="text-xl lg:text-3xl">{item.heartCount}</span>
            <GoComment className=" lg:size-5.5" />
            <span className="text-xl lg:text-3xl">10</span>
          </div>

          {/** Comment Input */}
          <div className="flex items-center gap-x-3 mt-5 mb-5">
            <input 
              placeholder="Add a comment..." 
              type="text" 
              className="flex-1 font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark) rounded-xl py-2 px-4 outline-none focus:ring-1 focus:ring-blue-500" 
            />
            <button className="px-6 py-2 bg-[#3B5D95] text-white font-medium rounded-[4px_20px_20px_20px] hover:bg-[#2e4a7a] transition-colors whitespace-nowrap">
              Post
            </button>
          </div>
          </div>

          {/** Comments list */}
          <div className="space-y-5 lg:space-y-10">
            {commentData.map((comment) => {
              if (comment.artid === parseInt(item.id as string)) {
                const commentUser = usersData.find((u) => u.id === comment.userId);
                return (
                  <Coment key={comment.id} comment={comment} user={commentUser} />
                );
              }
              return null;
            })}
          </div>

        </div>
      );
    }
    return null;
  })}
</div>
  </div>
  );
}