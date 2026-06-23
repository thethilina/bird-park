"use client"
import Image from "next/image"
import { useEffect , useState } from "react"
import { useTopLoader } from "nextjs-toploader"
import { PiPlugsConnectedBold } from "react-icons/pi"
import { TbPlugConnectedX } from "react-icons/tb"
import { ToastContainer, toast } from 'react-toastify';
import Link from "next/link"
import { BsSendPlusFill } from "react-icons/bs"

interface suggectionCardProps {
  suggection: any;
  onRemove: (id: string) => void;
}


export default function SuggectionCard({
  suggection,
  onRemove,
}: suggectionCardProps) {

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

  const sendrequest = async()=>{


    try{
       loader.start()
       const response = await fetch('/api/connection/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        "receiverId": suggection._id

        }),
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error sending the request")
        loader.done()
        return;
      }

      success("Request sent successfully!")
        loader.done()
        onRemove( suggection?._id);

    }catch(error){

       errorToast("Error sending the request")
        loader.done()


    }




  }



 


return(

<div className="border rounded-xl">

<Image src={suggection?.profileImage} alt={suggection?.username} width={200} height={200}  className="w-full rounded-t-xl h-50 object-cover "/> 

<div className="space-y-3  px-4 py-4">
 <h1 className="text-2xl font-semibold" > <Link href={`/Profile/${suggection?._id}`} > {suggection?.username} </Link> </h1> 

            <button onClick={sendrequest} className='text-xl px-2 py-1  bg-[#192942] hover:bg-[#2c456e] rounded-xl  w-full hover:font-medium  hover:cursor-pointer  flex gap-x-2 items-center'>      <BsSendPlusFill />
                        Connect</button>

</div>
</div>


)



}