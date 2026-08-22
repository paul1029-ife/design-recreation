---
title: Contextual Toolbar
slug: contextual-toolbar
category: layout
status: stable
---

## The problem

A toolbar that serves two jobs — a text prompt and a row of tools, say — has
two bad options. Show everything at once and it is wide enough to cover the
thing you are editing. Split it into two toolbars and every action starts with
finding the right one.

Keeping the mode switcher fixed and resizing the bar around whichever set is
active gives one control surface, in one place, at the width that set actually
needs. The switcher never moves, so the way back is always where you left it.

## Use cases

- An editor's floating toolbar with a manual mode and an AI prompt
- A media or timeline bar where tools and text input compete for one strip
- Any overlay control surface that must stay narrow enough to see past

**Not for:** more than three modes — the switcher grows and stops being the
fixed landmark that makes this work. Not for modes that need to be visible
simultaneously; this pattern trades that away deliberately. Not for a
persistent toolbar with room for everything, where switching is pure overhead.

## Installation

```bash
npm install motion lucide-react
```

Then copy `ContextualToolbar.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import ContextualToolbar from "@/patterns/contextual-toolbar/ContextualToolbar";
import { Music2, Sparkle } from "lucide-react";

<ContextualToolbar
  label="Editor mode"
  defaultMode="edit"
  modes={[
    { id: "edit", label: "Audio tools", icon: <Music2 />, content: <Tools /> },
    {
      id: "ai",
      label: "Refine with AI",
      icon: <Sparkle />,
      content: <Prompt />,
    },
  ]}
/>;
```

Each mode owns its own content, so the bar does not care whether a mode is a
form, a row of buttons or a single control — it only handles the switching and
the resize.

## API

| Prop           | Type                     | Default      | Description                                  |
| -------------- | ------------------------ | ------------ | -------------------------------------------- |
| `modes`        | `readonly ToolbarMode[]` | —            | Two or three. Empty renders nothing.         |
| `label`        | `string`                 | —            | Names the switcher for assistive technology. |
| `defaultMode`  | `string`                 | first mode   | Uncontrolled initial mode.                   |
| `mode`         | `string`                 | uncontrolled | Controlled mode. Pass with `onModeChange`.   |
| `onModeChange` | `(id: string) => void`   | —            | Fires on every switch.                       |
| `className`    | `string`                 | —            | Merged onto the root.                        |

`ToolbarMode`: `{ id: string; label: string; icon: ReactNode; content: ReactNode }`.

## Keyboard

| Key            | Action                                                         |
| -------------- | -------------------------------------------------------------- |
| `Tab`          | Enters the switcher, then moves into the active mode's content |
| `←` / `→`      | Switch mode, wrapping                                          |
| `Home` / `End` | First or last mode                                             |

The APG tabs contract with automatic activation: arrowing to a mode selects it,
because there is no cost to switching and nothing to confirm.

## Accessibility

**The mode icons were bare SVGs with `onClick`.** No role, no name, no tab
stop — so the only way to change mode was a mouse, and a screen reader was told
nothing about there being modes at all. They are a real `role="tablist"` of
`role="tab"` buttons now, with `aria-selected` and `aria-controls` pointing at
the panel, and the panel points back with `aria-labelledby`.

This is genuinely tabs rather than a radio group: there is one panel and its
contents are what changes. The library's other segmented control,
`expanding-segments`, is a `radiogroup` precisely because it has no panel.

**The submit button had no handler and no name**, and the four tool icons were
decoration — they looked like controls and were not. That is the sixth pattern
in this library where an affordance existed visually but not functionally; in
the migrated version the tools and the submit are the consumer's to wire, and
the demo wires them.

The caret colour was a hardcoded slate that was near-invisible on a dark
surface. It follows the text colour now.

Under `prefers-reduced-motion` the bar resizes instantly and the panels
cross-fade without travel or blur.

**Known limitation — touch targets.** The mode tabs are 28px circles sitting in
a dense pill. Their hit area is pushed out with a pseudo-element to 44px tall
and to the midpoint of the gap horizontally, which is 36px wide — comfortably
past the 24px WCAG 2.5.8 minimum, but under the 44px this library asks for.
Closing that gap means spacing the switcher out until it stops being the small
fixed landmark the whole pattern leans on, so the pattern is flagged
`touch: false` rather than claiming otherwise. If you need thumb targets, grow
the tabs and accept a taller bar.

## Performance

The bar's resize is a `layout` animation, and the border radius is set inline
rather than by a class so Motion can correct it during the projection —
without that, the corners visibly distort as the width changes.

**The spring's amplitude is a property of your content, not of the spring.**
At `stiffness: 110, damping: 10` the damping ratio is 0.477, so the first peak
overshoots by 18.2% — of whatever distance the bar actually travels. Give the
two modes similar widths and there is nothing left to bounce: an early version
of this demo padded the tool buttons out to 32px, which brought the tools row
to within 12px of the prompt row and reduced the visible overshoot to 2.2px.
Restoring the original's 16px icons puts the travel back at 76px and the
overshoot at 13.8px.

So if this reads as flat, check the width delta before touching the spring.
The tool buttons keep a 32×40 hit area through a pseudo-element, which buys
the touch target back without spending the width.

`will-change: transform` was set permanently on two elements. That holds a
compositor layer for the life of the page to buy a few frames of a 200ms
animation, and it is exactly what the property is documented not to be for.
Both are gone.

Direction is passed through `AnimatePresence`'s `custom` rather than baked
into each mode's variants. An exiting element renders with frozen props, so
reading direction off the mode itself would always use the previous value and
reversing would send both panels the same way.

## Source

The full component is [`ContextualToolbar.tsx`](./ContextualToolbar.tsx). The
docs site renders it inline here with a copy button — this is a copy-paste
library, so the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                                          |
| --------- | -------------------------------------------------------- |
| Framework | React 19                                                 |
| Motion    | Motion 12 (`motion/react`), `layout` + `AnimatePresence` |
| Styling   | Tailwind CSS v4                                          |
| Icons     | `lucide-react`                                           |
| Types     | TypeScript 5.9, strict                                   |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/2002747455155405041). Renamed from
Contextual AI Bar — AI is one of the two modes, not what the pattern is.
Rebuilt with a props API, a tabs contract, working controls and reduced-motion
handling.

The two modes were also wired to the wrong icons: the music note opened the AI
prompt and the sparkle opened the audio tools. Because each mode now carries
its own content, the pairing is the consumer's to state and the demo states it
the right way round.

The 110/10 resize spring — damping ratio 0.48, a pronounced overshoot — is
unchanged. That give is what makes the bar read as one object reshaping rather
than as two toolbars being swapped.
