import Image from "next/image";
import Gallery from "@/public/components/Gallery";
import { shuffledFeedDatabase } from "@/TestDataBase/artData";
import Buttonwhite from "@/public/components/Tn/Buttonwhite";
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center  pt-5  justify-center font-sans px-2  w-full">
    
      <Gallery artbase = {shuffledFeedDatabase} />
    
    </div>
  );
}
