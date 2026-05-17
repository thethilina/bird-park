import type { Metadata } from "next";
import SubmitworkNav from "@/public/components/Profile/SubmitworkNav";

export const metadata: Metadata = {
  title: "Bird Park",
  description: "For artists, by artists. A social media platform for sharing and discovering art.",
};

export default function SubmitworkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-1">
        <div className="flex-1">
          <SubmitworkNav />
          {children}
        </div>
      </div>
    </div>
  );
}
