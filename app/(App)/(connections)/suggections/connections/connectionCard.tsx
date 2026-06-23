"use client"
import Image from "next/image"
import { useEffect , useState } from "react"
import { useTopLoader } from "nextjs-toploader"
import { PiPlugsConnectedBold } from "react-icons/pi"
import { TbPlugConnectedX } from "react-icons/tb"
import { ToastContainer, toast } from 'react-toastify';
import Link from "next/link"

interface connectionCardProps {
  connection: any;
  onRemove: (id: string) => void;
}


export default function ConnectionCard({
  connection,
  onRemove,
}: connectionCardProps) {

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


  const removeconnection = async()=>{


    try{
       loader.start()
       const response = await fetch(`/api/connection/${connection?._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
       
      });

      const data = await response.json();
      if (!response.ok) {
        errorToast("Error removing the connection")
        loader.done()
        return;
      }

      success("Connection removed successfully!")
        loader.done()
onRemove( connection?._id);

    }catch(error){

       errorToast("Error removing the connection")
        loader.done()


    }




  }



return(

<div className="border rounded-xl">

<Image src={connection?.profileImage} alt={connection?.username} width={200} height={200}  className="w-full rounded-t-xl h-50 object-cover "/> 

<div className="space-y-3  px-4 py-4">
 <h1 className="text-2xl font-semibold" > <Link href={`/Profile/${connection?._id}`} > {connection?.username} </Link> </h1> 

            <button onClick={removeconnection} className='text-xl px-2 py-1  bg-[#192942] hover:bg-[#2c456e] rounded-xl  w-full hover:font-medium  hover:cursor-pointer  flex gap-x-2 items-center'><TbPlugConnectedX  />Remove connection</button>

</div>
</div>


)



}