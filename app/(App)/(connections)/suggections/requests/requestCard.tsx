"use client"
import Image from "next/image"
import { useEffect , useState } from "react"
import { useTopLoader } from "nextjs-toploader"
import { PiPlugsConnectedBold } from "react-icons/pi"
import { TbPlugConnectedX } from "react-icons/tb"
import { ToastContainer, toast } from 'react-toastify';
import Link from "next/link"

interface RequestCardProps {
  requst: any;
  onRemove: (id: string) => void;
}


export default function RequestCard({
  requst,
  onRemove,
}: RequestCardProps) {

const  [ connectionStatus , setconnectionStatues ] = useState('not_sent')
const loader = useTopLoader()


const success = (msg: string) =>
  toast(msg, {
    position: "top-right",
    autoClose: 2000,
    type: "success",
  });

const errorToast = (msg: string) =>
  toast(msg, {
    position: "top-right",
    autoClose: 2000,
    type: "error",
  });


  const acceptrequst = async()=>{


    try{
       loader.start()
       const response = await fetch('/api/connection/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "requestId": requst?._id

        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error accepting the request")
        loader.done()
        return;
      }

  
        success(`Connected with ${requst?.sender.username} sucessfully!`)   
        loader.done()
onRemove( requst?._id);
    }catch(error){

        errorToast("Error accepting the request")
        loader.done()


    }




  }

 const deletereq = async()=>{


    try{
       loader.start()
       const response = await fetch(`/api/connection/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "requestId": requst?._id

        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error declining the request")
        loader.done()
        return;
      }

  
      success(`Request from ${requst?.sender.username} has declined sucessfully!`)
        loader.done()
onRemove( requst?._id);

    }catch(error){

       errorToast("Error declining the request")
        loader.done()


    }




  }


return(

<div className="border rounded-xl">

<Image src={requst?.sender.profileImage} alt={requst.sender.username} width={200} height={200}  className="w-full rounded-t-xl h-36 sm:h-44 md:h-50 object-cover "/> 

<div className="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
 <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate" > <Link href={`/Profile/${requst?.sender._id}`} title={requst?.sender.username} > {requst?.sender.username} </Link> </h1> 

            <button onClick={acceptrequst} className='text-xs sm:text-sm md:text-base px-2 py-1.5 sm:px-3 sm:py-2 bg-[#192942] hover:bg-[#2c456e] rounded-xl  w-full hover:font-medium  hover:cursor-pointer  flex gap-x-2 items-center justify-center'><PiPlugsConnectedBold className="shrink-0" /><span>Connect</span></button>
            <button onClick={deletereq} className='text-xs sm:text-sm md:text-base px-2 py-1.5 sm:px-3 sm:py-2 hover:font-medium bg-[#0d1520] w-full rounded-xl  hover:bg-[#151e2c] hover:cursor-pointer flex gap-x-2 items-center justify-center'><TbPlugConnectedX className="shrink-0" /><span>Delete Request</span></button>

</div>
</div>


)



}