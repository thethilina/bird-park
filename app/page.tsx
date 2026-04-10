import Image from "next/image";
import Gallery from "@/public/components/Gallery";
import { artDatabase } from "@/TestDataBase/artData";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center  pt-5  justify-center font-sans px-2 lg:px-30 w-full">
      <Gallery artbase = {artDatabase} />

    </div>
  );
}
