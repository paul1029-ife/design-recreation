"use client";

import { useCallback, useEffect, useState } from "react";

import DeleteWithUndo from "./DeleteWithUndo";

/**
 * Gallery demo.
 *
 * `deleted` is terminal in the component — the item really is gone, and
 * pretending otherwise would be a lie in the API. Replayability is a gallery
 * concern, so the demo remounts the pattern with a fresh key a few seconds
 * after the commit rather than the component resetting itself.
 *
 * The window is shortened to 5s so the interaction can be seen end to end
 * without waiting; the real default is 10s.
 */
export default function DeleteWithUndoDemo() {
  const [run, setRun] = useState(0);
  const [deletedAt, setDeletedAt] = useState<number | null>(null);

  const handleDelete = useCallback(() => setDeletedAt(Date.now()), []);

  useEffect(() => {
    if (deletedAt === null) return;
    const id = window.setTimeout(() => {
      setDeletedAt(null);
      setRun((n) => n + 1);
    }, 2200);
    return () => window.clearTimeout(id);
  }, [deletedAt]);

  return (
    <DeleteWithUndo
      key={run}
      label="Delete Account"
      undoLabel="Cancel Deletion"
      deletedLabel="Account deleted."
      undoWindowMs={5000}
      onDelete={handleDelete}
    />
  );
}
