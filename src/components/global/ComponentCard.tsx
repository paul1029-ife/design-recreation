import { motion } from "motion/react";

interface ComponentCardProps {
  name: string;
  source: string;
  url: string;
  onClick: () => void;
}

const ComponentCard = ({ name, source, url, onClick }: ComponentCardProps) => {
  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      onClick={onClick}
      className="group relative bg-[#fcfcfc] rounded-2xl overflow-hidden"
      whileHover="hover"
      initial="initial"
      variants={{
        initial: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
        hover: {
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          y: -4,
        },
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        variants={{
          initial: { x: "-200%" },
          hover: { x: "200%" },
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <div className="relative p-8 flex flex-col justify-between min-h-[220px]">
        <div className="space-y-4">
          <motion.div
            variants={{
              initial: { y: 0 },
              hover: { y: -2 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <h3 className="text-2xl font-medium text-gray-900 tracking-tight leading-tight">
              {name}
            </h3>
          </motion.div>

          <motion.button
            onClick={handleSourceClick}
            className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-900 transition-colors w-fit group/link"
            variants={{
              initial: { opacity: 0.7 },
              hover: { opacity: 1 },
            }}
          >
            <motion.div
              className="flex items-center gap-1.5"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-medium">@{source}</span>
              <svg
                className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </motion.div>
          </motion.button>
        </div>

        <motion.div
          className="flex items-center justify-between pt-6 border-t border-gray-100"
          variants={{
            initial: { opacity: 0.5 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Preview
          </span>
          <motion.div
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300"
            variants={{
              initial: { x: 0 },
              hover: { x: 4 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
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
        className="absolute inset-0 rounded-2xl border border-gray-900 pointer-events-none"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 0.1 },
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default ComponentCard;
