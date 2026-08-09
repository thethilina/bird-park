"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CircleBar from "@/public/components/CircleBar";
import PostCreate from "../../CircleComponents/Postcreate";
import { FaLock, FaClock, FaUsers } from "react-icons/fa";
import CircleGallery from "../../CircleComponents/CircleGallery";
import ActivitySection from "../../CircleComponents/ActivitySection";
import { AnimatePresence, motion } from "framer-motion";

interface Circle {
  _id: string;
  name: string;
  description: string;
  image: string;
  icon: string;

  owner: {
    _id: string;
    username: string;
    fullName: string;
  };

  joinType: "open" | "approval";

  members: {
    _id: string;
    username: string;
    fullName: string;
    profileImage: string;
  }[];

  category: string;
}

type Role =
  | "none"
  | "member"
  | "moderator"
  | "admin"
  | "owner";

interface Permissions {
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
}

export default function Page() {
  const [isPostCreateOpen, setIsPostCreateOpen] =
    useState(false);

  const { circleid } = useParams();

  const [hasPendingRequest, setHasPendingRequest] =
    useState(false);

  const [circle, setCircle] =
    useState<Circle | null>(null);

  const [role, setRole] = useState<Role>("none");

  const [permissions, setPermissions] =
    useState<Permissions>({
      isOwner: false,
      isAdmin: false,
      isModerator: false,
      isMember: false,
    });

  const [loading, setLoading] = useState(true);
  const [triggerCreateOpen, setTriggerCreateOpen] = useState(0);

  useEffect(() => {
    if (!circleid) return;

    const fetchData = async () => {
      try {
        const [circleRes, roleRes] =
          await Promise.all([
            fetch(`/api/circles/${circleid}`),
            fetch(`/api/circles/${circleid}/role`),
          ]);

        const circleData = await circleRes.json();
        const roleData = await roleRes.json();

        setCircle(circleData.circle);

        setHasPendingRequest(
          circleData.hasPendingRequest || false
        );

        if (roleData.success) {
          setRole(roleData.role);
          setPermissions(roleData.permissions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [circleid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-gray-500">
          Loading circle...
        </p>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-gray-500">
          Circle not found.
        </p>
      </div>
    );
  }

  const isMember =
    role === "member" ||
    role === "moderator" ||
    role === "admin" ||
    role === "owner";

  const canCreateActivity =
    role === "owner" ||
    role === "admin" ||
    role === "moderator";

  return (
    <div className="space-y-10">

      <CircleBar
        circle={circle}
        role={role}
        permissions={permissions}
        hasPendingRequest={hasPendingRequest}
        postCreateOpen={setIsPostCreateOpen}
        onCreateActivity={() => setTriggerCreateOpen((n) => n + 1)}
      />

      {/* MEMBER CONTENT */}
      {isMember ? (
<>
        <AnimatePresence>
  {isPostCreateOpen && (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -80 }}
      transition={{
        duration: 0.22,
        ease: "easeOut",
      }}
    >
      <PostCreate
        circleId={circle._id}
        postCreateOpen={setIsPostCreateOpen}
      />
    </motion.div>
  )}
</AnimatePresence>

        {/* ── Activities (above Community works) ── */}
        <ActivitySection
          circleId={circle._id}
          canCreateActivity={canCreateActivity}
          triggerCreate={triggerCreateOpen}
        />

        <CircleGallery circleId={circle._id} />
        </>
      ) : (

        /* NON-MEMBER CONTENT */
        <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">

          {circle.joinType === "approval" ? (
            <>
              {/* PRIVATE CIRCLE */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 mb-6">
                {hasPendingRequest ? (
                  <FaClock className="text-3xl text-gray-400 dark:text-neutral-500" />
                ) : (
                  <FaLock className="text-3xl text-gray-400 dark:text-neutral-500" />
                )}
              </div>

              {hasPendingRequest ? (
                <>
                  <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">
                    Request sent
                  </h2>

                  <p className="mt-2 max-w-md text-lg text-gray-500 dark:text-neutral-500">
                    Your request to join this circle has
                    been sent to the circle moderators.
                    You&apos;ll be able to see the community
                    works once your request is approved.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">
                    This circle is private
                  </h2>

                  <p className="mt-2 max-w-md text-lg text-gray-500 dark:text-neutral-500">
                    The works shared in this circle are
                    only available to members. Send a
                    request to join the circle and explore
                    what the community has created.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              {/* OPEN CIRCLE */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 mb-6">
                <FaUsers className="text-3xl text-gray-400 dark:text-neutral-500" />
              </div>

              <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-200">
                Join this circle
              </h2>

              <p className="mt-2 max-w-md text-lg text-gray-500 dark:text-neutral-500">
                Join the circle to see community works,
                share your own creations, and take part in
                the community.
              </p>
            </>
          )}

        </div>
      )}
    </div>
  );
}