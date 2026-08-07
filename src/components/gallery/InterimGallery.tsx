"use client";

import { useState } from "react";

import ComponentCard from "@/components/global/ComponentCard";
import Modal from "@/components/global/Modal";
import { galleryEntries, type GalleryEntry } from "@/components/gallery/patterns";

/**
 * Interim gallery — a faithful port of the pre-migration grid so no pattern is
 * lost while the foundation lands. Phase 4 replaces this with the real
 * homepage (hero, search, categories, featured) and Phase 3 gives each pattern
 * a dedicated page instead of a modal preview.
 */
export function InterimGallery() {
  const [selected, setSelected] = useState<GalleryEntry | null>(null);
  const Preview = selected?.component;

  return (
    <>
      <ul className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        {galleryEntries.map((entry) => (
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

export default InterimGallery;
