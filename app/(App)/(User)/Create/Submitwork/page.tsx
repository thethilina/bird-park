"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader"
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import CreateCollectionModal from "@/public/components/CreateCollectionModal";
import { analyzeArtEmotion } from "@/lib/analyzeEmotion";



function Page() {


  const [art, setArt] = useState<any>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader()
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/collections/user/${user._id}`);
        const data = await res.json();
        if (data.success) setCollections(data.collections);
      } catch { }
    };
    fetchCollections();
  }, [user?._id]);







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

  const handleUploadAvatar = async (file: any) => {

    try {
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

    } catch (error) {
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
          collection: selectedCollection || undefined,
          visibility: "public",
        }),
      });

      const postData = await postResponse.json();

      if (!postResponse.ok) {
        throw new Error(postData.message);
      }

      // Start AI analysis and wait for it to complete
      await analyzeArtEmotion(postData.post._id, file);

      success("Artwork uploaded successfully!");

      setArt(null);
      setFile(null);
      setTitle("");
      setSelectedCollection("");

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
    <div className="px-3 sm:px-0 pb-15">

      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-5">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => { setTitle(e.target.value) }}
          className="flex-1 min-w-0 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-3 sm:px-4 py-2 text-lg sm:text-2xl dark:bg-(--colorbgdark)"
        />

        {/* Collection picker */}
        <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
          <label className="text-sm sm:text-lg font-medium whitespace-nowrap">Add to Collection:</label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="flex-1 min-w-[120px] p-1 text-sm sm:text-lg border rounded bg-transparent border-(--border) dark:text-white text-black"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id} className="text-black">
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateCollectionModal(true)}
            className="ml-auto flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span> New
          </button>
        </div>
      </div>

      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {art === null ? <div onClick={handleIconClick} className=" hover:cursor-pointer w-full text-base sm:text-xl gap-y-2 sm:gap-y-3 items-center justify-center flex flex-col h-64 sm:h-96 md:h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
        <IoCloudUpload size={32} className="sm:w-10 sm:h-10" />
        <p>Upload your art</p>

      </div> : <>

        <div className="relative w-full text-base sm:text-xl gap-y-2 sm:gap-y-3 items-center justify-center flex flex-col h-64 sm:h-96 md:h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
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

      <div className="flex items-center justify-center sm:justify-end w-full p-2 mt-4 text-right">
        <button onClick={uploadArt} className="w-full sm:w-auto px-4 text-[#141414] py-2 bg-[#e6f0f0] text-lg rounded-4xl hover:cursor-pointer hover:bg-[#979ea0] font-bold">Upload</button>
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

      {showCreateCollectionModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollectionModal(false)}
          onSuccess={(newCollection) => {
            setCollections([newCollection, ...collections]);
            setSelectedCollection(newCollection._id);
            setShowCreateCollectionModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Page;