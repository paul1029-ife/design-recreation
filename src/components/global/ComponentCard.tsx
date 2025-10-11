import { motion } from "framer-motion";
import type { ComponentCardProps } from "../..//types";
const ComponentCard = ({ name, source, onClick }: ComponentCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.24 }}
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between p-6 min-h-[200px]"
  >
    <div>
      <h3 className="text-lg font-semibold text-black mb-1">{name}</h3>
      <p className="text-sm text-gray-500">Inspired by {source}</p>
    </div>
    <div className="text-gray-400 text-xs mt-4 italic">Click to preview</div>
  </motion.div>
);

export default ComponentCard;
