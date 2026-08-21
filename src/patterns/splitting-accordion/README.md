---
title: Splitting Accordion
slug: splitting-accordion
category: disclosure
status: stable
---

<!-- Live demo and Source are injected by the docs site (Phase 3) from
     AccordionDemo.tsx and Accordion.tsx respectively. -->

## The problem

In a standard accordion the open panel shares a container with every other row, so
the boundary between "the answer I opened" and "the questions I didn't" is carried
by a divider line at best. With long content the answer visually bleeds into
unrelated rows, and on a list of ten items you lose track of which question you were
even reading. This accordion lifts the open item out of the shared container into a
block of its own, without moving it — the surrounding items regroup around it and
the reading order never changes.

## Use cases

- FAQ sections where answers run several paragraphs and need a clear end
- Settings pages with grouped sections, one expanded at a time
- Course or documentation outlines where a topic expands in place

**Not for:** lists where several panels need to be open at once. The grouping is
derived from a single active index, so multi-expand is out of scope by design —
use a plain accordion.

## Installation

```bash
npm install motion lucide-react
```

Then copy `Accordion.tsx`. It depends only on `@/lib/cn` and `@/lib/motion`.

## Usage

```tsx
import Accordion, {
  type AccordionItem,
} from "@/patterns/splitting-accordion/SplittingAccordion";
import { Layers } from "lucide-react";

const items: AccordionItem[] = [
  {
    id: "principles",
    title: "Principles & Patterns",
    icon: <Layers />,
    content: "Fundamental guidelines and repeated solutions.",
  },
];

<Accordion items={items} />;
```

## API

| Prop            | Type                           | Default      | Description                                     |
| --------------- | ------------------------------ | ------------ | ----------------------------------------------- |
| `items`         | `readonly AccordionItem[]`     | —            | Rows to render. Empty renders nothing.          |
| `defaultOpenId` | `string \| null`               | `null`       | Uncontrolled initial open item.                 |
| `openId`        | `string \| null`               | uncontrolled | Controlled open item. Pass with `onOpenChange`. |
| `onOpenChange`  | `(id: string \| null) => void` | —            | Fires on every open/close.                      |
| `collapsible`   | `boolean`                      | `true`       | Whether clicking the open item closes it.       |
| `className`     | `string`                       | —            | Merged onto the root.                           |

`AccordionItem`: `{ id: string; title: string; content: ReactNode; icon?: ReactNode; disabled?: boolean }`.

## Keyboard

| Key               | Action                                           |
| ----------------- | ------------------------------------------------ |
| `Tab`             | Move into and out of the accordion               |
| `↓`               | Focus the next header, wrapping at the end       |
| `↑`               | Focus the previous header, wrapping at the start |
| `Home`            | Focus the first header                           |
| `End`             | Focus the last header                            |
| `Enter` / `Space` | Toggle the focused item                          |

## Accessibility

Each row is a `<button>` inside an `<h3>`, carrying `aria-expanded` and
`aria-controls`. The panel is a `role="region"` labelled by its trigger. Arrow,
Home and End follow the WAI-ARIA accordion pattern; Enter and Space are native
button activation, deliberately not intercepted.

Collapsed panels are unmounted rather than visually hidden, so they are absent
from the accessibility tree and the tab order — verified: only the open panel
exists in the DOM. The chevron and the hover layer are `aria-hidden`.

Under `prefers-reduced-motion` the group reorganisation, the chevron rotation and
the panel reveal all collapse to 0.01s. The state change itself is never skipped.

**Known limitation:** `aria-controls` points at a panel that only exists while the
item is open. This is the standard trade-off for unmounting panel content (Radix
and Reach make the same one), but some older screen readers warn about the dangling
reference. If that matters more to you than tab-order cleanliness, keep the panel
mounted and hide it with `hidden`.

## Performance

The items are one flat list and are never re-parented between group wrappers, so no
element loses DOM identity mid-transition. Repositioning uses Motion's
`layout="position"`, which compiles to transforms — nothing animates `top` or
`margin` per frame.

Border widths are constant and only their colour changes, so a group separating
never reflows by the border's 1px. Group corner radii and the chevron rotation are
paint- and compositor-only.

The one exception is the panel reveal, which animates `height` — a layout property.
A disclosure has to reveal content of unknown size and no transform can do that
without clipping or distorting it. The cost is bounded: one element, one axis,
≤350ms.

## Source

The full component is [`SplittingAccordion.tsx`](./SplittingAccordion.tsx). The docs site renders it
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

Original interaction designed and built for this library. The reference frames that
set the visual direction — unified container when collapsed, three rounded groups
when open — came from Ifeoluwa.
