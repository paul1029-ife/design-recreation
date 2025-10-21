import { useEffect, useRef, useState, type JSX } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { CollapsedSearch, ExpandedSearch } from "./CommandKbd";

export default function CommandPalette(): JSX.Element {
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
    <div className="h-screen flex items-start justify-center">
      <div ref={containerRef}>
        <LayoutGroup>
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
        </LayoutGroup>
      </div>
    </div>
  );
}
