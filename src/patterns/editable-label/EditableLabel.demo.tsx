"use client";

import EditableLabel from "./EditableLabel";

/**
 * Gallery demo. Starts with a real name rather than an empty string — the
 * original opened blank, which made the pattern read as an input rather than
 * a rename.
 */
export default function EditableLabelDemo() {
  return <EditableLabel defaultValue="Design Review" fieldLabel="Board name" />;
}
