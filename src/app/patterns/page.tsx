import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import PatternBrowser from "@/components/patterns/PatternBrowser";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { registry } from "@/patterns/registry";

export const metadata: Metadata = {
  title: "All patterns",
  description:
    "Search every documented interaction pattern by the problem it solves, its category, or its tags.",
};

/** The exhaustive, searchable index. Home shows curated slices of this. */
export default function PatternsIndexPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-content-subtle transition-colors hover:text-content"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Home
          </Link>
          <ThemeToggle />
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-content">All patterns</h1>
          <p className="text-content-muted">
            Search by the problem you have, not the name of the interaction
            that fixes it. Press{" "}
            <kbd className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 font-mono text-xs">
              /
            </kbd>{" "}
            to jump to search.
          </p>
        </header>

        <PatternBrowser patterns={registry} />
      </main>
    </div>
  );
}
