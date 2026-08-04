"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import {
  IoChevronBack,
  IoPersonRemoveOutline,
  IoShieldOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoClose,
  IoPeopleOutline,
  IoFlagOutline,
  IoGridOutline,
  IoTimeOutline,
} from "react-icons/io5";
import Link from "next/link";

type Tab = "overview" | "members" | "requests" | "reports" | "posts";

interface CircleData {
  _id: string;
  name: string;
  icon?: string;
  image?: string;
  members: any[];
  admins: any[];
  moderators: any[];
  owner: any;
  joinRequests?: any[];
  reports?: any[];
  posts?: any[];
  category?: string;
  joinType?: string;
}

interface Post {
  _id: string;
  title: string;
  type: string;
  media?: { url: string };
  body?: string;
  author: { _id: string; fullName: string; username: string; profileImage?: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const { circleid } = useParams<{ circleid: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [circle, setCircle] = useState<CircleData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCircle = useCallback(async () => {
    try {
      const res = await fetch(`/api/circles/${circleid}`);
      const data = await res.json();
      if (data.success) {
        setCircle(data.circle);
      } else {
        toast.error("Circle not found");
        router.push(`/Circle/${circleid}`);
      }
    } catch {
      toast.error("Failed to load circle");
    } finally {
      setLoading(false);
    }
  }, [circleid, router]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/circles/${circleid}/posts?limit=50`);
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch {}
  }, [circleid]);

  useEffect(() => {
    fetchCircle();
    fetchPosts();
  }, [fetchCircle, fetchPosts]);

  useEffect(() => {
    if (!circle || !user) return;
    const isAdmin =
      (circle.owner?._id || circle.owner)?.toString() === user._id ||
      circle.admins.some((a: any) => (a._id || a).toString() === user._id);
    if (!isAdmin) {
      toast.error("Admin access required");
      router.push(`/Circle/${circleid}`);
    }
  }, [circle, user, circleid, router]);

  const isOwner = circle && user
    ? (circle.owner?._id || circle.owner)?.toString() === user._id
    : false;

  const doAction = async (endpoint: string, method: string, body: any, successMsg: string) => {
    const key = `${endpoint}-${JSON.stringify(body)}`;
    setActionLoading(key);
    try {
      const res = await fetch(`/api/circles/${circleid}/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(successMsg);
        fetchCircle();
        fetchPosts();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleKick = (userId: string) => doAction("kick", "POST", { targetUserId: userId }, "Member removed");
  const handleMakeAdmin = (userId: string) => doAction("admin", "POST", { targetUserId: userId }, "Admin assigned");
  const handleRemoveAdmin = (userId: string) => doAction("admin", "DELETE", { targetUserId: userId }, "Admin removed");
  const handleMakeMod = (userId: string) => doAction("moderator", "POST", { targetUserId: userId }, "Moderator assigned");
  const handleRemoveMod = (userId: string) => doAction("moderator", "DELETE", { targetUserId: userId }, "Moderator removed");
  const handleApprove = (userId: string) => doAction("approve", "POST", { targetUserId: userId }, "Request approved");
  const handleReject = (userId: string) => doAction("reject", "POST", { targetUserId: userId }, "Request rejected");

  const handleResolveReport = async (reportId: string) => {
    setActionLoading(`report-${reportId}`);
    try {
      const res = await fetch(`/api/circles/${circleid}/reports/${reportId}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Report resolved");
        fetchCircle();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to resolve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    setActionLoading(`post-${postId}`);
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
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="pl-0 lg:pl-72 pt-16 flex items-center justify-center min-h-screen bg-[#06060B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!circle) return null;

  const pendingRequests = circle.joinRequests?.filter((r: any) => r.status === "pending") || [];
  const pendingReports = circle.reports?.filter((r: any) => r.status === "pending") || [];

  const TABS: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: <IoGridOutline size={16} /> },
    { key: "members", label: "Members", icon: <IoPeopleOutline size={16} />, badge: circle.members.length },
    { key: "requests", label: "Requests", icon: <IoTimeOutline size={16} />, badge: pendingRequests.length },
    { key: "reports", label: "Reports", icon: <IoFlagOutline size={16} />, badge: pendingReports.length },
    { key: "posts", label: "Posts", icon: <IoGridOutline size={16} />, badge: posts.length },
  ];

  return (
    <div className="pl-0 lg:pl-72 min-h-screen bg-[#06060B] text-white">
      {/* Header */}
      <div className="px-4 lg:px-8 pt-8 pb-4 border-b border-white/10 bg-[#06060B]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/Circle/${circleid}`}
              className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <IoChevronBack size={14} /> Back to Circle
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#141414] border border-white/10 flex-shrink-0">
              {circle.icon ? (
                <img src={circle.icon} alt={circle.name} className="w-full h-full object-cover" />
              ) : circle.image ? (
                <img src={circle.image} alt={circle.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                  {circle.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{circle.name}</h1>
                <span className="text-[10px] px-2 py-1 uppercase font-bold tracking-wider rounded-md bg-white/10 text-white">
                  {isOwner ? "Owner" : "Admin"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard · Manage your circle</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
        {/* Tab Nav */}
        <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/10 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap -mb-px ${
                activeTab === tab.key
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab.key === "requests" || tab.key === "reports"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-white/10 text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Members", value: circle.members.length, icon: <IoPeopleOutline size={20} /> },
              { label: "Admins", value: circle.admins.length, icon: <IoShieldCheckmarkOutline size={20} /> },
              { label: "Moderators", value: circle.moderators.length, icon: <IoShieldOutline size={20} /> },
              { label: "Pending Requests", value: pendingRequests.length, icon: <IoTimeOutline size={20} /> },
              { label: "Total Posts", value: posts.length, icon: <IoGridOutline size={20} /> },
              { label: "Pending Reports", value: pendingReports.length, icon: <IoFlagOutline size={20} /> },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl border border-white/5 bg-[#141414]">
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Members Tab ── */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {circle.members.map((m: any) => {
              const memberId = (m._id || m).toString();
              const isOwnerId = (circle.owner?._id || circle.owner)?.toString() === memberId;
              const memberIsAdmin = circle.admins.some((a: any) => (a._id || a).toString() === memberId);
              const memberIsMod = circle.moderators.some((mod: any) => (mod._id || mod).toString() === memberId);
              const isSelf = user?._id === memberId;

              return (
                <div
                  key={memberId}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#141414]"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                    {m.profileImage ? (
                      <img src={m.profileImage} alt={m.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                        {m.fullName?.[0] || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link href={`/Profile/${memberId}`} className="text-sm font-semibold text-white hover:underline truncate">
                        {m.fullName || m.username || "Unknown"}
                      </Link>
                      {m.username && <span className="text-xs text-gray-500">@{m.username}</span>}
                    </div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {isOwnerId && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 font-bold">Owner</span>}
                      {memberIsAdmin && !isOwnerId && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white font-bold">Admin</span>}
                      {memberIsMod && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">Mod</span>}
                    </div>
                  </div>

                  {!isOwnerId && !isSelf && isOwner && (
                    <div className="flex gap-2 flex-shrink-0">
                      {!memberIsAdmin ? (
                        <button
                          onClick={() => handleMakeAdmin(memberId)}
                          disabled={actionLoading !== null}
                          title="Make Admin"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IoShieldCheckmarkOutline size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(memberId)}
                          disabled={actionLoading !== null}
                          title="Remove Admin"
                          className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IoShieldCheckmarkOutline size={16} />
                        </button>
                      )}
                    </div>
                  )}

                  {!isOwnerId && !isSelf && (
                    <div className="flex gap-2 flex-shrink-0">
                      {!memberIsMod ? (
                        <button
                          onClick={() => handleMakeMod(memberId)}
                          disabled={actionLoading !== null}
                          title="Make Moderator"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IoShieldOutline size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveMod(memberId)}
                          disabled={actionLoading !== null}
                          title="Remove Moderator"
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IoShieldOutline size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleKick(memberId)}
                        disabled={actionLoading !== null}
                        title="Remove Member"
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <IoPersonRemoveOutline size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Join Requests Tab ── */}
        {activeTab === "requests" && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <IoTimeOutline size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No pending join requests</p>
              </div>
            ) : (
              pendingRequests.map((req: any, i) => {
                const reqUser = req.user;
                const userId = (reqUser?._id || reqUser)?.toString();
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#141414]">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                      {reqUser?.profileImage ? (
                        <img src={reqUser.profileImage} alt={reqUser.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                          {reqUser?.fullName?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {reqUser?.fullName || reqUser?.username || "Unknown User"}
                      </p>
                      {req.createdAt && (
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                          Requested {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(userId)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <IoCheckmarkCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(userId)}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <IoClose size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Reports Tab ── */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            {(circle.reports || []).length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <IoFlagOutline size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No reports submitted</p>
              </div>
            ) : (
              (circle.reports || []).map((report: any, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border bg-[#141414] ${
                    report.status === "resolved"
                      ? "border-green-500/30 opacity-60"
                      : "border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          report.status === "resolved"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}>
                          {report.status === "resolved" ? "Resolved" : "Pending"}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                          by {report.reporter?.fullName || report.reporter?.username || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-white">Reason: </span>{report.reason || "No reason provided"}
                      </p>
                      {report.post?.title && (
                        <p className="text-xs text-gray-500 mt-2 p-2 bg-white/5 rounded-md">
                          Post: "{report.post.title}"
                        </p>
                      )}
                    </div>
                    {report.status !== "resolved" && (
                      <button
                        onClick={() => handleResolveReport(report._id)}
                        disabled={actionLoading === `report-${report._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
                      >
                        <IoCheckmarkCircle size={14} />
                        {actionLoading === `report-${report._id}` ? "…" : "Resolve"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Posts Tab ── */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <IoGridOutline size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No posts in this circle yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#141414]"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#2A2A2A] border border-white/5 flex-shrink-0 flex items-center justify-center">
                    {post.type === "art" && post.media?.url ? (
                      <img src={post.media.url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-lg opacity-50">📜</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                        post.type === "art" ? "bg-white/10 text-white" : "bg-white/10 text-white"
                      }`}>
                        {post.type === "art" ? "Art" : "Poem"}
                      </span>
                      <Link
                        href={`/Profile/${post.author._id}`}
                        className="text-xs text-gray-500 hover:text-white transition-colors truncate"
                      >
                        by {post.author.fullName}
                      </Link>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-600">
                        · {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    disabled={actionLoading === `post-${post._id}`}
                    className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
                    title="Delete post"
                  >
                    {actionLoading === `post-${post._id}` ? (
                      <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <IoTrashOutline size={16} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
