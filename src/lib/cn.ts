import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 *
 * Every pattern accepts a `className` and merges it with `cn` rather than
 * replacing its own classes — otherwise a consumer passing `px-6` gets it
 * silently dropped behind the pattern's `px-3`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
