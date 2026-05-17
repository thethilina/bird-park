import type { Metadata } from "next";
import CircleSideBar from "@/public/components/CircleSideBar";
import CircleBar from "@/public/components/CircleBar";

export const metadata: Metadata = {
  title: "Bird Park",
  description: "For artists, by artists. A social media platform for sharing and discovering art.",
};

export default function CircleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-1">
        <CircleSideBar />
        <div className="flex-1">
          <CircleBar />
          {children}
        </div>
      </div>
    </div>
  );
}
