import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "./globals.css";

/*
 * next/font/local self-hosts, preloads, and generates a size-adjusted fallback,
 * which removes the layout shift the previous @font-face + font-display: swap
 * setup had on first paint.
 *
 * Some-Sans ships 400 and 600 only. There is no 500 — `font-medium` snaps,
 * because font-synthesis is off globally.
 */
const someSans = localFont({
  src: [
    { path: "./fonts/Some-Sans-Regular.woff2", weight: "400", style: "normal" },
    {
      path: "./fonts/Some-Sans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-some-sans",
  display: "swap",
});

/*
 * `metadataBase` is what makes every relative OG and canonical URL in the app
 * resolve to an absolute one. Without it Next emits relative image paths, which
 * no social card renderer can fetch — the tags look correct in the HTML and the
 * preview comes back blank.
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Interaction patterns for production interfaces",
    template: "%s — Interaction Patterns",
  },
  description:
    "A curated collection of production-ready interaction patterns for React. Accessible, performant, documented, and free to copy.",
  keywords: [
    "react",
    "interaction design",
    "animation",
    "motion",
    "components",
    "accessibility",
    "tailwind",
  ],
  openGraph: {
    type: "website",
    siteName: "Interaction Patterns",
    title: "Interaction patterns for production interfaces",
    description:
      "Accessible, performant, documented React interaction patterns. Free to copy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interaction patterns for production interfaces",
    description:
      "Accessible, performant, documented React interaction patterns. Free to copy.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required on <html>: next-themes writes the
    // theme class before hydration to avoid a flash, which server HTML cannot
    // predict. It suppresses the mismatch on this element only.
    <html lang="en" className={someSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-surface-base font-sans text-content antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
