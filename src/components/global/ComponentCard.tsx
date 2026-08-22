"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";

export interface ComponentCardProps {
  name: string;
  source: string;
  url: string;
  onClick: () => void;
  className?: string;
}

/**
 * Card for a not-yet-migrated pattern, opening a modal preview.
 *
 * Documented patterns use `PatternCard` instead — it navigates to a real page
 * and carries category, domains and support claims. This one deliberately
 * carries none of that, because none of it exists yet for these.
 */
export function ComponentCard({
  name,
  source,
  url,
  onClick,
  className,
}: ComponentCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0.01 }
          : { duration: duration.slow, ease: ease.out }
      }
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      style={{ willChange: "transform" }}
      className={cn(
        "focus-ring group w-full cursor-pointer rounded-lg border border-border",
        "bg-surface p-3 text-left transition-colors hover:bg-surface-hover",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-base text-content">{name}</h3>
        <p className="text-sm text-content-subtle">
          Inspired by{" "}
          {/*
            An anchor nested inside a button is invalid HTML and creates a
            focus trap. Rendered as text; attribution links live on the
            pattern page once one exists.
          */}
          <span className="underline decoration-border-strong underline-offset-2">
            {source}
          </span>
        </p>
      </div>
      <span className="sr-only">{`Opens a preview of ${name}. Original at ${url}`}</span>
    </motion.button>
  );
}

export default ComponentCard;
