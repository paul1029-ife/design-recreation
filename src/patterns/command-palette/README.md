---
title: Command Palette
slug: command-palette
category: navigation
status: stable
---

## The problem

A command palette that arrives as a modal over the page throws away the one
piece of context people had: where the search box was, and what it belonged to.
The overlay appears from nowhere, dims everything, and has to be dismissed
before the page can be seen again.

Growing the field itself into the panel keeps the origin. The list reads as the
field having more to say rather than as a new surface arriving on top of the
old one — and closing puts you back exactly where you started.

## Use cases

- App-wide search and actions behind ⌘K
- A dashboard's "what can I do here" affordance, discoverable without a shortcut
- Any searchable action list of roughly ten to fifty items

**Not for:** navigation with a handful of destinations — a menu is cheaper.
Not for search that returns rich results with previews and pagination; this
list is one line per item. Not as a modal replacement: it deliberately does not
trap focus or dim the page, which is what makes it feel inline.

## Installation

```bash
npm install motion lucide-react
```

Then copy `CommandPalette.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import CommandPalette from "@/patterns/command-palette/CommandPalette";
import { Calendar, UserPlus } from "lucide-react";

<CommandPalette
  commands={[
    {
      id: "schedule",
      label: "Create new schedule",
      icon: <Calendar />,
      shortcut: ["⌘", "S"],
      onSelect: () => createSchedule(),
    },
    {
      id: "customer",
      label: "Add new customer",
      icon: <UserPlus />,
      onSelect: addCustomer,
    },
  ]}
/>;
```

## API

| Prop             | Type                 | Default                 | Description                                 |
| ---------------- | -------------------- | ----------------------- | ------------------------------------------- |
| `commands`       | `readonly Command[]` | —                       | The full list, filtered as you type.        |
| `collapsedLabel` | `string`             | `"Search for anything"` | Resting placeholder and the trigger's name. |
| `placeholder`    | `string`             | `"Search commands…"`    | Placeholder once open.                      |
| `groupLabel`     | `string`             | `"Suggestions"`         | Heading above the results.                  |
| `hotkey`         | `boolean`            | `true`                  | Bind ⌘K / Ctrl+K on the document.           |
| `className`      | `string`             | —                       | Merged onto the root.                       |

`Command`: `{ id: string; label: string; icon: ReactNode; shortcut?: readonly string[]; onSelect?: () => void }`.

Turn `hotkey` off when more than one palette can exist on a page — otherwise
every instance answers the same chord at once.

## Keyboard

| Key             | Action                                            |
| --------------- | ------------------------------------------------- |
| `⌘K` / `Ctrl+K` | Open from anywhere                                |
| `↑` / `↓`       | Move the highlight, wrapping                      |
| `Home` / `End`  | First or last result                              |
| `Enter`         | Run the highlighted command                       |
| `Escape`        | Close, clear the query, focus back on the trigger |

The field keeps focus the whole time and the highlight moves through
`aria-activedescendant`. Moving real DOM focus into the list would take it off
the input, and in a palette you have to be able to keep typing.

## Accessibility

**None of the commands did anything.** Every row was a button with no click
handler and no `onSelect` — the list filtered, highlighted and responded to
hover, and selecting an item was impossible for anyone. They run now, by click
or by `Enter`.

**There was no way to move through the list.** A command palette whose arrow
keys do nothing is the pattern's central interaction missing: you could type to
filter but not reach what you filtered to. Arrows, Home, End and Enter all work,
against an APG combobox contract — `role="combobox"` on the field with
`aria-expanded`, `aria-controls` and `aria-activedescendant`, and a `role="listbox"`
of `role="option"` rows carrying `aria-selected`.

**The close button was empty.** It rendered as `<button></button>` — no glyph,
no label, no content at all — so it was an invisible control sitting in the tab
order that announced as "button". It has an icon and a name now.

The trigger declares its shortcut with `aria-keyshortcuts`, so the ⌘K binding
is discoverable rather than folklore. Focus follows the surface: into the field
on open, back to the trigger on close.

The highlight is clamped rather than reset in an effect — filtering can shorten
the list underneath a highlight that has already moved past the new end.

Under `prefers-reduced-motion` the shared-layout growth still runs (it is
position and size, not travel) while the row fades and the dismiss button's
entrance delay are dropped.

**Known limitation:** this does not trap focus or dim the page, so it is not a
modal. That is deliberate — it is what makes the palette read as the field
expanding rather than as an overlay — but it means `Tab` can walk out of the
open panel into the page behind it. If you need containment, wrap it in a real
dialog and lose the inline feel.

## Performance

The two states share a `layoutId`, so collapsed-to-expanded is one shared-layout
projection rather than a crossfade between two boxes. The ids are scoped with
`useId`, so several palettes on a page do not animate into each other.

Filtering is `useMemo` over the source list — derived state, not state
synchronised in an effect, which would cost a render per keystroke and show a
stale list for one frame.

The bottom fade is `sticky`, not `absolute`. Positioned absolutely inside the
scroll container it scrolls away with the content it is supposed to be fading.

## Source

The full component is [`CommandPalette.tsx`](./CommandPalette.tsx). The docs
site renders it inline here with a copy button — this is a copy-paste library,
so the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                        |
| --------- | -------------------------------------- |
| Framework | React 19                               |
| Motion    | Motion 12 (`motion/react`), `layoutId` |
| Styling   | Tailwind CSS v4                        |
| Icons     | `lucide-react`                         |
| Types     | TypeScript 5.9, strict                 |

## Credits

Original design by
[ydwndr](https://x.com/ydwndr/status/1971241276243956025). Rebuilt with a props
API, working commands, arrow-key navigation, a combobox contract, a dismiss
button that exists, and reduced-motion handling. The shared-layout growth, the
30px radius, the 190ms delay before the dismiss button appears and the 150ms
row fade are unchanged.
