"use client";

import { useState } from "react";
import {
  ArrowRight,
  AudioWaveform,
  Mic2,
  Music2,
  Scissors,
  Sparkle,
  Timer,
} from "lucide-react";

import { cn } from "@/lib/cn";
import ContextualToolbar from "./ContextualToolbar";

const tools = [
  { id: "trim", label: "Trim", icon: <Scissors /> },
  { id: "timing", label: "Timing", icon: <Timer /> },
  { id: "voice", label: "Voice", icon: <Mic2 /> },
  { id: "levels", label: "Levels", icon: <AudioWaveform /> },
];

/**
 * Gallery demo. Owns both modes' contents, which is the point of the props
 * API — and is also where the original's wiring was crossed: the music note
 * opened an AI prompt and the sparkle opened the audio tools.
 */
export default function ContextualToolbarDemo() {
  const [prompt, setPrompt] = useState("");

  return (
    <ContextualToolbar
      label="Editor mode"
      defaultMode="edit"
      modes={[
        {
          id: "edit",
          label: "Audio tools",
          icon: <Music2 />,
          content: (
            <div className="flex items-center gap-4 px-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  aria-label={tool.label}
                  className={cn(
                    "focus-ring relative grid size-4 shrink-0 place-items-center",
                    "rounded-full text-content [&>svg]:size-4",
                    // 16px visually, like the original. Padding the button out
                    // instead would widen this row to nearly the width of the
                    // AI row, and the bar's resize spring would have almost
                    // nothing left to travel — which is the whole effect.
                    "before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']",
                  )}
                >
                  <span aria-hidden="true">{tool.icon}</span>
                </button>
              ))}
            </div>
          ),
        },
        {
          id: "ai",
          label: "Refine with AI",
          icon: <Sparkle />,
          content: (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPrompt("");
              }}
              className="flex min-w-0 items-center"
            >
              <input
                type="text"
                aria-label="Refine with AI"
                placeholder="Refine with AI"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                // `caret-content`, not a hardcoded slate: the original's caret
                // was near-invisible against a dark surface.
                className={cn(
                  "w-40 min-w-0 bg-transparent text-lg text-content-muted",
                  "caret-content outline-none placeholder:text-content-subtle",
                )}
              />
              <button
                type="submit"
                aria-label="Send"
                className={cn(
                  "focus-ring ml-2 shrink-0 rounded-full bg-surface p-2 shadow-sm",
                  "text-content transition-colors hover:bg-surface-subtle",
                )}
              >
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </form>
          ),
        },
      ]}
    />
  );
}
