import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { HugeiconsArrowTurnBackward } from "../icons/TurnBackwards";

interface ElasticTransitionType {
  type: "spring";
  damping: number;
  stiffness: number;
  restDelta: number;
}
const elasticTransition: ElasticTransitionType = {
  type: "spring",
  damping: 15,
  stiffness: 100,
  restDelta: 0.001,
};

const characterVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 5 },
};

const DeleteTimeout = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isDeleting) {
      const deleteTimeoutId = setTimeout(() => {
        setIsDeleted(true);
        setIsDeleting(false);
      }, 10000);

      setCountdown(10);
      const countdownIntervalId = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount > 0) {
            return prevCount - 1;
          }
          return 0;
        });
      }, 1000);

      return () => {
        clearTimeout(deleteTimeoutId);
        clearInterval(countdownIntervalId);
      };
    }
  }, [isDeleting]);

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const handleCancel = () => {
    setIsDeleting(false);
  };

  const renderStaggeredText = (text: string) =>
    text.split("").map((char, i) => (
      <motion.span
        key={char + i}
        variants={characterVariants}
        transition={{ ...elasticTransition, delay: i * 0.02 }}
      >
        {char === " " ? "\u00A0" : char}{" "}
      </motion.span>
    ));

  return (
    <div
      className="flex items-center justify-center p-16 min-h-[150px]"
      style={{ fontFamily: "Some-Sans" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {!isDeleted && !isDeleting && (
          <motion.button
            key="delete-button"
            onClick={handleDelete}
            style={{ borderRadius: "9999px" }}
            className="bg-red-500 text-white px-4 h-[50px] cursor-pointer font-semibold overflow-hidden"
            layout
            layoutId="delete-button"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1, backgroundColor: "#fb2c36" }}
            exit={{ opacity: 0, scale: 0.7, backgroundColor: "#fef2f2" }}
            transition={elasticTransition}
          >
            <motion.span
              className="flex will-change-transform"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStaggeredText("Delete Account")}
            </motion.span>
          </motion.button>
        )}

        {isDeleting && (
          <motion.div
            key="cancel-div"
            onClick={handleCancel}
            style={{ borderRadius: "9999px" }}
            className="flex items-center gap-3 bg-red-50/70 text-red-600 px-3 h-[50px] cursor-pointer overflow-hidden"
            layout
            layoutId="delete-button"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={elasticTransition}
          >
            <span className="bg-red-500 rounded-full text-white p-1.5 flex-shrink-0">
              {" "}
              <HugeiconsArrowTurnBackward className="size-5 font-medium rotate-x-180" />
            </span>
            <motion.span
              className="flex will-change-transform w-28"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStaggeredText("Cancel Delete")}
            </motion.span>

            <motion.span
              className="relative rounded-full bg-red-500 text-white w-9 h-7 flex items-center justify-center text-sm font-semibold flex-shrink-0 will-change-transform"
              style={{ transform: "translateZ(0)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={countdown}
                  initial={{ opacity: 0, y: -7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 7 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </motion.div>
        )}

        {isDeleted && (
          <motion.div
            key="deleted-message"
            className="text-gray-800 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Item successfully deleted.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeleteTimeout;
