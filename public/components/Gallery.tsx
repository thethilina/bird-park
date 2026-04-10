import React from 'react';
import Image from 'next/image';

function Gallery({ artbase }: any) {
  return (
    <div className="w-full">
      <div className="columns-2 sm:columns-2 gap-2 space-y-2 md:columns-3 lg:columns-2 xl:columns-4 lg:gap-5 lg:space-y-5 w-full">
        {artbase.map((art: any) => (
          art.category === "poem" ? <div key={art.id} className="break-inside-avoid p-5 rounded-md gap-y-5 text-center flex flex-col items-center justify-center " style={{ backgroundColor: art.backgroundColor, color: art.textColor ,fontFamily: art.font}}>


            <h2 className="lg:text-2xl font-bold mb-2">{art.title}</h2>
            <p className="lg:text-lg mb-4 ">{art.content}</p>
          </div> :

          



           <div key={art.id} className="break-inside-avoid">
            <Image 
              src={art.image} 
              alt={art.title} 
              width={500}
              height={500}
              className="hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;