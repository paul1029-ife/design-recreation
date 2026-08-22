"use client";

import { Globe, Lock } from "lucide-react";

import QuickSelect from "./QuickSelect";

/**
 * Gallery demo. Owns the options and the headroom the popover needs — it opens
 * upward and the component does not reserve that space, because how much
 * depends on where you anchor it.
 */
export default function QuickSelectDemo() {
  return (
    <div className="flex w-full items-end justify-center pt-28 pb-4">
      <QuickSelect
        label="Visibility"
        defaultValue="public"
        options={[
          { id: "private", label: "Private", icon: <Lock /> },
          { id: "public", label: "Public", icon: <Globe /> },
        ]}
      />
    </div>
  );
}
