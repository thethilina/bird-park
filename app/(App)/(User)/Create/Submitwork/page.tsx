import React from 'react';
import { IoCloudUpload } from "react-icons/io5";



function Page() {
  return (
    <div className="">
      
      <input 
        placeholder="Title" 
        className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark)" 
      />

      <div className=" w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
        <IoCloudUpload size={40} />
        <p>Upload your art</p>

      </div>

<div className="flex items-center justify-end w-full p-2 mt-4 text-right">
  <button className="mr-3 px-4 py-2">Draft</button>
  <button className="px-4 py-2 font-bold">Upload</button>
</div>
    </div>
  );
}

export default Page;