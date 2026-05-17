import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bird Park",
  description: "For artists, by artists. A social media platform for sharing and discovering art.",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-1">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
