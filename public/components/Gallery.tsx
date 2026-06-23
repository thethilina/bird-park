import React from "react";
import Link from "next/link";
import Image from "next/image";

// Real API post shape
interface Post {
  _id: string;
  type: "art" | "poem";
  title: string;
  body?: string;
  media?: {
    url: string;
    publicId?: string;
    type?: string;
  };
  poemStyle?: {
    fontFamily?: string;
    fontSize?: string;
    fontColor?: string;
    backgroundColor?: string;
  };
}

// Legacy test-database shape
interface LegacyArt {
  id: string | number;
  category?: string;
  title: string;
  content?: string;
  image?: any;
  backgroundColor?: string;
  textColor?: string;
  font?: string;
}

interface GalleryProps {
  posts?: Post[];
  artbase?: LegacyArt[];
}

function Gallery({ posts, artbase }: GalleryProps) {
  // --- Real API posts mode ---
  if (posts !== undefined) {
    if (posts.length === 0) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center text-(--text-muted) dark:text-(--text-muted-dark)">
          <p className="text-xl">No works yet.</p>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10 w-full">
          {posts.map((post) =>
            post.type === "poem" ? (
              <Link key={post._id} href={`/Art/${post._id}`}>
                <div
                  className="break-inside-avoid p-5 rounded-md gap-y-5 text-center flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity mb-2 lg:mb-5"
                  style={{
                    backgroundColor:
                      post.poemStyle?.backgroundColor || "#ffffff",
                    color: post.poemStyle?.fontColor || "#000000",
                    fontFamily:
                      post.poemStyle?.fontFamily || "Georgia, serif",
                  }}
                >
                  <h2 className="lg:text-2xl font-bold mb-2">{post.title}</h2>
                  <p
                    className="lg:text-lg mb-4 whitespace-pre-wrap line-clamp-6"
                    style={{ fontSize: post.poemStyle?.fontSize || "16px" }}
                  >
                    {post.body}
                  </p>
                </div>
              </Link>
            ) : (
              <div key={post._id} className="break-inside-avoid mb-2 lg:mb-5">
                <Link href={`/Art/${post._id}`}>
                  {post.media?.url ? (
                    <img
                      src={post.media.url}
                      alt={post.title}
                      className="w-full object-cover hover:opacity-90 transition-opacity duration-300 rounded-sm"
                    />
                  ) : (
                    <div className="w-full h-40 bg-(--colorbg) dark:bg-(--colorbgdark) rounded-sm flex items-center justify-center text-(--text-muted)">
                      No image
                    </div>
                  )}
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (!artbase || artbase.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center text-(--text-muted) dark:text-(--text-muted-dark)">
        <p className="text-xl">No works yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="columns-2 xl:gap-10 xl:space-y-10 sm:columns-2 gap-2 space-y-2 md:columns-3 lg:columns-3 xl:columns-4 lg:gap-5 lg:space-y-5 w-full">
        {artbase.map((art) =>
          art.category === "poem" ? (
            <div
              key={art.id}
              className="break-inside-avoid p-5 rounded-md gap-y-5 text-center flex flex-col items-center justify-center"
              style={{
                backgroundColor: art.backgroundColor,
                color: art.textColor,
                fontFamily: art.font,
              }}
            >
              <h2 className="lg:text-2xl font-bold mb-2">{art.title}</h2>
              <p className="lg:text-lg mb-4">{art.content}</p>
            </div>
          ) : (
            <div key={art.id} className="break-inside-avoid">
              <Link href={`/Art/${art.id}`}>
                <Image
                  src={art.image}
                  alt={art.title}
                  width={500}
                  height={500}
                  className="hover:opacity-90 transition-opacity duration-300"
                />
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Gallery;