import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/public/components/NavBar";
import { AuthProvider } from "@/contexts/AuthContext";
import NextTopLoader from 'nextjs-toploader';
import { ToastContainer } from "react-toastify";
import ServiceWorkerRegister from "./sw-register";

console.log("ROOT LAYOUT LOADED");

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
  description: "A sanctuary for artists.",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
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

/>   <ToastContainer
          style={{ zIndex: 999999 }}
        />
  <ServiceWorkerRegister />

            {children}
            </AuthProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
