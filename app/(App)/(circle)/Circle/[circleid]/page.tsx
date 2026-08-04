"use client";

import React, { useEffect, useState, useRef, useCallback, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import {
  IoSettingsOutline,
  IoPersonAddOutline,
  IoExitOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoShieldOutline,
  IoFlagOutline,
  IoEllipsisVertical,
  IoChevronDown,
  IoMenuOutline,
  IoClose,
  IoCloudUpload,
} from "react-icons/io5";
import Link from "next/link";

interface CircleData {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  category?: string;
  joinType: "open" | "approval";
  members: any[];
  admins: any[];
  moderators: any[];
  owner: any;
  rules?: { title: string; description?: string }[];
  joinRequests?: any[];
}

interface Post {
  _id: string;
  title: string;
  type: "art" | "poem";
  media?: { url: string };
  body?: string;
  author: { _id: string; fullName: string; username: string; profileImage?: string };
  createdAt: string;
  poemStyle?: {
    fontFamily: string;
    fontSize: string;
    fontColor: string;
    backgroundColor: string;
  };
}

interface FontOption {
  name: string;
  value: string;
}

interface SizeOption {
  name: string;
  value: string;
}

const fontOptions: FontOption[] = [
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Palatino", value: '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", serif' },
  { name: "Garamond", value: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
  { name: "Bookman", value: '"Bookman Old Style", Bookman, "URW Bookman L", serif' },
  { name: "Times New Roman", value: '"Times New Roman", Times, Baskerville, Georgia, serif' },
  { name: "Helvetica", value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Trebuchet MS", value: '"Trebuchet MS", Helvetica, jam, sans-serif' },
  { name: "Gill Sans", value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { name: "Optima", value: 'Optima, Segoe, "Segoe UI", Candara, Calibri, sans-serif' },
  { name: "Century Gothic", value: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' },
  { name: "Courier New", value: '"Courier New", Courier, monospace' },
  { name: "Lucida Sans Typewriter", value: '"Lucida Sans Typewriter", "Lucida Console", Monaco, monospace' },
  { name: "Consolas", value: "Consolas, monaco, monospace" },
  { name: "Copperplate", value: 'Copperplate, "Copperplate Gothic Light", fantasy' },
  { name: "Papyrus", value: "Papyrus, fantasy" },
  { name: "Brush Script", value: '"Brush Script MT", cursive' },
  { name: "Comic Sans", value: '"Comic Sans MS", cursive, sans-serif' },
  { name: "Impact", value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' },
  { name: "Lucida Handwriting", value: '"Lucida Handwriting", cursive' },
];

const sizeOptions: SizeOption[] = [
  { name: "Small", value: "14px" },
  { name: "Normal", value: "16px" },
  { name: "Large", value: "20px" },
  { name: "XL", value: "24px" },
  { name: "2XL", value: "32px" },
  { name: "3XL", value: "40px" },
];

export default function CircleDetailPage() {
  const { circleid } = useParams<{ circleid: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [circle, setCircle] = useState<CircleData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [joining, setJoining] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Post Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTab, setPostTab] = useState<"art" | "poem">("art");
  const [postTitle, setPostTitle] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postPreview, setPostPreview] = useState<string | null>(null);

  const [poemBody, setPoemBody] = useState("");
  const [poemFont, setPoemFont] = useState("Georgia, serif");
  const [poemFontSize, setPoemFontSize] = useState("20px");
  const [poemTextColor, setPoemTextColor] = useState("#FFFFFF");
  const [poemBgColor, setPoemBgColor] = useState("#1A1A1A");

  const [postUploading, setPostUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const isMember = circle && user
    ? circle.members.some((m: any) => (m._id || m).toString() === user._id) ||
    circle.admins.some((m: any) => (m._id || m).toString() === user._id) ||
    circle.moderators.some((m: any) => (m._id || m).toString() === user._id) ||
    (circle.owner?._id || circle.owner)?.toString() === user._id
    : false;

  const isAdmin = circle && user
    ? circle.admins.some((m: any) => (m._id || m).toString() === user._id) ||
    (circle.owner?._id || circle.owner)?.toString() === user._id
    : false;

  const isMod = circle && user
    ? circle.moderators.some((m: any) => (m._id || m).toString() === user._id)
    : false;

  const hasPendingRequest = circle && user
    ? circle.joinRequests?.some((r: any) => (r.user?._id || r.user)?.toString() === user._id)
    : false;

  // ─── Fetch circle ─────────────────────────────────────────────────────────────
  const fetchCircle = useCallback(async () => {
    try {
      const res = await fetch(`/api/circles/${circleid}`);
      const data = await res.json();
      if (data.success) setCircle(data.circle);
    } catch {
      toast.error("Failed to load circle");
    } finally {
      setLoading(false);
    }
  }, [circleid]);

  // ─── Fetch posts ──────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (reset = false) => {
    if (postsLoading || (!hasMore && !reset)) return;
    setPostsLoading(true);
    try {
      const cursor = reset ? "" : posts[posts.length - 1]?._id;
      const url = `/api/circles/${circleid}/posts?limit=12`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      }
    } catch {
      // silently fail
    } finally {
      setPostsLoading(false);
    }
  }, [circleid, posts, postsLoading, hasMore]);

  useEffect(() => {
    fetchCircle();
  }, [circleid]);

  useEffect(() => {
    fetchPosts(true);
  }, [circleid]);

  // ─── Infinite scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !postsLoading) fetchPosts();
    }, { rootMargin: "200px" });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [fetchPosts, hasMore, postsLoading]);

  // ─── Join / Leave ─────────────────────────────────────────────────────────────
  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/circles/${circleid}/join`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(circle?.joinType === "open" ? "Joined circle!" : "Join request sent!");
        fetchCircle();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this circle?")) return;
    try {
      const res = await fetch(`/api/circles/${circleid}/leave`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Left circle");
        fetchCircle();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/circles/${circleid}/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post deleted");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ─── Post Upload Handlers ───────────────────────────────────────────────────
  const resetPostModal = () => {
    setShowPostModal(false);
    setPostTitle("");
    setPostFile(null);
    setPostPreview(null);
    setPoemBody("");
    setPoemFont("Georgia, serif");
    setPoemFontSize("20px");
    setPoemTextColor("#FFFFFF");
    setPoemBgColor("#1A1A1A");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setPostFile(selected);
    setPostPreview(URL.createObjectURL(selected));
  };

  const handleUploadSubmit = async (): Promise<void> => {
    if (!postTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setPostUploading(true);
    try {
      let imageUrl = "";
      if (postTab === "art") {
        if (!postFile) throw new Error("Please select an artwork");
        const formData = new FormData();
        formData.append("file", postFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.message || "Image upload failed");
        imageUrl = uploadData.url;
      } else {
        if (!poemBody.trim()) throw new Error("Please write a poem");
      }

      const postBody = {
        title: postTitle,
        type: postTab,
        visibility: "circle",
        ...(postTab === "art" ? { media: { url: imageUrl } } : {
          body: poemBody,
          poemStyle: {
            fontFamily: poemFont,
            fontSize: poemFontSize,
            fontColor: poemTextColor,
            backgroundColor: poemBgColor,
          }
        }),
      };

      const res = await fetch(`/api/circles/${circleid}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(postTab === "art" ? "Artwork posted!" : "Poem posted!");
      setPosts((prev) => [data.post, ...prev]);
      resetPostModal();
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setPostUploading(false);
    }
  };


  if (loading) {
    return (
      <div className="pl-0 lg:pl-72 pt-10 px-4 min-h-screen bg-[#06060B]">
        <div className="max-w-6xl mx-auto animate-pulse space-y-4">
          <div className="h-48 rounded-xl bg-white/5" />
          <div className="h-16 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="pl-0 lg:pl-72 pt-20 flex items-center justify-center min-h-screen bg-[#06060B]">
        <p className="text-gray-500">Circle not found.</p>
      </div>
    );
  }

  return (
    <div className="pl-0 lg:pl-72 min-h-screen bg-[#06060B] text-white">
      {/* Cover Banner */}
      <div className="w-full h-48 lg:h-64 relative bg-[#1E1E1E] overflow-hidden">
        {circle.image ? (
          <img src={circle.image} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900/40 to-blue-900/40" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-white/10 gap-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1E1E1E] flex-shrink-0 flex items-center justify-center shadow-lg border border-white/10">
              {circle.icon ? (
                <img src={circle.icon} alt={circle.name} className="w-full h-full object-cover" />
              ) : circle.image ? (
                <img src={circle.image} alt={circle.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{circle.name[0]?.toUpperCase()}</span>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-xl font-bold">{circle.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">{circle.members.length} Members</span>
                {/* Member avatars */}
                {circle.members.length > 0 && (
                  <div className="flex -space-x-1.5 ml-1">
                    {circle.members.slice(0, 4).map((m: any, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-[#06060B] overflow-hidden bg-gray-700"
                      >
                        {m.profileImage ? (
                          <img src={m.profileImage} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white bg-blue-900">
                            {m.fullName?.[0] || "?"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 relative">
            <button className="px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors text-sm font-medium">
              Invite
            </button>

            {isMember ? (
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium"
              >
                Joined <IoChevronDown />
              </button>
            ) : hasPendingRequest ? (
              <button disabled className="px-4 py-1.5 rounded-full bg-white/5 text-white/50 text-sm font-medium cursor-not-allowed">
                Pending
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold disabled:opacity-50"
              >
                Join
              </button>
            )}

            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <IoMenuOutline size={22} />
            </button>

            {/* Dropdown Menu */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-12 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl py-1 z-30 overflow-hidden">
                {isAdmin && (
                  <Link
                    href={`/Circle/${circleid}/dashboard`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                  >
                    <IoSettingsOutline size={16} className="text-gray-400" /> Admin Dashboard
                  </Link>
                )}
                {isMod && !isAdmin && (
                  <Link
                    href={`/Circle/${circleid}/mod-dashboard`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                  >
                    <IoShieldOutline size={16} className="text-gray-400" /> Mod Dashboard
                  </Link>
                )}
                {isMember && (
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-red-400"
                  >
                    <IoExitOutline size={16} /> Leave Circle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ongoing activities (Mock UI based on design) */}
        <div className="py-8">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Ongoing activities</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { title: "Monthly Art Jam - March", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop" },
              { title: "What does silence sound like?", img: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=300&auto=format&fit=crop" },
              { title: "The fight", img: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=300&auto=format&fit=crop" },
            ].map((activity, i) => (
              <div key={i} className="min-w-[200px] w-[200px] bg-[#141414] rounded-xl overflow-hidden border border-white/5 flex flex-col">
                <div className="h-28 w-full bg-[#1E1E1E] p-2">
                  <img src={activity.img} alt={activity.title} className="w-full h-full object-cover rounded-lg opacity-80" />
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <h3 className="text-xs font-semibold text-gray-300 line-clamp-2 mb-3">{activity.title}</h3>
                  <button className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors">
                    Participate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community works */}
        <div className="pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400">Community works</h2>
            {isMember && (
              <button
                onClick={() => setShowPostModal(true)}
                className="text-xs font-medium bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                + Post Work
              </button>
            )}
          </div>

          {!isMember ? (
            <div className="text-center py-16 border border-white/5 rounded-2xl bg-[#0a0a0f]">
              <p className="text-gray-500 text-sm">Join the circle to see community works.</p>
            </div>
          ) : posts.length === 0 && !postsLoading ? (
            <div className="text-center py-16 border border-white/5 rounded-2xl bg-[#0a0a0f]">
              <p className="text-gray-500 text-sm">No works posted yet.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="break-inside-avoid rounded-xl overflow-hidden bg-[#141414] group relative border border-white/5"
                >
                  {post.type === "art" && post.media?.url && (
                    <img
                      src={post.media.url}
                      alt={post.title}
                      className="w-full object-cover"
                    />
                  )}
                  {post.type === "poem" && (
                    <div
                      className="p-4 min-h-[150px] flex items-center break-words"
                      style={{
                        backgroundColor: post.poemStyle?.backgroundColor || "#1a1a1a",
                        color: post.poemStyle?.fontColor || "#fff",
                        fontFamily: post.poemStyle?.fontFamily || "Georgia, serif"
                      }}
                    >
                      <p
                        className="leading-relaxed whitespace-pre-wrap w-full text-center"
                        style={{ fontSize: post.poemStyle?.fontSize || "14px" }}
                      >
                        {post.body}
                      </p>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      {user && (user._id === post.author._id || isAdmin || isMod) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenMenuId(openMenuId === post._id ? null : post._id);
                            }}
                            className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                          >
                            <IoEllipsisVertical size={14} />
                          </button>

                          {openMenuId === post._id && (
                            <div className="absolute right-0 top-8 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl py-1 z-20">
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/5 text-red-400 text-xs transition-colors"
                              >
                                <IoTrashOutline size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white truncate drop-shadow-md">{post.title}</h3>
                      <p className="text-xs text-gray-300 drop-shadow-md">by {post.author.fullName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={loaderRef} className="py-6 flex justify-center">
            {postsLoading && (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Post Work Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#06060B] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Post Work to Circle</h2>
              <button 
                onClick={resetPostModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Type Toggle */}
              <div className="flex p-1 bg-[#141414] border border-white/10 rounded-xl mb-6 w-max mx-auto">
                <button
                  onClick={() => setPostTab("art")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    postTab === "art" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Artwork
                </button>
                <button
                  onClick={() => setPostTab("poem")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    postTab === "poem" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Poem
                </button>
              </div>

              {/* Title Input */}
       

              {postTab === "art" ? (
                <div className="animate-in fade-in">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {!postPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 bg-[#141414] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IoCloudUpload size={28} className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                        Click to select artwork
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full rounded-xl border border-white/10 bg-[#141414] overflow-hidden">
                      <button
                        onClick={() => { setPostPreview(null); setPostFile(null); }}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                      >
                        <IoClose size={18} />
                      </button>
                      <img
                        src={postPreview}
                        alt="Preview"
                        className="w-full max-h-80 object-contain bg-[#06060B]"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in space-y-4">
                  {/* Styling Options for Poem */}
                  <div className="flex flex-wrap items-center gap-4 bg-[#141414] p-3 rounded-xl border border-white/10">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Font</label>
                      <select
                        value={poemFont}
                        onChange={(e) => setPoemFont(e.target.value)}
                        className="bg-[#1E1E1E] text-white text-xs p-1.5 rounded border border-white/10 outline-none"
                      >
                        {fontOptions.map((f, i) => (
                          <option key={i} value={f.value}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Size</label>
                      <select
                        value={poemFontSize}
                        onChange={(e) => setPoemFontSize(e.target.value)}
                        className="bg-[#1E1E1E] text-white text-xs p-1.5 rounded border border-white/10 outline-none"
                      >
                        {sizeOptions.map((s, i) => (
                          <option key={i} value={s.value}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Text Color</label>
                      <input
                        type="color"
                        value={poemTextColor}
                        onChange={(e) => setPoemTextColor(e.target.value)}
                        className="w-7 h-7 bg-transparent cursor-pointer rounded overflow-hidden"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bg Color</label>
                      <input
                        type="color"
                        value={poemBgColor}
                        onChange={(e) => setPoemBgColor(e.target.value)}
                        className="w-7 h-7 bg-transparent cursor-pointer rounded overflow-hidden"
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Write your poem here..."
                    value={poemBody}
                    onChange={(e) => setPoemBody(e.target.value)}
                    className="w-full h-64 rounded-xl border border-white/10 px-4 py-4 resize-y focus:outline-none"
                    style={{
                      backgroundColor: poemBgColor,
                      color: poemTextColor,
                      fontFamily: poemFont,
                      fontSize: poemFontSize,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#141414] rounded-b-3xl">
              <button
                onClick={resetPostModal}
                disabled={postUploading}
                className="px-5 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={postUploading}
                className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {postUploading && <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                {postUploading ? "Posting..." : `Post ${postTab === "art" ? "Artwork" : "Poem"}`}
              </button>
            </div>
          </div>
        </div >
      )}

{/* Click outside to close menus */ }
{
  (showSettingsMenu || openMenuId) && (
    <div
      className="fixed inset-0 z-20"
      onClick={() => {
        setShowSettingsMenu(false);
        setOpenMenuId(null);
      }}
    />
  )
}
    </div >
  );
}