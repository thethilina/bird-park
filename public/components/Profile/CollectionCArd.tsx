import React from 'react'
import Image from 'next/image'

function CollectionCArd({ collection }: any) {
  return (
    <div className='w-full bg-(--colorbg) dark:bg-(--colorbgdark) rounded-lg p-4 space-y-5 cursor-pointer'>

        <Image src={collection.cover} alt='cover' className=' h-8/10 rounded-lg object-cover' />
        <h1 className='text-xl '>{collection.name}</h1>
        

    </div>
  )
}

export default CollectionCArd