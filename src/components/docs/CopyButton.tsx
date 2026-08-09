"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/cn";

export interface CopyButtonProps {
  /** Text placed on the clipboard. */
  value: string;
  /** Accessible name. @default "Copy" */
  label?: string;
  className?: string;
}

/**
 * Copy-to-clipboard with a confirmed state.
 *
 * The confirmation is the point: without it people click twice because there
 * is no way to tell whether the first one worked. The icon swap is backed by a
 * live region, so the confirmation is not visual-only.
 */
export function CopyButton({
  value,
  label = "Copy",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Clear on unmount, otherwise the timer fires against a detached tree.
  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by permissions policy or an insecure
      // origin. Staying silent is wrong — leave the button in its idle state
      // so the user can select the text manually instead of believing it copied.
      setCopied(false);
    }
  }, [value]);

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label}: copied` : label}
        className={cn(
          "focus-ring grid size-8 cursor-pointer place-items-center rounded-md",
          "border border-border bg-surface text-content-subtle",
          "transition-colors hover:bg-surface-hover hover:text-content",
          className,
        )}
      >
        {copied ? (
          <Check className="size-4 text-success" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <Copy className="size-4" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}

export default CopyButton;
