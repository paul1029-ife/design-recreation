import { Keyboard, Pointer, Smartphone, Waves } from "lucide-react";

import type { PatternMeta } from "@/patterns/types";
import Badge from "./Badge";

const CLAIMS = [
  { key: "keyboard", label: "Keyboard", Icon: Keyboard },
  { key: "touch", label: "Touch", Icon: Pointer },
  { key: "responsive", label: "Responsive", Icon: Smartphone },
  { key: "reducedMotion", label: "Reduced motion", Icon: Waves },
] as const;

/**
 * The four support claims, surfaced where an adopter decides.
 *
 * Only satisfied claims are shown. Rendering "Keyboard ✗" would be worse than
 * silence — it invites people to skim past a red mark, and these flags are
 * audited precisely so the library cannot advertise support it lacks.
 */
export function SupportBadges({ meta }: { meta: PatternMeta }) {
  const supported = CLAIMS.filter(({ key }) => meta[key]);
  if (supported.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {supported.map(({ key, label, Icon }) => (
        <li key={key}>
          <Badge variant="muted">
            <Icon className="size-3" strokeWidth={2} aria-hidden="true" />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export default SupportBadges;
