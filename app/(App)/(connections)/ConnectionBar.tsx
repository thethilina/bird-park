"use client";

import React from 'react';
import { FaCompass } from "react-icons/fa6";
import { FaRegCircleDot } from "react-icons/fa6";
import { FiPlusCircle } from "react-icons/fi";
import Link from 'next/link';
import { BsFillEyeFill } from 'react-icons/bs';
import { usePathname } from 'next/navigation';

function ConnectionBar() {
  const pathname = usePathname();

  const links = [
    { href: "/suggections", label: "Suggestions", icon: FaCompass },
    { href: "/suggections/connections", label: "Connections", icon: FaRegCircleDot },
    { href: "/suggections/requests", label: "Observers", icon: FiPlusCircle },
    { href: "/suggections/observing", label: "Observing", icon: BsFillEyeFill },
  ];

  return (
    <>
      {/* Desktop Sidebar (lg and above) */}
      <nav className="hidden lg:block w-72 fixed top-10 h-screen pr-5 bg-(--color-background) dark:bg-(--background) border-r-2 border-(--border) py-5 gap-y-5">
        <div className="sticky top-30 mr-10 space-y-10 pl-6">
          <h1 className="text-3xl font-semibold tracking-tight">Connections</h1>
          
          <div className="flex flex-col text-xl gap-y-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <button className={`flex items-center hover:cursor-pointer align-middle gap-x-4 w-full px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-neutral-200/50 dark:bg-neutral-800/60 font-semibold text-neutral-900 dark:text-white' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50'
                  }`}>
                    <Icon className={`size-5 transition-transform ${isActive ? 'scale-110 text-blue-500' : ''}`} />
                    <span>{link.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Horizontal Tabs (below lg) */}
      <div className="block lg:hidden w-full bg-(--color-background) dark:bg-(--background) border-b border-(--border) sticky top-12 z-40">
        <div className="flex overflow-x-auto whitespace-nowrap px-4 py-3 gap-x-2 minimal-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="shrink-0">
                <button className={`flex items-center gap-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                  isActive 
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 font-semibold text-neutral-950 dark:text-white shadow-sm' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/30'
                }`}>
                  <Icon className={`size-4 ${isActive ? 'text-blue-500' : ''}`} />
                  <span>{link.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ConnectionBar;