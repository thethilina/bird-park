"use client";

import React, { useState, useEffect } from 'react';
import { IoMdSearch } from "react-icons/io";
import { FaCompass } from "react-icons/fa6";
import { FaRegCircleDot } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";
import Link from "next/link";

function CircleSideBar() {
  const [circles, setCircles] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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

  const filtered = circles.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <nav className='hidden sticky lg:block w-72  border-r-2  border-(--border) top-10 h-screen pr-5 bg-(--color-background) dark:bg-[#06060B] flex-col items-center py-5 gap-y-5 z-20'>
        <div className='sticky top-30 space-y-6 pr-4'>

          {/* searchbar */}
          <div className="hidden lg:block relative text-lg">
            <IoMdSearch className="absolute right-3 top-2.5 size-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circles"
              type="text"
              className="font-sans bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2 px-4 pr-10 w-full  outline-none dark:text-white dark:placeholder-gray-400 focus:border-white/30 transition-colors"
            />
          </div>

          {/* middle buttons */}
          <div className="flex flex-col text-xl font-medium gap-y-1">
            <Link href="/Circle" className='flex items-center gap-x-4 py-2.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors dark:text-gray-200'>
              <FaCompass className='size-5 text-gray-500 dark:text-gray-400' /> Discover
            </Link>
            <button className='flex items-center gap-x-4 py-2.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left dark:text-gray-200'>
              <FaRegCircleDot className='size-5 text-gray-500 dark:text-gray-400' /> Your Circles
            </button>
            <Link
              href="/Circle/create"
              className='flex items-center gap-x-4 py-2.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left dark:text-gray-200'
            >
              <FiPlusCircle className='size-5 text-gray-500 dark:text-gray-400' /> Create new circle
            </Link>
          </div>

          {/* circles */}
          <div className="flex flex-col gap-y-5 pt-4">
            <div className='flex items-center gap-x-3 px-2'>
              <div className='w-6 h-6 rounded-full bg-blue-500' />
              <h1 className='text-xl font-medium text-gray-500 dark:text-gray-400'>Circles you are in</h1>
            </div>

            {filtered.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto pr-1">
                {filtered.map((c) => (
                  <Link
                    key={c._id}
                    href={`/Circle/${c._id}`}
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
                {search ? "No circles match your search" : "No circles joined yet"}
              </p>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default CircleSideBar;