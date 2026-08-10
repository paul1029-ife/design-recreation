---
title: Speed Dial
slug: speed-dial
category: disclosure
status: stable
---

## The problem

A floating action button is the one control a thumb can always reach, and it
says nothing about what it does. A menu answers that, but a centred or
dropped panel puts half its options outside the arc the thumb can cover — so
the affordance that made the button good is lost the moment it is used.
Fanning the actions out of the button keeps the origin visible and every
option in reach.

## Use cases

- A mobile create or upload button with three to six item types
- A corner-anchored quick action set in a media or files app
- Any thumb-zone control where the options must stay reachable one-handed

**Not for:** desktop-first layouts with room for an inline row — use
`split-actions`. Not for more than six actions: the stack grows taller than the
thumb arc, which defeats the point. Not for grids of options where scanning
matters more than reach — use `create-menu`.

## Installation

```bash
npm install motion lucide-react
```

Then copy `SpeedDial.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import SpeedDial from "@/patterns/speed-dial/SpeedDial";
import { Music, Video } from "lucide-react";

<SpeedDial
  triggerLabel="Add media"
  actions={[
    { id: "music", label: "Music", icon: <Music />, onSelect: () => addMusic() },
    { id: "video", label: "Video", icon: <Video />, onSelect: () => addVideo() },
  ]}
/>;
```

The stack is absolutely positioned above the trigger, so give the container
headroom — the component does not reserve it, because how much depends on
where you anchor it.

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `readonly SpeedDialAction[]` | — | Three to six. Empty renders nothing. |
| `triggerLabel` | `string` | `"Actions"` | Accessible name for the trigger and the menu. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state. |
| `open` | `boolean` | uncontrolled | Controlled state. Pass with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on every toggle. |
| `className` | `string` | — | Merged onto the root. |

`SpeedDialAction`: `{ id: string; label: string; icon: ReactNode; onSelect: () => void }`.

## Keyboard

| Key | Action |
| --- | --- |
| `Enter` / `Space` | Open the stack, or run the focused action |
| `↑` | Move toward the top of the stack |
| `↓` | Move back toward the trigger |
| `Home` / `End` | Furthest or nearest card |
| `Escape` | Close and return focus to the trigger |

Arrows follow the visual column rather than DOM order, so `↑` always moves up
the screen.

## Accessibility

**The actions did nothing.** They were `cursor-pointer` divs with no click
handler — the stack opened, looked complete, and could not be used by anyone,
mouse included. They are real buttons with an `onSelect` callback now.

The trigger was an icon-only button with no accessible name, so it announced
as "button". It now has a name, `aria-haspopup="menu"` and `aria-expanded`,
and it controls a labelled `role="menu"`.

Opening focuses the card nearest the trigger — the one that unfolds first and
the one a thumb reaches without stretching. Closing returns focus to the
trigger. `Escape` closes from anywhere inside.

Under `prefers-reduced-motion` the fan collapses to a plain cross-fade: no
travel, no rotation, and the trigger does not spin. The stack still opens, so
nothing is lost.

**Known limitation:** the stack opens upward only. Anchored in a top corner it
would open off-screen. Flipping it needs collision detection against the
viewport, which is a positioning concern this pattern deliberately does not
own — wrap it in a positioning primitive if you need that.

## Performance

Animates `transform` and `opacity` only. Offset and rotation are derived from
each card's distance from the trigger, so the geometry generalises to any
count rather than being hardcoded for five.

The stagger is 30ms per card, sequenced from the trigger outward, so a
five-card stack settles in 320ms — inside the budget, and it is what makes the
stack read as unfolding rather than appearing.

The trigger stays mounted throughout, unlike the other disclosure patterns
here, so there is no shared-layout work and no focus to recover from an
unmount.

## Source

The full component is [`SpeedDial.tsx`](./SpeedDial.tsx). The docs site renders
it inline here with a copy button — this is a copy-paste library, so the
source is the delivery mechanism, not an appendix.

## Technologies

| | |
| --- | --- |
| Framework | React 19 |
| Motion | Motion 12 (`motion/react`) |
| Styling | Tailwind CSS v4 |
| Icons | `lucide-react` |
| Types | TypeScript 5.9, strict |

## Credits

Original design by
[Dmitry Elisov](https://www.pinterest.com/pin/107523509848495963/). Renamed
from Fan Menu, which described the shape rather than the job. Rebuilt with a
props API, working actions, a keyboard-operable menu, focus hand-off, and
reduced-motion handling. The fan geometry, the 30ms stagger and the trigger's
45° turn are unchanged — including the tap that grows rather than shrinks.
