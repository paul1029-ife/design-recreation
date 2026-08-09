import type { ComponentType } from "react";

import CommandPalette from "@/components/recreations/command-keyboard/CommandPalette";
import ContextualBar from "@/components/recreations/ContextualBar";
import DiscoveryBar from "@/components/recreations/DiscoveryBar";
import FanMenu from "@/components/recreations/FanMenu";
import InlineOverflow from "@/components/recreations/InlineOverflow";
import InviteCard from "@/components/recreations/InviteCard";
import OptionsMenu from "@/components/recreations/OptionsMenu";
import OrderCard from "@/components/recreations/OrderCard";
import PickerInteraction from "@/components/recreations/PickerInteraction";
import StripeNav from "@/components/recreations/StripeNav";
import SwitcherInteraction from "@/components/recreations/SwitcherInteraction";
import TabsInteraction from "@/components/recreations/TabsInteraction";
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
    id: 3,
    name: "Inline Overflow Interaction",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1976537178088899045?s=46",
    component: InlineOverflow,
  },
  {
    id: 4,
    name: "Switcher Interaction",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1980523444807635342?s=46",
    component: SwitcherInteraction,
  },
  {
    id: 5,
    name: "Invite Card",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1803335945120514234",
    component: InviteCard,
  },
  {
    id: 6,
    name: "Stripe Navigation",
    source: "stripe",
    url: "https://stripe.com",
    component: StripeNav,
  },
  {
    id: 8,
    name: "Discover Bar",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1991956289731239936",
    component: DiscoveryBar,
  },
  {
    id: 10,
    name: "Discrete Tabs Interaction",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1997555674411348433",
    component: TabsInteraction,
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
    id: 13,
    name: "Options Menu",
    source: "Dmitry Elisov",
    url: "https://www.pinterest.com/pin/107523509848495963/",
    component: OptionsMenu,
  },
  {
    id: 14,
    name: "Fan Menu",
    source: "Dmitry Elisov",
    url: "https://www.pinterest.com/pin/107523509848495963/",
    component: FanMenu,
  },
  {
    id: 18,
    name: "Voice Note Transcription",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2057363853986701646",
    component: VoiceNoteTranscription,
  },
];

