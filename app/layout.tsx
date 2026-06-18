import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/public/components/NavBar";
import { AuthProvider } from "@/contexts/AuthContext";
import NextTopLoader from 'nextjs-toploader';


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
  description:
    "For artists, by artists. A social media platform for sharing and discovering art.",
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
      <head />
      <body className="min-h-full flex flex-col ">
        <div className="flex flex-1">
          <div className="flex-1">
                    <AuthProvider>
        <NextTopLoader  color = "#F852B5"   showSpinner={false}   shadow="0 0 10px #2299DD,0 0 5px #2299DD"

/>

            {children}
            </AuthProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
