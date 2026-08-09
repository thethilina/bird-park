"use client";

import React from "react";
import { FaUsers, FaPalette, FaExchangeAlt } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";

export type ActivityStatus = "upcoming" | "active" | "ended";
export type ActivityType = "art_jam" | "prompt_battle";

export interface ActivityCardData {
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
  submissions: { artist?: { profileImage?: string } }[];
  maxParticipants?: number | null;
}

interface ActivityCardProps {
  activity: ActivityCardData;
  onView: (activity: ActivityCardData) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      cls: "border border-(--border) dark:border-(--borderdark) text-gray-400 dark:text-neutral-500 opacity-70",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-sm ${cls}`}
    >
      {label}
    </span>
  );
}

export default function ActivityCard({ activity, onView }: ActivityCardProps) {
  const isEnded = activity.status === "ended";
  const participantCount = activity.submissions.length;

  // Gather up to 4 avatars from submissions that have profileImage
  const avatars = activity.submissions
    .filter((s) => s.artist?.profileImage)
    .slice(0, 4)
    .map((s) => s.artist!.profileImage as string);

  const actionLabel =
    activity.status === "upcoming"
      ? activity.activityType === "art_jam"
        ? "View Jam"
        : "View Battle"
      : activity.status === "active"
      ? activity.activityType === "art_jam"
        ? "Join Jam"
        : "Choose a Prompt"
      : "View Submissions";

  return (
    <div
      className={`border border-(--border) dark:border-(--borderdark) rounded-lg p-5 space-y-4 bg-(--colorbg) dark:bg-(--colorbgdark) transition-opacity ${
        isEnded ? "opacity-70" : ""
      }`}
    >
      {/* Cover Image */}
      {activity.coverImage && (
        <div className="w-full h-32 rounded-lg overflow-hidden border border-(--border) dark:border-(--borderdark) shrink-0 mb-3">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Top row: type icon + label, status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
          {activity.activityType === "art_jam" ? (
            <FaPalette size={13} />
          ) : (
            <FaExchangeAlt size={13} />
          )}
          <span>
            {activity.activityType === "art_jam" ? "Art Jam" : "Prompt Battle"}
          </span>
        </div>
        <StatusBadge status={activity.status} />
      </div>

      {/* Title */}
      <h3 className="text-xl leading-snug">{activity.title}</h3>

      {/* Prompt preview */}
      {activity.activityType === "art_jam" && activity.prompt && (
        <p className="text-sm text-gray-500 dark:text-neutral-400 italic line-clamp-2">
          &ldquo;{activity.prompt}&rdquo;
        </p>
      )}
      {activity.activityType === "prompt_battle" &&
        activity.promptA &&
        activity.promptB && (
          <div className="flex items-center gap-2 text-sm">
            <span className="border border-(--border) dark:border-(--borderdark) rounded px-2.5 py-1">
              {activity.promptA}
            </span>
            <span className="text-gray-400 dark:text-neutral-500">or</span>
            <span className="border border-(--border) dark:border-(--borderdark) rounded px-2.5 py-1">
              {activity.promptB}
            </span>
          </div>
        )}

      {/* Description */}
      {activity.description && (
        <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2">
          {activity.description}
        </p>
      )}

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-neutral-500">
        <IoTimeOutline size={14} />
        <span>
          {formatDate(activity.startDate)} — {formatDate(activity.endDate)}
        </span>
      </div>

      {/* Footer: participants + action button */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <div className="flex items-center gap-2">
          {/* Avatar stack */}
          {avatars.length > 0 ? (
            <div className="flex">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="participant"
                  className="w-6 h-6 rounded-full object-cover border border-(--border) dark:border-(--borderdark) -ml-1 first:ml-0"
                />
              ))}
            </div>
          ) : (
            <FaUsers
              size={14}
              className="text-gray-400 dark:text-neutral-500"
            />
          )}
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            {participantCount}{" "}
            {participantCount === 1 ? "participant" : "participants"}
          </span>
        </div>

        <button
          onClick={() => onView(activity)}
          className="px-4 py-1.5 rounded-full border border-(--border) dark:border-(--borderdark) text-sm cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark)"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
