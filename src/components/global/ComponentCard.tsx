import { motion } from "framer-motion";

interface ComponentCardProps {
  name: string;
  source: string;
  onClick: () => void;
}

const ComponentCard = ({ name, source, onClick }: ComponentCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl cursor-pointer overflow-hidden"
      whileHover="hover"
      initial="initial"
      variants={{
        initial: { scale: 1 },
        hover: { scale: 1.02 },
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={{
          initial: { x: "-100%" },
          hover: { x: "100%" },
        }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />

      <div className="relative p-6 flex flex-col justify-between min-h-[200px]">
        <div className="space-y-3">
          <motion.h3
            className="text-xl font-semibold text-gray-900 tracking-tight"
            variants={{
              initial: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ duration: 0.3 }}
          >
            {name}
          </motion.h3>

          <motion.div
            className="flex items-center gap-1 text-sm text-gray-600"
            variants={{
              initial: { opacity: 0.7 },
              hover: { opacity: 1 },
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="font-medium">@{source}</span>
          </motion.div>
        </div>

        <motion.div
          className="flex items-center justify-between mt-8"
          variants={{
            initial: { opacity: 0.5, y: 0 },
            hover: { opacity: 1, y: -2 },
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Preview
          </span>
          <motion.div
            variants={{
              initial: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-gray-900 pointer-events-none"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 0.05 },
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default ComponentCard;
