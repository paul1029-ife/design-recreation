import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import type { PatternMeta } from "@/patterns/types";

const TECHNOLOGIES = [
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "Motion",
] as const;

export interface HeroProps {
  patterns: readonly PatternMeta[];
  /** Patterns not yet migrated, counted honestly rather than hidden. */
  inMigration: number;
}

/**
 * Says what this is in one line, then proves it with numbers.
 *
 * The statistics are derived from the registry rather than written down, so
 * they cannot become a stale marketing claim — if a pattern ships without
 * keyboard support the number drops on the next build.
 */
export function Hero({ patterns, inMigration }: HeroProps) {
  const categories = new Set(patterns.map((p) => p.category)).size;
  const keyboard = patterns.filter((p) => p.keyboard).length;
  const keyboardPct =
    patterns.length === 0
      ? 0
      : Math.round((keyboard / patterns.length) * 100);

  const stats = [
    { value: String(patterns.length), label: "documented" },
    { value: String(categories), label: categories === 1 ? "category" : "categories" },
    { value: `${keyboardPct}%`, label: "keyboard accessible" },
    { value: String(inMigration), label: "in migration" },
  ];

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-tight font-semibold text-content sm:text-4xl">
          Interaction patterns for production interfaces
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-content-muted">
          A curated collection of React interactions that solve real UX
          problems. Every one is accessible, performant, documented, and free
          to copy.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={"/patterns" as Route}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-content transition-opacity hover:opacity-90"
        >
          Browse patterns
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <a
          href="https://github.com/paul1029-ife/design-recreation"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-content transition-colors hover:bg-surface-hover"
        >
          <Github className="size-4" aria-hidden="true" />
          GitHub
        </a>
      </div>

      <dl className="flex flex-wrap gap-x-8 gap-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="sr-only">{stat.label}</dt>
            <dd
              data-tabular
              className="text-2xl font-semibold text-content"
            >
              {stat.value}
            </dd>
            <span aria-hidden="true" className="text-sm text-content-subtle">
              {stat.label}
            </span>
          </div>
        ))}
      </dl>

      <ul className="flex flex-wrap items-center gap-1.5">
        {TECHNOLOGIES.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-content-muted"
          >
            {tech}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Hero;
