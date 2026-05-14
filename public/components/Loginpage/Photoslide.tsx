"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion"

function Photoslide({ artdata }: any) {

  const emotions: string[] = [
    "joy", "sadness", "anger", "fear", "love", "hate", "envy", "jealousy",
    "guilt", "shame", "hope", "despair", "loneliness", "excitement",
    "anxiety", "nostalgia", "grief", "relief", "confusion", "curiosity",
    "admiration", "disgust", "frustration", "pride", "embarrassment",
    "compassion", "sympathy", "trust", "betrayal", "contentment",
    "boredom", "wonder", "panic", "calmness", "euphoria", "melancholy",
    "affection", "resentment", "determination", "regret", "insecurity",
    "motivation", "awe", "bitterness", "peace", "passion", "irritation",
    "tension", "vulnerability", "serenity"
  ]

  const [layout, setLayout] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setLayout((p) => (p + 1) % 3)
    }, 10000)

    return () => clearInterval(t)
  }, [])

  const item = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.8 }
  }

  const renderLayout = () => {
    if (layout === 0) {
      return (
        <div className='flex w-150 h-150 gap-2'>
          <div className='space-y-2 w-1/2'>
            <motion.div {...item} className="h-6/10"><Image src={artdata[0].cover} alt='art' width={500} height={500} className='w-full h-full object-cover ' /></motion.div>
            <motion.div {...item} transition={{ delay: 0.1 }} className="h-4/10"><Image src={artdata[1].cover} alt='art' width={500} height={500} className='w-full h-full object-cover ' /></motion.div>
          </div>
          <div className='space-y-2 w-1/2'>
            <motion.div {...item} transition={{ delay: 0.2 }} className="h-4/10"><Image src={artdata[2].cover} alt='art' width={500} height={500} className='w-full h-full object-cover ' /></motion.div>
            <motion.div {...item} transition={{ delay: 0.3 }} className="h-6/10"><Image src={artdata[3].cover} alt='art' width={500} height={500} className='w-full h-full object-cover ' /></motion.div>
          </div>
        </div>
      )
    }

    if (layout === 1) {
      return (
        <div className=' w-150 h-150 flex flex-col gap-2 '>
          <div className='flex space-x-2 h-1/2'>
            <motion.div {...item} className="w-6/10"><Image src={artdata[4].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
            <motion.div {...item} transition={{ delay: 0.1 }} className="w-4/10"><Image src={artdata[5].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
          </div>
          <div className='flex space-x-2 h-1/2'>
            <motion.div {...item} transition={{ delay: 0.2 }} className="w-4/10"><Image src={artdata[6].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
            <motion.div {...item} transition={{ delay: 0.3 }} className="w-6/10"><Image src={artdata[7].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
          </div>
        </div>
      )
    }

    return (
      <div className=' w-150 h-150 flex flex-col gap-2 '>
        <div className='flex space-x-2 h-1/2'>
          <motion.div {...item} className="w-3/10"><Image src={artdata[8].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
          <motion.div {...item} transition={{ delay: 0.1 }} className="w-7/10"><Image src={artdata[9].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
        </div>
        <div className='flex space-x-2 h-1/2'>
          <motion.div {...item} transition={{ delay: 0.2 }} className="w-6/10"><Image src={artdata[6].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
          <motion.div {...item} transition={{ delay: 0.3 }} className="w-4/10"><Image src={artdata[0].cover} alt='art' width={500} height={500} className='h-full w-full object-cover ' /></motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-10'>

      {/* IMAGE SECTION */}
      <AnimatePresence mode="wait">
        <div key={layout}>
          {renderLayout()}
        </div>
      </AnimatePresence>

      {/* EMOTION LAYERS - Restricted to w-150 */}
      <div className=" text-ml overflow-hidden w-145">
        {[0, 1, 2].map((row) => (
          <div key={row} className="whitespace-nowrap flex gap-6">
            <motion.div
              className="flex gap-6"
              animate={{
                x: row % 2 === 0 ? ["0%", "-50%"] : ["-50%", "0%"]
              }}
              transition={{
                duration: 250, // Very slow movement
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...emotions, ...emotions, ...emotions].map((e, i) => (
                <span key={i} className="opacity-70">
                  {e}
                </span>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Photoslide