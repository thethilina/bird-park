"use client";

import { useState, useEffect } from "react";
import ConnectionCard from "./connectionCard";
import ConnectionCardSkeleton from "@/public/components/ConnectionCardSkeleton";

export default function Page() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchrequests = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/connection`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      const data = await res.json();
      setConnections(data.connections || []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchrequests();
  }, []);

  return (
    <div className="pl-0 lg:pl-75 pt-4 lg:pt-10 px-4 lg:pr-8 pb-24 lg:pb-10">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <ConnectionCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto my-8 flex flex-col items-center justify-center py-12 px-4 text-center border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-xl">
          <div className="text-red-500 dark:text-red-400 font-medium text-lg mb-2">Failed to load connections</div>
          <p className="text-sm text-red-400 dark:text-red-500 mb-4">There was an error retrieving the list. Please try again.</p>
          <button 
            onClick={fetchrequests} 
            className="px-4 py-2 bg-[#192942] hover:bg-[#2c456e] text-white rounded-xl text-sm font-medium transition-colors hover:cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
          <p className="text-neutral-500 dark:text-neutral-400">No connections yet. Go to Suggestions to connect with others!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {connections.map((con: any) => (
            <ConnectionCard 
              connection={con} 
              key={con._id}   
              onRemove={(id: string) => {
                setConnections((prev: any[]) => prev.filter((r: any) => r._id !== id));
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}