import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import CategoryNav from "@/components/home/CategoryNav";
import Hero from "@/components/home/Hero";
import LegacyGallery from "@/components/gallery/LegacyGallery";
import PatternCard from "@/components/patterns/PatternCard";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { legacyEntries } from "@/components/gallery/patterns";
import { getFeatured, registry } from "@/patterns/registry";

/**
 * Home.
 *
 * Curated slices, not the full list — /patterns is the exhaustive, searchable
 * index. Repeating every pattern here would make the two pages the same page.
 */
export default function HomePage() {
  const featured = getFeatured();
  const recent = registry.slice(0, 4);

  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="flex w-full max-w-3xl flex-col gap-16 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-content">Interaction Patterns</span>
          <ThemeToggle />
        </div>

        <Hero patterns={registry} inMigration={legacyEntries.length} />

        {featured.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeading
              title="Featured"
              action={{ href: "/patterns" as Route, label: "All patterns" }}
            />
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {featured.map((meta) => (
                <li key={meta.slug} className="flex">
                  <PatternCard meta={meta} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-4">
          <SectionHeading title="Browse by category" />
          <CategoryNav patterns={registry} />
        </section>

        {recent.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeading title="Recently added" />
            {/*
              A dated list rather than more cards. At this size it would
              otherwise repeat Featured verbatim; as a list it answers a
              different question — what changed — and stays useful as the
              library grows past a single screen of cards.
            */}
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {recent.map((meta) => (
                <li key={meta.slug}>
                  <Link
                    href={`/patterns/${meta.slug}` as Route}
                    className="focus-ring group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1 font-semibold text-content">
                        {meta.name}
                        <ArrowUpRight
                          className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="truncate text-sm text-content-subtle">
                        {meta.problem}
                      </span>
                    </span>
                    <time
                      dateTime={meta.added}
                      data-tabular
                      className="shrink-0 text-sm text-content-subtle"
                    >
                      {meta.added}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {legacyEntries.length > 0 ? (
          <section className="flex flex-col gap-4">
            <SectionHeading title="Still migrating" />
            <p className="text-sm text-content-muted">
              {legacyEntries.length} interactions from before this became a
              library. They work, but they have no props API, docs, or
              accessibility contract yet — so they are previewable here rather
              than documented.
            </p>
            <LegacyGallery />
          </section>
        ) : null}

        <section className="flex flex-col gap-2 border-t border-border pt-8">
          <h2 className="font-semibold text-content">Reach out.</h2>
          <p className="text-content-muted">
            Are you a founder, or a fellow designer or engineer looking to
            create something your users won&rsquo;t forget? Or looking for a
            design engineer to add to your team? Please feel free to reach out.
          </p>
        </section>
      </main>

      <footer className="w-full max-w-3xl border-t border-border px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-content-subtle">
          <span>
            Built by{" "}
            <a
              href="https://ifeoluwa.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-sm font-semibold text-content underline underline-offset-2"
            >
              Ifeoluwa
            </a>
            , design engineer
          </span>
          <nav className="flex items-center gap-3">
            {[
              { label: "Twitter", href: "https://x.com/theactual001" },
              { label: "GitHub", href: "https://github.com/paul1029-ife" },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/paul-agbogun01/",
              },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-0.5 rounded-sm transition-colors hover:text-content"
              >
                {label}
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { href: Route; label: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-lg font-semibold text-content">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="focus-ring inline-flex items-center gap-1 rounded-md text-sm text-content-subtle transition-colors hover:text-content"
        >
          {action.label}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
