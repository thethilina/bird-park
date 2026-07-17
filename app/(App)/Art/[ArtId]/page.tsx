"use client";

import Image from "next/image";
import { GoComment } from "react-icons/go";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";


/* ─────────────── helpers ─────────────── */

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60)
    return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)
    return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12)
    return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}


/* ═══════════════ REPLY ITEM (flat — no nesting) ═══════════════ */

function ReplyItem({
  reply,
  postId,
  parentCommentAuthorName,
  currentUserId,
  onDeleted,
  onReplyToReply,
}: {
  reply: any;
  postId: string;
  parentCommentAuthorName: string;
  currentUserId: string | null;
  onDeleted: (id: string) => void;
  onReplyToReply: (authorName: string, commentId: string) => void;
}) {

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.body);
  const [displayBody, setDisplayBody] = useState(reply.body);
  const [savingEdit, setSavingEdit] = useState(false);

  // Menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === reply.author?._id;

  // Figure out who this reply is mentioning
  // If parentComment is different from the top-level comment, it's replying to another reply
  // We pass the name from the parent who posted the comment being replied to
  const mentionName = reply._replyingToName || null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  async function handleDelete() {
    setShowMenu(false);
    try {
      const res = await fetch(`/api/comments/${reply._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Reply deleted");
        onDeleted(reply._id);
      } else {
        toast.error("Failed to delete reply");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleSaveEdit() {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/comments/${reply._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editText.trim() }),
      });
      if (res.ok) {
        toast.success("Reply updated");
        setDisplayBody(editText.trim());
        setIsEditing(false);
      } else {
        toast.error("Failed to update reply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  }


  return (
    <div className="flex gap-x-3 ml-10 lg:ml-14 mt-4">

      {/* Avatar */}
      <Link href={`/Profile/${reply.author?._id}`} className="shrink-0">
        <Image
          src={reply.author?.profileImage || "/default-profile.png"}
          alt={reply.author?.fullName || "user"}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Name + time + menu */}
        <div className="flex items-center gap-x-2">
          <Link
            href={`/Profile/${reply.author?._id}`}
            className="font-semibold text-sm lg:text-base hover:underline"
          >
            {reply.author?.fullName || "Unknown"}
          </Link>
          <span className="text-xs lg:text-sm text-gray-500">
            {timeAgo(reply.createdAt)}
          </span>

          {isOwner && (
            <div className="relative ml-auto" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="4" cy="10" r="2" />
                  <circle cx="10" cy="10" r="2" />
                  <circle cx="16" cy="10" r="2" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-7 z-50 bg-white dark:bg-[#1a1a2e] border border-(--border) rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  <button
                    onClick={() => { setIsEditing(true); setEditText(displayBody); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply body with @mention */}
        {isEditing ? (
          <div className="mt-1">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-transparent border-b-2 border-(--border) outline-none py-1 text-sm lg:text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <div className="flex gap-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editText.trim()}
                className="px-3 py-1 text-sm bg-[#3B5D95] text-white rounded-full hover:bg-[#2d4a78] transition-colors disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 break-words whitespace-pre-wrap text-sm lg:text-base">
            {mentionName && (
              <span className="font-bold text-[#3B5D95]">
                @{mentionName}{" "}
              </span>
            )}
            {displayBody}
          </p>
        )}

        {/* Reply button */}
        {!isEditing && (
          <button
            onClick={() => onReplyToReply(reply.author?.fullName || "Unknown", reply._id)}
            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-medium transition-colors mt-1"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}



/* ═══════════════ TOP-LEVEL COMMENT ═══════════════ */

function CommentItem({
  comment,
  postId,
  currentUserId,
  onDeleted,
  onCommentCountChange,
}: {
  comment: any;
  postId: string;
  currentUserId: string | null;
  onDeleted: (id: string) => void;
  onCommentCountChange: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  // Reply input
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [replyParentId, setReplyParentId] = useState<string>(comment._id);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [displayBody, setDisplayBody] = useState(comment.body);
  const [savingEdit, setSavingEdit] = useState(false);

  // Menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === comment.author?._id;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch reply count on mount
  useEffect(() => {
    fetchReplyCount();
  }, []);

  async function fetchReplyCount() {
    try {
      const res = await fetch(`/api/comments/${comment._id}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplyCount(data.replies?.length || 0);
      }
    } catch {}
  }

  async function fetchReplies() {
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/comments/${comment._id}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies || []);
        setReplyCount(data.replies?.length || 0);
      }
    } catch {
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies(false);
    }
  }

  function toggleReplies() {
    if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  }

  // Open reply input for top-level reply (replying to the comment itself)
  function openReplyToComment() {
    setReplyingToName(null);
    setReplyParentId(comment._id);
    setReplyText("");
    setShowReplyInput(true);
    setTimeout(() => replyInputRef.current?.focus(), 50);
  }

  // Open reply input for replying to a specific reply (flat — still goes under same parent)
  function openReplyToReply(authorName: string, _replyId: string) {
    setReplyingToName(authorName);
    setReplyParentId(comment._id); // All replies stay under top-level comment
    setReplyText("");
    setShowReplyInput(true);
    setTimeout(() => replyInputRef.current?.focus(), 50);
  }

  async function handleReply() {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      // If replying to a reply, prepend the @mention into the body
      const bodyToSend = replyingToName
        ? replyText.trim()
        : replyText.trim();

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          body: bodyToSend,
          parentComment: replyParentId,
        }),
      });

      if (res.ok) {
        toast.success("Reply posted!");
        setReplyText("");
        setShowReplyInput(false);
        setReplyingToName(null);
        onCommentCountChange();
        fetchReplies();
        setShowReplies(true);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to post reply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleDelete() {
    setShowMenu(false);
    try {
      const res = await fetch(`/api/comments/${comment._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Comment deleted");
        onDeleted(comment._id);
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleSaveEdit() {
    if (!editText.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/comments/${comment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editText.trim() }),
      });
      if (res.ok) {
        toast.success("Comment updated");
        setDisplayBody(editText.trim());
        setIsEditing(false);
      } else {
        toast.error("Failed to update comment");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  }


  return (
    <div>

      {/* ── Top-level comment ── */}

      <div className="flex gap-x-3">

        {/* Avatar */}
        <Link href={`/Profile/${comment.author?._id}`} className="shrink-0">
          <Image
            src={comment.author?.profileImage || "/default-profile.png"}
            alt={comment.author?.fullName || "user"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Name + time + menu */}
          <div className="flex items-center gap-x-2">
            <Link
              href={`/Profile/${comment.author?._id}`}
              className="font-semibold text-base lg:text-lg hover:underline"
            >
              {comment.author?.fullName || "Unknown"}
            </Link>
            <span className="text-sm text-gray-500">
              {timeAgo(comment.createdAt)}
            </span>

            {isOwner && (
              <div className="relative ml-auto" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="4" cy="10" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="16" cy="10" r="2" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 z-50 bg-white dark:bg-[#1a1a2e] border border-(--border) rounded-lg shadow-lg overflow-hidden min-w-[130px]">
                    <button
                      onClick={() => { setIsEditing(true); setEditText(displayBody); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm lg:text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2.5 text-sm lg:text-base text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment text or edit */}
          {isEditing ? (
            <div className="mt-1">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent border-b-2 border-(--border) outline-none py-1 text-base lg:text-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <div className="flex gap-x-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editText.trim()}
                  className="px-4 py-1.5 text-sm bg-[#3B5D95] text-white rounded-full hover:bg-[#2d4a78] transition-colors disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 break-words whitespace-pre-wrap text-base lg:text-lg leading-relaxed">
              {displayBody}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <button
              onClick={openReplyToComment}
              className="text-sm lg:text-base text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-semibold transition-colors mt-1.5"
            >
              Reply
            </button>
          )}
        </div>
      </div>


      {/* ── Reply input (shared for comment-level and reply-to-reply) ── */}

      {showReplyInput && (
        <div className="ml-10 lg:ml-14 mt-3">

          {/* Show who you're replying to */}
          {replyingToName && (
            <div className="text-sm text-gray-500 mb-1">
              Replying to <span className="font-bold text-[#3B5D95]">@{replyingToName}</span>
            </div>
          )}

          <div className="flex items-center gap-x-2">
            <input
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={replyingToName ? `Reply to @${replyingToName}...` : "Add a reply..."}
              className="
                flex-1
                bg-transparent
                border-b-2 border-(--border)
                outline-none
                py-1.5
                text-sm lg:text-base
              "
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReply();
                if (e.key === "Escape") {
                  setShowReplyInput(false);
                  setReplyingToName(null);
                }
              }}
            />
            <button
              onClick={() => { setShowReplyInput(false); setReplyText(""); setReplyingToName(null); }}
              className="px-3 py-1.5 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={submittingReply || !replyText.trim()}
              className="px-4 py-1.5 text-sm bg-[#3B5D95] text-white rounded-full hover:bg-[#2d4a78] transition-colors disabled:opacity-50"
            >
              {submittingReply ? "..." : "Reply"}
            </button>
          </div>
        </div>
      )}


      {/* ── View replies toggle ── */}

      {replyCount > 0 && (
        <button
          onClick={toggleReplies}
          className="
            flex items-center gap-x-1
            text-sm lg:text-base font-semibold
            text-[#3B5D95]
            hover:text-[#2d4a78]
            ml-13 lg:ml-14
            mt-2
            transition-colors
          "
        >
          {showReplies ? (
            <>
              <BiChevronUp className="size-5" />
              Hide replies
            </>
          ) : (
            <>
              <BiChevronDown className="size-5" />
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </>
          )}
        </button>
      )}


      {/* ── Flat replies list (all at one level, no nesting) ── */}

      {showReplies && (
        <div>
          {loadingReplies ? (
            <div className="flex items-center gap-x-2 py-3 ml-14">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3B5D95] animate-pulse" />
              <span className="text-sm text-gray-500">Loading replies...</span>
            </div>
          ) : (
            replies.map((reply, index) => {
              // Determine who this reply is @mentioning
              // First reply mentions the top-level comment author
              // For simplicity, all replies under a top-level comment mention the top-level comment author
              // unless we can figure out a reply chain
              // We'll show @parentCommentAuthor for all replies since they're flat
              const mentionName = comment.author?.fullName || "Unknown";

              return (
                <ReplyItem
                  key={reply._id}
                  reply={{ ...reply, _replyingToName: mentionName }}
                  postId={postId}
                  parentCommentAuthorName={comment.author?.fullName || "Unknown"}
                  currentUserId={currentUserId}
                  onDeleted={(deletedId) => {
                    setReplies((prev) => prev.filter((r) => r._id !== deletedId));
                    setReplyCount((c) => Math.max(0, c - 1));
                    onCommentCountChange();
                  }}
                  onReplyToReply={(authorName, replyId) => {
                    openReplyToReply(authorName, replyId);
                  }}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


/* ═══════════════ MAIN PAGE ═══════════════ */

export default function Page() {

  const { ArtId } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [heartCount, setHeartCount] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [totalCommentCount, setTotalCommentCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);


  /* fetch post */

  const fetchpost = async () => {
    try {
      const response = await fetch(`/api/post/${ArtId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      const data = await response.json();
      setPost(data.post);

      // Set heart state
      setHeartCount(data.post.hearts?.length || 0);
      if (user?._id) {
        setHearted(
          data.post.hearts?.some(
            (h: any) =>
              (h._id || h).toString() === user._id
          ) || false
        );
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };


  /* fetch comments */

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `/api/comments/post/${ArtId}`
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCommentCount(data.comments?.length || 0);
      }
    } catch {
      console.error("Failed to load comments");
    }
  };


  useEffect(() => {
    if (ArtId) {
      fetchpost();
      fetchComments();
    }
  }, [ArtId]);

  // Update heart state when user loads
  useEffect(() => {
    if (user?._id && post?.hearts) {
      setHearted(
        post.hearts.some(
          (h: any) =>
            (h._id || h).toString() === user._id
        )
      );
    }
  }, [user, post]);


  /* toggle heart */

  async function toggleHeart() {
    if (!user) {
      toast.info("Please log in to heart this post");
      return;
    }

    // Optimistic update
    const wasHearted = hearted;
    setHearted(!hearted);
    setHeartCount((c) => (wasHearted ? c - 1 : c + 1));
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);

    try {
      const res = await fetch(
        `/api/post/${ArtId}/heart`,
        { method: "POST" }
      );

      if (res.ok) {
        const data = await res.json();
        setHearted(data.hearted);
        setHeartCount(data.heartCount);

        if (data.hearted) {
          toast.success("💖 Hearted!", {
            autoClose: 1500,
            hideProgressBar: true,
          });
        }
      } else {
        setHearted(wasHearted);
        setHeartCount((c) =>
          wasHearted ? c + 1 : c - 1
        );
        toast.error("Failed to heart post");
      }
    } catch {
      setHearted(wasHearted);
      setHeartCount((c) =>
        wasHearted ? c + 1 : c - 1
      );
      toast.error("Something went wrong");
    }
  }


  /* post comment */

  async function handleComment() {
    if (!commentText.trim()) return;

    if (!user) {
      toast.info("Please log in to comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: ArtId,
          body: commentText.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Comment posted!");
        setCommentText("");
        fetchComments();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to post comment");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }


  return (

    <div className="
      lg:flex
      lg:h-[calc(100vh-80px)]
      px-3
      overflow-hidden
      gap-x-10
      justify-center
    ">



      {/* LEFT SIDE */}

      <div
        className="
        flex-1
        lg:border-r-2
        lg:pr-10
        py-3
        lg:py-10
        border-(--border)
        gap-y-2
        flex
        flex-col
        lg:gap-y-5
        "
      >


        {/* USER */}

        <div className="flex items-center lg:text-xl gap-x-3">


          <Link
            href={`/Profile/${post?.author?._id}`}
            className="flex items-center gap-x-3"
          >


            <Image

              src={
                post?.author?.profileImage ||
                "/default-profile.png"
              }

              alt={
                post?.author?.fullName ||
                "artist"
              }

              className="
              w-10
              h-10
              lg:w-12
              lg:h-12
              rounded-full
              object-cover
              "

              width={48}

              height={48}

            />


            <span>
              {post?.author?.fullName}
            </span>


          </Link>


        </div>




        {/* TITLE */}

        <div>

          <h1 className="lg:text-2xl font-semibold">

            {post?.title}

          </h1>

        </div>





        {/* ART CONTENT */}

        {
          post?.type === "art" &&
          post?.media?.url && (

            <div>


              {/* Mobile */}

              <div
                className="
                w-full
                border-(--border)
                block
                lg:hidden
                border-2
                rounded-sm
                "
              >

                <img

                  src={post.media.url}

                  alt={post.title}

                  className="
                  w-full
                  h-full
                  object-contain
                  object-center
                  "

                />


              </div>




              {/* Desktop */}

              <div

                className="
                w-full
                border-(--border)
                hidden
                lg:block
                border-2
                rounded-sm
                "

                style={{
                  height:"calc(100vh - 300px)"
                }}

              >


                <img

                  src={post.media.url}

                  alt={post.title}

                  className="
                  w-full
                  h-full
                  object-contain
                  object-center
                  "

                />


              </div>



            </div>

          )

        }




        {/* POEM CONTENT */}

        {
          post?.type === "poem" && (

            <div

              className="
              w-full
              min-h-[500px]
              lg:h-[calc(100vh-300px)]
              border-2
              border-(--border)
              rounded-sm
              p-8
              overflow-y-auto
              "

              style={{

                backgroundColor:
                  post.poemStyle?.backgroundColor ||
                  "#ffffff",

                color:
                  post.poemStyle?.fontColor ||
                  "#000000",

                fontFamily:
                  post.poemStyle?.fontFamily ||
                  "Georgia, serif",

                fontSize:
                  post.poemStyle?.fontSize ||
                  "20px"

              }}

            >


              <p

                className="
                whitespace-pre-line
                leading-relaxed
                "

              >

                {post.body}

              </p>



            </div>

          )

        }




      </div>








      {/* RIGHT SIDE */}


      <div

        className="
        lg:my-10
        lg:w-2/5
        xl:w-1/3
        lg:px-5
        rounded-sm
        overflow-y-auto
        bg-(--color-background)
        dark:bg-(--background)

        [\&::-webkit-scrollbar]:hidden
        [-ms-overflow-style:none]
        [scrollbar-width:none]
        "

        style={{
          height:"calc(100vh - 100px)"
        }}

      >


        {
          post && (

            <div className="flex flex-col">



              {/* HEADER */}


              <div

                className="
                lg:sticky
                top-0
                bg-(--color-background)
                dark:bg-(--background)
                w-auto
                z-49
                "

              >



                <div

                  className="
                  flex
                  lg:gap-x-5
                  gap-x-3
                  items-center
                  border-(--border)
                  lg:pb-4
                  pb-2
                  border-b-2
                  "

                >


                  {/* HEART BUTTON */}

                  <button
                    onClick={toggleHeart}
                    className="
                      group
                      flex items-center gap-x-1
                      transition-transform
                      active:scale-90
                      cursor-pointer
                    "
                    style={{
                      transform: heartAnimating
                        ? "scale(1.25)"
                        : "scale(1)",
                      transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                    title={hearted ? "Remove heart" : "Heart this"}
                  >
                    {hearted ? (
                      <FaHeart
                        className="
                          size-6 lg:size-8
                          text-red-500
                          drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]
                        "
                      />
                    ) : (
                      <CiHeart
                        className="
                          size-6 lg:size-8
                          group-hover:text-red-400
                          transition-colors
                        "
                      />
                    )}
                  </button>


                  <span className="text-xl lg:text-3xl">
                    {heartCount}
                  </span>



                  <button
                    onClick={() => inputRef.current?.focus()}
                    className="
                      flex items-center gap-x-1
                      cursor-pointer
                      hover:opacity-70
                      transition-opacity
                    "
                  >
                    <GoComment className="size-5 lg:size-7"/>
                  </button>


                  <span className="text-xl lg:text-3xl">
                    {totalCommentCount}
                  </span>



                </div>




                {/* COMMENT INPUT */}


                <div className="
                  flex
                  items-center
                  gap-x-3
                  mt-5
                  mb-5
                ">


                  <input

                    ref={inputRef}

                    value={commentText}

                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }

                    placeholder="Add a comment..."

                    type="text"

                    className="
                    flex-1
                    font-sans
                    bg-(--colorbg)
                    dark:bg-(--colorbgdark)
                    border
                    border-(--border)
                    rounded-xl
                    py-2.5
                    px-4
                    outline-none
                    text-base
                    "

                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleComment();
                    }}

                  />



                  <button

                    onClick={handleComment}

                    disabled={submitting || !commentText.trim()}

                    className="
                    px-6
                    py-2.5
                    bg-[#3B5D95]
                    text-white
                    font-medium
                    rounded-[4px_20px_20px_20px]
                    hover:bg-[#2d4a78]
                    transition-colors
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-base
                    "

                  >

                    {submitting ? "..." : "Post"}

                  </button>


                </div>


              </div>




              {/* COMMENTS LIST */}

              <div className="
                space-y-6
                py-5
                lg:space-y-8
              ">


                {comments.length === 0 ? (
                  <div className="
                    text-center
                    py-10
                    text-gray-400
                  ">
                    <GoComment className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      postId={ArtId as string}
                      currentUserId={user?._id || null}
                      onDeleted={(deletedId) => {
                        setComments((prev) =>
                          prev.filter(
                            (c) => c._id !== deletedId
                          )
                        );
                        setTotalCommentCount((c) => Math.max(0, c - 1));
                      }}
                      onCommentCountChange={() => fetchComments()}
                    />
                  ))
                )}


              </div>



            </div>

          )

        }



      </div>



    </div>

  );

}