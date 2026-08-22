"use client";

import { Image as ImageIcon, Sparkles } from "lucide-react";

import ModeSwitcher from "./ModeSwitcher";

/**
 * Gallery demo. Owns the modes — which ones a composer offers is the product's
 * decision, and the pattern only cares that each has a label worth reading as
 * a placeholder.
 */
export default function ModeSwitcherDemo() {
  return (
    <ModeSwitcher
      modes={[
        { id: "ask", label: "Ask Anything", icon: <Sparkles /> },
        { id: "image", label: "Generate Image", icon: <ImageIcon /> },
      ]}
    />
  );
}
