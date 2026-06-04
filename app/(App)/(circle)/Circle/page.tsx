import React from 'react'
import Gallery from '@/public/components/Gallery'
import { shuffledFeedDatabase } from '@/TestDataBase/artData'





function page() {
  return (
    <div className='pl-75 pt-5'>      <Gallery artbase = {shuffledFeedDatabase} />
</div>
  )
}

export default page