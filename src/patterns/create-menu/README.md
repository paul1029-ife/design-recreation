---
title: Create Menu
slug: create-menu
category: selection
status: stable
---

## The problem

A "New" button does not say what you can make. A dropdown answers that, but it
answers it as a list — six labels read in sequence before you find the one you
came for. A grid of labelled icons is scannable in a single pass, because you
recognise a shape rather than reading a word. Having the trigger morph into
the grid keeps the two connected, so it reads as the same control opening
rather than a panel arriving from somewhere else.

## Use cases

- A create or compose control with four to nine item types
- An "add block" menu in an editor
- Any picker where the options have strong, distinct icons

**Not for:** long or open-ended lists. Past about nine options the grid stops
being scannable and you want a searchable command palette. Also not for
options without recognisable icons — a grid of near-identical glyphs is slower
to read than a list.

## Installation

```bash
npm install motion lucide-react
```

Then copy `CreateMenu.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import CreateMenu from "@/patterns/create-menu/CreateMenu";
import { Folder, CheckSquare } from "lucide-react";

<CreateMenu
  options={[
    {
      id: "project",
      label: "Project",
      icon: <Folder />,
      onSelect: () => newProject(),
    },
    {
      id: "task",
      label: "Task",
      icon: <CheckSquare />,
      onSelect: () => newTask(),
    },
  ]}
/>;
```

## API

| Prop           | Type                          | Default        | Description                                   |
| -------------- | ----------------------------- | -------------- | --------------------------------------------- |
| `options`      | `readonly CreateMenuOption[]` | —              | The items. Empty renders nothing.             |
| `triggerLabel` | `string`                      | `"Create New"` | Trigger text, reused as the menu heading.     |
| `columns`      | `number`                      | `3`            | Grid width. Drives vertical arrow navigation. |
| `defaultOpen`  | `boolean`                     | `false`        | Uncontrolled initial state.                   |
| `open`         | `boolean`                     | uncontrolled   | Controlled state. Pass with `onOpenChange`.   |
| `onOpenChange` | `(open: boolean) => void`     | —              | Fires on every toggle.                        |
| `className`    | `string`                      | —              | Merged onto the root.                         |

`CreateMenuOption`: `{ id: string; label: string; icon: ReactNode; onSelect: () => void }`.

## Keyboard

| Key               | Action                                                 |
| ----------------- | ------------------------------------------------------ |
| `Enter` / `Space` | Open the menu, or choose the focused item              |
| `←` `→`           | Previous or next item, wrapping through the whole grid |
| `↑` `↓`           | Move by one row, wrapping within the column            |
| `Home` / `End`    | First or last item                                     |
| `Escape`          | Close and return focus to the trigger                  |

## Accessibility

**The options did nothing.** They were `cursor-pointer` divs with no click
handler at all — the menu opened, looked complete, and could not be used. They
are now real buttons with `role="menuitem"` and an `onSelect` callback.

The close control was an `<X onClick>` — a click handler on an SVG, so the
only way out of the menu was a mouse. It is a labelled button now, and
`Escape` closes from anywhere inside.

The trigger carries `aria-haspopup="menu"` and `aria-expanded`, and the menu
is labelled by the heading it morphs from. Focus is handed to the first item
on open and back to the trigger on close — the trigger unmounts during the
morph, so without that hand-off focus falls to the document body.

Roving `tabindex` keeps the grid to one tab stop; arrows move within it, which
is the menu contract people already know.

Under `prefers-reduced-motion` the scale and the plus-icon delay are dropped
and the items cross-fade in place. The stagger is kept: it is 40ms per item
and reads as sequence rather than movement.

**Known limitation:** vertical arrows wrap within a column rather than
clamping, and with a non-multiple-of-`columns` item count the last row is
short — so `↓` from the bottom of a short column lands on the first row rather
than a non-existent cell. That is deliberate, but it is not what a spreadsheet
does.

## Performance

The trigger and the menu share a `layoutId`, so the container morphs rather
than one element swapping for another — and the id is namespaced with `useId`,
so two instances on a page cannot animate into each other. The label shares a
second `layoutId`, which is what makes the heading appear to travel rather
than re-render in place.

Animates `transform` and `opacity` only. Items use a 300/20 spring and a 40ms
stagger, both kept verbatim from the original — the total is 240ms across six
items, inside the 200ms-per-element budget once the stagger overlaps.

`translateZ(0)` on the morphing elements is retained: it forces a compositor
layer up front, which avoids a first-frame hitch on the shared-layout
transition.

## Source

The full component is [`CreateMenu.tsx`](./CreateMenu.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

|           |                            |
| --------- | -------------------------- |
| Framework | React 19                   |
| Motion    | Motion 12 (`motion/react`) |
| Styling   | Tailwind CSS v4            |
| Icons     | `lucide-react`             |
| Types     | TypeScript 5.9, strict     |

## Credits

Original design by
[Dmitry Elisov](https://www.pinterest.com/pin/107523509848495963/). Rebuilt
with a props API, working options, a keyboard-operable menu following the
WAI-ARIA menu pattern, focus hand-off, and reduced-motion handling. The
morph, stagger and spring are unchanged.
