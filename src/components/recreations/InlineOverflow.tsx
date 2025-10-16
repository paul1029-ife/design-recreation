import { MoreHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const InlineOverflow = () => {
  const [isFull, setIsFull] = useState(false);

  const handleClick = () => {
    setIsFull(!isFull);
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 gap-8 "
      style={{ fontFamily: "Some-Sans" }}
    >
      <motion.div className="rounded-full bg-stone-100 flex gap-1.5 px-2 py-1.5 items-center">
        <div className="px-3 py-2 rounded-full bg-white">Save</div>
        <div className="px-3 py-2 rounded-full bg-white">Copy</div>
        <AnimatePresence mode="wait">
          {isFull && (
            <motion.div
              className="flex gap-1.5 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              exit={{
                width: 0,
                marginLeft: -12,
                marginRight: -12,
                transition: {
                  type: "spring",
                  mass: 1,
                  stiffness: 958,
                  damping: 60,
                },
              }}
              transition={{
                type: "spring",
                bounce: 0.35,
                duration: 0.8,
              }}
            >
              <motion.div
                className="px-3 py-2 rounded-full bg-white whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.16,
                    duration: 0.2,
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                Share
              </motion.div>
              <motion.div
                className="px-3 py-2 rounded-full bg-white whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.16,
                    duration: 0.2,
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                Delete
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className="bg-white rounded-full size-8 flex items-center justify-center hover:text-gray-500 text-gray-900 transition-colors"
          onClick={handleClick}
        >
          {isFull ? <X size={20} /> : <MoreHorizontal size={20} />}
        </button>
      </motion.div>
    </div>
  );
};

export default InlineOverflow;
