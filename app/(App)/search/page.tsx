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
   RESPONSIVE HOOK
   Returns true when viewport < 640 px (phone).
   Defaults to false on SSR so the desktop shell is hydrated
   first — avoids a layout shift on desktop.
============================================================ */

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

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
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const isMobile = useMobile();

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
    { id: "all",         label: "All",         icon: <HiSparkles size={isMobile ? 14 : 16} />, count: totalResults   },
    { id: "users",       label: "People",      icon: <FiUsers    size={isMobile ? 14 : 16} />, count: users.length   },
    { id: "posts",       label: "Posts",       icon: <FiGrid     size={isMobile ? 14 : 16} />, count: posts.length   },
    { id: "circles",     label: "Circles",     icon: <MdGroups   size={isMobile ? 15 : 17} />, count: circles.length },
    { id: "collections", label: "Collections", icon: <FiBookOpen size={isMobile ? 14 : 16} />, count: collections.length },
  ];

  return (
    <div className="min-h-screen pb-24  mx-auto"
      style={{ padding: isMobile ? "1rem 1rem 6rem" : "1.5rem 1.5rem 6rem" }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: isMobile ? "1.25rem" : "2rem" }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            fontSize: isMobile ? "1.5rem" : "2.5rem",
          }}
        >
          {query ? (
            <>
              Results for{" "}
              <span style={{ color: "#a78bfa" }}>&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Explore Bird Park"
          )}
        </h1>
        {query && !loading && (
          <p style={{ marginTop: "0.375rem", color: "#9ca3af", fontSize: isMobile ? "0.875rem" : "1.125rem" }}>
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* ── FILTER TABS ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.375rem" : "0.75rem",
          marginBottom: isMobile ? "1.25rem" : "2rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          /* Hide scrollbar but keep scroll */
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "0.3rem" : "0.5rem",
                padding: isMobile ? "0.45rem 0.75rem" : "0.75rem 1.25rem",
                borderRadius: "0.75rem",
                fontSize: isMobile ? "0.825rem" : "1rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background-color 0.2s, color 0.2s",
                background: isActive ? "#7c3aed" : "rgba(255,255,255,0.05)",
                border: isActive
                  ? "1px solid #7c3aed"
                  : "1px solid rgba(255,255,255,0.1)",
                color: isActive ? "#fff" : "#9ca3af",
              }}
            >
              {tab.icon}
              {/* On very small screens, hide label for non-active tabs if too many */}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    padding: isMobile ? "1px 5px" : "2px 8px",
                    borderRadius: "0.5rem",
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                    background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                    color: isActive ? "#fff" : "#6b7280",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton isMobile={isMobile} />
      ) : !query ? (
        <EmptyPrompt isMobile={isMobile} />
      ) : totalResults === 0 ? (
        <NoResults query={query} isMobile={isMobile} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.75rem" : "2.5rem" }}>

          {/* PEOPLE */}
          {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader
                  icon={<FiUsers size={isMobile ? 15 : 17} />}
                  title="People"
                  count={users.length}
                  isMobile={isMobile}
                  onSeeAll={() => setActiveTab("users")}
                />
              )}
              <div
                className="grid gap-3 mt-3"
                style={{
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fill, minmax(280px, 1fr))",
                }}
              >
                {(activeTab === "all" ? users.slice(0, 3) : users).map((u) => (
                  <UserCard key={u._id} user={u} isMobile={isMobile} />
                ))}
              </div>
            </section>
          )}

          {/* POSTS */}
          {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader
                  icon={<FiGrid size={isMobile ? 15 : 17} />}
                  title="Posts"
                  count={posts.length}
                  isMobile={isMobile}
                  onSeeAll={() => setActiveTab("posts")}
                />
              )}
              <div
                className="grid gap-3 mt-3"
                style={{
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(260px, 1fr))",
                }}
              >
                {(activeTab === "all" ? posts.slice(0, isMobile ? 4 : 3) : posts).map((p) => (
                  <PostCard key={p._id} post={p} isMobile={isMobile} />
                ))}
              </div>
            </section>
          )}

          {/* CIRCLES */}
          {(activeTab === "all" || activeTab === "circles") && circles.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader
                  icon={<MdGroups size={isMobile ? 16 : 18} />}
                  title="Circles"
                  count={circles.length}
                  isMobile={isMobile}
                  onSeeAll={() => setActiveTab("circles")}
                />
              )}
              <div
                className="grid gap-3 mt-3"
                style={{
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(260px, 1fr))",
                }}
              >
                {(activeTab === "all" ? circles.slice(0, isMobile ? 4 : 3) : circles).map((c) => (
                  <CircleCard key={c._id} circle={c} isMobile={isMobile} />
                ))}
              </div>
            </section>
          )}

          {/* COLLECTIONS */}
          {(activeTab === "all" || activeTab === "collections") && collections.length > 0 && (
            <section>
              {activeTab === "all" && (
                <SectionHeader
                  icon={<FiBookOpen size={isMobile ? 15 : 17} />}
                  title="Collections"
                  count={collections.length}
                  isMobile={isMobile}
                  onSeeAll={() => setActiveTab("collections")}
                />
              )}
              <div
                className="grid gap-3 mt-3"
                style={{
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(260px, 1fr))",
                }}
              >
                {(activeTab === "all" ? collections.slice(0, isMobile ? 4 : 3) : collections).map((col) => (
                  <CollectionCard key={col._id} collection={col} isMobile={isMobile} />
                ))}
              </div>
            </section>
          )}

          {/* Empty filtered tab */}
          {activeTab !== "all" && (
            (activeTab === "users"       && users.length       === 0) ||
            (activeTab === "posts"       && posts.length       === 0) ||
            (activeTab === "circles"     && circles.length     === 0) ||
            (activeTab === "collections" && collections.length === 0)
          ) && (
            <div
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                padding: isMobile ? "2.5rem 1rem" : "3.5rem 1.5rem",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#6b7280" }}>
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
    <Suspense fallback={<div style={{ padding: "2.5rem 1rem", color: "#fff" }}>Loading…</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon, title, count, isMobile, onSeeAll,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  isMobile: boolean;
  onSeeAll: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "#fff",
          fontWeight: 600,
          fontSize: isMobile ? "1rem" : "1.25rem",
        }}
      >
        <span style={{ color: "#a78bfa" }}>{icon}</span>
        {title}
        <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b7280", fontWeight: 400 }}>
          ({count})
        </span>
      </div>
      {count > 3 && (
        <button
          onClick={onSeeAll}
          style={{
            fontSize: isMobile ? "0.8rem" : "0.95rem",
            fontWeight: 500,
            color: "#a78bfa",
            background: "rgba(167,139,250,0.1)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: "0.5rem",
            padding: isMobile ? "0.35rem 0.7rem" : "0.5rem 0.9rem",
            cursor: "pointer",
          }}
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

function UserCard({ user, isMobile }: { user: User; isMobile: boolean }) {
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";
  const avatarSize = isMobile ? 44 : 56;

  return (
    <Link href={`/Profile/${user._id}`}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.625rem" : "0.875rem",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          padding: isMobile ? "0.875rem" : "1.125rem",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "rgba(255,255,255,0.06)";
          el.style.borderColor = "rgba(255,255,255,0.15)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "rgba(255,255,255,0.03)";
          el.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={user.profileImage || fallback}
            alt={user.fullName}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          {user.isCurrentUser && (
            <span
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#7c3aed",
                border: "2px solid #0a0a0a",
              }}
            />
          )}
        </div>

        {/* Name + username + tag */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontWeight: 600,
              color: "#fff",
              fontSize: isMobile ? "0.9rem" : "1.05rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.fullName}
          </p>
          <p
            style={{
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              color: "#6b7280",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{user.username}
          </p>
          {user.currentCategory && (
            <span
              style={{
                display: "inline-block",
                marginTop: 5,
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "0.5rem",
                background: "rgba(124,58,237,0.15)",
                color: "#a78bfa",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              {user.currentCategory}
            </span>
          )}
        </div>

        {/* Connection count — hidden on very small phones */}
        {!isMobile && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{user.connectionCount}</p>
            <p style={{ fontSize: "0.8rem", color: "#4b5563" }}>connections</p>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ============================================================
   POST CARD
============================================================ */

function PostCard({ post, isMobile }: { post: Post; isMobile: boolean }) {
  const isArt = post.type === "art";
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";
  const thumbHeight = isMobile ? 120 : 170;

  return (
    <Link href={`/Art/${post._id}`}>
      <div
        style={{
          overflow: "hidden",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.18)";
          el.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.08)";
          el.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: "relative", height: thumbHeight, width: "100%", overflow: "hidden" }}>
          {isArt && post.media?.url ? (
            <img
              src={post.media.url}
              alt={post.title}
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.75rem",
                textAlign: "center",
                backgroundColor: post.poemStyle?.backgroundColor || "#151515",
                color: post.poemStyle?.fontColor || "#e0e0e0",
                fontFamily: post.poemStyle?.fontFamily || "serif",
              }}
            >
              <p
                style={{
                  fontSize: isMobile ? "0.8rem" : "1rem",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: isMobile ? 3 : 4,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {post.body}
              </p>
            </div>
          )}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: "0.7rem",
              padding: "2px 7px",
              borderRadius: "0.4rem",
              fontWeight: 500,
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#d1d5db",
            }}
          >
            {post.type}
          </span>
        </div>

        {/* Meta */}
        <div style={{ padding: isMobile ? "0.625rem" : "1rem" }}>
          <h3
            style={{
              fontWeight: 600,
              color: "#fff",
              fontSize: isMobile ? "0.85rem" : "1.05rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <img
              src={post.author?.profileImage || fallback}
              alt={post.author?.fullName}
              style={{
                width: isMobile ? 18 : 22,
                height: isMobile ? 18 : 22,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {isMobile ? post.author?.username : post.author?.fullName}
            </p>
            <span style={{ fontSize: "0.8rem", color: "#6b7280", flexShrink: 0 }}>
              ♡ {post.hearts?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   CIRCLE CARD
============================================================ */

function CircleCard({ circle, isMobile }: { circle: Circle; isMobile: boolean }) {
  const coverHeight = isMobile ? 90 : 128;
  const iconSize = isMobile ? 40 : 52;

  return (
    <Link href={`/Circle/${circle._id}`}>
      <div
        style={{
          overflow: "hidden",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.18)";
          el.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.08)";
          el.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        {/* Cover */}
        <div
          style={{
            position: "relative",
            height: coverHeight,
            width: "100%",
            overflow: "hidden",
            background: "#1a1a1a",
          }}
        >
          {circle.image ? (
            <img
              src={circle.image}
              alt={circle.name}
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#211a35",
              }}
            >
              <MdGroups style={{ color: "#a78bfa", width: isMobile ? 28 : 40, height: isMobile ? 28 : 40 }} />
            </div>
          )}
          {circle.icon && (
            <div
              style={{
                position: "absolute",
                bottom: -Math.round(iconSize * 0.35),
                left: isMobile ? 10 : 16,
                width: iconSize,
                height: iconSize,
                borderRadius: isMobile ? 8 : 10,
                overflow: "hidden",
                border: "2px solid #111",
                background: "#222",
              }}
            >
              <img src={circle.icon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: isMobile ? "0.625rem" : "1rem",
            paddingTop: circle.icon
              ? `${Math.round(iconSize * 0.35) + (isMobile ? 6 : 10)}px`
              : isMobile ? "0.625rem" : "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontWeight: 600,
                  color: "#fff",
                  fontSize: isMobile ? "0.85rem" : "1.05rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {circle.name}
              </h3>
              {circle.category && !isMobile && (
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 2 }}>{circle.category}</p>
              )}
            </div>
            <span
              style={{
                flexShrink: 0,
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                padding: isMobile ? "3px 7px" : "4px 12px",
                borderRadius: "0.5rem",
                fontWeight: 500,
                border: "1px solid rgba(255,255,255,0.15)",
                color: circle.isMember ? "#a78bfa" : "#d1d5db",
                background: circle.isMember ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
                whiteSpace: "nowrap",
              }}
              onClick={(e) => e.preventDefault()}
            >
              {circle.isMember ? "Member" : "Explore"}
            </span>
          </div>

          {circle.description && !isMobile && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginTop: 6,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {circle.description}
            </p>
          )}

          <p style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#4b5563", marginTop: isMobile ? 6 : 10 }}>
            {circle.memberCount} member{circle.memberCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   COLLECTION CARD
============================================================ */

function CollectionCard({ collection, isMobile }: { collection: Collection; isMobile: boolean }) {
  const fallback = (userData.avatar as any).src || "/default-avatar.jpg";
  const coverHeight = isMobile ? 100 : 144;

  return (
    <Link href={`/Collection/${collection._id}`}>
      <div
        style={{
          overflow: "hidden",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.18)";
          el.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "rgba(255,255,255,0.08)";
          el.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        {/* Cover */}
        <div style={{ position: "relative", height: coverHeight, width: "100%", overflow: "hidden", background: "#1a1a1a" }}>
          {collection.coverImage ? (
            <img
              src={collection.coverImage}
              alt={collection.title}
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1e1a2e",
              }}
            >
              <FiBookOpen style={{ color: "#a78bfa", width: isMobile ? 22 : 32, height: isMobile ? 22 : 32 }} />
            </div>
          )}
          {collection.artistCategory && (
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontSize: "0.7rem",
                padding: "2px 7px",
                borderRadius: "0.4rem",
                fontWeight: 500,
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#d1d5db",
              }}
            >
              {collection.artistCategory}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? "0.625rem" : "1rem" }}>
          <h3
            style={{
              fontWeight: 600,
              color: "#fff",
              fontSize: isMobile ? "0.85rem" : "1.05rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {collection.title}
          </h3>

          {collection.description && !isMobile && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#6b7280",
                marginTop: 4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {collection.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: isMobile ? 8 : 12 }}>
            <img
              src={collection.author?.profileImage || fallback}
              alt={collection.author?.fullName}
              style={{
                width: isMobile ? 18 : 22,
                height: isMobile ? 18 : 22,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {isMobile ? collection.author?.username : collection.author?.fullName}
            </p>
            <span style={{ fontSize: "0.8rem", color: "#6b7280", flexShrink: 0 }}>
              {collection.postCount} posts
            </span>
          </div>

          {collection.top3Emotions && collection.top3Emotions.length > 0 && !isMobile && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
              {collection.top3Emotions.slice(0, 2).map((e) => (
                <span
                  key={e.emotion}
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "0.4rem",
                    background: "rgba(99,102,241,0.1)",
                    color: "#818cf8",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
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

function LoadingSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {[1, 2].map((s) => (
        <div key={s}>
          <div
            className="animate-pulse"
            style={{
              height: 18,
              width: 100,
              borderRadius: "0.5rem",
              background: "rgba(255,255,255,0.05)",
              marginBottom: 12,
            }}
          />
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
            }}
          >
            {[1, 2, isMobile ? null : 3].filter(Boolean).map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  borderRadius: "1rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  overflow: "hidden",
                }}
              >
                <div style={{ height: isMobile ? 100 : 150, background: "rgba(255,255,255,0.04)" }} />
                <div style={{ padding: isMobile ? "0.625rem" : "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ height: 14, width: "66%", borderRadius: "0.5rem", background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ height: 11, width: "100%", borderRadius: "0.5rem", background: "rgba(255,255,255,0.04)" }} />
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

function EmptyPrompt({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "3rem 1rem" : "5rem 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: isMobile ? 56 : 72,
          height: isMobile ? 56 : 72,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? 14 : 20,
        }}
      >
        <IoMdSearch style={{ color: "#a78bfa", width: isMobile ? 24 : 32, height: isMobile ? 24 : 32 }} />
      </div>
      <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", fontWeight: 600, color: "#fff", marginBottom: 8 }}>
        Discover Bird Park
      </h2>
      <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#9ca3af", maxWidth: 280 }}>
        Search for artists, artwork, poems, circles, or collections.
      </p>
    </div>
  );
}

function NoResults({ query, isMobile }: { query: string; isMobile: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "3rem 1rem" : "5rem 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: isMobile ? 56 : 72,
          height: isMobile ? 56 : 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? 14 : 20,
        }}
      >
        <FiFilter style={{ color: "#9ca3af", width: isMobile ? 22 : 28, height: isMobile ? 22 : 28 }} />
      </div>
      <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", fontWeight: 600, color: "#fff", marginBottom: 8 }}>
        No results found
      </h2>
      <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", color: "#9ca3af", maxWidth: 280 }}>
        Nothing matched <span style={{ color: "#fff" }}>&ldquo;{query}&rdquo;</span>. Try a different term.
      </p>
    </div>
  );
}