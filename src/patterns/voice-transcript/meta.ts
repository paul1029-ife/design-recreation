import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "voice-transcript",
  name: "Voice Transcript",
  problem:
    "A voice note cannot be skimmed or searched, so there is no way to tell whether it is worth forty seconds until you have already spent them.",
  category: "feedback",
  domains: ["messaging", "media", "accessibility"],
  tags: ["audio", "waveform", "transcript", "playback"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2057363853986701646",
  },
  added: "2026-08-18",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
