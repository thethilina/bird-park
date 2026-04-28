import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import NavBar from "@/public/components/NavBar";
import ProfileBar from "@/public/components/ProfileBar";
import CircleSideBar from "@/public/components/CircleSideBar";
import CircleBar from "@/public/components/CircleBar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bird Park",
  description: "For artists, by artists. A social media platform for sharing and discovering art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
      </head>
      <body className="min-h-full flex flex-col  ">
    
        <div className="flex flex-1">
          
          <div className="flex-1">
              <NavBar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
