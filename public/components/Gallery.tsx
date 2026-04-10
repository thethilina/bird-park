import React from 'react';
import Image from 'next/image';

function Gallery({ artbase }: any) {
  return (
    <div className="w-full">
      <div className="columns-2 sm:columns-2 gap-2 space-y-2 md:columns-3 lg:columns-4 lg:gap-10 lg:space-y-10 w-full">
        {artbase.map((art: any) => (
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