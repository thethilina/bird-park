import Link from "next/link";

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

interface GalleryProps {
  posts: Post[];
}

export default function GalleryC({ posts }: GalleryProps) {
  if (!posts?.length) {
    return (
      <div className="w-full py-10 text-center text-gray-500">
        No works yet.
      </div>
    );
  }

  return (
    <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3  xl:columns-4  gap-3 md:gap-5 lg:gap-5 xl:gap-8">
      {posts.map((post) =>
        post.type === "poem" ? (
          <div
            key={post._id}
            className="break-inside-avoid mb-3 md:mb-5 xl:mb-8"
          >
            <Link href={`/Art/${post._id}`}>
              <div
                className="p-5 cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor:
                    post.poemStyle?.backgroundColor ?? "#fff",
                  color: post.poemStyle?.fontColor ?? "#000",
                  fontFamily:
                    post.poemStyle?.fontFamily ?? "Georgia",
                }}
              >
                <h2 className="text-xl font-bold mb-2">
                  {post.title}
                </h2>

                <p
                  className="whitespace-pre-wrap line-clamp-6"
                  style={{
                    fontSize:
                      post.poemStyle?.fontSize ?? "16px",
                  }}
                >
                  {post.body}
                </p>
              </div>
            </Link>
          </div>
        ) : (
          <div
            key={post._id}
            className="break-inside-avoid mb-3  md:mb-5 xl:mb-8"
          >
            <Link href={`/Art/${post._id}`}>
              {post.media?.url ? (
                <img
                  src={post.media.url}
                  alt={post.title}
                  className="block w-full object-cover hover:opacity-90 transition"
                />
              ) : (
                <div className="w-full h-52 flex items-center justify-center bg-gray-200 rounded-sm">
                  No image
                </div>
              )}
            </Link>
          </div>
        )
      )}
    </div>
  );
} 