import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PatternCard from "@/components/patterns/PatternCard";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getByCategory, getPopulatedCategories } from "@/patterns/registry";
import { CATEGORY_LABELS, type PatternCategory } from "@/patterns/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

/**
 * Only populated categories get a route. Generating a page for an empty one
 * would put an indexable dead end in the sitemap.
 */
export function generateStaticParams() {
  return getPopulatedCategories().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as PatternCategory];
  if (!label) return {};

  return {
    title: `${label} patterns`,
    description: `Interaction patterns in the ${label.toLowerCase()} category — accessible, documented, and free to copy.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as PatternCategory];
  if (!label) notFound();

  const patterns = getByCategory(category as PatternCategory);
  if (patterns.length === 0) notFound();

  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/patterns"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-content-subtle transition-colors hover:text-content"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All patterns
          </Link>
          <ThemeToggle />
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-content">
            {label} patterns
          </h1>
          <p className="text-content-muted">
            {patterns.length}{" "}
            {patterns.length === 1 ? "pattern" : "patterns"} in this category.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {patterns.map((meta) => (
            <li key={meta.slug} className="flex">
              <PatternCard meta={meta} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
