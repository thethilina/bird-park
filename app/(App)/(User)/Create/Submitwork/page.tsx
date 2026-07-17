"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader"
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';



function Page() {


    const [art, setArt] = useState<any>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loader = useTopLoader()
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");


const analyzeEmotion = async (postId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/emotion/art", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return;

    const data = await response.json();

    const top3Emotions =
      data.emotional_profile.themes.map((emotion: any) => ({
        emotion: emotion.name,
        score: emotion.weight,
      }));

    await fetch(`/api/post/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        top3Emotions,
      }),
    });

    console.log("Emotion analysis complete.");
  } catch (err) {
    console.error(err);
  }
};





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
    
    



const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const imageUrl = URL.createObjectURL(selectedFile);
    setArt(imageUrl);
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

const uploadArt = async () => {
  try {
    if (!file) {
      errorToast("Please select an artwork");
      return;
    }

    if (!title.trim()) {
      errorToast("Please enter a title");
      return;
    }

    loader.start();

    // Upload image first
    const imageUrl = await handleUploadAvatar(file);

    if (!imageUrl) {
      throw new Error("Image upload failed");
    }

    // Create the post immediately
    const postResponse = await fetch("/api/post/art", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        media: {
          url: imageUrl,
        },
        visibility: "public",
      }),
    });

    const postData = await postResponse.json();

    if (!postResponse.ok) {
      throw new Error(postData.message);
    }

    // Start AI analysis in the background
    analyzeEmotion(postData.post._id, file);

    success("Artwork uploaded successfully!");

    setArt(null);
    setFile(null);
    setTitle("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (err) {
    console.error(err);
    errorToast("Failed to upload artwork");
  } finally {
    loader.done();
  }
};

  return (
    <div className="">
      
      <input 
        placeholder="Title" 
        value={title}
        onChange={(e)=>{setTitle(e.target.value)}}
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
  <button onClick={uploadArt } className="px-4 text-[#141414] py-2 bg-[#e6f0f0] text-lg rounded-4xl hover:cursor-pointer hover:bg-[#979ea0] font-bold">Upload</button>
</div>

      {/* Fullscreen Preview */}
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