import { getPatternSource, slugToPascal } from "@/lib/pattern-source";
import { getPattern, getPatternSlugs } from "@/patterns/registry";

/**
 * shadcn-compatible registry items, one JSON file per pattern.
 *
 * A route handler rather than a build script: it reads the same registry the
 * site does, so a pattern cannot be installable but undocumented (or the
 * reverse), and `generateStaticParams` prerenders each one to a static file at
 * build time — no server required to serve them.
 *
 * The `.json` suffix lives in the slug so the published URLs read as files,
 * which is what `npx shadcn add <url>` expects.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPatternSlugs().map((slug) => ({ slug: `${slug}.json` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.json$/, "");

  const meta = getPattern(slug);
  const source = getPatternSource(slug);

  if (!meta || !source) {
    return Response.json({ error: "Pattern not found" }, { status: 404 });
  }

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: meta.slug,
    type: "registry:ui",
    title: meta.name,
    description: meta.problem,
    // `motion` and `lucide-react` are real npm packages; the pattern's own
    // helpers (cn, motion tokens) travel with the file rather than as deps.
    dependencies: [...meta.dependencies],
    files: [
      {
        path: `patterns/${meta.slug}/${source.filename}`,
        target: `components/patterns/${meta.slug}/${source.filename}`,
        type: "registry:ui",
        content: source.code,
      },
    ],
    meta: {
      category: meta.category,
      domains: [...meta.domains],
      tags: [...meta.tags],
      keyboard: meta.keyboard,
      touch: meta.touch,
      reducedMotion: meta.reducedMotion,
      responsive: meta.responsive,
      component: slugToPascal(slug),
    },
  };

  return Response.json(item, {
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
