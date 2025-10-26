import { useState } from "react";
import InviteCard from "./components/recreations/InviteCard";
import InlineOverflow from "./components/recreations/InlineOverflow";
import type { PlaygroundComponent } from "./types";
import Modal from "./components/global/Modal";
import ComponentCard from "./components/global/ComponentCard";
import FoodOrderCard from "./components/recreations/OrderCard";
import CommandPalette from "./components/recreations/command-keyboard/CommandPalette";

const components: PlaygroundComponent[] = [
  {
    id: 1,
    name: "Food Order Card",
    source: "Yadwinder Singh",
    component: FoodOrderCard,
  },
  {
    id: 2,
    name: "Command Keyboard",
    source: "Tanjim",
    component: CommandPalette,
  },
  {
    id: 3,
    name: "Invite Card",
    source: "Nitish Khagwal",
    component: InviteCard,
  },
  {
    id: 4,
    name: "Inline Overflow Interaction",
    source: "Nitish Khagwal",
    component: InlineOverflow,
  },
];

function App() {
  const [selectedComponent, setSelectedComponent] =
    useState<PlaygroundComponent | null>(null);

  const openModal = (component: PlaygroundComponent) =>
    setSelectedComponent(component);
  const closeModal = () => setSelectedComponent(null);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-black">
      <main className="flex flex-col gap-16 items-center justify-center w-full max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Ife's Playground
          </h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            A minimal collection of UI components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {components.map((comp) => (
            <ComponentCard
              key={comp.id}
              name={comp.name}
              source={comp.source}
              onClick={() => openModal(comp)}
            />
          ))}
        </div>

        {components.length === 0 && (
          <div className="text-gray-400 italic text-sm">
            No components yet. Start adding some.
          </div>
        )}
      </main>

      <Modal
        isOpen={selectedComponent !== null}
        onClose={closeModal}
        component={selectedComponent?.component}
        name={selectedComponent?.name}
      />
      <footer className="w-full py-6 text-center text-sm text-gray-500">
        Built by{" "}
        <a
          href="https://ifeoluwa.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-black transition"
        >
          Ifeoluwa Agbogun
        </a>
      </footer>
    </div>
  );
}

export default App;
