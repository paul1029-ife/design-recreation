---
title: Copy Feedback
slug: copy-feedback
category: feedback
status: stable
---

## The problem

Nothing distinguishes a successful copy from a click that missed. People press
Copy two or three times and still paste with their fingers crossed. A
confirmation fixes that — but a confirmation that vanishes on its own schedule
raises a second question: is it done, or is it stuck? Letting the fill run for
exactly as long as the message stays answers both at once.

## Use cases

- Invite codes, API keys, and one-time passwords
- Share links in a permissions or publish flow
- Any short value the user is about to paste somewhere else

**Not for:** long values that need to stay readable while being copied. The
pill truncates, and a truncated secret is hard to verify — use a field with a
copy affordance beside it.

## Installation

```bash
npm install motion lucide-react
```

Then copy `CopyFeedback.tsx`. It depends only on `@/lib/cn` and `@/lib/motion`.

## Usage

```tsx
import CopyFeedback from "@/patterns/copy-feedback/CopyFeedback";

<CopyFeedback value="7B38BD2" confirmLabel="Code copied!" />;
```

## API

| Prop           | Type                      | Default              | Description                                             |
| -------------- | ------------------------- | -------------------- | ------------------------------------------------------- |
| `value`        | `string`                  | —                    | Placed on the clipboard, and shown when idle.           |
| `actionLabel`  | `string`                  | `"Copy"`             | Trigger text.                                           |
| `confirmLabel` | `string`                  | `"Copied!"`          | Confirmation text.                                      |
| `errorLabel`   | `string`                  | `"Press ⌘C to copy"` | Shown if the clipboard write is refused.                |
| `holdMs`       | `number`                  | `2000`               | How long the confirmation is held. Drives the fill too. |
| `onCopy`       | `(value: string) => void` | —                    | Fires after a successful write.                         |
| `className`    | `string`                  | —                    | Merged onto the root.                                   |

## Keyboard

| Key               | Action                |
| ----------------- | --------------------- |
| `Tab`             | Focus the copy button |
| `Enter` / `Space` | Copy                  |

Focus stays on the trigger throughout. The confirmation replaces the pill's
contents visually but never moves focus, so repeated copies need no
re-targeting.

## Accessibility

**It now actually copies.** The original set a boolean and showed "Copied!"
without ever touching the clipboard — a confirmation for something that did
not happen, which is worse than no confirmation at all.

Clipboard access can be refused by permissions policy or an insecure origin.
That case gets its own state and message rather than being swallowed, so the
user is told to copy manually instead of pasting nothing.

The confirmation is `aria-hidden` and carried by a `role="status"` live region
instead. Visually the pill's contents swap; to assistive technology this is
one control reporting an outcome, not two elements appearing and disappearing.

Under `prefers-reduced-motion` the timer fill is not rendered at all — a bar
sweeping the full width of the control is exactly the kind of large-area
movement the preference is asking about. The text still swaps, so the
confirmation is never lost.

**Known limitation:** the fill is decorative for sighted users only; there is
no announced countdown. Announcing one would talk over the confirmation it is
timing.

## Performance

The fill animates `scaleX` from a left origin rather than `width` — a width
animation reflows the pill every frame, a transform does not. `linear` easing
is correct here and almost nowhere else in the library, because the bar
represents real elapsed time.

`holdMs` drives both the fill duration and the reset timer, so the bar cannot
finish before or after the message clears. Text swaps animate `opacity`,
`filter` and `scale` only, with blur capped at 4px.

## Source

The full component is [`CopyFeedback.tsx`](./CopyFeedback.tsx). The docs site
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

Original interaction by
[@nitishkmrk](https://x.com/nitishkmrk/status/1997641234567890123). Rebuilt
with a props API, a real clipboard write, an error state, screen-reader
announcements, a transform-based timer, and reduced-motion handling.
