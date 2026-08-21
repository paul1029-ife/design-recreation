---
title: Quick Select
slug: quick-select
category: selection
status: stable
---

## The problem

A dropdown for two or three choices makes you open a list, read it, and aim at
a row — three steps to flip something you already understood before you
pressed anything. The list adds nothing when the whole option set would fit on
one line.

Laying the options out as a row above the trigger makes the set visible at a
glance and every option a single tap, while the trigger keeps showing the
current value rather than being replaced by the menu.

## Use cases

- Visibility, permission or scope on a share sheet
- A two- or three-way mode switch that changes what a Save button does
- Any binary that is worth confirming visually before committing

**Not for:** more than about four options — the row grows wider than the
trigger it hangs off and the arrow stops pointing at anything. Use a real
listbox. Not for options that need descriptions — use `create-menu`. Not for a
choice that is already visible and permanent: if the row can just live on the
page, use `expanding-segments` and skip the popover.

## Installation

```bash
npm install motion lucide-react
```

Then copy `QuickSelect.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import QuickSelect from "@/patterns/quick-select/QuickSelect";
import { Globe, Lock } from "lucide-react";

<QuickSelect
  label="Visibility"
  defaultValue="public"
  onValueChange={(id) => setVisibility(id)}
  options={[
    { id: "private", label: "Private", icon: <Lock /> },
    { id: "public", label: "Public", icon: <Globe /> },
  ]}
/>;
```

The popover opens upward, so give the container headroom — the component does
not reserve it, because how much depends on where you anchor it.

## API

| Prop            | Type                           | Default      | Description                                      |
| --------------- | ------------------------------ | ------------ | ------------------------------------------------ |
| `options`       | `readonly QuickSelectOption[]` | —            | Two to four. Empty renders nothing.              |
| `label`         | `string`                       | —            | Names the control, e.g. "Visibility".            |
| `defaultValue`  | `string`                       | first option | Uncontrolled initial selection.                  |
| `value`         | `string`                       | uncontrolled | Controlled selection. Pass with `onValueChange`. |
| `onValueChange` | `(id: string) => void`         | —            | Fires on selection.                              |
| `className`     | `string`                       | —            | Merged onto the root.                            |

`QuickSelectOption`: `{ id: string; label: string; icon: ReactNode }`.

## Keyboard

| Key               | Action                                                      |
| ----------------- | ----------------------------------------------------------- |
| `Enter` / `Space` | Open the popover, or commit the focused option              |
| `←` `→` `↑` `↓`   | Move between options, wrapping                              |
| `Home` / `End`    | First or last option                                        |
| `Escape`          | Close without changing the value, focus back on the trigger |

## Accessibility

**It could not be closed.** The popover only toggled from the trigger, so
clicking anywhere else left it hanging over the page — the dismissal everyone
reaches for first did nothing. It closes on outside pointerdown and on
`Escape` now.

The trigger was a button with no `aria-haspopup`, no `aria-expanded` and no
indication it owned a popup, and the options were plain buttons with no
selected state — a screen reader user heard "Private" and "Public" with
nothing saying either was chosen. It is an APG listbox now: the trigger
declares the popup and its state, the popover is a labelled `role="listbox"`,
and each option carries `aria-selected`.

The trigger's accessible name is `"Visibility: Public"` rather than just
"Public". The value is the button's visible text, so without the prefix it
announces the answer without the question.

Opening focuses the current value, so the first arrow press moves from where
you are rather than from the top of the row. Closing returns focus to the
trigger. The focus effect deliberately depends on `open` alone — keying it to
the selection as well would drag focus around while you are still arrowing
through the options.

Under `prefers-reduced-motion` the popover cross-fades with no rise or scale,
the value swap loses its vertical travel, and the chevron does not spin. The
control still opens, selects and closes.

## Performance

`transform` and `opacity` only. The trigger carries `layout`, so the width
change when a longer label replaces a shorter one is a projection rather than
a reflow.

The value swap sits inside a `min-w-[80px]` box. Without a floor, exchanging
"Public" for "Private" resizes the trigger mid-swap and shoves the chevron
sideways while it is spinning — two things moving for one decision.

A permanent `will-change: transform` on the wrapper is gone. It held a
compositor layer for the life of the page to buy a 200ms popover.

## Source

The full component is [`QuickSelect.tsx`](./QuickSelect.tsx). The docs site
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
[nitishkmrk](https://x.com/nitishkmrk/status/2008234567890123456). Renamed from
Picker Interaction, which named the widget category rather than the job.
Rebuilt with a props API, an APG listbox contract, outside-click and Escape
dismissal, focus hand-off in both directions and reduced-motion handling. The
popover's rise, the 150ms value swap and the chevron's `circOut` spin are
unchanged.
