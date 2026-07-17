"use client";
import React, { useEffect, useState, useRef } from "react";
import ProfileBar from "@/public/components/ProfileBar";
import CollectionCard from "@/public/components/Profile/CollectionCArd";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { IoClose, IoAdd } from "react-icons/io5";
import { MdOutlineCreateNewFolder } from "react-icons/md";

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
  const [creating, setCreating] = useState(false);
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

  const handleCreateCollection = async () => {
    if (!newTitle.trim()) {
      errorToast("Please enter a title for your collection.");
      return;
    }
    try {
      loader.start();
      setCreating(true);
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
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
    <div className="space-y-5">
      <ProfileBar User={profileUser} />

    
      
     {isOwnProfile && (
          <div             onClick={() => setShowModal(true)}
 className="items-center flex border-(--border) bg-[#0e0e14]  hover:cursor-pointer  text-2xl  gap-y-3 p-4 flex-col justify-center w-60 h-70 border rounded-xl">
        <MdOutlineCreateNewFolder size={30} />
        <h1>Create new collection</h1>
      </div>
 )}


      {/* Create Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-[#0e0e14]  border border-(--border) dark:border-(--borderdark) rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative"
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 hover:cursor-pointer right-4 text-(--text-muted) hover:text-white transition-colors"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-2xl ">Create Collection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Autumn Studies"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) dark:bg-[#131e2e] outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) dark:bg-[#131e2e] outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl border border-(--border) hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark) transition-colors text-sm"
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