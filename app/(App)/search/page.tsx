"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoMdSearch } from "react-icons/io";
import { FiUsers, FiGrid, FiBookOpen, FiFilter } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { MdGroups } from "react-icons/md";
import userData from "@/TestDataBase/userdata";

/* ============================================================
   TYPES
============================================================ */

interface User {
  _id: string;
  fullName: string;
  username: string;
  profileImage?: string;
  bio?: string;
  currentCategory?: string;
  connectionCount: number;
  isCurrentUser: boolean;
}

interface Post {
  _id: string;
  title: string;
  body?: string;
  type: "art" | "poem";
  media?: { url: string; type: string };
  poemStyle?: { backgroundColor?: string; fontColor?: string; fontFamily?: string };
  author: { _id: string; fullName: string; username: string; profileImage?: string };
  hearts: string[];
  createdAt: string;
}

interface Collection {
  _id: string;
  title: string;
  description?: string;
  coverImage?: string;
  author: { _id: string; fullName: string; username: string; profileImage?: string };
  artistCategory?: string;
  top3Emotions?: { emotion: string; score: number }[];
  postCount: number;
  createdAt: string;
}

interface Circle {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  category?: string;
  memberCount: number;
  isMember: boolean;
}

type FilterTab = "all" | "users" | "posts" | "collections" | "circles";

