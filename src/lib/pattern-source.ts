import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads pattern files off disk at build time.
 *
 * Server-only by construction — it touches node:fs, so importing it from a
 * client component is a build error rather than a silent bundle bloat.
 *
 * Reading the real file rather than maintaining a copy of the source in the
 * docs is the whole point: in a copy-paste library the published source IS the
 * deliverable, so it must not be able to drift from what actually ships.
 */

const PATTERNS_DIR = join(process.cwd(), "src", "patterns");

/** `inline-confirm` → `InlineConfirm` */
export function slugToPascal(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function read(slug: string, file: string): string | null {
  try {
    return readFileSync(join(PATTERNS_DIR, slug, file), "utf8");
  } catch {
    return null;
  }
}

export interface PatternSource {
  /** Filename as it appears in the repo, e.g. "InlineConfirm.tsx". */
  filename: string;
  /** Full component source. */
  code: string;
}

export function getPatternSource(slug: string): PatternSource | null {
  const filename = `${slugToPascal(slug)}.tsx`;
  const code = read(slug, filename);
  return code === null ? null : { filename, code };
}

export function getPatternDemoSource(slug: string): PatternSource | null {
  const filename = `${slugToPascal(slug)}.demo.tsx`;
  const code = read(slug, filename);
  return code === null ? null : { filename, code };
}

export interface PatternDoc {
  /** Markdown body with the YAML frontmatter removed. */
  body: string;
  /** Everything before the `## Source` heading. */
  beforeSource: string;
  /** Everything after it, heading excluded. */
  afterSource: string;
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const SOURCE_HEADING = /^## Source[^\n]*\n/m;

/**
 * Splits the README around its `## Source` heading so the page can inject the
 * highlighted file there. The READMEs are written expecting that injection —
 * the section exists as a placeholder rather than duplicating the code.
 */
export function getPatternDoc(slug: string): PatternDoc | null {
  const raw = read(slug, "README.md");
  if (raw === null) return null;

  const body = raw.replace(FRONTMATTER, "").trim();
  const match = SOURCE_HEADING.exec(body);

  if (!match) return { body, beforeSource: body, afterSource: "" };

  const headingStart = match.index;
  const headingEnd = headingStart + match[0].length;

  // Drop the placeholder prose under the heading; the real source replaces it.
  const rest = body.slice(headingEnd);
  const nextHeading = rest.search(/^## /m);

  return {
    body,
    beforeSource: body.slice(0, headingStart).trim(),
    afterSource: (nextHeading === -1 ? "" : rest.slice(nextHeading)).trim(),
  };
}
