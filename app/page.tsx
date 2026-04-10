import Image from "next/image";
import i1 from "../public/images/i1.png";
import i2 from "../public/images/i2.png";
import i3 from "../public/images/i3.png";
import i4 from "../public/images/i4.png";
import i5 from "../public/images/i5.png";
import i6 from "../public/images/i6.png";
import i7 from "../public/images/i7.png";
import i8 from "../public/images/i8.png";

const images = [i1, i2, i3, i4, i5, i6, i7,  i6, i7,  , i8 ,i1, i2, i3, i4, i5];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center  pt-5  justify-center font-sans px-30 w-full">
      {/* Pinterest-style Column Layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-10 space-y-10 w-full mx-auto">
        {images.map((img, idx) => (
          <div key={idx} className="break-inside-avoid">
            <Image
              src={img}
              alt={`Bird ${idx + 1}`}
              className="w-full h-auto  object-cover hover:opacity-90 transition-opacity cursor-zoom-in"
              placeholder="blur" // Optional: gives that smooth loading feel
            />
          </div>
        ))}
      </div>
    </div>
  );
}
