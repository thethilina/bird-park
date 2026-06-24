"use client";

import Image from "next/image";
import { FaHeart } from "react-icons/fa";
import { GoComment } from "react-icons/go";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";

export default function Page() {
  const { ArtId } = useParams();

  const [post, setPost] = useState<any>(null);

  const fetchpost = async () => {
    try {
      const response = await fetch(`/api/post/${ArtId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  useEffect(() => {
    if (ArtId) fetchpost();
  }, [ArtId]);

  return (
    <div className="lg:flex  lg:h-[calc(100vh-80px)] px-3 overflow-hidden gap-x-10 justify-center">

      {/* LEFT DIV */}
      <div className="flex-1 lg:border-r-2 lg:pr-10 py-3 lg:py-10 border-(--border) gap-y-2 flex flex-col lg:gap-y-5">

        {/* USER */}
        <div className="flex items-center lg:text-xl gap-x-3">
          <Link
            href={`/Profile/${post?.author?._id}`}
            className="flex items-center gap-x-3"
          >
            <Image
              src={post?.author?.profileImage || ""}
              alt={post?.author?.fullName || ""}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full"
              width={48}
              height={48}
            />

            <span>{post?.author?.fullName}</span>
          </Link>
        </div>

        {/* TITLE */}
        <h1 className="lg:text-2xl font-semibold">
          {post?.title}
        </h1>

        {/* IMAGE */}
        {post?.media?.url && (
          <div>
            <div className="w-full border-(--border) block lg:hidden border-2 rounded-sm">
              <img
                src={post.media.url}
                alt={post.title}
                className="w-full h-full object-contain object-center"
              />
            </div>

            <div
              className="w-full border-(--border) lg:block hidden border-2 rounded-sm"
              style={{ height: "calc(100vh - 300px)" }}
            >
              <img
                src={post.media.url}
                alt={post.title}
                className="w-full h-full object-contain object-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DIV (UNCHANGED UI STRUCTURE) */}
      <div
        className="lg:my-10 lg:w-2/5 xl:w-1/3 lg:px-5 rounded-sm overflow-y-auto bg-(--color-background) dark:bg-(--background)
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ height: "calc(100vh - 100px)" }}
      >

        {post && (
          <div className="flex flex-col">

            {/* HEADER */}
            <div className="lg:sticky top-0 bg-(--color-background) dark:bg-(--background) w-auto z-49">

              <div className="flex lg:gap-x-5 gap-x-2 items-center border-(--border) lg:pb-4 pb-2 border-b-2">
                <CiHeart className="size-5 lg:size-7" />
                <span className="text-xl lg:text-3xl">
                  {post.hearts?.length || 0}
                </span>

                <GoComment className="lg:size-5.5" />
                <span className="text-xl lg:text-3xl">
                  {post.comments?.length || 0}
                </span>
              </div>

              {/* COMMENT INPUT (UNCHANGED) */}
              <div className="flex items-center gap-x-3 mt-5 mb-5">
                <input
                  placeholder="Add a comment..."
                  type="text"
                  className="flex-1 font-sans bg-(--colorbg) dark:bg-(--colorbgdark) border border-(--border) dark:border-(--borderdark) rounded-xl py-2 px-4 outline-none focus:ring-1 focus:ring-blue-500"
                />

                <button className="px-6 py-2 bg-[#3B5D95] text-white font-medium rounded-[4px_20px_20px_20px] hover:bg-[#2e4a7a] transition-colors whitespace-nowrap">
                  Post
                </button>
              </div>
            </div>

            {/* COMMENTS SECTION (UNCHANGED) */}
            <div className="space-y-5 py-5 lg:space-y-10">
              {/* your original commentData mapping stays here */}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

