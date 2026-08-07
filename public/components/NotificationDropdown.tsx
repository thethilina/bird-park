"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMailSharp } from "react-icons/io5";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 3000000); // Poll every 30s
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggle = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening
      try {
        await fetch("/api/notifications/read-all", { method: "PATCH" });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  const handleNotificationClick = (notification: any) => {
    setIsOpen(false);
    
    // Determine the target route based on notification type
    let route = "/";
    switch (notification.type) {
      case "connection_request":
      case "connection_accepted":
        if (notification.sender?._id) {
          route = `/Profile/${notification.sender._id}`;
        }
        break;
      case "comment":
      case "reply":
      case "heart":
        if (notification.entityId) {
          route = `/Art/${notification.entityId}`;
        }
        break;
      case "circle_join_request":
      case "circle_join_approved":
        if (notification.entityId) {
          route = `/Circle/${notification.entityId}`;
        }
        break;
      default:
        break;
    }

    router.push(route);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative cursor-pointer" onClick={handleToggle}>
        <IoMailSharp className="dark:text-[#BEC9F4] text-gray-700 size-7 lg:size-8 transition-transform hover:scale-105" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-(--color-background) dark:border-(--background)">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[400px] overflow-y-auto bg-(--color-background) dark:bg-[#0e0e14] border border-(--border) dark:border-(--borderdark) rounded-xl shadow-2xl z-[250] flex flex-col font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 font-bold text-lg border-b border-(--border) dark:border-(--borderdark) sticky top-0 bg-(--color-background) dark:bg-[#0e0e14] z-10 flex justify-between items-center">
            <span>Notifications</span>
          </div>

          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-(--text-muted) flex flex-col items-center">
                <IoMailSharp className="size-10 mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex gap-3 p-3 items-start border-b border-(--border) dark:border-(--borderdark) last:border-none cursor-pointer transition-colors hover:bg-(--hover) dark:hover:bg-(--hoverdark) ${
                    !notif.isRead ? "bg-blue-500/5 dark:bg-blue-500/10" : ""
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    <img
                      src={notif.sender?.profileImage || "/default-profile.png"}
                      alt={notif.sender?.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-(--border)"
                    />
                    {!notif.isRead && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-(--color-background) dark:border-[#0e0e14]"></div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 text-sm overflow-hidden">
                    <span className="text-gray-900 dark:text-gray-100 line-clamp-2">
                      <span className="font-semibold mr-1">
                        {notif.sender?.fullName || "Someone"}
                      </span>
                      {notif.message}
                    </span>
                    <span className="text-(--text-muted) text-xs mt-1 font-medium">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
