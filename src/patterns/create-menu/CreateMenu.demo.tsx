"use client";

import {
  Bell,
  CheckSquare,
  FileText,
  Flag,
  Folder,
  Trophy,
} from "lucide-react";

import CreateMenu from "./CreateMenu";

/**
 * Gallery demo. Owns the options; the pattern owns none of them.
 * `onSelect` is a no-op here — in a real app it opens the relevant composer.
 */
export default function CreateMenuDemo() {
  return (
    <CreateMenu
      triggerLabel="Create New"
      options={[
        {
          id: "project",
          label: "Project",
          icon: <Folder />,
          onSelect: () => {},
        },
        {
          id: "task",
          label: "Task",
          icon: <CheckSquare />,
          onSelect: () => {},
        },
        { id: "note", label: "Note", icon: <FileText />, onSelect: () => {} },
        { id: "goal", label: "Goal", icon: <Trophy />, onSelect: () => {} },
        {
          id: "milestone",
          label: "Milestone",
          icon: <Flag />,
          onSelect: () => {},
        },
        {
          id: "reminder",
          label: "Reminder",
          icon: <Bell />,
          onSelect: () => {},
        },
      ]}
    />
  );
}
