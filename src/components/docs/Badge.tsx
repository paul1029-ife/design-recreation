import { cn } from "@/lib/cn";

export interface BadgeProps {
  children: React.ReactNode;
  /** `solid` marks the primary axis (category); `outline` the rest. */
  variant?: "solid" | "outline" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "outline",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap",
        variant === "solid" && "bg-accent text-accent-content",
        variant === "outline" && "border border-border text-content-muted",
        variant === "muted" && "bg-surface-subtle text-content-subtle",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
