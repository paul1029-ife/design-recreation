"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import PatternCard from "./PatternCard";
import { cn } from "@/lib/cn";
import type {
  PatternCategory,
  PatternDomain,
  PatternMeta,
} from "@/patterns/types";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/patterns/types";

export interface PatternBrowserProps {
  patterns: readonly PatternMeta[];
  /** Rendered above the results; omitted on already-filtered pages. */
  showFilters?: boolean;
}

type CategoryFilter = PatternCategory | "all";
type DomainFilter = PatternDomain | "all";

/**
 * Search and filtering over the registry.
 *
 * Searches the problem statement and tags, not just the name. Someone looking
 * for this library arrives with a friction ("undo", "confirm without a
 * dialog"), not with the name of the interaction that solves it — matching
 * only titles would make the library findable exclusively by people who
 * already know what it contains.
 */
export function PatternBrowser({
  patterns,
  showFilters = true,
}: PatternBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [domain, setDomain] = useState<DomainFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, the convention every docs site shares. Ignored while
  // typing elsewhere, otherwise it would hijack the character.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const categories = useMemo(
    () => [...new Set(patterns.map((p) => p.category))].sort(),
    [patterns],
  );
  const domains = useMemo(
    () => [...new Set(patterns.flatMap((p) => p.domains))].sort(),
    [patterns],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return patterns.filter((pattern) => {
      if (category !== "all" && pattern.category !== category) return false;
      if (domain !== "all" && !pattern.domains.includes(domain)) return false;
      if (!needle) return true;

      const haystack = [
        pattern.name,
        pattern.problem,
        pattern.category,
        ...pattern.tags,
        ...pattern.domains,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [patterns, query, category, domain]);

  const filtered = query.trim() !== "" || category !== "all" || domain !== "all";

  return (
    <div className="flex flex-col gap-5">
      {showFilters ? (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-subtle"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by problem, name or tag…"
              aria-label="Search patterns"
              className={cn(
                "focus-ring w-full rounded-xl border border-border bg-surface",
                "py-2.5 pr-10 pl-9 text-content placeholder:text-content-subtle",
                // The browser's own clear affordance is inconsistent across
                // engines and unlabelled; a real button replaces it.
                "[&::-webkit-search-cancel-button]:appearance-none",
              )}
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="focus-ring absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-content-subtle hover:bg-surface-hover hover:text-content"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <FilterRow
            label="Category"
            value={category}
            options={categories.map((value) => ({
              value,
              label: CATEGORY_LABELS[value],
            }))}
            onChange={(next) => setCategory(next as CategoryFilter)}
          />

          <FilterRow
            label="Domain"
            value={domain}
            options={domains.map((value) => ({
              value,
              label: DOMAIN_LABELS[value],
            }))}
            onChange={(next) => setDomain(next as DomainFilter)}
          />
        </div>
      ) : null}

      {/* Result count is announced: filtering is a state change a sighted user
          reads from the grid and everyone else needs told. */}
      <p role="status" aria-live="polite" className="text-sm text-content-subtle">
        {results.length === 1
          ? `1 pattern${filtered ? " matches your filters" : ""}`
          : `${results.length} patterns${filtered ? " match your filters" : ""}`}
      </p>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-content-muted">Nothing matches that yet.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setDomain("all");
            }}
            className="focus-ring mt-3 rounded-md px-2 py-1 text-sm font-semibold text-content underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {results.map((pattern) => (
            <li key={pattern.slug} className="flex">
              <PatternCard meta={pattern} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FilterRowProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

/**
 * Single-select filter as a radiogroup rather than a row of toggle buttons:
 * the options are mutually exclusive, and `aria-checked` communicates that
 * where `aria-pressed` would imply they combine.
 */
function FilterRow({ label, value, options, onChange }: FilterRowProps) {
  if (options.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-content-subtle">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {[{ value: "all", label: "All" }, ...options].map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "focus-ring cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors",
                selected
                  ? "border-transparent bg-accent text-accent-content"
                  : "border-border text-content-muted hover:bg-surface-hover",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PatternBrowser;
