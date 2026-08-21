---
title: Delete with Undo
slug: delete-with-undo
category: action
status: stable
---

<!-- Live demo and Source are injected by the docs site from
     DeleteWithUndo.demo.tsx and DeleteWithUndo.tsx. -->

## The problem

"Are you sure?" is answered reflexively. People learn the shape of the dialog,
click through it without reading, and lose the thing anyway — so the dialog
costs an interruption without buying safety. Deferring the commit and offering
a way back for a few seconds is strictly better: it costs nothing when the
action was intended, and it is fully recoverable when it was not.

## Use cases

- Deleting a record from a table or list
- Archiving, unsubscribing, or leaving a workspace
- Any single destructive action whose effect can be deferred a few seconds

**Not for:** actions that cannot be deferred, such as anything that hits a
third party immediately (sending a message, charging a card). If the commit
can't wait, the undo window is a lie — use a real dialog.

## Installation

```bash
npm install motion lucide-react
```

Then copy `DeleteWithUndo.tsx`. It depends only on `@/lib/cn` and
`@/lib/motion`.

## Usage

```tsx
import DeleteWithUndo from "@/patterns/delete-with-undo/DeleteWithUndo";

<DeleteWithUndo
  label="Delete Account"
  undoLabel="Cancel Deletion"
  onDelete={() => deleteAccount()}
/>;
```

`onDelete` fires only once the window has elapsed, so it is the real commit
point — do not delete anything before it.

## API

| Prop             | Type                                | Default     | Description                                     |
| ---------------- | ----------------------------------- | ----------- | ----------------------------------------------- |
| `label`          | `string`                            | —           | Text of the destructive trigger.                |
| `onDelete`       | `() => void`                        | —           | Fires when the window elapses. The real commit. |
| `undoLabel`      | `string`                            | `"Undo"`    | Text of the undo control.                       |
| `deletedLabel`   | `string`                            | `"Deleted"` | Shown once the window elapses.                  |
| `undoWindowMs`   | `number`                            | `10000`     | Drives both the countdown and the commit.       |
| `onUndo`         | `() => void`                        | —           | Fires if the user takes it back.                |
| `onStatusChange` | `(s: DeleteWithUndoStatus) => void` | —           | Fires on every transition.                      |
| `disabled`       | `boolean`                           | `false`     | Disables the trigger.                           |
| `className`      | `string`                            | —           | Merged onto the root.                           |

`deleted` is terminal. The item is gone, and the component does not pretend
otherwise — remount it if you need a fresh instance.

## Keyboard

| Key               | Action                                                         |
| ----------------- | -------------------------------------------------------------- |
| `Tab`             | Focus the trigger, then the undo control once the window opens |
| `Enter` / `Space` | Start the deletion, or undo it                                 |

## Accessibility

The undo control is a real `<button>`. It was previously a `<div onClick>`,
which made the entire safety net decorative for anyone not using a mouse —
the trigger was reachable but the way back was not. Its accessible name
includes the time remaining, so the urgency is available without watching the
counter.

The per-character reveal is `aria-hidden` with the real string on the parent.
Without that, a screen reader spells the label out one letter at a time, which
is how most staggered-text implementations quietly break.

The live region announces only the window opening and closing. A counter
changing every second would talk over everything else, so the number is
`aria-hidden` and carried by the button's label instead.

The countdown is derived from a deadline rather than decremented, so a
throttled or backgrounded tab cannot make the displayed number disagree with
when the commit actually fires. `undoWindowMs` drives both — they cannot drift
apart, which they did when the timeout and the counter were separate literals.

Under `prefers-reduced-motion` the stagger is dropped entirely (the text
renders at once), and scale and travel are replaced with opacity.

**Known limitation:** the window keeps running while the undo control has
focus. Pausing on focus would be friendlier, but it would also mean the commit
time is no longer predictable from `undoWindowMs`, which callers depend on.

## Performance

Animates `transform` and `opacity` only. The trigger and the undo control
share a `layoutId`, so the change reads as one control transforming rather
than two elements swapping — and `layoutId` is namespaced with `useId` so two
instances on a page cannot animate into each other.

The countdown pill is `tabular-nums`; without it the digits change width and
the pill jitters every second. Stagger is capped at 200ms total regardless of
label length, so a long label does not delay the interface.

The interval ticks at 250ms rather than 1000ms so the displayed second is
never more than a quarter-second stale, at negligible cost.

## Source

The full component is [`DeleteWithUndo.tsx`](./DeleteWithUndo.tsx). The docs site renders it
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
[@nitishkmrk](https://x.com/nitishkmrk/status/1986684038409589227). Rebuilt
with a props API, a keyboard-reachable undo, a deadline-derived countdown,
screen-reader announcements, and reduced-motion handling.
