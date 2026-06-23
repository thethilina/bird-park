"use client"
import { useState , useEffect } from "react"
import ObservingCard from "./ObservingCard"

export default function  page(){

const [users ,setUsers] = useState<any[]>([])


const fetchrequests = async()=>{


try{

    const res = await fetch(`/api/connection/observing` , {
        method : 'GET',
        headers: { 'Content-Type': 'application/json' },

    })

    if (!res.ok) {
        alert("error fetching data")
    }

      const data = await res.json();
        setUsers(data.observing)
        console.log(data.observing)

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

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
    {users.map((user:any)=>{

return(

<ObservingCard observing = {user} key={user.requestId} onRemove={(id: string) => {
    setUsers((prev: any[]) =>
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