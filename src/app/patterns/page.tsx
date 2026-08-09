import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Badge from "@/components/docs/Badge";
import SupportBadges from "@/components/docs/SupportBadges";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { registry } from "@/patterns/registry";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/patterns/types";

export const metadata: Metadata = {
  title: "All patterns",
  description:
    "Every documented interaction pattern in the library, with its category, domains and support guarantees.",
};

/**
 * Index of documented patterns.
 *
 * Deliberately plain: search, filtering and category browse are Phase 4. This
 * exists so /patterns is a real page rather than a 404 sitting one path
 * segment above every pattern URL.
 */
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
            {registry.length} documented{" "}
            {registry.length === 1 ? "pattern" : "patterns"}. Each one ships with
            a props API, a keyboard model and an accessibility contract.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {registry.map((meta) => (
            <li key={meta.slug}>
              <Link
                href={`/patterns/${meta.slug}` as Route}
                className="focus-ring group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-content">
                    {meta.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-content-muted">
                    {meta.problem}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="solid">
                    {CATEGORY_LABELS[meta.category]}
                  </Badge>
                  {meta.domains.map((domain) => (
                    <Badge key={domain}>{DOMAIN_LABELS[domain]}</Badge>
                  ))}
                </div>

                <SupportBadges meta={meta} />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
