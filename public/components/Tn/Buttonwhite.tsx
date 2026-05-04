"use client"
import React from 'react'

function Buttonwhite({ text, onClick }: { text: any; onClick: any }) {
  return (
    <button className='dark:bg-[#f1f1f1] border text-[#fff]  bg-[#373753]  dark:text-[#080808] lg:text-xl py-1 px-3 rounded-full' onClick={onClick}>
      {text}
    </button>
  )
}

export default Buttonwhite