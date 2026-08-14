import type { ComponentType } from "react";

import CommandPalette from "@/components/recreations/command-keyboard/CommandPalette";
import ContextualBar from "@/components/recreations/ContextualBar";
import OrderCard from "@/components/recreations/OrderCard";
import PickerInteraction from "@/components/recreations/PickerInteraction";
import StripeNav from "@/components/recreations/StripeNav";
import SwitcherInteraction from "@/components/recreations/SwitcherInteraction";
import VoiceNoteTranscription from "@/components/recreations/VoiceNoteTranscription";

export interface GalleryEntry {
  id: number;
  name: string;
  source: string;
  url: string;
  component: ComponentType;
}

/**
 * Patterns still in the flat pre-migration layout.
 *
 * Shrinks to nothing as Phase 5 moves each one into `src/patterns/`. The names
 * here are still the old mechanism-first ones; they become problem-first on
 * migration, alongside slug redirects.
 */
export const legacyEntries: readonly GalleryEntry[] = [
  {
    id: 1,
    name: "Food Order Card",
    source: "tanjim38",
    url: "https://x.com/tanjim38/status/1979876452851183892?s=46",
    component: OrderCard,
  },
  {
    id: 2,
    name: "Command Keyboard",
    source: "ydwndr",
    url: "https://x.com/ydwndr/status/1971241276243956025?s=46",
    component: CommandPalette,
  },
  {
    id: 4,
    name: "Switcher Interaction",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1980523444807635342?s=46",
    component: SwitcherInteraction,
  },
  {
    id: 6,
    name: "Stripe Navigation",
    source: "stripe",
    url: "https://stripe.com",
    component: StripeNav,
  },
  {
    id: 11,
    name: "Contextual AI Bar",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2002747455155405041?s=20",
    component: ContextualBar,
  },
  {
    id: 12,
    name: "Picker Interaction",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2008234567890123456?s=20",
    component: PickerInteraction,
  },
  {
    id: 18,
    name: "Voice Note Transcription",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2057363853986701646",
    component: VoiceNoteTranscription,
  },
];
