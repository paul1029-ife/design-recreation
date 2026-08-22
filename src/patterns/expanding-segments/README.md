---
title: Expanding Segments
slug: expanding-segments
category: selection
status: stable
---

## The problem

An icon-only row is compact, but it is also unlabelled — people cannot tell
what the options are without hovering each one, and hovering is not available
on touch. Labelling every icon solves that and immediately stops fitting.
Expanding only the selection keeps the row small while always naming the
current choice, which is the one people most need to read back.

## Use cases

- A mailbox or workspace switcher in a compact toolbar
- Filter modes where the active filter must stay legible
- Any small single-select where the options are recognisable as icons but the
  current one needs a name

**Not for:** more than four options, or options whose icons are not
self-evident. If people cannot guess an icon before selecting it, expanding
the one they already chose does not help them.

## Installation

```bash
npm install motion
```

Then copy `ExpandingSegments.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import ExpandingSegments from "@/patterns/expanding-segments/ExpandingSegments";
import { Mail, Calendar, Bell } from "lucide-react";

<ExpandingSegments
  label="Mailbox view"
  segments={[
    {
      id: "inbox",
      label: "Inbox",
      icon: <Mail />,
      accentClassName: "text-blue-600",
    },
    { id: "planner", label: "Planner", icon: <Calendar /> },
    { id: "alerts", label: "Alerts", icon: <Bell /> },
  ]}
  onValueChange={(id) => setView(id)}
/>;
```

## API

| Prop            | Type                   | Default       | Description                                      |
| --------------- | ---------------------- | ------------- | ------------------------------------------------ |
| `segments`      | `readonly Segment[]`   | —             | The options. Empty renders nothing.              |
| `label`         | `string`               | —             | Names the group for assistive technology.        |
| `defaultValue`  | `string`               | first segment | Uncontrolled initial selection.                  |
| `value`         | `string`               | uncontrolled  | Controlled selection. Pass with `onValueChange`. |
| `onValueChange` | `(id: string) => void` | —             | Fires on every selection change.                 |
| `className`     | `string`               | —             | Merged onto the root.                            |

`Segment`: `{ id: string; label: string; icon: ReactNode; accentClassName?: string }`.

## Keyboard

| Key            | Action                                              |
| -------------- | --------------------------------------------------- |
| `Tab`          | Enter and leave the group — it is a single tab stop |
| `←` `→`        | Move the selection, wrapping at both ends           |
| `↑` `↓`        | Same as left and right                              |
| `Home` / `End` | First or last segment                               |

## Accessibility

The original was three `<div onClick>` elements, so the whole control was
**unreachable by keyboard** — there was no way to change the selection without
a mouse. It is now a `role="radiogroup"` of `role="radio"` buttons following
the WAI-ARIA radiogroup pattern: arrows move selection and focus together, and
roving `tabindex` keeps the group to one tab stop rather than three.

`aria-checked` carries the selection, so it is announced without relying on
the label expanding — which is a visual signal only.

Each icon is `aria-hidden`; the accessible name comes from the visible label,
which is always in the DOM even when it is visually collapsed to zero opacity.
That means a screen-reader user hears all three names, not just the selected
one.

Under `prefers-reduced-motion` the width change and the sheen are dropped and
the selection updates immediately. The label still swaps, so nothing is lost.

**Known limitation:** the collapsed labels are transparent rather than
`hidden`, so they remain in the accessibility tree by design — that is what
makes the unselected options announceable. It also means they are inside the
pill's `overflow-hidden` box rather than removed, which is fine at three
options and would need revisiting at ten.

## Performance

Animates `width`, which is a layout property and normally avoided. It is kept
here deliberately: the pill's expansion _is_ the interaction, and Motion's
`layout` prop produces a visibly different feel — it interpolates a transform
between measured boxes, which distorts the icon and label mid-flight. One
element, one axis, bounded by a spring that settles in about 400ms.

The spring is kept verbatim from the original at `300/20` (damping ratio
0.577) rather than mapped onto `spring.snappy`. The ratio is close, but the
lower stiffness makes it about 15% slower and that difference is legible in a
control this small.

The sheen runs only on the segment that just became selected, so it reads as
confirmation rather than ambient decoration, and it is skipped entirely under
reduced motion.

## Source

The full component is [`ExpandingSegments.tsx`](./ExpandingSegments.tsx). The
docs site renders it inline here with a copy button — this is a copy-paste
library, so the source is the delivery mechanism, not an appendix.

## Technologies

|           |                            |
| --------- | -------------------------- |
| Framework | React 19                   |
| Motion    | Motion 12 (`motion/react`) |
| Styling   | Tailwind CSS v4            |
| Types     | TypeScript 5.9, strict     |

## Credits

Original interaction by
[@nitishkmrk](https://x.com/nitishkmrk/status/1997555674411348433). Rebuilt as
a keyboard-operable radiogroup with a props API, driven by data rather than
three duplicated blocks, with reduced-motion handling. The width spring and
the sheen are unchanged.
