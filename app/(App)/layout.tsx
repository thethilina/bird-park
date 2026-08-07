import type { Metadata } from "next";
import "../globals.css";
import NavBar from "@/public/components/NavBar";

export const metadata: Metadata = {
  title: "Bird Park",
  description: "A sanctuary for artists.",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1">
      <div className="flex-1">
        <NavBar />
        <div className="xl:px-15 lg:px-10 md:px-5 sm:px-2 ">
          {children}
        </div>
      </div>
    </div>
  );
}