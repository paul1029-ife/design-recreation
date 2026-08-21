import { ImageResponse } from "next/og";

import { CATEGORY_LABELS } from "@/patterns/types";
import { getPattern, getPatternSlugs } from "@/patterns/registry";

export const alt = "Pattern preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Prerendered per pattern, so each card is a static file rather than a function
 * invocation on every crawl.
 */
export function generateStaticParams() {
  return getPatternSlugs().map((slug) => ({ slug }));
}

export default async function PatternOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getPattern(slug);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#08090a",
        padding: 80,
        color: "#f4f5f6",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#878d94" }}>
        {meta ? CATEGORY_LABELS[meta.category] : "Interaction Patterns"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontSize: 72, lineHeight: 1.1 }}>
          {meta?.name ?? "Interaction Patterns"}
        </div>
        {/*
            The problem statement, not a feature list. It is the sentence
            someone searching for this behaviour would recognise, and it is
            already capped at one sentence by the metadata contract.
          */}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            lineHeight: 1.4,
            color: "#b6bbc0",
          }}
        >
          {meta?.problem ?? "Production-ready React interaction patterns."}
        </div>
      </div>

      {/*
          One joined string rather than a row of spans. Satori treats a
          fragment as a single flex child, so `gap` applies around the whole
          group and not between the items inside it — the separators end up
          jammed against the words.
        */}
      <div style={{ display: "flex", fontSize: 24, color: "#878d94" }}>
        {[
          "Interaction Patterns",
          meta?.difficulty,
          meta?.keyboard ? "Keyboard" : null,
          meta?.reducedMotion ? "Reduced motion" : null,
        ]
          .filter(Boolean)
          .join("   ·   ")}
      </div>
    </div>,
    size,
  );
}
