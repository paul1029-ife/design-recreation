---
title: Inline Confirm
slug: inline-confirm
category: feedback
status: stable
---

<!-- Live demo and Source are injected by the docs site from
     InlineConfirm.demo.tsx and InlineConfirm.tsx. -->

## The problem

Confirming an action usually costs a modal. Modals break flow, steal focus, and
train people to dismiss without reading — at which point the confirmation has
stopped confirming anything. This keeps the whole exchange inside the control
the user just pressed: the trigger becomes the progress indicator, then the
result, then the trigger again. Focus never moves, so a keyboard user is never
relocated mid-action.

## Use cases

- Syncing or connecting an external account from a settings row
- Any action taking 1–4s where a page-level spinner would feel disconnected
  from the thing that started it
- Low-stakes commits inside a table row or list item

**Not for:** destructive or irreversible actions. Use `delete-with-undo`, which
gives people a way back, or a real dialog when the stakes justify interrupting.

## Installation

```bash
npm install motion lucide-react
```

Then copy `InlineConfirm.tsx`. It depends only on `@/lib/cn` and `@/lib/motion`.

## Usage

```tsx
import InlineConfirm from "@/patterns/inline-confirm/InlineConfirm";

<InlineConfirm
  label="Calendar"
  actionLabel="Sync Events"
  onConfirm={() => syncCalendar()}
/>;
```

Return a promise from `onConfirm` and the pending stage tracks it. Return
nothing and it resolves immediately.

## API

| Prop                    | Type                                 | Default                 | Description                                                |
| ----------------------- | ------------------------------------ | ----------------------- | ---------------------------------------------------------- |
| `label`                 | `string`                             | —                       | Names the thing being acted on.                            |
| `onConfirm`             | `() => void \| Promise<void>`        | —                       | Called on commit. A rejection returns the control to idle. |
| `actionLabel`           | `string`                             | `"Confirm"`             | Trigger text.                                              |
| `icon`                  | `ReactNode`                          | —                       | Leading icon, rendered in a 30px slot.                     |
| `status`                | `"idle" \| "pending" \| "confirmed"` | uncontrolled            | Controlled stage. Pass with `onStatusChange`.              |
| `onStatusChange`        | `(s: InlineConfirmStatus) => void`   | —                       | Fires on every stage transition.                           |
| `confirmedHoldMs`       | `number`                             | `2000`                  | How long the confirmed stage is held.                      |
| `disabled`              | `boolean`                            | `false`                 | Disables the trigger.                                      |
| `pendingAnnouncement`   | `string`                             | `` `${actionLabel}…` `` | Screen-reader text while in flight.                        |
| `confirmedAnnouncement` | `string`                             | `"Done"`                | Screen-reader text on completion.                          |
| `className`             | `string`                             | —                       | Merged onto the root.                                      |

## Keyboard

| Key               | Action            |
| ----------------- | ----------------- |
| `Tab`             | Focus the trigger |
| `Enter` / `Space` | Commit            |

The control has one tab stop. While pending and confirmed there is nothing to
focus, so focus stays where the user left it rather than being moved or lost.

## Accessibility

The three visual stages are `aria-hidden`. Visually they replace one another,
but to assistive technology they are one control whose state changed — so the
change is carried by a single `role="status"` live region instead of three
elements appearing and disappearing. The region is mounted before its text
changes, otherwise nothing is announced.

The trigger is a real `<button>` with a visible `:focus-visible` ring and a
44px hit area produced by a pseudo-element, so the pill stays 30px tall
without failing the touch target minimum.

Under `prefers-reduced-motion` the blur and travel are dropped; the pending
indicator switches from a sliding bar to a pulse so the "still working" signal
survives without lateral movement.

**Known limitation:** the pending stage is indeterminate — there is no
percentage to announce, only "working". For operations beyond about 5 seconds,
prefer a determinate progress control so people can tell whether it has
stalled.

## Performance

Animates `transform`, `opacity` and `filter` only. The container uses Motion's
`layout` prop, which compiles to a transform rather than animating width. Blur
is capped at 5px on elements under 200px, keeping paint under 1ms at 4× CPU
throttle. Variants and transitions are hoisted to module scope so they are not
reallocated on every render.

`layoutId` is namespaced with `useId`, so two instances on one page cannot
claim the same shared-layout id and animate into each other.

## Source

The full component is [`InlineConfirm.tsx`](./InlineConfirm.tsx). The docs site renders it
inline here with a copy button — this is a copy-paste library, so the source is
the delivery mechanism, not an appendix.

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
[@nitishkmrk](https://x.com/nitishkmrk/status/2054518189019783553). Rebuilt with
a props API, a real promise-driven state machine, keyboard and screen-reader
support, and reduced-motion handling. The decorative shimmer sweep across the
completed checkmark was dropped — the checkmark had already delivered the
state, so the sweep communicated nothing.
