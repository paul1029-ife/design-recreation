"use client";

import InlineConfirm from "./InlineConfirm";
import { IconCalendar01 } from "@/components/icons/IconCalendar01";

/** Stands in for a real request so the pending stage has something to track. */
function fakeSync(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2200));
}

/**
 * Gallery demo. Owns the sample copy and the fake latency; the pattern owns
 * neither. Previously all of this lived inside the component, along with a
 * setTimeout loop that advanced the stages on its own — which is why it could
 * not be used for anything.
 */
export default function InlineConfirmDemo() {
  return (
    <InlineConfirm
      label="Calendar"
      actionLabel="Sync Events"
      icon={<IconCalendar01 width={22} height={22} color="currentColor" />}
      onConfirm={fakeSync}
      pendingAnnouncement="Syncing events"
      confirmedAnnouncement="Events synced"
    />
  );
}
