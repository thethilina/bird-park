"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { IoMdAddCircle } from "react-icons/io";
import ActivityCard, { type ActivityCardData } from "./ActivityCard";
import CreateActivityModal from "./CreateActivityModal";

interface ActivitySectionProps {
  circleId: string;
  canCreateActivity: boolean;
  /** Increment this counter from a parent to imperatively open the create modal */
  triggerCreate?: number;
}

export default function ActivitySection({
  circleId,
  canCreateActivity,
  triggerCreate = 0,
}: ActivitySectionProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // Open the create modal whenever parent increments the counter
  useEffect(() => {
    if (triggerCreate > 0) setCreateOpen(true);
  }, [triggerCreate]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/circles/${circleId}/activities/shared-prompt`
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.success && data.activities) {
        setActivities(data.activities);
      } else {
        setActivities([]);
      }
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleActivityCreated = () => {
    fetchActivities();
  };

  if (loading) {
    return (
      <div className="space-y-4 mx-4 sm:mx-6 lg:mx-10 ">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Activities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="border border-(--border) dark:border-(--borderdark) rounded-lg p-5 space-y-3 animate-pulse bg-(--colorbg) dark:bg-(--colorbgdark)"
            >
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-6 w-48 rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && activities.length === 0) {
    return (
      <div className=" space-y-4 mx-4 sm:mx-6 lg:mx-10  ">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl">Activities</h2>
          {canCreateActivity && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-(--border) dark:border-(--borderdark) text-base cursor-pointer transition-colors hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark)"
            >
              <IoMdAddCircle size={16} />
              New Activity
            </button>
          )}
        </div>
        <div className="flex items-center justify-center p-10 border border-dotted border-(--border) dark:border-(--borderdark) rounded-xl text-center">
          <p className="text-gray-500 dark:text-neutral-400">
            No activities yet.
            {canCreateActivity && " Create one to get started!"}
          </p>
        </div>

        <AnimatePresence>
          {createOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CreateActivityModal
                circleId={circleId}
                onClose={() => setCreateOpen(false)}
                onCreated={handleActivityCreated}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div className=" space-y-4 mx-4 sm:mx-6 lg:mx-10  ">
        {/* Section header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl">Activities</h2>
          {canCreateActivity && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-(--border) dark:border-(--borderdark) text-base cursor-pointer transition-colors hover:bg-(--colorbg) dark:hover:bg-(--colorbgdark)"
            >
              <IoMdAddCircle size={16} />
              New Activity
            </button>
          )}
        </div>

        {/* Activity cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onView={(act) => router.push(`/Circle/${circleId}/activity/${act._id}`)}
            />
          ))}
        </div>
      </div>

      {/* Create activity modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CreateActivityModal
              circleId={circleId}
              onClose={() => setCreateOpen(false)}
              onCreated={handleActivityCreated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
