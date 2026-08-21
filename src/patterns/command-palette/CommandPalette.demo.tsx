"use client";

import {
  BarChart3,
  Calendar,
  CalendarDays,
  CreditCard,
  FileCheck,
  FileText,
  Mail,
  Package,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import CommandPalette from "./CommandPalette";

/**
 * Gallery demo. Owns the command list and the headroom the expanded panel
 * needs. `hotkey` is off here: several demos share a page, and three palettes
 * all answering ⌘K would open three at once.
 */
export default function CommandPaletteDemo() {
  return (
    <div className="flex w-full justify-center px-4 pt-8 pb-64">
      <CommandPalette
        hotkey={false}
        commands={[
          {
            id: "schedule",
            label: "Create new schedule",
            icon: <Calendar />,
            shortcut: ["⌘", "S"],
          },
          {
            id: "customer",
            label: "Add new customer",
            icon: <UserPlus />,
            shortcut: ["⌘", "C"],
          },
          {
            id: "invoice",
            label: "Draft an invoice",
            icon: <FileText />,
            shortcut: ["⌘", "I"],
          },
          { id: "inventory", label: "Check inventory", icon: <Package /> },
          { id: "meeting", label: "Book a meeting", icon: <CalendarDays /> },
          { id: "verify", label: "Verify a supplier", icon: <ShieldCheck /> },
          { id: "team", label: "Invite your team", icon: <Users /> },
          { id: "settings", label: "Open settings", icon: <Settings /> },
          { id: "reports", label: "View reports", icon: <BarChart3 /> },
          { id: "billing", label: "Manage billing", icon: <CreditCard /> },
          { id: "email", label: "Send an email", icon: <Mail /> },
          { id: "approve", label: "Approve a request", icon: <FileCheck /> },
        ]}
      />
    </div>
  );
}
