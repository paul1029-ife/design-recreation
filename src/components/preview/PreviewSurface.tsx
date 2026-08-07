import { cn } from "@/lib/cn";

export interface PreviewSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The stage a pattern is shown on.
 *
 * A dot grid rather than a flat fill for two reasons: it reads as "specimen on
 * a stage" instead of "component that failed to fill its container", and the
 * 16px grid gives the eye a scale reference so a pattern's real size is
 * legible. Recessed to `surface-base` so the pattern's own `surface` reads as
 * sitting on top of it.
 *
 * Server component — no interactivity of its own. Shared by the gallery modal
 * and the pattern pages so the preview language is identical in both.
 */
export function PreviewSurface({ children, className }: PreviewSurfaceProps) {
  return (
    <div
      className={cn(
        "preview-canvas flex min-h-[260px] items-center justify-center",
        "overflow-hidden rounded-xl border border-border bg-surface-base p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default PreviewSurface;
