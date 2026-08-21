---
title: Inline Overflow
slug: inline-overflow
category: disclosure
status: stable
---

## The problem

A toolbar with more actions than fit has to hide some. The usual answer is a
dropdown, which moves them to a different surface with different hit targets,
a different dismiss gesture and a different place on screen — so the secondary
actions stop being siblings of the primary ones and become a different class
of thing. Widening the bar in place keeps them all in one row, one surface,
one set of rules.

## Use cases

- A document or item toolbar with two everyday actions and a few rarer ones
- A selection toolbar in an editor, where the bar is already floating
- Any row of three to six actions that has to survive a narrow container

**Not for:** more than about six actions — past that the expanded bar is wider
than the container and the reveal has nowhere to go, so use a real menu. Not
for actions that need submenus, descriptions or icons-plus-detail — use
`create-menu`. Not for a single destructive action needing confirmation — use
`inline-confirm`.

This is the third of the library's _inline_ family, with `inline-confirm` and
`inline-search`. They share one idea: resolve the interaction in the surface
that started it rather than opening another one.

## Installation

```bash
npm install motion lucide-react react-use-measure
```

Then copy `InlineOverflow.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import InlineOverflow from "@/patterns/inline-overflow/InlineOverflow";
import { Copy, Save, Share, Trash2 } from "lucide-react";

<InlineOverflow
  label="Document actions"
  primary={[
    { id: "save", label: "Save", icon: <Save />, onSelect: () => save() },
    { id: "copy", label: "Copy", icon: <Copy />, onSelect: () => copy() },
  ]}
  overflow={[
    { id: "share", label: "Share", icon: <Share />, onSelect: () => share() },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 />,
      onSelect: () => remove(),
    },
  ]}
/>;
```

## API

| Prop           | Type                        | Default          | Description                                              |
| -------------- | --------------------------- | ---------------- | -------------------------------------------------------- |
| `primary`      | `readonly OverflowAction[]` | —                | Always visible. Two or three; this is the resting width. |
| `overflow`     | `readonly OverflowAction[]` | —                | Revealed in place by the toggle.                         |
| `label`        | `string`                    | `"Actions"`      | Accessible name for the toolbar.                         |
| `moreLabel`    | `string`                    | `"More actions"` | Accessible name for the toggle.                          |
| `defaultOpen`  | `boolean`                   | `false`          | Uncontrolled initial state.                              |
| `open`         | `boolean`                   | uncontrolled     | Controlled state. Pass with `onOpenChange`.              |
| `onOpenChange` | `(open: boolean) => void`   | —                | Fires on every toggle.                                   |
| `className`    | `string`                    | —                | Merged onto the root.                                    |

`OverflowAction`: `{ id: string; label: string; icon: ReactNode; onSelect: () => void }`.

## Keyboard

| Key               | Action                                                 |
| ----------------- | ------------------------------------------------------ |
| `Tab`             | Enter and leave the bar — it is one tab stop, not five |
| `←` / `→`         | Move between actions and the toggle, wrapping          |
| `Home` / `End`    | First action, or the toggle                            |
| `Enter` / `Space` | Run the focused action, or toggle the overflow         |
| `Escape`          | Collapse, returning focus to the toggle                |

The APG toolbar contract. A five-control bar that costs five tab presses to
walk past is the more common implementation and the wrong one.

## Accessibility

**None of the actions did anything.** All five chips were `cursor-pointer`
divs with no click handler and no keyboard path — the bar expanded, looked
complete, and could not be used by anyone. They are real buttons with an
`onSelect` callback now, and the toggle is a button rather than a div, so it
answers `Enter` and `Space`.

The toggle carries `aria-expanded` and `aria-controls` pointing at the revealed
group, so a screen reader user is told the bar has more in it before they go
looking. The bar itself is a labelled `role="toolbar"`.

Focus stays on the toggle when it opens, which is correct for a disclosure —
the revealed chips are one `←` away and nothing has been taken from you. It is
`Escape` that needs care: it can be pressed while focus is on a chip that is
about to unmount, so the toggle is focused through its own ref rather than by
index, because the index it will occupy after the collapse is not the one it
occupies during the event.

Under `prefers-reduced-motion` the width snaps, the blur is dropped, and the
chips lose the hover lift and tilt. The reveal still cross-fades, so the change
is not silent.

**Narrow containers.** The chips tighten from `px-3` to `px-2` below 420px of
container, which brings four labelled chips plus the toggle from ~390px down to
~360px and keeps the whole bar inside a typical preview column. Below that the
expanded row scrolls horizontally inside the pill rather than clipping, and
focus drags the scroll with it, so keyboard users reach every chip and the
toggle without touching the scroll at all.

The tightening matters more than it looks. When the row overflows, the thing
that ends up half-cut at the edge is the toggle — the one control that closes
the bar — and a control sliced down the middle reads as broken rather than as
scrollable.

**Touch is declared `false`, and that is not an oversight.** The chips are 36px
tall and the toggle is a 28px circle six pixels from its neighbour. The chips
could be grown to the 44px this library asks for, but the toggle could not —
not without either changing the bar's proportions or letting its hit area
overlap the chip beside it, and overlapping targets cause the mis-taps that the
44px rule exists to prevent. A dense action bar is a pointer-and-keyboard
control. Saying so is more useful than claiming a guarantee the layout cannot
keep; `speed-dial` is the thumb-reachable pattern.

## Performance

The bar's width is measured from its own content with `react-use-measure`
rather than hardcoded. The original animated to a fixed `210`, which is a
number that is only correct for the two labels it shipped with — translate
"Save" into German and the bar clips itself. Because the overflow group is
unmounted by `AnimatePresence` in `popLayout` mode, it leaves the flow the
instant it starts exiting, so one measurement drives both states.

Two details make that measurement safe rather than circular. The measured row
is `w-max`, so it reports its intrinsic width no matter what the bar around it
is doing; and the narrow-screen cap is `max-w-full` in CSS rather than a
`Math.min` against a second measurement. Capping the animated number against a
measured container would make the container's size an input to the width that
determines the container's size — which settles on a plausible-looking wrong
answer instead of failing loudly.

Width is a layout-animated property and there is no way around that here — the
bar's width _is_ the animation. It is one element on its own line, so the reflow
is cheap and contained; the chips ride it with `layout="position"`, which
translates them rather than re-laying them out.

The chips carried a `transition-all` class alongside Motion's `whileHover` and
`whileTap`. Two systems were driving one `transform`: CSS interpolating toward
each frame Motion wrote. Removing the class is what makes the press read as
immediate.

Two dead properties went with it — an `animationDelay` in a `animate` object,
which is not a Motion prop, and a `z: -10` on a non-3D element.

## Source

The full component is [`InlineOverflow.tsx`](./InlineOverflow.tsx). The docs
site renders it inline here with a copy button — this is a copy-paste library,
so the source is the delivery mechanism, not an appendix.

## Technologies

|             |                            |
| ----------- | -------------------------- |
| Framework   | React 19                   |
| Motion      | Motion 12 (`motion/react`) |
| Measurement | `react-use-measure`        |
| Styling     | Tailwind CSS v4            |
| Icons       | `lucide-react`             |
| Types       | TypeScript 5.9, strict     |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/1976537178088899045). Rebuilt with
a props API, working actions, an APG toolbar contract and reduced-motion
handling. The 200/14 width spring — damping ratio 0.49, well outside the house
default — is unchanged, because the overshoot is what makes the row read as
one elastic object rather than as chips appearing beside each other.
