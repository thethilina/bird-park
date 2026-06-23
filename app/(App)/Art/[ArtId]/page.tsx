"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { GoComment } from "react-icons/go";
import { IoClose, IoAdd, IoBookmark } from "react-icons/io5";
import { MdOutlineCollections } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";

function ArtDetailPage() {
  const { ArtId } = useParams();
  const { user } = useAuth();
  const loader = useTopLoader();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add-to-collection modal
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const successToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "success" });
  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "error" });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/${ArtId}`);
        const data = await res.json();
        if (data.success) setPost(data.post);
      } catch {} finally {
        setLoading(false);
      }
    };
    if (ArtId) fetchPost();
  }, [ArtId]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCollectionModal(false);
      }
    };
    if (showCollectionModal) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCollectionModal]);

  const openCollectionModal = async () => {
    setShowCollectionModal(true);
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/collections/user/${user._id}`);
      const data = await res.json();
      if (data.success) setCollections(data.collections);
    } catch {}
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      loader.start();
      setAdding(collectionId);
      const res = await fetch(`/api/collections/${collectionId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: ArtId }),
      });
      const data = await res.json();
      loader.done();
      setAdding(null);
      if (!res.ok) {
        errorToast(data.message || "Failed to add to collection.");
        return;
      }
      successToast("Added to collection!");
      setShowCollectionModal(false);
    } catch {
      errorToast("Something went wrong.");
      loader.done();
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--border)" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <p className="text-2xl text-(--text-muted)">Post not found.</p>
      </div>
    );
  }

  const author = post.author;
  const isPoem = post.type === "poem";

  return (
    <div className="lg:flex lg:h-[calc(100vh-80px)] px-3 overflow-hidden gap-x-10 justify-center">

      {/* Left — Art/Poem display */}
      <div className="flex-1 lg:border-r-2 lg:pr-10 py-3 lg:py-10 border-(--border) gap-y-2 flex flex-col lg:gap-y-5">

        {/* Author */}
        <div className="flex items-center lg:text-xl gap-x-3">
          <Link
            href={`/Profile/${author?._id}`}
            className="flex items-center gap-x-3"
          >
            {author?.profileImage && (
              <img
                src={author.profileImage}
                alt={author.username}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
              />
            )}
            <span>{author?.fullName || author?.username}</span>
          </Link>

          {/* Collection badge */}
          {post.collection && (
            <Link
              href={`/Collection/${post.collection._id}`}
              className="ml-2 px-3 py-1 rounded-full border border-(--border) text-sm text-(--text-muted) hover:text-white transition-colors flex items-center gap-1"
            >
              <MdOutlineCollections size={14} />
              {post.collection.title}
            </Link>
          )}
        </div>

        {/* Title */}
        <h1 className="lg:text-2xl font-semibold">{post.title}</h1>

        {/* Art Image or Poem */}
        {isPoem ? (
          <div
            className="w-full flex-1 rounded-xl p-6 flex items-start justify-start overflow-y-auto"
            style={{
              backgroundColor: post.poemStyle?.backgroundColor || "#fff",
              color: post.poemStyle?.fontColor || "#000",
              fontFamily: post.poemStyle?.fontFamily || "Georgia, serif",
              fontSize: post.poemStyle?.fontSize || "18px",
            }}
          >
            <pre className="whitespace-pre-wrap font-inherit w-full">
              {post.body}
            </pre>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="w-full border-(--border) block lg:hidden border-2 rounded-sm">
              {post.media?.url && (
                <img
                  src={post.media.url}
                  alt={post.title}
                  className="w-full h-full object-contain object-center"
                  style={{ backgroundColor: "transparent" }}
                />
              )}
            </div>
            {/* Desktop */}
            <div
              className="w-full border-(--border) lg:block hidden border-2 rounded-sm"
              style={{ height: "calc(100vh - 300px)" }}
            >
              {post.media?.url && (
                <img
                  src={post.media.url}
                  alt={post.title}
                  className="w-full h-full object-contain object-center"
                  style={{ backgroundColor: "transparent" }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Right — Actions & Comments */}
      <div
        className="lg:my-10 lg:w-2/5 xl:w-1/3 lg:px-5 rounded-sm overflow-y-auto bg-(--color-background) dark:bg-(--background) [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="flex flex-col">

          {/* Sticky header */}
          <div className="lg:sticky top-0 bg-(--color-background) dark:bg-(--background) w-auto z-49">
            <div className="flex lg:gap-x-5 gap-x-2 items-center border-(--border) lg:pb-4 pb-2 border-b-2 flex-wrap gap-y-2">
              <CiHeart className="size-5 lg:size-7 cursor-pointer hover:text-red-400 transition-colors" />
              <span className="text-xl lg:text-3xl">
                {post.hearts?.length || 0}
              </span>
              <GoComment className="lg:size-5.5 cursor-pointer" />
              <span className="text-xl lg:text-3xl">0</span>

              {/* Add to collection button */}
              {user && (
                <button
                  onClick={openCollectionModal}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-sm hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark) transition-colors"
                  title="Add to collection"
                >
                  <IoBookmark size={15} />
                  <span className="hidden sm:inline">Save to Collection</span>
                </button>
              )}
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-x-3 mt-5 mb-5">
              <input
                placeholder="Add a comment..."
                type="text"
                className="flex-1 font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark) rounded-xl py-2 px-4 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="px-6 py-2 bg-[#3B5D95] text-white font-medium rounded-[4px_20px_20px_20px] hover:bg-[#2e4a7a] transition-colors whitespace-nowrap">
                Post
              </button>
            </div>
          </div>

          {/* Comments placeholder */}
          <div className="py-5 text-(--text-muted) text-center text-sm">
            No comments yet. Be the first!
          </div>
        </div>
      </div>

      {/* Add to Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-[#0d1725] border border-(--border) rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 relative"
          >
            <button
              onClick={() => setShowCollectionModal(false)}
              className="absolute top-4 right-4 text-(--text-muted) hover:text-white transition-colors"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-xl font-semibold">Save to Collection</h2>

            {collections.length === 0 ? (
              <div className="py-8 text-center text-(--text-muted)">
                <p>You have no collections yet.</p>
                <Link
                  href={`/Profile/${user?._id}/collections`}
                  className="mt-2 text-blue-400 hover:underline text-sm block"
                >
                  Create your first collection →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {collections.map((c) => {
                  const cover =
                    c.coverImage ||
                    c.posts?.find((p: any) => p?.media?.url)?.media?.url ||
                    null;
                  return (
                    <button
                      key={c._id}
                      onClick={() => handleAddToCollection(c._id)}
                      disabled={adding !== null}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-(--border) hover:bg-(--colorbg) dark:hover:bg-[#131e2e] transition-colors text-left disabled:opacity-60"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1a2e45] flex-shrink-0">
                        {cover ? (
                          <img
                            src={cover}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MdOutlineCollections
                              size={20}
                              className="opacity-30"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.title}</p>
                        <p className="text-xs text-(--text-muted)">
                          {c.posts?.length || 0} works
                        </p>
                      </div>
                      {adding === c._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0" />
                      ) : (
                        <IoAdd size={18} className="text-(--text-muted) flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtDetailPage;