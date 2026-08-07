"use client";

import {
  Plus,
  Folder,
  CheckSquare,
  FileText,
  Trophy,
  Flag,
  Bell,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const options = [
  { label: "Project", icon: Folder },
  { label: "Task", icon: CheckSquare },
  { label: "Note", icon: FileText },
  { label: "Goal", icon: Trophy },
  { label: "Milestone", icon: Flag },
  { label: "Reminder", icon: Bell },
];

export default function OptionsMenu() {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <div className="flex w-full items-center justify-center p-20">
      <AnimatePresence mode="popLayout">
        {!menuOpened ? (
          <motion.button
            key="button"
            layoutId="container"
            onClick={() => setMenuOpened(true)}
            className="flex items-center gap-1 bg-surface-subtle px-3 py-2 shadow-sm border-[3px] border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 20,
            }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.21 } }}
            >
              <Plus size={18} />
            </motion.span>

            <motion.span
              layoutId="create-text"
              className="text-sm font-medium"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
            >
              Create New
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="menu"
            layoutId="container"
            className="w-[260px] bg-surface-subtle pt-2 shadow-md border-[3px] border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 20,
            }}
          >
            <div className="flex items-center justify-between px-3">
              <motion.span
                layoutId="create-text"
                className="text-sm font-medium"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
              >
                Create New
              </motion.span>

              <X
                onClick={() => setMenuOpened(false)}
                className="text-xs bg-border-strong rounded-full p-0.5 size-5 text-accent-content cursor-pointer"
              />
            </div>

            <motion.div
              className="mt-2 grid grid-cols-3 gap-4 rounded-xl p-2 bg-surface"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.04,
                  },
                },
              }}
            >
              {options.map(({ label, icon: Icon }) => (
                <motion.div
                  key={label}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-lg p-2 hover:bg-surface-subtle text-content-muted will-change-transform"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon size={20} />
                  <span className="text-xs">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
