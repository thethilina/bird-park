"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoMdSearch } from "react-icons/io";
import { FaCompass } from "react-icons/fa6";
import { FaRegCircleDot } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import Link from "next/link";

function CircleSideBar() {
  const [circles, setCircles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const fetchCircles = async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.success) {
        setCircles(data.circles || []);
      }
    } catch (err) {
      console.error("Failed to fetch circles", err);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, []);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const trimmed = search.trim();
    if (!trimmed) return;

    router.push(`/Circle/search?q=${encodeURIComponent(trimmed)}`);
    setMobileOpen(false);
  };

  // Shared list/links content used by both the desktop nav and the mobile drawer
  const renderContent = (onNavigate?: () => void) => (
    <>
      {/* searchbar */}
      <div className="relative text-lg">
        <IoMdSearch className="absolute right-3 top-2.5 size-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search circles"
          type="text"
          className="font-sans bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2 px-4 pr-10 w-full outline-none dark:text-white dark:placeholder-gray-400 focus:border-white/30 transition-colors"
        />
      </div>

      {/* middle buttons */}
      <div className="flex flex-col text-xl font-medium gap-y-1">
        <Link
          href="/Circle"
          onClick={onNavigate}
          className='flex items-center gap-x-4 py-2.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors dark:text-gray-200'
        >
          <FaCompass className='size-5 text-gray-500 dark:text-gray-400' /> Discover
        </Link>

        <Link
          href="/Circle/create"
          onClick={onNavigate}
          className='flex items-center gap-x-4 py-2.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left dark:text-gray-200'
        >
          <FiPlusCircle className='size-5 text-gray-500 dark:text-gray-400' /> Create new circle
        </Link>
      </div>

      {/* circles */}
      <div className="flex flex-col gap-y-5 pt-4 pb-15">
        <div className='flex items-center gap-x-3 px-2'>
          <div className='w-6 h-6 rounded-full bg-blue-500' />
          <h1 className='text-xl font-medium text-gray-500 dark:text-gray-400'>Circles you are in</h1>
        </div>

        {circles.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto pr-1">
            {circles.map((c) => (
              <Link
                key={c._id}
                href={`/Circle/${c._id}`}
                onClick={onNavigate}
                className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-lg transition-colors dark:text-gray-200"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-xl font-bold dark:text-white text-gray-600 shadow-sm">
                  {c.icon ? (
                    <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
                  ) : c.image ? (
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    c.name?.[0]?.toUpperCase() || "C"
                  )}
                </div>
                <span className="truncate font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic pl-2">
            No circles joined yet
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className='hidden sticky lg:block w-72 border-r-2 border-(--border) top-10 h-screen pr-5 bg-(--color-background) dark:bg-[#06060B] flex-col items-center py-5 gap-y-5 z-20'>
        <div className='sticky top-30 space-y-6 pr-4'>
          {renderContent()}
        </div>
      </nav>

      {/* Mobile floating trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open circles"
        className="lg:hidden fixed bottom-20 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-(--color-background) dark:bg-[#06060B] border-2 border-(--border) shadow-lg text-blue-500 active:scale-95 transition-transform"
      >
        <FaRegCircleDot className="size-6" />
      </button>

      {/* Mobile bottom-sheet drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />

          {/* sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-(--color-background) dark:bg-[#06060B] border-t-2 border-(--border) shadow-2xl flex flex-col animate-[slideUp_0.25s_ease-out]">
            {/* drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
            </div>

            {/* header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-(--border) shrink-0">
              <h2 className="text-lg font-semibold dark:text-white">Circles</h2>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <IoClose className="size-6 dark:text-gray-200" />
              </button>
            </div>

            {/* content */}
            <div className="overflow-y-auto px-4 py-4 space-y-6">
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

export default CircleSideBar;