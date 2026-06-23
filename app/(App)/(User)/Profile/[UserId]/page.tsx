"use client";

import ProfileBar from "@/public/components/ProfileBar";
import Gallery from "@/public/components/Gallery";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function Page() {
  const { UserId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/artists/${UserId}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data.artist);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/post/user/${UserId}`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        if (data.success) setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (UserId) {
      fetchUser();
      fetchPosts();
    }
  }, [UserId]);

  return (
    <div className="space-y-5">
      <ProfileBar User={user} />
      {loading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--border)" />
        </div>
      ) : (
        <Gallery posts={posts} />
      )}
    </div>
  );
}

export default Page;