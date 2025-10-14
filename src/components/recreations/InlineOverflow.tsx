import { MoreHorizontalIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const InlineOverflow = () => {
  const [isFull, setIsFull] = useState(false);
  const handleClick = () => {
    setIsFull(!isFull);
  };
  return (
    <div
      className="flex items-center justify-center p-4"
      style={{ fontFamily: "Some-Sans" }}
    >
      <motion.div className="rounded-full bg-gray-100 flex gap-2 px-2 py-1.5 items-center">
        <div className="p-2 rounded-full bg-white Save">Save</div>
        <div className="p-2 rounded-full bg-white Copy">Copy</div>
        <AnimatePresence mode="wait">
          {isFull && (
            <div className="flex gap-2">
              <div className="p-2 rounded-full bg-white ">Share</div>
              <div className="p-2 rounded-full bg-white ">Delete</div>
            </div>
          )}
        </AnimatePresence>
        <motion.button
          className="bg-gray-200 rounded-full size-8 flex items-center justify-center"
          onClick={handleClick}
        >
          {isFull ? <XIcon /> : <MoreHorizontalIcon />}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InlineOverflow;
