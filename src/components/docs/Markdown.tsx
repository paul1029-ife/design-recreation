import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/cn";
import CodeBlock from "./CodeBlock";

/**
 * Renders a pattern README.
 *
 * Every element is mapped explicitly onto the design tokens rather than
 * pulling in a typography plugin: the plugin's defaults would fight the token
 * layer, and the docs are part of the product, not a generic article page.
 *
 * GFM is required — the API and keyboard sections are tables, and those are
 * the two things a developer reads first.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 className="mt-12 mb-3 scroll-mt-24 text-xl font-semibold text-content first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-8 mb-2 scroll-mt-24 text-lg font-semibold text-content">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="my-4 leading-relaxed text-content-muted">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-4 list-disc space-y-1.5 pl-5 text-content-muted marker:text-border-strong">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-4 list-decimal space-y-1.5 pl-5 text-content-muted marker:text-content-subtle">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-content">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="focus-ring rounded-sm font-semibold text-content underline decoration-border-strong underline-offset-2 hover:decoration-content"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-10 border-border" />,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-2 border-border-strong pl-4 text-content-subtle">
            {children}
          </blockquote>
        ),

        // Tables scroll inside their own container so a wide API table can
        // never make the page itself scroll sideways.
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-border bg-surface-subtle">
            {children}
          </thead>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-border last:border-b-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 font-semibold whitespace-nowrap text-content">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 align-top text-content-muted">{children}</td>
        ),

        // `pre` is flattened: fenced blocks are rendered by CodeBlock, which
        // brings its own container, so the default wrapper would double up.
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children }) => {
          const language = /language-(\w+)/.exec(className ?? "")?.[1];

          if (!language) {
            return (
              <code
                className={cn(
                  "rounded-md border border-border bg-surface-subtle",
                  "px-1.5 py-0.5 font-mono text-[0.85em] text-content",
                )}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeBlock
              code={String(children).replace(/\n$/, "")}
              lang={language}
              className="my-6"
            />
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default Markdown;
