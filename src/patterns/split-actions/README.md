---
title: Split Actions
slug: split-actions
category: disclosure
status: stable
---

## The problem

A generic "+" button hides what you can actually add, so people press it to
find out. A dropdown answers that but costs a second click and covers the
content underneath — which is often the thing you were about to act on. When
there are only two or three options, the button can simply become them.

## Use cases

- A floating create button with two or three real actions behind it
- A compose control that splits into "message" and "meeting"
- Any compact trigger whose options are worth showing rather than naming

**Not for:** more than three actions. The row stops fitting on a phone and the
convergence animation turns into noise — use a menu, which is what
`options-menu` is for.

## Installation

```bash
npm install motion lucide-react
```

Then copy `SplitActions.tsx`. It depends only on `@/lib/cn` and `@/lib/motion`.

## Usage

```tsx
import SplitActions from "@/patterns/split-actions/SplitActions";

<SplitActions
  triggerLabel="Add"
  actions={[
    { id: "schedule", label: "Schedule", onSelect: () => openScheduler() },
    { id: "remind", label: "Remind", onSelect: () => openReminder() },
  ]}
/>;
```

## API

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `actions` | `readonly SplitAction[]` | — | Two or three. Empty renders nothing. |
| `triggerLabel` | `string` | `"Show actions"` | Accessible name for the collapsed trigger. |
| `triggerIcon` | `ReactNode` | a plus | Icon inside the trigger. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state. |
| `open` | `boolean` | uncontrolled | Controlled state. Pass with `onOpenChange`. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires on every toggle. |
| `className` | `string` | — | Merged onto the root. |

`SplitAction`: `{ id: string; label: string; icon?: ReactNode; onSelect: () => void }`.

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Focus the trigger, then move through the actions once open |
| `Enter` / `Space` | Expand, or run the focused action |
| `Escape` | Collapse back to the trigger |

## Accessibility

The trigger carries `aria-expanded` and `aria-controls`, and an accessible
name — it was previously a button containing only an icon, so it announced as
"button".

**Focus is handed over explicitly.** The trigger unmounts when the row
expands, which destroys focus and drops a keyboard user at the top of the
document. Focus moves to the first action on open and returns to the trigger
on close. A `defaultOpen` mount does not steal focus, because that is a render
rather than an interaction.

Under `prefers-reduced-motion` the travel and blur are dropped and the pills
cross-fade; the reveal still happens, it just does not fly.

**Known limitation:** the actions are a row, not a menu, so there is no
roving-tabindex or type-ahead. That is correct at two or three items and wrong
at ten — which is the point at which you should be using a menu.

## Performance

Animates `transform`, `opacity` and `filter` only. Each pill enters from the
offset where the trigger was, computed symmetrically so the outermost travel
furthest and a middle one does not move at all — the row appears to unpack out
of the button rather than materialise around it.

Blur is capped at 12px on elements well under 200px, so paint stays cheap.
`mode="popLayout"` takes the exiting trigger out of flow immediately, so the
pills do not wait for it to finish before settling.

## Source

The full component is [`SplitActions.tsx`](./SplitActions.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

| | |
| --- | --- |
| Framework | React 19 |
| Motion | Motion 12 (`motion/react`) |
| Styling | Tailwind CSS v4 |
| Icons | `lucide-react` |
| Types | TypeScript 5.9, strict |

## Credits

Original interaction by
[@nitishkmrk](https://x.com/nitishkmrk/status/2054152857591419327). Rebuilt
with a props API, an accessible trigger, explicit focus handover, Escape to
collapse, and reduced-motion handling.
