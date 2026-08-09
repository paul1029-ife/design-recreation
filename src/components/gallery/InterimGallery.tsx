"use client";

import { useState } from "react";
import type { Route } from "next";

import ComponentCard from "@/components/global/ComponentCard";
import Modal from "@/components/global/Modal";
import { galleryEntries, type GalleryEntry } from "@/components/gallery/patterns";

/**
 * Interim gallery — a faithful port of the pre-migration grid so no pattern is
 * lost while the foundation lands. Phase 4 replaces this with the real
 * homepage (hero, search, categories, featured).
 *
 * Migrated patterns navigate to their own documented page; the modal preview
 * remains only for patterns that do not have one yet, and disappears entirely
 * once Phase 5 finishes.
 */
export function InterimGallery() {
  const [selected, setSelected] = useState<GalleryEntry | null>(null);
  const Preview = selected?.component;

  return (
    <>
      <ul className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        {galleryEntries.map((entry) => (
          <li key={entry.id} className="flex">
            {entry.slug ? (
              <ComponentCard
                name={entry.name}
                source={entry.source}
                url={entry.url}
                // typedRoutes cannot verify a template built from runtime
                // data. The slug comes from the registry, and every registry
                // slug has a prerendered page via generateStaticParams — so
                // the guarantee holds, it just isn't expressible to the checker.
                href={`/patterns/${entry.slug}` as Route}
              />
            ) : (
              <ComponentCard
                name={entry.name}
                source={entry.source}
                url={entry.url}
                onClick={() => setSelected(entry)}
              />
            )}
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
