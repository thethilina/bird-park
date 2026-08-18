"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "react-toastify";
import { IoClose, IoAdd, IoTrashOutline, IoPencil, IoImageOutline } from "react-icons/io5";
import { IoImagesOutline } from "react-icons/io5";

function CollectionDetailPage() {
  const { collectionId } = useParams();
  const { user } = useAuth();
  const loader = useTopLoader();
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add-post modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  const successToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "success" });
  const errorToast = (msg: string) =>
    toast(msg, { position: "top-right", autoClose: 3000, type: "error" });

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch(`/api/collections/${collectionId}`);
        const data = await res.json();
        if (data.success) setCollection(data.collection);
      } catch {} finally {
        setLoading(false);
      }
    };
    if (collectionId) fetchCollection();
  }, [collectionId]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowAddModal(false);
      }
    };
    if (showAddModal) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAddModal]);

  const openAddModal = async () => {
    setShowAddModal(true);
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/post/user/${user._id}`);
      const data = await res.json();
      if (data.success) {
        // Filter out posts already in this collection
        const collectionPostIds = new Set(
          (collection?.posts || []).map((p: any) => p._id?.toString())
        );
        setUserPosts(
          data.posts.filter((p: any) => !collectionPostIds.has(p._id?.toString()))
        );
      }
    } catch {}
  };

  const handleAddPost = async (postId: string) => {
    try {
      loader.start();
      setAdding(postId);
      const res = await fetch(`/api/collections/${collectionId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorToast(data.message || "Failed to add post.");
        loader.done();
        setAdding(null);
        return;
      }
      successToast("Added to collection!");
      // Refresh collection
      const refreshRes = await fetch(`/api/collections/${collectionId}`);
      const refreshData = await refreshRes.json();
      if (refreshData.success) setCollection(refreshData.collection);
      setUserPosts((prev) => prev.filter((p) => p._id !== postId));
      loader.done();
      setAdding(null);
    } catch {
      errorToast("Something went wrong.");
      loader.done();
      setAdding(null);
    }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      loader.start();
      const res = await fetch(`/api/collections/${collectionId}/post`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorToast(data.message || "Failed to remove post.");
        loader.done();
        return;
      }
      successToast("Removed from collection.");
      setCollection((prev: any) => ({
        ...prev,
        posts: prev.posts.filter((p: any) => p._id !== postId),
      }));
      loader.done();
    } catch {
      errorToast("Something went wrong.");
      loader.done();
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      loader.start();
      const res = await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
      if (res.ok) {
        successToast("Collection deleted");
        router.push(`/Profile/${user?._id}/collections`);
      } else {
        errorToast("Failed to delete");
      }
    } catch {
      errorToast("Something went wrong");
    } finally {
      loader.done();
    }
  };

  const handleEditCollection = async () => {
    if (!editTitle.trim()) {
      errorToast("Title required");
      return;
    }
    try {
      setEditing(true);
      loader.start();
      let coverImageUrl = collection.coverImage;
      if (editCoverFile) {
        const formData = new FormData();
        formData.append("file", editCoverFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          coverImageUrl = uploadData.url;
        }
      }
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          coverImage: coverImageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        successToast("Collection updated");
        setCollection(data.collection);
        setShowEditModal(false);
      } else {
        errorToast("Update failed");
      }
    } catch {
      errorToast("Something went wrong");
    } finally {
      setEditing(false);
      loader.done();
    }
  };

  const openEditModal = () => {
    setEditTitle(collection.title);
    setEditDesc(collection.description || "");
    setEditCoverPreview(collection.coverImage || null);
    setEditCoverFile(null);
    setShowEditModal(true);
  };

  const isOwner =
    user?._id &&
    collection?.author &&
    (collection.author._id === user._id ||
      collection.author._id?.toString() === user._id?.toString() ||
      collection.author === user._id);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--border)" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-2xl text-(--text-muted)">Collection not found.</p>
      </div>
    );
  }

  const posts: any[] = collection.posts || [];
  const author = collection.author;

  return (
    <div className="space-y-8 py-6">

      {/* Collection Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex gap-4 items-start w-full">
          {/* Cover thumbnail */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#0d1725] border border-(--border) flex-shrink-0 shadow-md">
            {collection.coverImage || posts.find((p: any) => p?.media?.url)?.media?.url ? (
              <img
                src={collection.coverImage || posts.find((p: any) => p?.media?.url)?.media?.url}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-(--text-muted)">
                <IoImagesOutline size={36} className="opacity-30" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">{collection.title}</h1>
              {/* Action buttons (owner only) */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openEditModal}
                    className="p-2 hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark) rounded-full transition-colors text-blue-500"
                    title="Edit Collection"
                  >
                    <IoPencil size={20} />
                  </button>
                  <button
                    onClick={handleDeleteCollection}
                    className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                    title="Delete Collection"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              )}
            </div>
            {collection.description && (
              <p className="text-(--text-muted) dark:text-(--text-muted-dark) mt-2 max-w-2xl text-lg">
                {collection.description}
              </p>
            )}
            
            {/* Emotions */}
            {collection.top3Emotions && collection.top3Emotions.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {collection.top3Emotions.map((em: any, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium capitalize"
                  >
                    {em.emotion} ({Math.round(em.score * 100)}%)
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-(--text-muted)">
              {author && (
                <Link
                  href={`/Profile/${author._id}`}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  {author.profileImage && (
                    <img
                      src={author.profileImage}
                      alt={author.username}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span>@{author.username}</span>
                </Link>
              )}
              <span>·</span>
              <span>
                {posts.length} {posts.length === 1 ? "work" : "works"}
              </span>
            </div>
          </div>
        </div>

        {/* Add post button (owner only) */}
        {isOwner && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#192942] hover:bg-[#2c456e] text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0 mt-4 md:mt-0"
          >
            <IoAdd size={18} />
            Add Work
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-24 text-(--text-muted) dark:text-(--text-muted-dark)">
          <IoImagesOutline size={52} className="opacity-20 mb-4" />
          <p className="text-xl">This collection is empty.</p>
          {isOwner && (
            <button
              onClick={openAddModal}
              className="mt-4 text-blue-400 hover:underline text-sm"
            >
              Add your first work
            </button>
          )}
        </div>
      ) : (
        <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-2 lg:gap-5 space-y-2 lg:space-y-5 w-full">
          {posts.map((post: any) =>
            post.type === "poem" ? (
              <div key={post._id} className="break-inside-avoid mb-2 lg:mb-5 relative group">
                <Link href={`/Art/${post._id}`}>
                  <div
                    className="p-5 rounded-xl gap-y-3 text-center flex flex-col items-center justify-center hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor:
                        post.poemStyle?.backgroundColor || "#ffffff",
                      color: post.poemStyle?.fontColor || "#000000",
                      fontFamily:
                        post.poemStyle?.fontFamily || "Georgia, serif",
                    }}
                  >
                    <h2 className="text-lg font-bold">{post.title}</h2>
                    <p
                      className="whitespace-pre-wrap line-clamp-6 text-sm"
                      style={{ fontSize: post.poemStyle?.fontSize || "14px" }}
                    >
                      {post.body}
                    </p>
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleRemovePost(post._id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
                    title="Remove from collection"
                  >
                    <IoTrashOutline size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div key={post._id} className="break-inside-avoid mb-2 lg:mb-5 relative group">
                <Link href={`/Art/${post._id}`}>
                  {post.media?.url ? (
                    <img
                      src={post.media.url}
                      alt={post.title}
                      className="w-full object-cover hover:opacity-90 transition-opacity duration-300 rounded-sm"
                    />
                  ) : (
                    <div className="w-full h-40 bg-(--colorbg) dark:bg-(--colorbgdark) rounded-sm flex items-center justify-center text-(--text-muted)">
                      No image
                    </div>
                  )}
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleRemovePost(post._id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
                    title="Remove from collection"
                  >
                    <IoTrashOutline size={14} />
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Add Work Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-(--foreground)">
          <div
            ref={modalRef}
            className="bg-(--colorbg) border border-(--border) rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 relative max-h-[85vh] flex flex-col"
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-(--text-muted) hover:text-(--foreground) transition-colors"
            >
              <IoClose size={22} />
            </button>
            <h2 className="text-2xl font-semibold">Add Work to Collection</h2>

            {userPosts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12 text-(--text-muted)">
                <p>No works available to add.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {userPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="relative rounded-lg overflow-hidden border border-(--border) group cursor-pointer"
                    onClick={() => !adding && handleAddPost(post._id)}
                  >
                    {post.type === "poem" ? (
                      <div
                        className="aspect-square flex flex-col items-center justify-center p-3 text-center"
                        style={{
                          backgroundColor:
                            post.poemStyle?.backgroundColor || "#fff",
                          color: post.poemStyle?.fontColor || "#000",
                          fontFamily:
                            post.poemStyle?.fontFamily || "Georgia, serif",
                        }}
                      >
                        <p className="font-bold text-sm truncate w-full">
                          {post.title}
                        </p>
                        <p
                          className="text-xs line-clamp-3 mt-1"
                          style={{ fontSize: "11px" }}
                        >
                          {post.body}
                        </p>
                      </div>
                    ) : (
                      <div className="aspect-square">
                        {post.media?.url ? (
                          <img
                            src={post.media.url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-(--colorbg) dark:bg-(--colorbgdark) flex items-center justify-center text-(--text-muted) text-xs">
                            No image
                          </div>
                        )}
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      {adding === post._id ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      ) : (
                        <IoAdd size={28} className="text-white" />
                      )}
                    </div>
                    {/* Title label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-xs truncate">{post.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-(--foreground)">
          <div
            ref={editModalRef}
            className="bg-(--colorbg) border border-(--border) rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative"
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-(--text-muted) hover:text-(--foreground) transition-colors"
            >
              <IoClose size={22} />
            </button>

            <h2 className="text-2xl font-bold">Edit Collection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Cover Image
                </label>
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-(--border) bg-(--colorbg) flex flex-col items-center justify-center cursor-pointer hover:bg-(--hover) transition-colors overflow-hidden relative"
                >
                  {editCoverPreview ? (
                    <img src={editCoverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
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
                  ref={editFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditCoverFile(file);
                      setEditCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-(--foreground)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-(--text-muted) dark:text-(--text-muted-dark)">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--colorbg) outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none text-(--foreground)"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-xl border border-(--border) hover:bg-(--hover) transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCollection}
                disabled={editing}
                className="px-6 py-2 rounded-xl bg-[#3B5D95] hover:bg-[#2e4a7a] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editing ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionDetailPage;
