import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ModalProps } from "../../types";

const Modal = ({ isOpen, onClose, component: Component, name }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-white rounded-2xl h-3/4 shadow-xl max-w-4xl w-full mx-2 md:mx-4 overflow-scroll scrollbar-hide border border-gray-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-black">{name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-black transition-colors ease-in duration-250"
              >
                <X size={22} />
              </button>
            </div>

            {/* Component Display */}
            <div className="p-8 flex items-center justify-center min-h-[400px]">
              {Component && <Component />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
