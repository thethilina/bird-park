"use client";

import React, { useState, useEffect } from 'react';
import { FaCompass, FaRegCircleDot } from "react-icons/fa6";
import { FaUserFriends } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Link from 'next/link';
import { BsFillEyeFill } from 'react-icons/bs';
import { usePathname } from 'next/navigation';

function ConnectionBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { href: "/suggections", label: "Suggestions", icon: FaCompass },
    { href: "/suggections/connections", label: "Connections", icon: FaRegCircleDot },
    { href: "/suggections/requests", label: "Observers", icon: FiPlusCircle },
    { href: "/suggections/observing", label: "Observing", icon: BsFillEyeFill },
  ];

  const renderContent = (onNavigate?: () => void) => (
    <div className="flex flex-col text-xl font-medium gap-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-x-4 py-3 px-4 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-neutral-200/60 dark:bg-neutral-800 font-semibold text-neutral-950 dark:text-white' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/30'
            }`}
          >
            <Icon className={`size-5 ${isActive ? 'text-blue-500' : ''}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and above) */}
      <nav className="hidden lg:block w-72 sticky top-10 h-screen pr-5 bg-(--color-background) dark:bg-(--background) border-r-2 border-(--border) py-5 gap-y-5">
        <div className="sticky top-30 mr-10 space-y-10 pl-6">
          <h1 className="text-3xl font-semibold tracking-tight">Connections</h1>
          {renderContent()}
        </div>
      </nav>

      {/* Mobile/Tablet Floating Trigger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open connections navigation"
        className="lg:hidden fixed bottom-20 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-(--color-background) dark:bg-[#06060B] border-2 border-(--border) shadow-lg text-blue-500 hover:scale-105 active:scale-95 transition-transform hover:cursor-pointer"
      >
        <FaUserFriends className="size-6" />
      </button>

      {/* Mobile Bottom-sheet Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-45">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-(--color-background) dark:bg-[#06060B] border-t-2 border-(--border) shadow-2xl flex flex-col animate-[slideUp_0.25s_ease-out]">
            {/* Drag Handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-(--border) shrink-0">
              <h2 className="text-lg font-semibold dark:text-white">Connections</h2>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hover:cursor-pointer"
              >
                <IoClose className="size-6 dark:text-gray-200" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-4 py-6 space-y-6">
              {renderContent(() => setMobileOpen(false))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ConnectionBar;