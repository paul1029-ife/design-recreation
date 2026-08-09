"use client";

import ExpandingSegments from "./ExpandingSegments";
import { FluentCalendar16Filled } from "@/components/icons/IconCalendar";
import { MaterialSymbolsMailRounded } from "@/components/icons/IconMail";
import { MaterialSymbolsNotificationsRounded } from "@/components/icons/IconNotifications";

/** Gallery demo. Owns the segments and their accents; the pattern owns neither. */
export default function ExpandingSegmentsDemo() {
  return (
    <ExpandingSegments
      label="Mailbox view"
      segments={[
        {
          id: "inbox",
          label: "Inbox",
          icon: <MaterialSymbolsMailRounded />,
          accentClassName: "text-blue-600",
        },
        {
          id: "planner",
          label: "Planner",
          icon: <FluentCalendar16Filled />,
          accentClassName: "text-danger",
        },
        {
          id: "alerts",
          label: "Alerts",
          icon: <MaterialSymbolsNotificationsRounded />,
          accentClassName: "text-danger",
        },
      ]}
    />
  );
}
