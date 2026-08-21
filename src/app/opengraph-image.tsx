import { ImageResponse } from "next/og";

import { registry } from "@/patterns/registry";

/*
 * Generated rather than a checked-in PNG, so the card cannot drift from the
 * library: the pattern count below is read from the registry at build time.
 *
 * No custom font is loaded. Satori needs TTF/OTF or WOFF and this project's
 * face ships as WOFF2 only, so the card uses next/og's bundled default. A card
 * in the right typeface is not worth shipping a second copy of the font.
 */
export const alt = "Interaction patterns for production interfaces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
        Interaction Patterns
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/*
            Two elements, not one string with a <br />. Satori does not
            implement <br />, so the line runs on and overflows the card —
            which looks like a text-wrapping bug rather than a missing tag.
          */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 68 }}>
          <div style={{ display: "flex" }}>Interaction patterns for</div>
          <div style={{ display: "flex" }}>production interfaces</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#b6bbc0" }}>
          Accessible, performant, documented. Free to copy.
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 24, color: "#878d94" }}>
        {`${registry.length} patterns   ·   React 19   ·   Tailwind v4`}
      </div>
    </div>,
    size,
  );
}
