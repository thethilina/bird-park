"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  IoCogOutline,
  IoPulseOutline,
  IoAnalyticsOutline,
} from "react-icons/io5";
import Link from "next/link";

type Tab = "overview" | "members" | "requests" | "reports" | "posts" | "settings" | "emotions";

interface EmotionEntry {
  emotion: string;
  score: number;
}

interface EmotionData {
  topEmotions: EmotionEntry[];
  emotionHistory: { emotions: EmotionEntry[]; date: string }[];
  memberStats: {
    _id: string;
    fullName: string;
    username: string;
    profileImage?: string;
    totalPosts: number;
    analyzed: number;
    pending: number;
    failed: number;
    topCluster?: string;
  }[];
  summary: {
    totalPosts: number;
    totalAnalyzed: number;
    totalPending: number;
    totalFailed: number;
  };
}

interface CircleRule {
  title: string;
  description: string;
}

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
  description?: string;
  rules?: CircleRule[];
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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [circle, setCircle] = useState<CircleData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>((searchParams?.get("tab") as Tab) || "overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [emotionLoading, setEmotionLoading] = useState(false);

  // Settings state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editJoinType, setEditJoinType] = useState("open");
  const [editRules, setEditRules] = useState<CircleRule[]>([]);
  const [transferTargetId, setTransferTargetId] = useState("");

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

  const fetchEmotions = useCallback(async () => {
    setEmotionLoading(true);
    try {
      const res = await fetch(`/api/circles/${circleid}/emotions`);
      const data = await res.json();
      if (data.success) setEmotionData(data);
    } catch {}
    finally { setEmotionLoading(false); }
  }, [circleid]);

  useEffect(() => {
    fetchCircle();
    fetchPosts();
  }, [fetchCircle, fetchPosts]);

  useEffect(() => {
    if (!circle || !user) return;
    const isOwner = (circle.owner?._id || circle.owner)?.toString() === user._id;
    const isAdmin = circle.admins.some((a: any) => (a._id || a).toString() === user._id);
    const isMod = circle.moderators.some((m: any) => (m._id || m).toString() === user._id);
    
    if (!isOwner && !isAdmin && !isMod) {
      toast.error("Dashboard access required");
      router.push(`/Circle/${circleid}`);
    } else {
      // Initialize settings state once circle loads
      setEditName(circle.name || "");
      setEditDesc(circle.description || "");
      setEditJoinType(circle.joinType || "open");
      // @ts-ignore
      setEditRules(circle.rules || []);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("settings");
    try {
      const res = await fetch(`/api/circles/${circleid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          joinType: editJoinType,
          rules: editRules,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved");
        fetchCircle();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId) return toast.error("Select a member");
    if (!confirm("Are you sure you want to transfer ownership? You will lose Owner privileges.")) return;
    
    setActionLoading("transfer");
    try {
      const res = await fetch(`/api/circles/${circleid}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: transferTargetId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ownership transferred");
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to transfer");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCircle = async () => {
    if (!confirm("Delete this circle forever? This cannot be undone!")) return;
    if (!confirm("Are you REALLY sure?")) return;
    
    setActionLoading("delete-circle");
    try {
      const res = await fetch(`/api/circles/${circleid}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Circle deleted");
        router.push("/explore");
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch {
      toast.error("Request failed");
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

  const isAdminStatus = circle.admins.some((a: any) => (a._id || a).toString() === user?._id);
  const isModStatus = circle.moderators.some((m: any) => (m._id || m).toString() === user?._id);

  const TABS: { key: Tab; label: string; icon: React.ReactNode; badge?: number; hidden?: boolean }[] = [
    { key: "overview" as Tab, label: "Overview", icon: <IoGridOutline size={16} /> },
    { key: "members" as Tab, label: "Members", icon: <IoPeopleOutline size={16} />, badge: circle.members.length, hidden: !(isOwner || isAdminStatus) },
    { key: "requests" as Tab, label: "Requests", icon: <IoTimeOutline size={16} />, badge: pendingRequests.length },
    { key: "reports" as Tab, label: "Reports", icon: <IoFlagOutline size={16} />, badge: pendingReports.length },
    { key: "posts" as Tab, label: "Posts", icon: <IoGridOutline size={16} />, badge: posts.length },
    { key: "emotions" as Tab, label: "Emotions", icon: <IoPulseOutline size={16} />, hidden: !(isOwner || isAdminStatus) },
    { key: "settings" as Tab, label: "Settings", icon: <IoCogOutline size={16} />, hidden: !(isOwner || isAdminStatus) },
  ].filter(t => !t.hidden);

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
        <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/10 mb-6"
          onClick={(e) => {
            // Lazy-load emotions data when switching to emotions tab
            const btn = (e.target as HTMLElement).closest("button");
            if (btn?.dataset.tabkey === "emotions" && !emotionData && !emotionLoading) {
              fetchEmotions();
            }
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              data-tabkey={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "emotions" && !emotionData && !emotionLoading) {
                  fetchEmotions();
                }
              }}
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

        {/* ── Emotions Tab ── */}
        {activeTab === "emotions" && (
          <div className="space-y-8">
            {emotionLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              </div>
            ) : !emotionData ? (
              <div className="text-center py-16 text-gray-500">
                <IoPulseOutline size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Could not load emotion data.</p>
                <button
                  onClick={fetchEmotions}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white font-semibold transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Posts", value: emotionData.summary.totalPosts, color: "text-white" },
                    { label: "Analyzed", value: emotionData.summary.totalAnalyzed, color: "text-emerald-400" },
                    { label: "Pending", value: emotionData.summary.totalPending, color: "text-yellow-400" },
                    { label: "Failed", value: emotionData.summary.totalFailed, color: "text-red-400" },
                  ].map((s) => (
                    <div key={s.label} className="p-5 rounded-2xl border border-white/5 bg-[#141414]">
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Top Emotions */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]">
                  <div className="flex items-center gap-2 mb-6">
                    <IoAnalyticsOutline size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-white">Top Themes</h2>
                    <span className="text-xs text-gray-500 ml-1">(AI semantic clusters from analyzed posts)</span>
                  </div>

                  {emotionData.topEmotions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No analyzed posts yet. Submit posts to the circle and the AI will detect creative themes.</p>
                  ) : (
                    <div className="space-y-3">
                      {emotionData.topEmotions.map((e, i) => {
                        const maxScore = Math.max(...emotionData.topEmotions.map((x) => x.score), 1);
                        const pct = Math.round((e.score / maxScore) * 100);
                        const hue = (i * 47 + 200) % 360;
                        return (
                          <div key={e.emotion}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white capitalize">{e.emotion}</span>
                              <span className="text-xs text-gray-400 font-mono">{e.score.toFixed(2)}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: `hsl(${hue}, 70%, 60%)`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Emotion History */}
                {emotionData.emotionHistory.length > 0 && (
                  <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]">
                    <div className="flex items-center gap-2 mb-5">
                      <IoTimeOutline size={18} className="text-gray-400" />
                      <h2 className="text-lg font-bold text-white">Emotion History</h2>
                      <span className="text-xs text-gray-500 ml-1">(latest {emotionData.emotionHistory.length} snapshots)</span>
                    </div>

                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                      {emotionData.emotionHistory.map((snapshot, si) => {
                        const topInSnapshot = snapshot.emotions?.slice(0, 3) ?? [];
                        return (
                          <div
                            key={si}
                            className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                          >
                            <div className="flex-shrink-0 text-right min-w-[60px]">
                              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
                                {new Date(snapshot.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </p>
                              <p className="text-[10px] text-gray-700">
                                {new Date(snapshot.date).getFullYear()}
                              </p>
                            </div>
                            <div className="flex-1 flex flex-wrap gap-2">
                              {topInSnapshot.map((em) => (
                                <span
                                  key={em.emotion}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10"
                                >
                                  {em.emotion}
                                  <span className="ml-1 text-gray-500 font-mono text-[10px]">{em.score.toFixed(1)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Member Stats */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#141414]">
                  <div className="flex items-center gap-2 mb-5">
                    <IoPeopleOutline size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-white">Member Contributions</h2>
                  </div>

                  {emotionData.memberStats.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No posts yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {emotionData.memberStats.map((m) => (
                        <div
                          key={m._id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#2A2A2A] flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
                            {m.profileImage ? (
                              <img src={m.profileImage} alt={m.fullName} className="w-full h-full object-cover" />
                            ) : (
                              m.fullName?.[0]?.toUpperCase() || "?"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{m.fullName}</p>
                            {m.username && <p className="text-xs text-gray-500">@{m.username}</p>}
                            {m.topCluster && (
                              <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 truncate max-w-[160px]">
                                {m.topCluster}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-right flex-shrink-0">
                            <div>
                              <p className="text-sm font-bold text-white">{m.totalPosts}</p>
                              <p className="text-[10px] uppercase tracking-wider text-gray-500">posts</p>
                            </div>
                            <div className="flex gap-1">
                              {m.analyzed > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                  {m.analyzed} ✓
                                </span>
                              )}
                              {m.pending > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400">
                                  {m.pending} ⏳
                                </span>
                              )}
                              {m.failed > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">
                                  {m.failed} ✗
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            {/* General Settings */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#141414]">
              <h2 className="text-xl font-bold mb-4">General Settings</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Circle Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Join Type</label>
                  <select
                    value={editJoinType}
                    onChange={(e) => setEditJoinType(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white"
                  >
                    <option value="open">Open (Anyone can join)</option>
                    <option value="approval">Approval (Requires request)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2">Circle Rules</h3>
                  <div className="space-y-3">
                    {editRules.map((rule, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Rule Title"
                            value={rule.title}
                            onChange={(e) => {
                              const newRules = [...editRules];
                              newRules[idx].title = e.target.value;
                              setEditRules(newRules);
                            }}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                          />
                          <input
                            type="text"
                            placeholder="Rule Description"
                            value={rule.description}
                            onChange={(e) => {
                              const newRules = [...editRules];
                              newRules[idx].description = e.target.value;
                              setEditRules(newRules);
                            }}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-gray-300"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditRules(editRules.filter((_, i) => i !== idx))}
                          className="px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        >
                          <IoClose size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditRules([...editRules, { title: "", description: "" }])}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-semibold text-white"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading === "settings"}
                    className="px-6 py-2.5 rounded-lg bg-[#3B5D95] text-white font-bold hover:bg-[#2d4a78] disabled:opacity-50"
                  >
                    {actionLoading === "settings" ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone (Owner Only) */}
            {isOwner && (
              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
                <h2 className="text-xl font-bold mb-4 text-red-500">Danger Zone</h2>
                
                <div className="space-y-6">
                  {/* Transfer Ownership */}
                  <div className="pb-6 border-b border-red-500/20">
                    <h3 className="font-semibold text-white mb-1">Transfer Ownership</h3>
                    <p className="text-sm text-red-400 mb-3">
                      Transfer full control of this circle to another member. You will be demoted to an Admin.
                    </p>
                    <div className="flex gap-2">
                      <select
                        value={transferTargetId}
                        onChange={(e) => setTransferTargetId(e.target.value)}
                        className="flex-1 bg-black/30 border border-red-500/20 rounded-lg p-2.5 text-white"
                      >
                        <option value="">Select a member...</option>
                        {circle.members.map((m: any) => {
                          const mId = (m._id || m).toString();
                          if (mId === user?._id) return null;
                          return (
                            <option key={mId} value={mId}>
                              {m.fullName || m.username}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        onClick={handleTransferOwnership}
                        disabled={actionLoading === "transfer" || !transferTargetId}
                        className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  {/* Delete Circle */}
                  <div>
                    <h3 className="font-semibold text-white mb-1">Delete Circle</h3>
                    <p className="text-sm text-red-400 mb-3">
                      Permanently delete this circle and all of its data. This cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteCircle}
                      disabled={actionLoading === "delete-circle"}
                      className="px-6 py-2.5 rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-colors disabled:opacity-50"
                    >
                      Delete Circle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
