"use client";

import { useState } from "react";

import ComponentCard from "@/components/global/ComponentCard";
import Modal from "@/components/global/Modal";
import { legacyEntries, type GalleryEntry } from "@/components/gallery/patterns";

/**
 * Preview grid for patterns that have not been migrated yet.
 *
 * These have no props API, docs or accessibility contract, so they get a modal
 * preview rather than a page — a URL would imply a documented pattern behind
 * it. This component disappears entirely once Phase 5 finishes.
 */
export function LegacyGallery() {
  const [selected, setSelected] = useState<GalleryEntry | null>(null);
  const Preview = selected?.component;

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {legacyEntries.map((entry) => (
          <li key={entry.id} className="flex">
            <ComponentCard
              name={entry.name}
              source={entry.source}
              url={entry.url}
              onClick={() => setSelected(entry)}
            />
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
      >
        {Preview ? <Preview /> : null}
      </Modal>
    </>
  );
}

export default LegacyGallery;
