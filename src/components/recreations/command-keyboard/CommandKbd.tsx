"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { commands } from "../../../constants/commands";

type Command = {
  id: string | number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string[];
};

type CollapsedSearchProps = {
  onClick: () => void;
};

export function CollapsedSearch({ onClick }: CollapsedSearchProps) {
  return (
    <motion.div
      layoutId="main-container"
      style={{ borderRadius: 30 }}
      className="bg-surface relative w-full sm:w-[350px]"
    >
      <motion.button
        onClick={onClick}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface cursor-text rounded-[30px] shadow-sm border border-border hover:shadow-md transition-shadow duration-200 focus:outline-none "
      >
        <motion.div
          layoutId="search-text"
          className="gap-2 items-center inline-flex"
        >
          <Search className="w-4 h-4 text-content-subtle flex-shrink-0" />
          <motion.span className="text-sm text-content-subtle truncate">
            Search for anything
          </motion.span>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

type ExpandedSearchProps = {
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

export function ExpandedSearch({
  onClose,
  searchQuery,
  setSearchQuery,
}: ExpandedSearchProps) {
  // Derived state, not synchronised state. Mirroring this into useState via an
  // effect cost an extra render on every keystroke and could show a stale list
  // for one frame.
  const filteredCommands = useMemo<Command[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === "") return commands;
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <motion.div
      layoutId="main-container"
      style={{ borderRadius: 30 }}
      className="bg-surface relative w-full sm:w-[640px] shadow-lg overflow-hidden"
    >
      <motion.div
        layout
        className="flex items-center gap-3 px-4 py-3 border-b mx-3 border-border"
      >
        <Search className="w-4 h-4 text-content-subtle flex-shrink-0" />
        <input
          type="text"
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search commands..."
          className="flex-1 outline-none text-sm text-content-muted placeholder-content-subtle min-w-0"
        />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.19 }}
          onClick={onClose}
          className="p-1 hover:bg-surface-subtle rounded transition-colors flex-shrink-0"
        ></motion.button>
      </motion.div>

      <div className="max-h-96 overflow-y-auto relative scrollbar-hide">
        <div className="px-3 py-2">
          <motion.div
            layout="position"
            className="text-xs font-medium text-content-subtle uppercase tracking-wider px-3 py-1.5"
          >
            Suggestions
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredCommands.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-8 text-center text-sm text-content-subtle"
              >
                No commands found
              </motion.div>
            ) : (
              <motion.div
                layout="preserve-aspect"
                className="space-y-0.5 min-h-10"
              >
                {filteredCommands.map((cmd) => (
                  <CommandItem key={cmd.id} command={cmd} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface to-transparent pointer-events-none z-30 rounded-b-[30px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </motion.div>
  );
}

type CommandItemProps = {
  command: Command;
};

export function CommandItem({ command }: CommandItemProps) {
  const Icon = command.icon;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center w-full justify-between gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-surface-subtle/80 group transition-colors duration-200"
    >
      <motion.div className="flex items-center gap-3 flex-1">
        <Icon className="w-4 h-4 text-content-subtle flex-shrink-0" />
        <span className="text-sm font-medium text-content leading-5">
          {command.label}
        </span>
      </motion.div>

      {command.shortcut.map((key, idx) => (
        <kbd
          key={idx}
          className="inline-flex items-center justify-center rounded border border-border bg-surface-subtle/60 font-medium text-content-muted w-4 h-4 text-xs leading-5"
        >
          {key}
        </kbd>
      ))}
    </motion.button>
  );
}
