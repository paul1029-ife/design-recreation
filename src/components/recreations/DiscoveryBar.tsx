"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type Transition,
  type MotionStyle,
} from "motion/react";
import { HugeiconsFire02 } from "../icons/IconFire";
import { HugeiconsFavourite } from "../icons/IconHeart";

type Tab = "popular" | "favorites";

const DiscoveryBar: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [searchValue, setSearchValue] = useState("");

  const elasticTransition: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 19,
    mass: 1,
  };

  const pillRadius = 28;

  const gpuEase = {
    transform: "translateZ(0)",
    backfaceVisibility: "hidden" as const,
    willChange: "width, transform, opacity",
  };

  const activeTabStyle = {
    background: "linear-gradient(135deg, #ffe5f0 0%, #ffd4e8 100%)",
    boxShadow: "0 2px 8px rgba(255, 105, 180, 0.15)",
    borderRadius: pillRadius,
    ...gpuEase,
  };

  return (
    <LayoutGroup>
      <div className="flex items-center justify-center p-4">
        <div className="relative flex items-center gap-3">
          <motion.div
            initial={false}
            animate={{ width: isSearching ? 250 : 48 }}
            transition={elasticTransition}
            className={`relative flex items-center bg-surface overflow-hidden h-12`}
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              borderRadius: pillRadius,
              ...gpuEase,
            }}
          >
            <motion.button
              layout="position"
              transition={elasticTransition}
              className="flex items-center justify-center w-12 h-12 z-10 flex-shrink-0 mx-auto"
              onClick={() => setIsSearching(!isSearching)}
              whileTap={{ scale: 0.9, filter: "blur(0.8px)" }}
              style={{
                borderRadius: pillRadius,
                ...gpuEase,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-content-muted will-change-transform"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </motion.button>

            {/* Search Input */}
            <AnimatePresence mode="popLayout">
              {isSearching && (
                <motion.input
                  key="search-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-full text-base text-content-muted placeholder-content-subtle bg-transparent border-none outline-none whitespace-nowrap"
                  autoFocus
                  style={gpuEase}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            layout
            transition={elasticTransition}
            className="relative flex items-center bg-surface h-12 overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              borderRadius: pillRadius,
              ...gpuEase,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isSearching ? (
                <motion.button
                  key="close-button"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    ...elasticTransition,
                    duration: 0.2,
                    delay: 0.1,
                  }}
                  onClick={() => {
                    setIsSearching(false);
                    setSearchValue("");
                  }}
                  className="flex items-center justify-center w-12 h-12"
                  whileTap={{ scale: 0.85 }}
                  style={{
                    borderRadius: pillRadius,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-content-muted"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              ) : (
                <motion.div
                  key="discovery-tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 px-1.5"
                  style={gpuEase}
                >
                  <TabButton
                    isActive={activeTab === "popular"}
                    onClick={() => setActiveTab("popular")}
                    activeStyle={activeTabStyle}
                    icon={
                      <HugeiconsFire02
                        className="size-5 font-mediu"
                        fill={activeTab === "popular" ? "#EE3832" : "black"}
                      />
                    }
                    label="Popular"
                    radius={pillRadius}
                  />

                  <TabButton
                    isActive={activeTab === "favorites"}
                    onClick={() => setActiveTab("favorites")}
                    activeStyle={activeTabStyle}
                    icon={
                      <HugeiconsFavourite
                        className="size-5 font-medium"
                        fill={activeTab === "favorites" ? "#EE3832" : "black"}
                      />
                    }
                    label="Favorites"
                    radius={pillRadius}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </LayoutGroup>
  );
};

const TabButton = ({
  isActive,
  onClick,
  activeStyle,
  icon,
  label,
  radius,
}: {
  isActive: boolean;
  onClick: () => void;
  activeStyle?: MotionStyle;
  icon: React.ReactNode;
  label: string;
  radius: number;
}) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap outline-none ${
      isActive ? "text-content" : "text-content-subtle hover:text-content-muted"
    }`}
    style={{ borderRadius: radius }}
  >
    {isActive && (
      <motion.div
        layoutId="active-tab-bg"
        className="absolute inset-0"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={activeStyle}
      />
    )}
    <span className="relative z-10 flex items-center gap-1">
      {icon}{" "}
      <span className={`font-semibold ${isActive ? "text-[#EE3832]" : ""}`}>
        {label}
      </span>
    </span>
  </button>
);

export default DiscoveryBar;
