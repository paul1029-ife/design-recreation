"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";

interface BaseProps {
  name: string;
  source: string;
  url: string;
  className?: string;
}

/**
 * Migrated patterns navigate to their own page; legacy ones still open the
 * modal preview. Two shapes rather than one optional `href`, so it is a type
 * error to supply both or neither.
 */
export type ComponentCardProps = BaseProps &
  ({ href: Route; onClick?: never } | { href?: never; onClick: () => void });

export function ComponentCard({
  name,
  source,
  url,
  href,
  onClick,
  className,
}: ComponentCardProps) {
  const reduce = useReducedMotion();

  const motionProps = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: reduce
      ? { duration: 0.01 }
      : { duration: duration.slow, ease: ease.out },
    whileHover: reduce ? undefined : { y: -2 },
    whileTap: reduce ? undefined : { scale: 0.99 },
    style: { willChange: "transform" },
    className: cn(
      "focus-ring group block w-full cursor-pointer rounded-lg border border-border",
      "bg-surface p-3 text-left transition-colors hover:bg-surface-hover",
      className,
    ),
  } as const;

  const body = (
    <div className="flex flex-col gap-1">
      <h3 className="flex items-center gap-1 text-base text-content">
        {name}
        {href ? (
          <ArrowUpRight
            className="size-3.5 text-content-subtle opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        ) : null}
      </h3>
      <p className="text-sm text-content-subtle">
        Inspired by{" "}
        {/*
          An anchor nested inside a button or link is invalid HTML and creates
          a focus trap. Rendered as text; the credit link lives on the pattern
          page, which is where attribution belongs.
        */}
        <span className="underline decoration-border-strong underline-offset-2">
          {source}
        </span>
      </p>
    </div>
  );

  if (href) {
    return (
      <motion.div {...motionProps} className={undefined}>
        <Link href={href} className={motionProps.className}>
          {body}
          <span className="sr-only">{`. Documentation for ${name}.`}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button type="button" onClick={onClick} {...motionProps}>
      {body}
      <span className="sr-only">{`Opens a preview of ${name}. Original at ${url}`}</span>
    </motion.button>
  );
}

export default ComponentCard;
