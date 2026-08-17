"use client";

import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPalette, FaExchangeAlt, FaArrowLeft, FaUsers } from "react-icons/fa";
import { IoTimeOutline, IoCloudUpload, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useTopLoader } from "nextjs-toploader";
import Link from "next/link";
import { motion } from "framer-motion";
import { analyzeArtEmotion, analyzePoemEmotion } from "@/lib/analyzeEmotion";

type ActivityStatus = "upcoming" | "active" | "ended";
type ActivityType = "art_jam" | "prompt_battle";

interface Activity {
  _id: string;
  activityType: ActivityType;
  title: string;
  coverImage?: string;
  prompt?: string;
  promptA?: string;
  promptB?: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  maxParticipants?: number | null;
  creator: { _id: string; username: string; fullName: string; profileImage: string };
  topEmotions?: { emotion: string; score: number }[];
  submissions: {
    artist: { _id: string; username: string; fullName: string; profileImage: string };
    post: { _id: string; media?: { url: string; type: string }; title: string; type: string; body?: string };
    chosenPrompt?: "A" | "B" | null;
    submittedAt: string;
  }[];
  comments: any[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const map: Record<ActivityStatus, { label: string; cls: string }> = {
    upcoming: {
      label: "Upcoming",
      cls: "border border-(--border) dark:border-(--borderdark) text-gray-500 dark:text-neutral-400",
    },
    active: {
      label: "Live",
      cls: "border border-emerald-600/60 text-emerald-700 dark:text-emerald-400",
    },
    ended: {
      label: "Ended",
      cls: "border border-(--border) dark:border-(--borderdark) text-gray-400 dark:text-neutral-500",
    },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm ${cls}`}>
      {label}
    </span>
  );
}

// ─── Submission Form ─────────────────────────────────────────────────────────

function SubmissionForm({
  activityId,
  circleId,
  chosenPrompt,
  onSuccess,
}: {
  activityId: string;
  circleId: string;
  chosenPrompt?: "A" | "B" | null;
  onSuccess: () => void;
}) {
  const [postType, setPostType] = useState<"art" | "poem">("art");
  const [title, setTitle] = useState("");
  const [art, setArt] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [poem, setPoem] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loader = useTopLoader();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setArt(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Please enter a title");
    if (postType === "art" && !file) return toast.error("Please select artwork");
    if (postType === "poem" && !poem.trim()) return toast.error("Please write your poem");

    try {
      loader.start();
      setUploading(true);

      let payload: Record<string, unknown> = {
        title,
        type: postType,
        visibility: "circle",
        activityId,
      };

      if (postType === "art") {
        const formData = new FormData();
        formData.append("file", file!);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error("Image upload failed");
        payload.media = { url: uploadData.url };
      } else {
        payload.body = poem;
      }

      // Create post (it now saves activityId)
      const postRes = await fetch(`/api/circles/${circleId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const postData = await postRes.json();
      if (!postRes.ok) throw new Error(postData.message);

      // Await emotion analysis
      if (postType === "art") {
        await analyzeArtEmotion(postData.post._id, file!);
      } else {
        await analyzePoemEmotion(postData.post._id, poem);
      }

      // Link to activity
      const submitRes = await fetch(
        `/api/circles/${circleId}/activities/${activityId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: postData.post._id,
            chosenPrompt: chosenPrompt ?? null,
          }),
        }
      );
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.message);

      toast.success("Work submitted successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setUploading(false);
      loader.done();
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setPostType("art")}
          className={`px-5 py-1.5 rounded-full text-base font-bold transition-colors cursor-pointer ${
            postType === "art"
              ? "bg-[#e6f0f0] text-[#141414]"
              : "border border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark)"
          }`}
        >
          Art
        </button>
        <button
          onClick={() => setPostType("poem")}
          className={`px-5 py-1.5 rounded-full text-base font-bold transition-colors cursor-pointer ${
            postType === "poem"
              ? "bg-[#192942] text-white"
              : "border border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark)"
          }`}
        >
          Poem
        </button>
      </div>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) px-4 py-2 text-lg outline-none"
      />

      {postType === "art" ? (
        <>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {art === null ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer w-full gap-y-3 items-center justify-center flex flex-col h-52 rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) hover:opacity-80 transition-opacity"
            >
              <IoCloudUpload size={32} />
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Upload your artwork
              </p>
            </div>
          ) : (
            <div className="relative w-full h-52 rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) overflow-hidden">
              <button
                onClick={() => { setArt(null); setFile(null); }}
                className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 cursor-pointer"
              >
                <IoClose size={16} />
              </button>
              <img src={art} alt="preview" className="w-full h-full object-contain" />
            </div>
          )}
        </>
      ) : (
        <textarea
          placeholder="Write your poem here..."
          value={poem}
          onChange={(e) => setPoem(e.target.value)}
          className="w-full h-40 rounded-xl border-2 border-dotted border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) px-4 py-3 text-base resize-none outline-none"
        />
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="px-5 py-2 bg-[#e6f0f0] text-[#141414] rounded-full font-bold text-base cursor-pointer hover:bg-[#979ea0] transition-colors disabled:opacity-50"
        >
          {uploading ? "Submitting…" : "Submit Work"}
        </button>
      </div>
    </div>
  );
}


// ─── Activity Page ────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const { circleid, activityId } = useParams();
  const router = useRouter();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPrompt, setSelectedPrompt] = useState<"A" | "B" | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [commentBody, setCommentBody] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (!circleid || !activityId) return;

    const fetchActivity = async () => {
      try {
        const [actRes, roleRes] = await Promise.all([
          fetch(`/api/circles/${circleid}/activities/${activityId}`),
          fetch(`/api/circles/${circleid}/role`),
        ]);
        
        const roleData = await roleRes.json();
        
        if (!roleData.success || roleData.role === "none") {
          setError("You must be a member of this circle to view activities.");
          setLoading(false);
          return;
        }

        const actData = await actRes.json();
        if (actData.success) {
          setActivity(actData.activity);
        } else {
          setError(actData.message || "Failed to load activity");
        }
      } catch (err) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [circleid, activityId]);

  const handleSubmitSuccess = () => {
    setSubmitted(true);
    setShowSubmit(false);
    // Reload activity to see submission
    window.location.reload();
  };

  const handlePostComment = async () => {
    if (!commentBody.trim()) return;
    try {
      setCommenting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, body: commentBody }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentBody("");
        // Reload to show comment
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Loading activity...</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-gray-500">{error || "Activity not found"}</p>
        <button
          onClick={() => router.push(`/Circle/${circleid}`)}
          className="px-4 py-2 rounded-full border border-(--border) dark:border-(--borderdark) hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark) transition-colors cursor-pointer"
        >
          Back to Circle
        </button>
      </div>
    );
  }

  const isJam = activity.activityType === "art_jam";
  const isBattle = activity.activityType === "prompt_battle";
  const isActive = activity.status === "active";
  const isEnded = activity.status === "ended";

  const instructions = isJam
    ? [
        "Create something based on the prompt",
        "Stay within the time limit",
        "Upload your work before the jam ends",
      ]
    : [
        "Choose one of the two prompts",
        "Create something based on your chosen prompt",
        "Upload your work before the activity ends",
      ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push(`/Circle/${circleid}`)}
          className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <FaArrowLeft size={14} /> Back to Circle
        </button>
      </div>

      {/* Cover Image */}
      {activity.coverImage && (
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-(--border) dark:border-(--borderdark)">
          <img src={activity.coverImage} alt={activity.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-neutral-400 uppercase tracking-widest font-medium">
          {isJam ? <FaPalette size={13} /> : <FaExchangeAlt size={13} />}
          <span>{isJam ? "Art Jam" : "Prompt Battle"}</span>
        </div>
        <h1 className="text-4xl md:text-5xl">{activity.title}</h1>
        
        <div className="flex items-center justify-center gap-4 text-base">
          <StatusBadge status={activity.status} />
          <span className="text-gray-400 dark:text-neutral-500">·</span>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400">
            <IoTimeOutline size={16} />
            {isActive ? (
              <span>{getTimeRemaining(activity.endDate)}</span>
            ) : activity.status === "upcoming" ? (
              <span>Starts {formatDate(activity.startDate)}</span>
            ) : (
              <span>Ended {formatDate(activity.endDate)}</span>
            )}
          </div>
        </div>

        {/* Top Emotions */}
        {activity.topEmotions && activity.topEmotions.length > 0 && (
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400 dark:text-neutral-500">Activity Vibe:</span>
            {activity.topEmotions.map((e, i) => (
              <span key={i} className="px-2.5 py-1 rounded border border-(--border) dark:border-(--borderdark) text-xs bg-(--colorbg) dark:bg-(--colorbgdark)">
                {e.emotion}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr className="border-t border-(--border) dark:border-(--borderdark)" />

      {/* Prompt Area */}
      <div className="max-w-2xl mx-auto space-y-8">
        {isJam && activity.prompt && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
              The Prompt
            </p>
            <p className="text-3xl md:text-4xl italic">&ldquo;{activity.prompt}&rdquo;</p>
            {activity.description && (
              <p className="text-lg text-gray-500 dark:text-neutral-400">
                {activity.description}
              </p>
            )}
          </div>
        )}

        {isBattle && (
          <div className="text-center space-y-6">
            <p className="text-sm text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
              Choose Your Prompt
            </p>
            {activity.description && (
              <p className="text-lg text-gray-500 dark:text-neutral-400">
                {activity.description}
              </p>
            )}
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
              <button
                onClick={() => {
                  if (!isActive || submitted) return;
                  setSelectedPrompt("A");
                  setShowSubmit(true);
                }}
                disabled={!isActive || submitted}
                className={`flex-1 border-2 rounded-xl px-6 py-10 text-center text-3xl cursor-pointer transition-all ${
                  selectedPrompt === "A"
                    ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300"
                    : "border-(--border) dark:border-(--borderdark) hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark)"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {activity.promptA}
              </button>
              <div className="flex items-center justify-center text-gray-400 dark:text-neutral-500">
                or
              </div>
              <button
                onClick={() => {
                  if (!isActive || submitted) return;
                  setSelectedPrompt("B");
                  setShowSubmit(true);
                }}
                disabled={!isActive || submitted}
                className={`flex-1 border-2 rounded-xl px-6 py-10 text-center text-3xl cursor-pointer transition-all ${
                  selectedPrompt === "B"
                    ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300"
                    : "border-(--border) dark:border-(--borderdark) hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark)"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {activity.promptB}
              </button>
            </div>
            
            {selectedPrompt && !submitted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-500 dark:text-neutral-400">
                  You chose <span className="font-medium text-gray-900 dark:text-white">{selectedPrompt === "A" ? activity.promptA : activity.promptB}</span>. Now create your submission!
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-(--colorbg) dark:bg-(--colorbgdark) rounded-xl p-6 border border-(--border) dark:border-(--borderdark)">
          <p className="text-sm font-medium mb-3">How it works</p>
          <ol className="space-y-2">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-base text-gray-600 dark:text-neutral-400">
                <span className="shrink-0 w-6 h-6 rounded-full border border-(--border) dark:border-(--borderdark) bg-(--color-background) dark:bg-(--background) flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Submission Form Area */}
        {isActive && !submitted && (
          <div className="pt-6">
            {isJam && !showSubmit && (
              <div className="text-center">
                <button
                  onClick={() => setShowSubmit(true)}
                  className="px-8 py-3 rounded-full bg-[#192942] text-white font-bold text-lg cursor-pointer hover:bg-opacity-90 transition-opacity"
                >
                  Submit your work
                </button>
              </div>
            )}

            {(isJam && showSubmit) || (isBattle && showSubmit && selectedPrompt) ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="p-6 border border-(--border) dark:border-(--borderdark) rounded-2xl bg-(--color-background) dark:bg-(--background) shadow-lg">
                  <h3 className="text-xl mb-6 text-center">Your Submission</h3>
                  <SubmissionForm
                    activityId={activity._id}
                    circleId={circleid as string}
                    chosenPrompt={selectedPrompt}
                    onSuccess={handleSubmitSuccess}
                  />
                </div>
              </motion.div>
            ) : null}
          </div>
        )}

        {submitted && (
          <div className="text-center p-8 border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl">
            <h3 className="text-xl font-medium text-emerald-800 dark:text-emerald-400 mb-2">Work Submitted!</h3>
            <p className="text-emerald-700/80 dark:text-emerald-400/80">
              Your submission has been recorded. You can view all submissions once the activity ends (or if it's already visible below).
            </p>
          </div>
        )}
      </div>

      <hr className="border-t border-(--border) dark:border-(--borderdark)" />

      {/* Submissions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Submissions</h2>
          <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 bg-(--colorbg) dark:bg-(--colorbgdark) px-3 py-1.5 rounded-full border border-(--border) dark:border-(--borderdark)">
            <FaUsers size={14} />
            <span>{activity.submissions.length}</span>
          </div>
        </div>

        {activity.submissions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-neutral-400 border border-dotted border-(--border) dark:border-(--borderdark) rounded-xl">
            No submissions yet. Be the first!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activity.submissions.map((sub, i) => (
              <Link href={`/Art/${sub.post._id}`} key={i}>
                <div className="group border border-(--border) dark:border-(--borderdark) rounded-xl overflow-hidden hover:border-gray-400 transition-colors cursor-pointer bg-(--colorbg) dark:bg-(--colorbgdark)">
                  {sub.post.type === "art" && sub.post.media ? (
                    <div className="aspect-square bg-gray-100 dark:bg-neutral-800 relative">
                      <img src={sub.post.media.url} alt={sub.post.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-[#f5f5f5] dark:bg-[#1a1a1a] p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-medium line-clamp-3">{sub.post.title}</p>
                      <p className="text-xs text-gray-500 mt-2">Poem</p>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{sub.post.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <img src={sub.artist.profileImage} alt="artist" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs text-gray-500 dark:text-neutral-400 truncate">{sub.artist.fullName || sub.artist.username}</span>
                    </div>
                    {isBattle && sub.chosenPrompt && (
                      <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-(--border) dark:border-(--borderdark)">
                        {sub.chosenPrompt === "A" ? activity.promptA : activity.promptB}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <hr className="border-t border-(--border) dark:border-(--borderdark)" />

      {/* Activity Comments */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl">Activity Discussion</h2>
        
        {/* Comment input */}
        <div className="flex gap-4">
          <textarea
            placeholder="Share your thoughts about this activity..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="flex-1 rounded-xl border border-(--border) dark:border-(--borderdark) bg-(--colorbg) dark:bg-(--colorbgdark) p-4 outline-none resize-none min-h-[100px]"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handlePostComment}
            disabled={commenting || !commentBody.trim()}
            className="px-6 py-2 rounded-full bg-[#192942] text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {commenting ? "Posting..." : "Post Comment"}
          </button>
        </div>

        {/* Comment list */}
        <div className="space-y-6 pt-4">
          {activity.comments?.length === 0 ? (
            <p className="text-gray-500 dark:text-neutral-400 text-center py-4">No comments yet.</p>
          ) : (
            activity.comments?.map((comment: any, i: number) => (
              <div key={i} className="flex gap-4">
                <img
                  src={comment.author.profileImage}
                  alt="author"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.author.fullName || comment.author.username}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-neutral-300 text-sm">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
}
