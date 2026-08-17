---
title: Order Status
slug: order-status
category: feedback
status: stable
---

## The problem

A status that only ever renders its current value makes people re-read the
whole card to work out whether anything moved since they last looked. Nothing
distinguishes "packing" from "packing, still" — the card looks the same either
way, so the only way to know is to remember what it said before.

Animating the change carries that information in the motion itself. The puck
advances along the track, so progress is legible before a single word has been
read, and arriving on a card mid-transition tells you something just happened.

## Use cases

- Order or delivery tracking, where the stage changes while the page is open
- A multi-step job — export, build, render — with a known number of stages
- Any short, ordered, forward-only sequence that the server drives

**Not for:** progress with no discrete stages — use a plain bar. Not for steps
a user drives themselves; the motion here says "this moved on its own", which
is misleading if they pressed something. Not for sequences that can fail or go
backwards: the puck only travels one way and retiring it at the end means
"done", not "stopped".

## Installation

```bash
npm install gsap @gsap/react motion
```

Then copy `OrderStatus.tsx`. It depends on `@/lib/cn` and the four icons in
`@/components/icons`, or pass your own through `stages`.

## Usage

```tsx
import OrderStatus from "@/patterns/order-status/OrderStatus";

<OrderStatus onComplete={() => celebrate()} />;
```

The default four-stage delivery flow is exported as `defaultOrderStages` if you
want to adapt rather than replace it.

```tsx
<OrderStatus
  holdMs={2000}
  stages={[
    {
      id: "queued",
      title: "Queued",
      subtitle: "Waiting for a worker",
      meta: "Est. 30s",
      icon: <Clock />,
      progress: 0.33,
    },
    // …
  ]}
/>
```

## API

Deliberately small. This is a display, not a widget — most of what a consumer
needs to change is the content, and the rest is the design.

| Prop         | Type                    | Default           | Description                                   |
| ------------ | ----------------------- | ----------------- | --------------------------------------------- |
| `stages`     | `readonly OrderStage[]` | the delivery flow | Ordered, forward-only. Empty renders nothing. |
| `holdMs`     | `number`                | `1100`            | How long each stage is held before advancing. |
| `onComplete` | `() => void`            | —                 | Fires once, when the last stage is reached.   |
| `className`  | `string`                | —                 | Merged onto the root.                         |

`OrderStage`: `{ id: string; title: string; subtitle: string; meta: string; icon: ReactNode; progress: number }`, where `progress` is 0–1.

## Keyboard

There is nothing to operate. The card has no controls — it reports, and the
sequence is driven by the server, so there is no task for a keyboard to
complete. That is why this pattern does not claim keyboard support rather than
claiming it and meaning "not applicable".

The information still has to reach people who are not watching it, which is
what the live region below is for.

## Accessibility

**The card announced nothing.** It advanced through four stages on its own with
no live region, so a screen reader user was told about the first stage on load
and then never again — the order could go from "Preparing" to "Delivered"
in silence. The text block is a `role="status"` live region now, so each stage
is announced as it arrives, politely, without interrupting.

The track is a `role="progressbar"` with `aria-valuenow` counting stages rather
than percent, and an `aria-valuetext` that reads "Out for Delivery — step 3 of
4". Percent would have been the easy mapping and the wrong one: the stages are
what the card is about, and "75%" does not say which one you are in.

The travelling puck is `aria-hidden`. It duplicates what the progressbar and
the live region already say, and its icon changes for decorative reasons.

Under `prefers-reduced-motion` every duration in the timeline collapses to
zero. The sequence, the stage changes, the live announcements and the hold
between stages all survive — only the travel goes. This matters more here than
in most patterns: the animation _is_ the message, so the reduced version has to
keep delivering that message in text rather than simply removing it.

**The card is dark in both themes.** That is the design rather than an
unfinished light mode, so its interior uses fixed light values instead of the
inverting content tokens, which would resolve to grey-on-black in light mode. A
hairline ring separates it from a dark canvas.

## Performance

The sequence is one GSAP timeline per stage, scoped to the container through
`useGSAP`, so everything it creates is reverted on unmount.

The auto-advance is a `gsap.delayedCall` rather than a `setTimeout`. That is
not a style preference: the delayed call is registered with the scoped context,
so unmounting mid-sequence kills it, where a bare timeout fires into a
component that no longer exists. The original left one running.

The puck's travel animates `left`, which is a layout property — kept from the
original, because switching to a transform would need the track measured and
the pattern is not paying for that complexity for one 20px dot. It also carried
`willChange: "transform"` while animating `left`, which is wrong twice over:
permanent `will-change` holds a compositor layer for the page's whole life, and
it named a property that was never animating. That is gone.

The four progress bars animate `scaleX` from a left origin, which is composited
and free.

## Source

The full component is [`OrderStatus.tsx`](./OrderStatus.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                                                            |
| --------- | -------------------------------------------------------------------------- |
| Framework | React 19                                                                   |
| Motion    | GSAP 3 (`@gsap/react` `useGSAP`) for the sequence, Motion 12 for the badge |
| Styling   | Tailwind CSS v4                                                            |
| Types     | TypeScript 5.9, strict                                                     |

## Credits

Original design by
[tanjim38](https://x.com/tanjim38/status/1979876452851183892). Renamed from Food
Order Card, which described the example rather than the job. Rebuilt with a
small props API, a live region, a progressbar contract, reduced-motion support
and a delayed call that cleans up after itself. Every GSAP duration, ease and
position offset — including the `elastic.out(1, 0.4)` on the text and the
`back.in`/`back.out(1.7)` on the puck — is unchanged.
