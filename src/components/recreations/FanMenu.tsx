"use client";

import { BookA, PiIcon, Music, Video, Image as ImageIcon, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

const FanMenu = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const menuItems = [
        { label: "Learning", icon: <BookA className="w-5 h-5" /> },
        { label: "Document", icon: <PiIcon className="w-5 h-5" /> },
        { label: "Music", icon: <Music className="w-5 h-5" /> },
        { label: "Video", icon: <Video className="w-5 h-5" /> },
        { label: "Image", icon: <ImageIcon className="w-5 h-5" /> },
    ]

    return (
        <div className="flex w-full items-end justify-center px-40 py-20 min-h-[580px] relative">
            <div className="relative flex justify-center">
                <div className="absolute bottom-[calc(100%+16px)] flex flex-col items-center gap-2.5">
                    <AnimatePresence>
                        {isExpanded && menuItems.map((item, index) => {
                            const reverseIndex = menuItems.length - 1 - index;
                            const xValue = reverseIndex * -32 - 4;
                            const rotateValue = reverseIndex * -4 - 4;

                            return (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20, x: 0, rotate: 0 }}
                                    animate={{ opacity: 1, y: 0, x: xValue, rotate: rotateValue }}
                                    exit={{ opacity: 0, y: 20, x: 0, rotate: 0 }}
                                    transition={{ duration: 0.2, delay: reverseIndex * 0.03 }}
                                    className="flex items-center gap-3 bg-surface rounded-2xl cursor-pointer shadow-sm px-4 py-2.5 font-medium text-content-muted whitespace-nowrap"
                                >
                                    {item.icon}
                                    {item.label}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileTap={{ scale: 1.05 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-surface flex items-center justify-center rounded-full w-12 h-12 shadow-sm relative z-10"
                    animate={{ rotate: isExpanded ? 45 : 0 }}
                >
                    <Plus className="w-6 h-6 text-content-muted" />
                </motion.button>

            </div>
        </div>
    )
}

export default FanMenu