"use client";

import ProfileBar from "@/public/components/ProfileBar";
import Gallery from "@/public/components/Gallery";
import { shuffledFeedDatabase } from "@/TestDataBase/artData";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function Page() {
  const { UserId } = useParams();
  const [user, setUser] = useState<any>(null);









  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/artists/${UserId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data.artist);
      } catch (error) {
        console.error("An error occurred while fetching user data:", error);
      }
    };

    if (UserId) {
      fetchUser();
    }
  }, []);

  return (
    <div className="space-y-5">
      <ProfileBar User={user} />
      <Gallery
        artbase={shuffledFeedDatabase.filter(
          (a) => a.userId === Number(UserId)
        )}
      />
    </div>
  );
}

export default Page;