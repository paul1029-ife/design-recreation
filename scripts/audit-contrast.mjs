#!/usr/bin/env node
/**
 * Contrast audit over the token palette.
 *
 * Every colour in the library resolves to a token, so contrast is decidable
 * from `globals.css` alone — no browser, no per-page sweep, and it covers both
 * themes at once. This is what makes it worth running in CI: a token edit that
 * drops a pairing below AA fails the build instead of shipping.
 *
 * Only pairings the library actually uses are checked. Auditing the cartesian
 * product would flag combinations no component renders and train people to
 * ignore the output.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

/* ------------------------------------------------------------------ parsing */

function block(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No ${selector} block in globals.css`);
  const end = css.indexOf("\n}", start);
  const body = css.slice(start, end);
  const tokens = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

const light = block(":root");
const dark = { ...light, ...block(".dark") };

/* ------------------------------------------------------------------- colour */

function toRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** WCAG relative luminance. */
function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/* -------------------------------------------------------------------- rules */

/**
 * `min` is the WCAG threshold for that pairing:
 *   4.5 — body text
 *   3.0 — large text (≥18.66px bold or ≥24px), icons, and UI boundaries
 */
/** Surfaces text comes to rest on. */
const RESTING = ["surface-base", "surface", "surface-subtle"];
/** Transient fills that only appear under hover or press. */
const TRANSIENT = ["surface-hover", "surface-active"];

const PAIRS = [
  ...RESTING.flatMap((bg) => [
    { fg: "content", bg, min: 4.5, note: "body text" },
    { fg: "content-muted", bg, min: 4.5, note: "secondary text" },
    { fg: "content-subtle", bg, min: 4.5, note: "tertiary text" },
  ]),

  /*
   * Hover and press fills are audited for the two content levels that are
   * allowed to sit on them. `content-subtle` is deliberately not: the library's
   * convention is that an element raising its background to a hover fill also
   * raises its text to `content`, so subtle-on-hover never renders. Auditing it
   * anyway reported three failures that no component could produce, which is
   * how an audit gets ignored.
   *
   * If you add a hover fill under text that stays subtle, that convention is
   * what you have broken.
   */
  ...TRANSIENT.flatMap((bg) => [
    { fg: "content", bg, min: 4.5, note: "body text on hover fill" },
    { fg: "content-muted", bg, min: 4.5, note: "secondary text on hover fill" },
  ]),

  // Inverted pairings on filled controls.
  { fg: "accent-content", bg: "accent", min: 4.5, note: "text on accent fill" },
  { fg: "danger-content", bg: "danger", min: 4.5, note: "text on danger fill" },
  {
    fg: "success-content",
    bg: "success",
    min: 4.5,
    note: "text on success fill",
  },

  // Intent colours used as text rather than as a fill.
  { fg: "danger", bg: "surface", min: 4.5, note: "danger text" },
  { fg: "success", bg: "surface", min: 4.5, note: "success text" },

  // Non-text UI, at the 3:1 threshold.
  { fg: "ring", bg: "surface", min: 3, note: "focus ring on card" },
  { fg: "ring", bg: "surface-base", min: 3, note: "focus ring on page" },

  /*
   * `border-strong` is deliberately absent. It is a *line* token — hairlines,
   * list markers, underline decoration — and WCAG does not hold decorative
   * boundaries to 3:1 when the control is identifiable without them. Holding
   * it to that threshold would mean darkening every hairline in the library to
   * fix two components that were misusing it as a fill; those two now use
   * `surface-active` and `content-subtle` instead.
   */
  {
    fg: "content-subtle",
    bg: "surface-subtle",
    min: 3,
    note: "switch off-track",
  },
];

/* -------------------------------------------------------------------- report */

let failures = 0;
let checked = 0;

for (const [themeName, tokens] of [
  ["light", light],
  ["dark", dark],
]) {
  const rows = [];
  for (const { fg, bg, min, note } of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) continue;
    checked++;
    const r = ratio(tokens[fg], tokens[bg]);
    if (r < min) {
      failures++;
      rows.push(
        `  ${fg} on ${bg} — ${r.toFixed(2)}:1, needs ${min}:1  (${note})`,
      );
    }
  }
  if (rows.length) {
    console.log(
      `\n${themeName.toUpperCase()} — ${rows.length} below threshold`,
    );
    console.log(rows.join("\n"));
  }
}

console.log(
  failures === 0
    ? `\n${checked} token pairings checked across both themes. All meet WCAG AA.`
    : `\n${failures} of ${checked} pairings below WCAG AA.`,
);

process.exit(failures === 0 ? 0 : 1);
