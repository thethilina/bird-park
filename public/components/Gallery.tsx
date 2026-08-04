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

export default function Gallery({ posts }: GalleryProps) {
  if (!posts?.length) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-xl text-(--text-muted)">No works yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-2 lg:gap-5 xl:gap-10 space-y-2 lg:space-y-5 xl:space-y-10">

        {posts.map((post) =>
          post.type === "poem" ? (
            <Link key={post._id} href={`/Art/${post._id}`}>
              <div
                className="break-inside-avoid mb-2 lg:mb-5 p-5 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
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
          ) : (
            <div
              key={post._id}
              className="break-inside-avoid mb-2 lg:mb-5"
            >
              <Link href={`/Art/${post._id}`}>
                {post.media?.url ? (
                  <img
                    src={post.media.url}
                    alt={post.title}
                    className="w-full rounded-sm object-cover hover:opacity-90 transition"
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
    </div>
  );
}