import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CollapsedSearch, ExpandedSearch } from "./CommandKbd";

export default function CommandPalette() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = (): void => {
    setIsExpanded(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
      }
      if (e.key === "Escape" && isExpanded) {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="flex items-start h-[460px] justify-center w-[670px] pt-8">
      <div ref={containerRef}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <CollapsedSearch
              key="collapsed"
              onClick={() => setIsExpanded(true)}
            />
          ) : (
            <ExpandedSearch
              key="expanded"
              onClose={handleClose}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
