"use client"
import { useState , useEffect } from "react"
import RequestCard from "../requests/requestCard"

export default function  page(){

const [requsts ,pendingRequests] = useState<any[]>([])


const fetchrequests = async()=>{


try{

    const res = await fetch(`/api/connection/pending` , {
        method : 'GET',
        headers: { 'Content-Type': 'application/json' },

    })

    if (!res.ok) {
        alert("error fetching data")
    }

      const data = await res.json();
        pendingRequests(data.requests)
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
    {requsts.map((req:any)=>{

return(

<RequestCard requst = {req} key = {req._id}   onRemove={(id: string) => {
    pendingRequests((prev: any[]) =>
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