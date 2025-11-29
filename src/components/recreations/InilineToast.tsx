import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

const InlineToast = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div className="flex w-full items-center justify-center p-5">
      <div className="relative flex h-11 w-[196px] items-center justify-center overflow-hidden rounded-full bg-gray-100 shadow-sm">
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ width: "0%", opacity: 1 }}
              animate={{ width: "100%" }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              transition={{ duration: 2, ease: "linear" }}
              className="absolute left-0 top-0 h-full bg-gray-300"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full px-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {!copied ? (
              <motion.div
                key="default"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                  transition: { ease: "easeOut", duration: 0.4 },
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 1.25,
                  transition: { duration: 0.1, ease: "linear" },
                }}
                className="flex w-full items-center justify-between"
              >
                <span className="pl-2 text-md text-gray-500 font-semibold">
                  7B38BD2
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCopied(true)}
                  className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold tex-black shadow-sm"
                >
                  Copy
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  scale: 1,
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 1.25,
                  transition: { duration: 0.1, ease: "linear" },
                }}
                className="flex w-full items-center justify-center gap-1.5"
              >
                <Check
                  className="h-4 w-4 text-white bg-black rounded-full p-0.5 will-change-transform"
                  strokeWidth={2}
                />
                <span className="text-sm font-semibold text-gray-900">
                  Code Copied!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InlineToast;
