"use client"

import { motion } from "framer-motion"

export default function Loader() {
  return (
    <div className="h-full w-full inset-0 flex items-center justify-center bg-black/30 z-30">
      <motion.div
        className="w-10 h-10 md:w-16 md:h-16 border-4 border-t-blue-500 border-blue-200 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  )
}
