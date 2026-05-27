import { useState } from "react";
import InviteCard from "./components/recreations/InviteCard";
import InlineOverflow from "./components/recreations/InlineOverflow";
import type { PlaygroundComponent } from "./types";
import Modal from "./components/global/Modal";
import ComponentCard from "./components/global/ComponentCard";
import FoodOrderCard from "./components/recreations/OrderCard";
import CommandPalette from "./components/recreations/command-keyboard/CommandPalette";
import SwitcherInteraction from "./components/recreations/SwitcherInteraction";
import StripeNav from "./components/recreations/StripeNav";
import DeleteTimeout from "./components/recreations/DeleteTimeout";
import DiscoveryBar from "./components/recreations/DiscoveryBar";
import InilineToast from "./components/recreations/InilineToast";
import TabsInteraction from "./components/recreations/TabsInteraction";
import { PhMailbox } from "./components/icons/IconMailBox";
import { motion } from "motion/react";
import { MoveUpRight } from "lucide-react";
import ContextualBar from "./components/recreations/ContextualBar";
import PickerInteraction from "./components/recreations/PickerInteraction";
import OptionsMenu from "./components/recreations/OptionsMenu";
import FanMenu from "./components/recreations/FanMenu";
import EditableChip from "./components/recreations/EditableChip";
import InlineConfirm from "./components/recreations/InlineConfirm";
import SplitActions from "./components/recreations/SplitActions";
import VoiceNoteTranscription from "./components/recreations/VoiceNoteTranscription";

const components: PlaygroundComponent[] = [
  {
    id: 1,
    name: "Food Order Card",
    source: "tanjim38",
    url: "https://x.com/tanjim38/status/1979876452851183892?s=46",
    component: FoodOrderCard,
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
    id: 7,
    name: "Delete with Timeout",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1986684038409589227",
    component: DeleteTimeout,
  },
  {
    id: 8,
    name: "Discover Bar",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1991956289731239936",
    component: DiscoveryBar,
  },
  {
    id: 9,
    name: "Inline Toast",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1997641234567890123",
    component: InilineToast,
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
    url: "https://www.pinterest.com/pin/107523509848495963/feedback/?invite_code=030b4f1cb942429d857064cbff5adb32&sender_id=986147787064454915",
    component: OptionsMenu,
  },
  {
    id: 14,
    name: "Fan Menu",
    source: "Dmitry Elisov",
    url: "https://www.pinterest.com/pin/107523509848495963/feedback/?invite_code=030b4f1cb942429d857064cbff5adb32&sender_id=986147787064454915",
    component: FanMenu,
  },
  {
    id: 15,
    name: "Editable Chip",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2049797627580207241",
    component: EditableChip,
  },
  {
    id: 16,
    name: "Inline Confirm",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2054518189019783553",
    component: InlineConfirm,
  },
  {
    id: 17,
    name: "Split Actions",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2054152857591419327",
    component: SplitActions,
  },
  {
    id: 18,
    name: "Voice Note Transcription",
    source: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2057363853986701646",
    component: VoiceNoteTranscription,
  },
];

function App() {
  const [selectedComponent, setSelectedComponent] =
    useState<PlaygroundComponent | null>(null);

  const openModal = (component: PlaygroundComponent) =>
    setSelectedComponent(component);
  const closeModal = () => setSelectedComponent(null);

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center bg-[#f8f9fa] text-[#212529]"
      style={{
        opacity: 1,
        fontFamily: "Some-Sans",
      }}
    >
      <main className="flex flex-col items-start gap-16 justify-center w-full max-w-2xl px-3 py-16 backdrop-blur-[0.2px]">
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold">Ifeoluwa.</p>
          <p className="text-[#343a40]">Design Engineer</p>
        </div>
        <div className="">
          In my 4+ years writing code, I've grown to have a deeper appreciation
          for the thought put behind crafting user interactions. This is my
          playground, where I'll try to not only recreate things I appreciate,
          but also build interactions that others will appreciate. Hope you
          enjoy using them as much as I enjoyed building them. <br />
          For my comprehensive work{" "}
          <a
            href="https://ifeoluwa.tech"
            className="font-semibold underline"
            target="_blank"
          >
            ifeoluwa.tech
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {components.map((comp) => (
            <ComponentCard
              key={comp.id}
              name={comp.name}
              source={comp.source}
              url={comp.url}
              onClick={() => openModal(comp)}
            />
          ))}
        </div>

        {components.length === 0 && (
          <div className="text-gray-400 italic text-sm">
            No components yet. Start adding some.
          </div>
        )}

        <section id="contact">
          <div className="flex gap-2 items-center text-md font-semibold">
            {" "}
            <PhMailbox />
            <p className="">Reach out.</p>
          </div>
          <div className="mt-2">
            Are you a founder, or fellow designer/engineer looking to create
            something that your users won't forget? Or maybe you're just looking
            for a design engineer to add to your team? Please feel free to reach
            out.
          </div>
        </section>
      </main>

      <Modal
        isOpen={selectedComponent !== null}
        onClose={closeModal}
        component={selectedComponent?.component}
        name={selectedComponent?.name}
      />

      <footer className="w-full py-6 border-t-[1px] text-sm text-gray-700 max-w-2xl px-3 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          @2025{" "}
          <motion.span
            initial={{ backgroundColor: "rgba(33, 37, 41, 0.6)" }}
            animate={{ backgroundColor: "rgba(33, 37, 41, 1)" }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="size-2"
          ></motion.span>{" "}
          <span className="">{formatTime()}</span>
        </div>
        <div className="flex gap-2 items-center text-sm">
          <a
            className="flex items-center gap-0.5 cursor-pointer"
            href="https://x.com/theactual001"
          >
            Twitter <MoveUpRight className="size-3" />{" "}
          </a>
          <a
            className="flex items-center gap-0.5 cursor-pointer"
            href="https://github.com/paul1029-ife"
          >
            GitHub <MoveUpRight className="size-3" />{" "}
          </a>
          <a
            className="flex items-center gap-0.5 cursor-pointer"
            href="https://www.linkedin.com/in/paul-agbogun01/"
          >
            LinkedIn <MoveUpRight className="size-3" />{" "}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
