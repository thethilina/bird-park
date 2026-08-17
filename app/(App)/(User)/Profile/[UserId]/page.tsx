"use client";

import ProfileBar from "@/public/components/ProfileBar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { IoPencil } from "react-icons/io5";
import { toast } from "react-toastify";
import ProfileBarSkeleton from "@/public/components/ProfileBarSkeleton";


function Page() {

  const { UserId } = useParams();

  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);


  useEffect(() => {

    if (!UserId) return;


    const fetchData = async () => {

      try {

        const [userResponse, postsResponse] = await Promise.all([
          fetch(`/api/artists/${UserId}`),
          fetch(`/api/post/user/${UserId}`)
        ]);


        const userData = await userResponse.json();
        const postsData = await postsResponse.json();


        if(userData.success){
          setUser(userData.artist);
        }


        if(postsData.success){
          setPosts(postsData.posts);
        }


      } catch(error){

        console.error(
          "Profile loading error:",
          error
        );

      } finally {
        setLoading(false);
      }

    };


    fetchData();


  }, [UserId]);



  return (

    <div className="space-y-5">


      {loading ? <ProfileBarSkeleton /> : <ProfileBar User={user}/>}



      <div
        className="
        grid 
        xl:grid-cols-4
        lg:grid-cols-3
        md:grid-cols-2
        grid-cols-2
        md:gap-5
        gap-3
        w-full
        "
      >


      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10  h-64 sm:h-80 md:h-100 w-full" />
        ))
      ) : posts.length === 0 ? (
        <div className="col-span-full py-16 px-4 text-center border border-dashed border-neutral-300 dark:border-neutral-700  bg-white/5">
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">No artworks or poems published yet.</p>
        </div>
      ) : (
        posts.map((post)=>{


          return (

          <div key={post._id} className="relative group overflow-hidden">
            <Link
              href={`/Art/${post._id}`}
              className="block h-full"
            >


          {
            post.type === "art" ? (

              <div
                className="
                overflow-hidden
                bg-(--colorbg)
                border
                border-(--border)
                h-64 sm:h-80 md:h-100
                "
              >

                <img
                  src={post.media?.url}
                  alt={post.title}
                  className="
                  object-cover
                  h-full
                  w-full
                  "
                />

              </div>


            ) : (


              <div
                className="
                h-64 sm:h-80 md:h-100
                border
                border-(--border)
                p-5
                flex
                flex-col
                justify-center
                overflow-hidden
                "
                style={{
                  backgroundColor:
                    post.poemStyle?.backgroundColor || "#fff",
                  color:
                    post.poemStyle?.fontColor || "#000",
                  fontFamily:
                    post.poemStyle?.fontFamily || "Georgia"
                }}
              >


                <h2
                  className="
                  font-bold
                  text-xl
                  mb-4
                  "
                >
                  {post.title}
                </h2>



                <p
                  className="
                  line-clamp-8
                  whitespace-pre-line
                  "
                  style={{
                    fontSize:
                      post.poemStyle?.fontSize || "16px"
                  }}
                >
                  {post.body}
                </p>


              </div>


            )

          }


          </Link>

            {currentUser?._id === UserId && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingPost(post);
                    setEditTitle(post.title || "");
                    setEditBody(post.body || "");
                  }}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <IoPencil size={16} />
                </button>
              </div>
            )}
          </div>
        );
        })
      )}


      </div>

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit {editingPost.type === "poem" ? "Poem" : "Post"}</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#3B5D95] transition-colors"
                />
              </div>
              {editingPost.type === "poem" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Body</label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={6}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#3B5D95] transition-colors resize-none"
                  />
                </div>
              )}
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-black/20">
              <button
                onClick={() => setEditingPost(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editTitle.trim()) return toast.error("Title is required");
                  if (editingPost.type === "poem" && !editBody.trim()) return toast.error("Body is required");
                  
                  setSaving(true);
                  try {
                    const res = await fetch(`/api/post/${editingPost._id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: editTitle.trim(),
                        ...(editingPost.type === "poem" && { body: editBody.trim() })
                      })
                    });
                    
                    if (res.ok) {
                      toast.success("Post updated successfully");
                      setPosts(posts.map(p => p._id === editingPost._id ? { ...p, title: editTitle.trim(), body: editingPost.type === "poem" ? editBody.trim() : p.body } : p));
                      setEditingPost(null);
                    } else {
                      toast.error("Failed to update post");
                    }
                  } catch (e) {
                    toast.error("Something went wrong");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-semibold bg-[#3B5D95] text-white hover:bg-[#2d4a78] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>

  );
}


export default Page;