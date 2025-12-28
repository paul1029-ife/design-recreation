import { useState } from "react";
import { Globe, ChevronDown, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const PickerInteraction = () => {
  const [isPublic, setIsPublic] = useState(true);
  const [open, setOpen] = useState(false);

  const config = {
    public: {
      label: "Public",
      icon: Globe,
    },
    private: {
      label: "Private",
      icon: Lock,
    },
  };

  const handleSelect = (status: boolean) => {
    setIsPublic(status);
    setOpen(false);
  };

  const currentConfig = isPublic ? config.public : config.private;

  return (
    <div className="flex w-full items-center justify-center p-20">
      <div className="relative inline-block will-change-transform">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 z-10"
            >
              <div className="relative flex items-center gap-1  rounded-full border border-gray-100 bg-gray-50 p-1.5">
                <MenuOption
                  label={config.private.label}
                  Icon={config.private.icon}
                  isActive={!isPublic}
                  position={"left"}
                  onClick={() => handleSelect(false)}
                />

                <MenuOption
                  label={config.public.label}
                  Icon={config.public.icon}
                  isActive={isPublic}
                  position={"right"}
                  onClick={() => handleSelect(true)}
                />

                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-50 rotate-45 " />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          layout
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.87 }}
          className="group relative flex items-center gap-2 rounded-full bg-gray-100 px-4 py-3 text-gray-700 outline-none"
        >
          <div className="flex items-center gap-2 min-w-[80px] justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={isPublic ? "public" : "private"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <currentConfig.icon
                  size={18}
                  className="text-gray-500 mb-0.5"
                  strokeWidth={2.5}
                />
                <span className="font-semibold text-gray-900">
                  {currentConfig.label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <ChevronDown size={16} className="text-gray-500" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

interface MenuOptionProps {
  label: string;
  Icon: React.ComponentType<{ size: number; strokeWidth?: number }>;
  isActive: boolean;
  position: "left" | "right";
  onClick: () => void;
}
const MenuOption = ({
  label,
  Icon,
  isActive,
  position,
  onClick,
}: MenuOptionProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-2 transition-all duration-200 bg-white
      ${isActive ? "text-black" : "text-gray-400 hover:text-gray-600"}
      ${position === "left" ? "rounded-l-full" : "rounded-r-full"}
    `}
  >
    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
    <span
      className={`font-semibold ${isActive ? "text-black" : "text-gray-600"}`}
    >
      {label}
    </span>
  </button>
);

export default PickerInteraction;
