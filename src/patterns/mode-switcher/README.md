---
title: Mode Switcher
slug: mode-switcher
category: input
status: stable
---

## The problem

A field that behaves differently depending on a mode set somewhere else is a
trap. You type a question into what turns out to be an image prompt, because
nothing in the field said which kind of thing it wanted — the mode was
indicated by a control off to one side that you had already stopped looking at.

Putting the answer in the placeholder puts it where the eye is already resting
before typing starts, and retyping it on every switch means the change is
impossible to miss even in peripheral vision.

## Use cases

- An AI composer that switches between chat, image, and search
- A single search field that scopes to people, files, or messages
- Any input whose parsing or destination changes with a mode

**Not for:** more than about four modes — cycling through them one press at a
time gets tedious fast, so use a real listbox. Not for modes that change the
field's _shape_ rather than its meaning; if one needs three inputs and another
needs one, they are different forms. Not where the placeholder is already
carrying an example or a hint you cannot afford to lose.

## Installation

```bash
npm install gsap @gsap/react motion lucide-react
```

Then copy `ModeSwitcher.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import ModeSwitcher from "@/patterns/mode-switcher/ModeSwitcher";
import { Image as ImageIcon, Sparkles } from "lucide-react";

<ModeSwitcher
  modes={[
    { id: "ask", label: "Ask Anything", icon: <Sparkles /> },
    { id: "image", label: "Generate Image", icon: <ImageIcon /> },
  ]}
  onSubmit={(value, modeId) => send(value, modeId)}
/>;
```

Each `label` is doing two jobs — the visible placeholder and the field's
accessible name — so write it as something worth reading in both.

## API

| Prop            | Type                      | Default      | Description                                  |
| --------------- | ------------------------- | ------------ | -------------------------------------------- |
| `modes`         | `readonly SwitcherMode[]` | —            | Two or more. The button cycles in order.     |
| `defaultMode`   | `string`                  | first mode   | Uncontrolled initial mode.                   |
| `mode`          | `string`                  | uncontrolled | Controlled mode. Pass with `onModeChange`.   |
| `onModeChange`  | `(id: string) => void`    | —            | Fires on every switch.                       |
| `defaultValue`  | `string`                  | `""`         | Uncontrolled initial field value.            |
| `value`         | `string`                  | uncontrolled | Controlled value. Pass with `onValueChange`. |
| `onValueChange` | `(value: string) => void` | —            | Fires on every keystroke.                    |
| `onSubmit`      | `(value, modeId) => void` | —            | Fires on Enter or the send button.           |
| `submitLabel`   | `string`                  | `"Send"`     | Accessible name for the send button.         |
| `className`     | `string`                  | —            | Merged onto the root.                        |

`SwitcherMode`: `{ id: string; label: string; icon: ReactNode }`.

## Keyboard

| Key                                  | Action                             |
| ------------------------------------ | ---------------------------------- |
| `Tab`                                | Mode button → field → send         |
| `Enter`                              | Submit, from anywhere in the field |
| `Space` / `Enter` on the mode button | Switch to the next mode            |

The root is a real `<form>`, so `Enter` submits. The original was a bare `div`
with an input in it and a send button wired to nothing, so `Enter` did nothing
at all — in a composer, which is the one control people expect to submit on
`Enter` without thinking about it.

## Accessibility

**The field had no name.** Its `placeholder` was the empty string, and the text
you can see is a separate absolutely-positioned `div` painted over the top. So
the one thing telling you which mode you are in was invisible to assistive
tech, and the field announced as just "edit text". It carries `aria-label` from
the current mode now, so the name changes with the mode exactly as the visible
placeholder does.

That overlay is also split into one `<span>` per character to animate, which
some screen readers spell out letter by letter. It is `aria-hidden` — the
`aria-label` carries the same words properly.

The mode button said "Toggle input mode", which names the action but not the
state. It reads "Mode: Generate Image. Change mode" now, and a polite live
region announces each switch, because a name that changes underneath you is not
reliably re-announced on its own.

**The send button did nothing.** No handler, no form. It submits now.

Under `prefers-reduced-motion` the switch is instant: the icon does not blur
out, the characters do not fly in, and the placeholder swaps directly. Nothing
is lost, because the information was always in the words rather than the
motion.

**Known limitation:** the `ChevronsUpDown` icon on the mode button implies a
dropdown, and this is a cycle button. It is kept because it is the original's
design, and with two modes the distinction rarely bites — but with three or
more it is a promise the control does not keep, and a listbox is the honest
answer at that point.

## Performance

The character split is imperative DOM work — `replaceChildren` and one span per
character — done on a node React does not own. That is the standard way to do a
per-character reveal without a paid plugin, and it is safe here precisely
because the node is `aria-hidden` and childless in JSX.

The switch is a single GSAP timeline with a named `syncPoint`, so the icon's
elastic return and the text's stagger start together rather than in sequence.
The `tl.to({}, { duration: 0.001 })` between them is not superstition: it gives
React a beat to commit the new icon before it is flown back in, and without it
the _outgoing_ glyph is what reappears.

Two things went. The icon carried a permanent `will-change: transform`, which
holds a compositor layer for the page's whole life to buy a few frames of a
200ms tween. And the button was `disabled` for the full second the animation
runs — disabling a control mid-press drops focus to the body in several
browsers, so the guard is a ref inside the handler instead.

One real bug came out of that guard: the original set its animating flag
_before_ checking the refs, so a null ref left the button permanently dead. The
check comes first now.

## Source

The full component is [`ModeSwitcher.tsx`](./ModeSwitcher.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                                           |
| --------- | --------------------------------------------------------- |
| Framework | React 19                                                  |
| Motion    | GSAP 3 (`@gsap/react` `useGSAP`), Motion 12 for the press |
| Styling   | Tailwind CSS v4                                           |
| Icons     | `lucide-react`                                            |
| Types     | TypeScript 5.9, strict                                    |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/1980523444807635342). Renamed from
Switcher Interaction, which named the mechanism rather than the job. Rebuilt
with a props API, a real form, an accessible name that tracks the mode, and
reduced-motion support. The GSAP timings are unchanged — `power2.in` out,
`elastic.out(1, 0.7)` back, and `elastic.out(1, 0.8)` with a 20ms stagger on
the characters.
