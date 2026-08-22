"use client";

import VoiceTranscript from "./VoiceTranscript";

/**
 * Gallery demo. Owns the headroom the bubble needs — it grows upward out of
 * flow, so the space belongs to whatever the player is sitting in.
 */
export default function VoiceTranscriptDemo() {
  return (
    <div className="flex w-full items-end justify-center pt-40 pb-4">
      <VoiceTranscript />
    </div>
  );
}
