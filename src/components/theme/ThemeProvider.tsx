"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * Theme root.
 *
 * `attribute="class"` pairs with the `@custom-variant dark` declaration in
 * globals.css. `defaultTheme="system"` means a first-time visitor gets the
 * theme their OS already asked for; the toggle then persists an explicit
 * choice that overrides it.
 *
 * disableTransitionOnChange prevents every colour-bearing element on the page
 * from animating at once when the theme flips — a full-page cross-fade reads
 * as a rendering bug, not as polish.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
