"use client"
import { useState , useEffect } from "react"
import ConnectionCard from "./connectionCard"

export default function  page(){

const [connections ,setConnections] = useState<any[]>([])


const fetchrequests = async()=>{


try{

    const res = await fetch(`/api/connection` , {
        method : 'GET',
        headers: { 'Content-Type': 'application/json' },

    })

    if (!res.ok) {
        alert("error fetching data")
    }

      const data = await res.json();
        setConnections(data.connections)
        console.log(data.requests)

}catch(e){

alert("error fetching data")

}finally{




}


}


useEffect(()=>{
fetchrequests()

}
,[]
)

return(

<>
<div className="pl-75 pt-10 ">

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
    {connections.map((con:any)=>{

return(

<ConnectionCard connection = {con} key = {con._id}   onRemove={(id: string) => {
    setConnections((prev: any[]) =>
      prev.filter((r: any) => r._id !== id)
    );
  }} />



)



}



)


}
</div>


</div>
</>



)








}   