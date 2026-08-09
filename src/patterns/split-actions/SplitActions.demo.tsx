"use client";

import { Bell } from "lucide-react";

import SplitActions from "./SplitActions";
import { IconCalendar01 } from "@/components/icons/IconCalendar01";

/**
 * Gallery demo. Owns the sample actions; the pattern owns none of them.
 * `onSelect` is a no-op here — in a real app it opens the composer.
 */
export default function SplitActionsDemo() {
  return (
    <SplitActions
      triggerLabel="Add"
      actions={[
        {
          id: "schedule",
          label: "Schedule",
          icon: <IconCalendar01 width={16} height={16} color="currentColor" />,
          onSelect: () => {},
        },
        {
          id: "remind",
          label: "Remind",
          icon: <Bell strokeWidth={2} />,
          onSelect: () => {},
        },
      ]}
    />
  );
}
