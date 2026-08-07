"use client";

import { Gauge, Layers, MousePointerClick, Pointer, Send } from "lucide-react";

import Accordion, { type AccordionItem } from "./Accordion";

/**
 * Gallery entry. Owns the sample content and the sizing frame; the pattern
 * itself owns none of it.
 *
 * Starts fully collapsed — that is the resting state, and it is the one that
 * shows the unified container the interaction departs from.
 */
const ITEMS: readonly AccordionItem[] = [
  {
    id: "what-is",
    title: "What is Interaction Design?",
    icon: <MousePointerClick />,
    content:
      "The design of how people and products talk to each other — what a user can do, and how that exchange stays legible over time.",
  },
  {
    id: "principles",
    title: "Principles & Patterns",
    icon: <Layers />,
    content:
      "Fundamental guidelines and repeated solutions that ensure consistency and usability in design.",
  },
  {
    id: "usability",
    title: "Usability & Accessibility",
    icon: <Pointer />,
    content:
      "Whether people can actually complete the task — with a keyboard, with a screen reader, on a phone, and under load.",
  },
  {
    id: "prototyping",
    title: "Prototyping & Testing",
    icon: <Send />,
    content:
      "Building the cheapest thing that answers the question, putting it in front of real users, and letting the result change your mind.",
  },
  {
    id: "optimisation",
    title: "UX Optimisation",
    icon: <Gauge />,
    content:
      "Measuring what shipped, finding where people stall, and removing that friction without breaking the paths that already work.",
  },
];

export default function AccordionDemo() {
  return (
    <div className="flex w-full max-w-md items-center justify-center px-2 py-4">
      <Accordion items={ITEMS} />
    </div>
  );
}
