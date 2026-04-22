import { feedDatabase } from "@/TestDataBase/artData";
import usersData from "@/TestDataBase/usersdata";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { BiCommentDetail } from "react-icons/bi";


interface Props {
  params: Promise<{ ArtId: string }>;
}

export default async function Page({ params }: Props) {
  const { ArtId } = await params;

  return (
    <div className="flex   gap-x-10  xl:mx-30 lg:mx-10 pt-5 justify-center  px-2 ">
      
    {/** left div */}

    <div className="flex-1  border-r-2   p-10  border-(--border)   flex flex-col gap-y-5">
      {feedDatabase.map((item) => {
        if (item.id === ArtId) {
          const user = usersData.find((u) => u.id === item.userId);
          return (
              <>

              {/** user avatar and name and collection */}
              <div className="flex items-center lg:text-xl gap-x-3"> 
                <Image src={user?.avatar as any} alt={user?.fullName as string} className="w-12 h-12 rounded-full" width={48} height={48} />
                <span>{user?.fullName}</span>
              </div>
              
              {/** art title */}
              <h1 className="lg:text-2xl">{item.title}</h1>

              {/** art image */}
              {item.image && (
<div className="relative w-full max-h-[calc(100vh-300px)] aspect-square md:aspect-video"> 
  <Image 
    src={item.image} 
    alt={item.title}  
    fill
    priority
    className="object-contain object-left" 
  />
</div>
)}
              </>
          );
        }
        return null;
      })}
    </div>

    {/* right div */}
  
    <div>

     {/** */} 

    </div>

    </div>
  );
}