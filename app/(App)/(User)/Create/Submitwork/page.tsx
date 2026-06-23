"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function Page() {
  const [art, setArt] = useState<string | null>(null);
  const [artFile, setArtFile] = useState<File | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader();
  const { user } = useAuth();
  const router = useRouter();

  const successToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "success" });
  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "error" });

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/collections/user/${user._id}`);
        const data = await res.json();
        if (data.success) setCollections(data.collections);
      } catch {}
    };
    fetchCollections();
  }, [user?._id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtFile(file);
      const imageUrl = URL.createObjectURL(file);
      setArt(imageUrl);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setArt(null);
    setArtFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      errorToast("Please enter a title.");
      return;
    }
    if (!artFile) {
      errorToast("Please upload an image.");
      return;
    }

    try {
      loader.start();
      setUploading(true);

      // 1. Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", artFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        errorToast("Image upload failed.");
        loader.done();
        setUploading(false);
        return;
      }

      // 2. Create post
      const postRes = await fetch("/api/post/art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          media: {
            url: uploadData.url,
            publicId: uploadData.publicId,
            type: "image",
          },
          collection: selectedCollection || undefined,
          visibility,
        }),
      });
      const postData = await postRes.json();

      if (!postRes.ok) {
        errorToast(postData.message || "Failed to upload artwork.");
        loader.done();
        setUploading(false);
        return;
      }

      successToast("Artwork uploaded successfully!");
      loader.done();
      setTimeout(() => router.push(`/Profile/${user?._id}`), 1500);
    } catch {
      errorToast("Something went wrong.");
      loader.done();
      setUploading(false);
    }
  };

  return (
    <div className="">

      {/* Title Input */}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-5 w-full rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) px-4 py-2 text-2xl dark:bg-(--colorbgdark)"
      />

      {/* Collection Picker */}
      {collections.length > 0 && (
        <div className="mb-5 flex items-center gap-3">
          <label className="text-sm font-medium text-(--text-muted) dark:text-(--text-muted-dark)">
            Add to collection:
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="rounded-lg border border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark) px-3 py-1.5 text-sm outline-none"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="rounded-lg border border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark) px-3 py-1.5 text-sm outline-none"
          >
            <option value="public">Public</option>
            <option value="circle">Circle only</option>
          </select>
        </div>
      )}

      {/* File Input */}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Upload Zone */}
      {art === null ? (
        <div
          onClick={handleIconClick}
          className="hover:cursor-pointer w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark) hover:border-blue-400 transition-colors"
        >
          <IoCloudUpload size={40} />
          <p>Upload your art</p>
          <p className="text-sm text-(--text-muted) dark:text-(--text-muted-dark)">
            JPG, PNG, WEBP supported
          </p>
        </div>
      ) : (
        <div className="relative w-full text-xl gap-y-3 items-center justify-center flex flex-col h-130 rounded-xl border-2 border-dotted border-(--border) bg-(--colorbg) dark:bg-(--colorbgdark)">
          <button
            onClick={handleRemoveArt}
            className="absolute top-2 hover:cursor-pointer right-2 z-10 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <IoClose size={20} />
          </button>
          <img
            src={art}
            alt="uploadedart"
            onClick={() => setIsFullScreen(true)}
            className="w-full h-full object-contain object-center hover:cursor-pointer"
            style={{ backgroundColor: "transparent", borderRadius: "0px" }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end w-full p-2 mt-4 text-right gap-3">
        <button
          disabled={uploading}
          className="mr-3 px-4 py-2 opacity-60 cursor-not-allowed"
        >
          Draft
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-6 py-2 font-bold bg-[#192942] hover:bg-[#2c456e] text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <IoCloudUpload />
          {uploading ? "Uploading..." : "Upload"}
        </button>
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