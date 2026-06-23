"use client"
import React from 'react';
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useState, useRef, ChangeEvent } from 'react'
import { useTopLoader } from "nextjs-toploader"
import Image from "next/image";



function Page() {


    const [art, setArt] = useState<any>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loader = useTopLoader()


   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setArt(imageUrl);
        }
    };

  const handleUploadAvatar = async (file : any ) => {

        try{
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.url;
            }

        }catch(error){
            console.error("Error uploading avatar:", error);
        }

    }


    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveArt = (e: React.MouseEvent) => {
        e.stopPropagation();
        setArt(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleArtClick = () => {
        setIsFullScreen(true);
    };



  return (
    <div className="">
      
      <input 
        placeholder="Title" 
        className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark)" 
      />
         <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
    {art === null ?    <div onClick={handleIconClick}  className=" hover:cursor-pointer w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
        <IoCloudUpload size={40} />
        <p>Upload your art</p>

      </div> :<>
      
<div className="relative w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
  <button
    onClick={handleRemoveArt}
    className="absolute top-2  hover:cursor-pointer right-2 z-10 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
  >
    <IoClose size={20} />
  </button>
  <img 
    src={art} 
    alt="uploadedart"
    onClick={handleArtClick}
    className="w-full h-full object-contain object-center hover:cursor-pointer"
    style={{ backgroundColor: "transparent", borderRadius: "0px" }} 
  />
</div>
      
      </>}

<div className="flex items-center justify-end w-full p-2 mt-4 text-right">
  <button className="mr-3 px-4 py-2">Draft</button>
  <button className="px-4 py-2 font-bold">Upload</button>
</div>

{isFullScreen && art && (
  <div
    onClick={() => setIsFullScreen(false)}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
  >
    <button
      onClick={() => setIsFullScreen(false)}
      className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
    >
      <IoClose size={28} />
    </button>
    <img
      src={art}
      alt="uploadedart-fullscreen"
      className="max-h-full max-w-full object-contain"
    />
  </div>
)}
    </div>
  );
}

export default Page;