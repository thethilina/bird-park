"use client";
import React, { useEffect, useState, useRef } from "react";
import ProfileBar from "@/public/components/ProfileBar";
import CollectionCard from "@/public/components/Profile/CollectionCArd";
import CollectionCardSkeleton from "@/public/components/Profile/CollectionCardSkeleton";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { IoClose, IoAdd, IoImageOutline } from "react-icons/io5";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import Image from "next/image";import ProfileBarSkeleton from "@/public/components/ProfileBarSkeleton";

function Page() {
  const { UserId } = useParams();
  const { user } = useAuth();
  const loader = useTopLoader();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create collection popup state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const successToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "success" });
  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "error" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/artists/${UserId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setProfileUser(data.artist);
      } catch {}
    };

    const fetchCollections = async () => {
      try {
        const res = await fetch(`/api/collections/user/${UserId}`);
        const data = await res.json();
        if (data.success) setCollections(data.collections);
      } catch {} finally {
        setLoading(false);
      }
    };

    if (UserId) {
      fetchUser();
      fetchCollections();
    }
  }, [UserId]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    if (showModal) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleCreateCollection = async () => {
    if (!newTitle.trim()) {
      errorToast("Please enter a title for your collection.");
      return;
    }
    try {
      loader.start();
      setCreating(true);

      let coverImageUrl = "";
      if (coverImageFile) {
        const formData = new FormData();
        formData.append("file", coverImageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          coverImageUrl = uploadData.url;
        } else {
          errorToast("Failed to upload cover image.");
          loader.done();
          setCreating(false);
          return;
        }
      }

      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDesc.trim(),
          coverImage: coverImageUrl || undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorToast(data.message || "Failed to create collection.");
        loader.done();
        setCreating(false);
        return;
      }
      successToast("Collection created!");
      setCollections((prev) => [data.collection, ...prev]);
      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      setCoverImageFile(null);
      setCoverImagePreview(null);
      loader.done();
      setCreating(false);
    } catch {
      errorToast("Something went wrong.");
      loader.done();
      setCreating(false);
    }
  };

  const isOwnProfile = user?._id === UserId || user?._id === profileUser?._id;

  return (
    <div className="space-y-5 pt-5  px-3 md:px-5 pb-20 ">
      {loading ? <ProfileBarSkeleton /> : <ProfileBar User={profileUser} />}


      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <CollectionCardSkeleton key={idx} />
          ))
        ) : (
          <>
     {isOwnProfile && (
   <div 
     onClick={() => setShowModal(true)}
     className="items-center flex border-(--border) bg-(--colorbg) hover:cursor-pointer text-center gap-y-3 p-4 flex-col justify-center w-full h-full min-h-[180px] border rounded-xl hover:bg-(--hover) transition-all hover:scale-105 active:scale-95 duration-200 text-(--foreground)"
   >
     <MdOutlineCreateNewFolder size={40} />
     <h1 className="text-sm sm:text-base font-medium">Create new collection</h1>
   </div>
 )}
            
            {collections.length === 0 && !isOwnProfile ? (
              <div className="col-span-full py-16 px-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl bg-white/5 w-full">
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">This artist has not created any collections yet.</p>
              </div>
            ) : (
              collections.map((collection) => (
                <CollectionCard key={collection._id} collection={collection} />
              ))
            )}
          </>
        )}
      </div>


      {/* Create Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-(--foreground)">
          <div
            ref={modalRef}
            className="bg-(--colorbg)  border border-(--border) rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative"
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 hover:cursor-pointer right-4 text-(--text-muted) hover:text-(--foreground) transition-colors"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-2xl font-bold">Create Collection</h2>

            <div className="space-y-4">
              {/* Cover Image Picker */}
              <div>
                <label className="block text-sm font-medium mb-2 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Cover Image
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-(--border) bg-(--colorbg) flex flex-col items-center justify-center cursor-pointer hover:bg-(--hover) transition-colors overflow-hidden relative"
                >
                  {coverImagePreview ? (
                    <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-(--text-muted)">
                      <IoImageOutline size={32} className="mb-2" />
                      <span className="text-sm">Click to upload cover image</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Autumn Studies"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-(--foreground)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this collection about?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none text-(--foreground)"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl border border-(--border) hover:bg-(--hover) transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={creating}
                className="px-6 py-2 rounded-xl bg-[#3B5D95] hover:bg-[#2e4a7a] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;