/* ============================================================
   MAIN
============================================================ */

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setUsers([]); setPosts([]); setCollections([]); setCircles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPosts(data.posts || []);
        setCollections(data.collections || []);
        setCircles(data.circles || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveTab("all");
    fetchResults(query);
  }, [query, fetchResults]);

  const totalResults = users.length + posts.length + collections.length + circles.length;

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "all", label: "All", icon: <HiSparkles size={16} />, count: totalResults },
    { id: "users", label: "People", icon: <FiUsers size={16} />, count: users.length },
    { id: "posts", label: "Posts", icon: <FiGrid size={16} />, count: posts.length },
    { id: "circles", label: "Circles", icon: <MdGroups size={17} />, count: circles.length },
    { id: "collections", label: "Collections", icon: <FiBookOpen size={16} />, count: collections.length },
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white leading-tight">
          {query ? (
            <>
              Results for <span style={{ color: "#a78bfa" }}>&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Explore Bird Park"
          )}
        </h1>
        {query && !loading && (
          <p className="mt-2 text-xl text-gray-400">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`search-filter-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
                fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer",
                transition: "background-color 0.2s, color 0.2s",
                background: isActive ? "#7c3aed" : "rgba(255,255,255,0.05)",
                border: isActive ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
                color: isActive ? "#fff" : "#9ca3af",
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  marginLeft: 2, padding: "2px 8px", borderRadius: "0.5rem", fontSize: "0.8rem",
                  background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                  color: isActive ? "#fff" : "#6b7280",
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSkeleton />
      ) : !query ? (
        <EmptyPrompt />
      ) : totalResults === 0 ? (
        <NoResults query={query} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* PEOPLE */}
          {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader icon={<FiUsers size={17} />} title="People" count={users.length} onSeeAll={() => setActiveTab("users")} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {(activeTab === "all" ? users.slice(0, 3) : users).map((u) => <UserCard key={u._id} user={u} />)}
              </div>
            </section>
          )}

          {/* POSTS */}
          {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader icon={<FiGrid size={17} />} title="Posts" count={posts.length} onSeeAll={() => setActiveTab("posts")} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {(activeTab === "all" ? posts.slice(0, 3) : posts).map((p) => <PostCard key={p._id} post={p} />)}
              </div>
            </section>
          )}

          {/* CIRCLES */}
          {(activeTab === "all" || activeTab === "circles") && circles.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader icon={<MdGroups size={18} />} title="Circles" count={circles.length} onSeeAll={() => setActiveTab("circles")} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {(activeTab === "all" ? circles.slice(0, 3) : circles).map((c) => <CircleCard key={c._id} circle={c} />)}
              </div>
            </section>
          )}

          {/* COLLECTIONS */}
          {(activeTab === "all" || activeTab === "collections") && collections.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader icon={<FiBookOpen size={17} />} title="Collections" count={collections.length} onSeeAll={() => setActiveTab("collections")} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {(activeTab === "all" ? collections.slice(0, 3) : collections).map((col) => <CollectionCard key={col._id} collection={col} />)}
              </div>
            </section>
          )}

          {/* Empty filtered tab */}
          {activeTab !== "all" && (
            (activeTab === "users" && users.length === 0) ||
            (activeTab === "posts" && posts.length === 0) ||
            (activeTab === "circles" && circles.length === 0) ||
            (activeTab === "collections" && collections.length === 0)
          ) && (
              <div style={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "3.5rem 1.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", color: "#6b7280" }}>
                  No {activeTab} found for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading…</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({ icon, title, count, onSeeAll }: { icon: React.ReactNode; title: string; count: number; onSeeAll: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: 600, fontSize: "1.25rem" }}>
        <span style={{ color: "#a78bfa" }}>{icon}</span>
        {title}
        <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: 400 }}>({count})</span>
      </div>
      {count > 3 && (
        <button
          onClick={onSeeAll}
          style={{ fontSize: "0.95rem", fontWeight: 500, color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.5rem", padding: "0.5rem 0.9rem", cursor: "pointer" }}
        >
          See all →
        </button>
      )}
    </div>
  );
}

/* ============================================================
   USER CARD
============================================================ */

function UserCard({ user }: { user: User }) {
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";
  return (
    <Link href={`/Profile/${user._id}`}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.875rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "1.125rem", cursor: "pointer", transition: "background-color 0.2s, border-color 0.2s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.06)"; el.style.borderColor = "rgba(255,255,255,0.15)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.08)"; }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={user.profileImage || fallback} alt={user.fullName} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
          {user.isCurrentUser && <span style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#7c3aed", border: "2px solid #0a0a0a" }} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 600, color: "#fff", fontSize: "1.05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.fullName}</p>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{user.username}</p>
          {user.currentCategory && (
            <span style={{ display: "inline-block", marginTop: 6, fontSize: "0.8rem", padding: "3px 10px", borderRadius: "0.5rem", background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
              {user.currentCategory}
            </span>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{user.connectionCount}</p>
          <p style={{ fontSize: "0.8rem", color: "#4b5563" }}>connections</p>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   POST CARD  — links to /Art/[id]
============================================================ */

function PostCard({ post }: { post: Post }) {
  const isArt = post.type === "art";
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";

  return (
    <Link href={`/Art/${post._id}`}>
      <div
        style={{ overflow: "hidden", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "background-color 0.2s, border-color 0.2s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.18)"; el.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.03)"; }}
      >
        {/* Thumbnail */}
        <div style={{ position: "relative", height: 170, width: "100%", overflow: "hidden" }}>
          {isArt && post.media?.url ? (
            <img src={post.media.url} alt={post.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center", backgroundColor: post.poemStyle?.backgroundColor || "#151515", color: post.poemStyle?.fontColor || "#e0e0e0", fontFamily: post.poemStyle?.fontFamily || "serif" }}>
              <p style={{ fontSize: "1rem", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>{post.body}</p>
            </div>
          )}
          <span style={{ position: "absolute", top: 10, right: 10, fontSize: "0.8rem", padding: "3px 10px", borderRadius: "0.5rem", fontWeight: 500, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", color: "#d1d5db" }}>
            {post.type}
          </span>
        </div>
        {/* Meta */}
        <div style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: "1.05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <img src={post.author?.profileImage || fallback} alt={post.author?.fullName} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
            <p style={{ fontSize: "0.9rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{post.author?.fullName}</p>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>♡ {post.hearts?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   CIRCLE CARD  — links to /Circle/[id]
============================================================ */

function CircleCard({ circle }: { circle: Circle }) {
  return (
    <Link href={`/Circle/${circle._id}`}>
      <div
        style={{ overflow: "hidden", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "background-color 0.2s, border-color 0.2s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.18)"; el.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.03)"; }}
      >
        {/* Cover */}
        <div style={{ position: "relative", height: 128, width: "100%", overflow: "hidden", background: "#1a1a1a" }}>
          {circle.image ? (
            <img src={circle.image} alt={circle.name} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#211a35" }}>
              <MdGroups style={{ color: "#a78bfa", width: 40, height: 40 }} />
            </div>
          )}
          {/* Icon overlay */}
          {circle.icon && (
            <div style={{ position: "absolute", bottom: -18, left: 16, width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "3px solid #111", background: "#222" }}>
              <img src={circle.icon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem", paddingTop: circle.icon ? "1.75rem" : "1rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontWeight: 600, color: "#fff", fontSize: "1.05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{circle.name}</h3>
              {circle.category && <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 3 }}>{circle.category}</p>}
            </div>
            <span
              style={{ flexShrink: 0, fontSize: "0.8rem", padding: "4px 12px", borderRadius: "0.5rem", fontWeight: 500, border: "1px solid rgba(255,255,255,0.15)", color: circle.isMember ? "#a78bfa" : "#d1d5db", background: circle.isMember ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}
              onClick={(e) => e.preventDefault()}
            >
              {circle.isMember ? "Member" : "Explore"}
            </span>
          </div>
          {circle.description && (
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {circle.description}
            </p>
          )}
          <p style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: 10 }}>{circle.memberCount} member{circle.memberCount !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   COLLECTION CARD  — links to /Collection/[id]
============================================================ */

function CollectionCard({ collection }: { collection: Collection }) {
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";

  return (
    <Link href={`/Collection/${collection._id}`}>
      <div
        style={{ overflow: "hidden", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "background-color 0.2s, border-color 0.2s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.18)"; el.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.08)"; el.style.background = "rgba(255,255,255,0.03)"; }}
      >
        {/* Cover */}
        <div style={{ position: "relative", height: 144, width: "100%", overflow: "hidden", background: "#1a1a1a" }}>
          {collection.coverImage ? (
            <img src={collection.coverImage} alt={collection.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e1a2e" }}>
              <FiBookOpen style={{ color: "#a78bfa", width: 32, height: 32 }} />
            </div>
          )}
          {collection.artistCategory && (
            <span style={{ position: "absolute", top: 10, left: 10, fontSize: "0.8rem", padding: "3px 10px", borderRadius: "0.5rem", fontWeight: 500, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", color: "#d1d5db" }}>
              {collection.artistCategory}
            </span>
          )}
        </div>
        {/* Content */}
        <div style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, color: "#fff", fontSize: "1.05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{collection.title}</h3>
          {collection.description && (
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{collection.description}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <img src={collection.author?.profileImage || fallback} alt={collection.author?.fullName} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
            <p style={{ fontSize: "0.9rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{collection.author?.fullName}</p>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>{collection.postCount} posts</span>
          </div>
          {collection.top3Emotions && collection.top3Emotions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {collection.top3Emotions.slice(0, 2).map((e) => (
                <span key={e.emotion} style={{ fontSize: "0.8rem", padding: "3px 10px", borderRadius: "0.5rem", background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {e.emotion}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   LOADING SKELETON
============================================================ */

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {[1, 2].map((s) => (
        <div key={s}>
          <div style={{ height: 22, width: 120, borderRadius: "0.5rem", background: "rgba(255,255,255,0.05)", marginBottom: 16 }} className="animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse" style={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                <div style={{ height: 150, background: "rgba(255,255,255,0.04)" }} />
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 18, width: "66%", borderRadius: "0.5rem", background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ height: 14, width: "100%", borderRadius: "0.5rem", background: "rgba(255,255,255,0.04)" }} />
                  <div style={{ height: 14, width: "50%", borderRadius: "0.5rem", background: "rgba(255,255,255,0.03)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   EMPTY / NO RESULTS
============================================================ */

function EmptyPrompt() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 0", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <IoMdSearch style={{ color: "#a78bfa", width: 32, height: 32 }} />
      </div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#fff", marginBottom: 10 }}>Discover Bird Park</h2>
      <p style={{ fontSize: "1rem", color: "#9ca3af", maxWidth: 300 }}>
        Search for artists, artwork, poems, circles, or collections.
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 0", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <FiFilter style={{ color: "#9ca3af", width: 28, height: 28 }} />
      </div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#fff", marginBottom: 10 }}>No results found</h2>
      <p style={{ fontSize: "1rem", color: "#9ca3af", maxWidth: 300 }}>
        Nothing matched <span style={{ color: "#fff" }}>&ldquo;{query}&rdquo;</span>. Try a different term.
      </p>
    </div>
  );
}