"use client";

import { Copy, Save, Share, Trash2 } from "lucide-react";

import InlineOverflow from "./InlineOverflow";

/**
 * Gallery demo. Owns the sample actions — the pattern itself takes them as
 * props, because which two actions earn the resting width is the decision the
 * consumer is making when they reach for this.
 */
export default function InlineOverflowDemo() {
  return (
    <InlineOverflow
      label="Document actions"
      primary={[
        { id: "save", label: "Save", icon: <Save />, onSelect: () => {} },
        { id: "copy", label: "Copy", icon: <Copy />, onSelect: () => {} },
      ]}
      overflow={[
        { id: "share", label: "Share", icon: <Share />, onSelect: () => {} },
        { id: "delete", label: "Delete", icon: <Trash2 />, onSelect: () => {} },
      ]}
    />
  );
}
