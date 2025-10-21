import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
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
    <AnimatePresence mode="wait">
      <motion.div
        layoutId="main-container"
        className="bg-white rounded-lg shadow-xl overflow-hidden relative"
      >
        <motion.button
          layoutId="search-container"
          onClick={onClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-text"
          style={{ width: 360 }}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <motion.span
            layoutId="search-text"
            className="text-sm text-gray-400"
            layout-id="search-placeholder"
          >
            Search for anything
          </motion.span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
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
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCommands(commands);
    } else {
      const filtered = commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommands(filtered);
    }
  }, [searchQuery]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layoutId="main-container"
        className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden relative"
        style={{ width: 640 }}
      >
        <motion.div
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
          layoutId="search-container"
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <motion.input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            layout-id="search-placeholder"
            placeholder="search commands..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </motion.div>

        <div className="max-h-96 overflow-y-auto relative scrollbar-hide">
          <div className="px-3 py-2">
            <motion.div
              layout="position"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-1.5"
            >
              Suggestions
            </motion.div>

            {filteredCommands.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-400">
                No commands found
              </div>
            ) : (
              <div className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {filteredCommands.map((cmd) => (
                    <CommandItem key={cmd.id} command={cmd} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl z-30" />
      </motion.div>
    </AnimatePresence>
  );
}

type CommandItemProps = {
  command: Command;
};

function CommandItem({ command }: CommandItemProps) {
  const Icon = command.icon;

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors group hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-md">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm text-gray-700">{command.label}</span>
      </div>

      <div className="flex items-center gap-0.5">
        {command.shortcut.map((key, idx) => (
          <kbd
            key={idx}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded"
          >
            {key}
          </kbd>
        ))}
      </div>
    </motion.button>
  );
}
