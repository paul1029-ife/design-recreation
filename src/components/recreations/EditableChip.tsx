import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Pencil } from "lucide-react";

const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 22,
};

const iconVariants = {
  initial: { scale: 0, opacity: 0, filter: "blur(6px)" },
  animate: { scale: 1, opacity: 1, filter: "blur(0px)" },
  exit: { scale: 0, opacity: 0, filter: "blur(6px)" },
};

export default function EditableChip() {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("");
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(draft.length, draft.length);
    }
  }, [isEditing]);

  const handleEdit = () => {
    setDraft(label);
    setIsEditing(true);
  };

  const handleConfirm = () => {
    setLabel(draft.trim() || label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        animate={{
          width: isEditing ? 260 : 190,
          backgroundColor: isEditing ? "#ffffff" : "#efefef",
          boxShadow: isEditing
            ? "0 0 0 2.5px #1a1a1a"
            : "0 2px 10px rgba(0,0,0,0.08)",
        }}
        transition={spring}
        className="flex items-center gap-2 rounded-full px-2 py-2 overflow-hidden"
        style={{ willChange: "transform, width" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isEditing ? (
            <motion.input
              key="input"
              ref={inputRef}
              autoFocus
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-[#1a1a1a] text-lg font-medium ml-3 min-w-0"
            />
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex-1 text-[#888] text-lg font-medium ml-3 select-none whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          {isEditing ? (
            <motion.button
              key="confirm"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={spring}
              onClick={handleConfirm}
              className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label="Confirm"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            </motion.button>
          ) : (
            <motion.button
              key="edit"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={spring}
              onClick={handleEdit}
              className="w-10 h-10 rounded-full bg-[#e2e2e2] flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label="Edit"
            >
              <Pencil className="w-4 h-4 text-[#888]" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
