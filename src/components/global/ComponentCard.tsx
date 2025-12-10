import React from "react";
import { motion } from "framer-motion";

interface ComponentCardProps {
  name: string;
  source: string;
  url: string;
  onClick: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  name,
  source,
  url,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="group w-full text-left bg-[#e9ecef] hover:bg-[#ced4da] p-3 rounded-sm"
      style={{
        fontFamily: "Some-Sans",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Text content */}
      <div className="flex flex-col gap-1">
        <motion.h3
          className="text-[#212529] font-normal text-base"
          transition={{ duration: 0.2 }}
        >
          {name}
        </motion.h3>
        <motion.p
          className="text-[#6c757d] text-sm leading-relaxed"
          transition={{ duration: 0.2 }}
        >
          Inspired by{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="underline hover:text-[#212529] transition-colors"
          >
            {source}
          </a>
        </motion.p>
      </div>
    </motion.button>
  );
};

export default ComponentCard;
