import { ArrowUpRight } from "lucide-react";

import InterimGallery from "@/components/gallery/InterimGallery";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Interim home. Server component — only the gallery below it is client-side.
 * Phase 4 replaces this with the real homepage.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="flex w-full max-w-2xl flex-col items-start gap-12 px-4 py-16">
        <header className="flex w-full items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-content">Ifeoluwa.</p>
            <p className="text-content-muted">Design Engineer</p>
          </div>
          <ThemeToggle />
        </header>

        <p className="text-content-muted">
          A curated collection of production-ready interaction patterns for React.
          Accessible, performant, documented, and free to copy. For my
          comprehensive work{" "}
          <a
            href="https://ifeoluwa.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm font-semibold text-content underline underline-offset-2"
          >
            ifeoluwa.tech
          </a>
        </p>

        <InterimGallery />

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-content">Reach out.</h2>
          <p className="text-content-muted">
            Are you a founder, or a fellow designer or engineer looking to create
            something your users won&rsquo;t forget? Or looking for a design
            engineer to add to your team? Please feel free to reach out.
          </p>
        </section>
      </main>

      <footer className="w-full max-w-2xl border-t border-border px-4 py-6">
        <div className="flex items-center justify-between gap-4 text-sm text-content-subtle">
          <span>&copy; {new Date().getFullYear()}</span>
          <nav className="flex items-center gap-3">
            {[
              { label: "Twitter", href: "https://x.com/theactual001" },
              { label: "GitHub", href: "https://github.com/paul1029-ife" },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/in/paul-agbogun01/",
              },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-0.5 rounded-sm transition-colors hover:text-content"
              >
                {label}
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
