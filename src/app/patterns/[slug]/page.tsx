import { createElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CodeBlock from "@/components/docs/CodeBlock";
import InstallCommand from "@/components/docs/InstallCommand";
import Markdown from "@/components/docs/Markdown";
import Badge from "@/components/docs/Badge";
import SupportBadges from "@/components/docs/SupportBadges";
import PreviewSurface from "@/components/preview/PreviewSurface";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getPatternDoc, getPatternSource } from "@/lib/pattern-source";
import { getDemo } from "@/patterns/demos";
import { getPattern, getPatternSlugs } from "@/patterns/registry";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/patterns/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Every pattern is prerendered — these pages are static content. */
export function generateStaticParams() {
  return getPatternSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getPattern(slug);
  if (!meta) return {};

  return {
    title: meta.name,
    // The problem statement is the description: it is what someone searching
    // for this behaviour would actually type.
    description: meta.problem,
    openGraph: {
      title: `${meta.name} — Interaction Patterns`,
      description: meta.problem,
      type: "article",
    },
  };
}

export default async function PatternPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getPattern(slug);
  if (!meta) notFound();

  const Demo = getDemo(slug);
  const source = getPatternSource(slug);
  const doc = getPatternDoc(slug);

  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-content-subtle transition-colors hover:text-content"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All patterns
          </Link>
          <ThemeToggle />
        </div>

        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-content">{meta.name}</h1>
            <p className="text-lg leading-relaxed text-content-muted">
              {meta.problem}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="solid">{CATEGORY_LABELS[meta.category]}</Badge>
            {meta.domains.map((domain) => (
              <Badge key={domain}>{DOMAIN_LABELS[domain]}</Badge>
            ))}
            <Badge>{meta.difficulty}</Badge>
          </div>

          <SupportBadges meta={meta} />
        </header>

        {/*
          The demo leads. Everything below it is support.

          createElement rather than <Demo />: the component is looked up from
          the module-scope demos map, not defined here, so its identity is
          stable — but written as JSX the lint rule reads it as a component
          being created during render. createElement says what is actually
          happening, which is that an element is being created.
        */}
        {Demo ? <PreviewSurface>{createElement(Demo)}</PreviewSurface> : null}

        {/*
          Deliberately not a heading. The README owns the Installation section
          further down; adding an <h2> here would put two install entries in
          the document outline and make a screen-reader user wonder which one
          is authoritative. This is a shortcut, so it is labelled as a region
          and stays out of the outline.
        */}
        <section aria-label="Quick install" className="flex flex-col gap-2">
          <InstallCommand slug={meta.slug} />
        </section>

        <article>
          {doc ? <Markdown>{doc.beforeSource}</Markdown> : null}

          {source ? (
            <section className="mt-12">
              <h2 className="mb-3 text-xl font-semibold text-content">Source</h2>
              <p className="my-4 leading-relaxed text-content-muted">
                The whole component. In a copy-paste library the source is the
                delivery mechanism, not an appendix — so it is read straight off
                disk at build time and cannot drift from what ships.
              </p>
              <CodeBlock
                code={source.code}
                title={source.filename}
                maxHeight="34rem"
              />
            </section>
          ) : null}

          {doc?.afterSource ? <Markdown>{doc.afterSource}</Markdown> : null}
        </article>
      </main>

      <footer className="w-full max-w-3xl border-t border-border px-4 py-6 text-sm text-content-subtle">
        Added {meta.added}
        {meta.credit ? (
          <>
            {" · Original by "}
            <a
              href={meta.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-sm underline underline-offset-2 hover:text-content"
            >
              {meta.credit.author}
            </a>
          </>
        ) : null}
      </footer>
    </div>
  );
}
