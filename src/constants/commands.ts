import {
  Calendar,
  UserPlus,
  FileText,
  Package,
  CalendarDays,
  ShieldCheck,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Mail,
  FileCheck,
} from "lucide-react";

export const commands = [
  {
    id: "schedule",
    label: "Create new schedule",
    icon: Calendar,
    shortcut: ["⌘", "S"],
  },
  {
    id: "customer",
    label: "Add new customer",
    icon: UserPlus,
    shortcut: ["⌘", "C"],
  },
  {
    id: "invoice",
    label: "Create new invoice",
    icon: FileText,
    shortcut: ["⌘", "I"],
  },
  {
    id: "product",
    label: "Add new product",
    icon: Package,
    shortcut: ["⌘", "P"],
  },
  {
    id: "credit-note",
    label: "Create new credit note",
    icon: FileCheck,
    shortcut: ["⌘", "N"],
  },
  {
    id: "event",
    label: "Create new event or metric",
    icon: CalendarDays,
    shortcut: ["⌘", "E"],
  },
  {
    id: "role",
    label: "Create new role or permissions",
    icon: ShieldCheck,
    shortcut: ["⌘", "R"],
  },
  {
    id: "invite",
    label: "Invite teammates",
    icon: Users,
    shortcut: ["⌘", "T"],
  },
  {
    id: "settings",
    label: "Open settings",
    icon: Settings,
    shortcut: ["⌘", ","],
  },
  {
    id: "analytics",
    label: "View analytics dashboard",
    icon: BarChart3,
    shortcut: ["⌘", "A"],
  },
  {
    id: "payment",
    label: "Process payment",
    icon: CreditCard,
    shortcut: ["⌘", "Y"],
  },
  {
    id: "email",
    label: "Send email campaign",
    icon: Mail,
    shortcut: ["⌘", "M"],
  },
];
