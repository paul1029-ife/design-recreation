import { codeToHtml } from "shiki";

import { cn } from "@/lib/cn";
import CopyButton from "./CopyButton";

export interface CodeBlockProps {
  code: string;
  lang?: string;
  /** Shown in the header strip, usually the filename. */
  title?: string;
  /** Constrain tall files so the page stays navigable. */
  maxHeight?: string;
  className?: string;
}

/**
 * Syntax-highlighted code, highlighted at build time.
 *
 * Shiki runs here in a server component, so the grammars and themes never
 * reach the browser — the client receives coloured markup and no highlighter.
 *
 * `defaultColor: false` emits both themes as CSS variables on each token
 * rather than baking one in, so the block follows the theme toggle instantly
 * instead of needing a re-render or a second request.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  maxHeight,
  className,
}: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-border px-3 py-2">
        <span className="truncate font-mono text-xs text-content-subtle">
          {title ?? lang}
        </span>
        <CopyButton
          value={code}
          label={title ? `Copy ${title}` : "Copy code"}
        />
      </figcaption>

      <div
        className="shiki-scroll overflow-auto text-sm"
        style={maxHeight ? { maxHeight } : undefined}
        // Shiki output is generated at build time from files in this repo —
        // there is no user input anywhere in this path.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}

export default CodeBlock;
