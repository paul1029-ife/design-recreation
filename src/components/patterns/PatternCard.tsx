import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Badge from "@/components/docs/Badge";
import SupportBadges from "@/components/docs/SupportBadges";
import { cn } from "@/lib/cn";
import type { PatternMeta } from "@/patterns/types";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/patterns/types";

export interface PatternCardProps {
  meta: PatternMeta;
  /** Drops the domain and support rows for dense lists. */
  compact?: boolean;
  className?: string;
}

/**
 * The card used everywhere a pattern is listed.
 *
 * Leads with the problem rather than the mechanism, because that is what
 * someone is scanning for — they arrive knowing the friction they have, not
 * the name of the interaction that fixes it.
 *
 * Server component: it is pure metadata, so listing pages ship no JavaScript
 * for it.
 */
export function PatternCard({ meta, compact, className }: PatternCardProps) {
  return (
    <Link
      href={`/patterns/${meta.slug}` as Route}
      className={cn(
        "focus-ring group flex h-full flex-col gap-3 rounded-xl border border-border",
        "bg-surface p-4 transition-colors hover:bg-surface-hover",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="flex items-center gap-1 font-semibold text-content">
          {meta.name}
          <ArrowUpRight
            className="size-3.5 shrink-0 text-content-subtle opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </h3>
        <p className="text-sm leading-relaxed text-content-muted">
          {meta.problem}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="solid">{CATEGORY_LABELS[meta.category]}</Badge>
          {!compact &&
            meta.domains.map((domain) => (
              <Badge key={domain}>{DOMAIN_LABELS[domain]}</Badge>
            ))}
        </div>
        {!compact ? <SupportBadges meta={meta} /> : null}
      </div>
    </Link>
  );
}

export default PatternCard;
