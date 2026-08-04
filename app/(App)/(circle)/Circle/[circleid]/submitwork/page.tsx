"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoCloudUpload, IoClose, IoChevronBack } from "react-icons/io5";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import Link from "next/link";

export default function CircleSubmitWorkPage() {
  const { circleid } = useParams<{ circleid: string }>();
  const router = useRouter();
  const loader = useTopLoader();

  const [activeTab, setActiveTab] = useState<"art" | "poem">("art");
  
  // Art state
  const [artTitle, setArtTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poem state
  const [poemTitle, setPoemTitle] = useState("");
  const [poemBody, setPoemBody] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleRemoveArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadImage = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.success) return data.url;
    throw new Error(data.message || "Upload failed");
  };

  const submitArt = async () => {
    if (!file) return toast.error("Please select an artwork");
    if (!artTitle.trim()) return toast.error("Please enter a title");

    loader.start();
    try {
      const imageUrl = await handleUploadImage(file);
      const res = await fetch(`/api/circles/${circleid}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artTitle,
          type: "art",
          media: { url: imageUrl },
          visibility: "circle",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast.success("Artwork posted successfully!");
      router.push(`/Circle/${circleid}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to post artwork");
    } finally {
      loader.done();
    }
  };

  const submitPoem = async () => {
    if (!poemTitle.trim()) return toast.error("Please enter a title");
    if (!poemBody.trim()) return toast.error("Please write a poem");

    loader.start();
    try {
      const res = await fetch(`/api/circles/${circleid}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: poemTitle,
          type: "poem",
          body: poemBody,
          visibility: "circle",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      toast.success("Poem posted successfully!");
      router.push(`/Circle/${circleid}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to post poem");
    } finally {
      loader.done();
    }
  };

  return (
    <div className="pl-0 lg:pl-72 min-h-screen bg-[#06060B] text-white">
      {/* Header */}
      <div className="px-4 lg:px-8 pt-8 pb-4 border-b border-white/10 bg-[#06060B] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/Circle/${circleid}`}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <IoChevronBack size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Post to Circle</h1>
              <p className="text-sm text-gray-500 mt-0.5">Share your creativity with the community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
        {/* Toggle */}
        <div className="flex p-1 bg-[#141414] border border-white/10 rounded-xl mb-8 w-max">
          <button
            onClick={() => setActiveTab("art")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "art" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTab("poem")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "poem" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Poem
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "art" ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <input
              placeholder="Title of your artwork"
              value={artTitle}
              onChange={(e) => setArtTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-4 text-xl font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!preview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-80 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 bg-[#141414] flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IoCloudUpload size={32} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-lg font-medium text-gray-400 group-hover:text-white transition-colors">
                  Click or drag to upload art
                </p>
                <p className="text-xs text-gray-600">Supports JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="relative w-full rounded-xl border border-white/10 bg-[#141414] overflow-hidden group">
                <button
                  onClick={handleRemoveArt}
                  className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-full bg-black/50 p-2 text-white hover:bg-red-500 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                >
                  <IoClose size={20} />
                </button>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-[600px] object-contain bg-[#06060B]"
                />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={submitArt}
                className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Post Artwork
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <input
              placeholder="Title of your poem"
              value={poemTitle}
              onChange={(e) => setPoemTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-4 text-xl font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
            />

            <textarea
              placeholder="Write your poem here..."
              value={poemBody}
              onChange={(e) => setPoemBody(e.target.value)}
              className="w-full min-h-[400px] rounded-xl border border-white/10 bg-[#141414] px-4 py-4 text-base leading-relaxed text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors resize-y"
            />

            <div className="flex justify-end pt-4">
              <button
                onClick={submitPoem}
                className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Post Poem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
