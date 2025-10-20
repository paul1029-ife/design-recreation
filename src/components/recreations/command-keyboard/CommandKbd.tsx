import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const CommandKbd = () => {
  const [isOpened, setIsOpened] = useState(false);
  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.keyCode === 75) {
        setIsOpened(true);
      }
    });
  }, []);
  return (
    <div className="w-full p-10 flex items-center justify-center">
      <div className="w-80 h-2">
        <AnimatePresence mode="wait">
          {isOpened ? (
            <motion.input
              layoutId="input-field"
              className="bg-white w-full px-2 py-1 rounded-xl focus:outline-none text-black"
              placeholder="Enter you text"
            />
          ) : (
            <motion.input
              layoutId="input-field"
              className="bg-white w-50 px-2 py-1 rounded-xl focus:outline-none text-black"
              placeholder="Enter you text"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommandKbd;
