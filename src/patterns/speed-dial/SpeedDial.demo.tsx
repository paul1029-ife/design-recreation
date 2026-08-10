"use client";

import { BookA, Image as ImageIcon, Music, PiIcon, Video } from "lucide-react";

import SpeedDial from "./SpeedDial";

/**
 * Gallery demo. Owns the sample actions and the headroom the fan needs — the
 * pattern is anchored to whatever corner the consumer puts it in, so the
 * spacing belongs here rather than baked into the component.
 */
export default function SpeedDialDemo() {
  return (
    <div className="flex w-full items-end justify-center pt-64 pb-4">
      <SpeedDial
        triggerLabel="Add media"
        actions={[
          { id: "learning", label: "Learning", icon: <BookA />, onSelect: () => {} },
          { id: "document", label: "Document", icon: <PiIcon />, onSelect: () => {} },
          { id: "music", label: "Music", icon: <Music />, onSelect: () => {} },
          { id: "video", label: "Video", icon: <Video />, onSelect: () => {} },
          { id: "image", label: "Image", icon: <ImageIcon />, onSelect: () => {} },
        ]}
      />
    </div>
  );
}
