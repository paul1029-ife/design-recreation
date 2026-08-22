---
title: Mega Nav
slug: mega-nav
category: navigation
status: stable
---

## The problem

Giving each navigation section its own dropdown makes every section feel like a
different place. The panel vanishes and a new one appears, so moving from
"Platform" to "Developers" reads as two separate visits rather than as
scanning across one menu — and the sections stop looking like siblings.

Keeping one panel and moving it holds the relationship visible. The arrow stays
pointed at whichever item you are on, so the panel is always visibly _about_
that item, and the content slides sideways rather than being replaced.

## Use cases

- A marketing or product header with three to five sections
- A docs site nav where each section needs descriptions, not just labels
- Any nav where sections are peers and people compare across them

**Not for:** small screens — the panel is a two-column grid anchored to a
horizontal bar, and neither survives a phone. Ship a disclosure list there
instead. Not for a single dropdown: one section does not need shared-layout
machinery. Not for application chrome where the nav must not open on hover.

## Installation

```bash
npm install motion lucide-react
```

Then copy `MegaNav.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import MegaNav from "@/patterns/mega-nav/MegaNav";

<MegaNav
  label="Product"
  items={[
    {
      label: "Platform",
      links: [
        {
          label: "Dashboard",
          description: "Manage your stores",
          href: "/dash",
        },
        { label: "Analytics", description: "Track reach", href: "/analytics" },
      ],
    },
    {
      label: "Developers",
      links: [{ label: "API Docs", description: "Integrate", href: "/docs" }],
      banner: { description: "Start building with the API.", href: "/start" },
    },
  ]}
/>;
```

## API

| Prop        | Type                 | Default  | Description                                |
| ----------- | -------------------- | -------- | ------------------------------------------ |
| `items`     | `readonly NavItem[]` | —        | Top-level sections. Empty renders nothing. |
| `label`     | `string`             | `"Main"` | Names the navigation landmark.             |
| `className` | `string`             | —        | Merged onto the `<nav>`.                   |

`NavItem`: `{ label: string; links: readonly NavLink[]; banner?: NavBanner }`.
`NavLink`: `{ label: string; description: string; href: string }`.
`NavBanner`: `{ description: string; href: string }`.

## Keyboard

| Key               | Action                                              |
| ----------------- | --------------------------------------------------- |
| `Tab`             | Move onto the bar, then into the open panel's links |
| `←` / `→`         | Move between top-level sections                     |
| `↓`               | Open the focused section                            |
| `Enter` / `Space` | Toggle the focused section                          |
| `Escape`          | Close and return focus to the section button        |

## Accessibility

**It could not be opened with a keyboard at all.** The top-level items were
`<li>` elements with `onMouseEnter` and nothing else — not focusable, not
activatable, with no `aria-expanded` and no path to the panel. Everything below
the bar was unreachable for anyone not using a pointer, which is the whole
navigation.

They are buttons now, with `aria-expanded` and `aria-controls`. Hover still
opens, because that is the interaction being recreated, but it is no longer the
only way in: arrows walk the bar, `↓` and `Enter` open, `Escape` closes and
returns focus to the button that opened it. The panel's links are ordinary
anchors, so `Tab` reaches them once it is open.

`Escape` is bound on the document rather than on the bar, because by the time
you want it your focus is usually on a link inside the panel.

**The banner was hardcoded indigo** — `bg-indigo-50` with `text-indigo-900` —
which in dark mode put near-black text on a pale wash. It uses the accent token
at low opacity now, so it reads as a highlight in both themes.

`group-hover:translate-x-1` on the banner's arrow never fired: the modifier was
on the icon with no `group` on any ancestor. The class is on the anchor now.

**Known limitation:** this is a desktop pattern and the metadata says so —
`responsive: false`. A two-column panel hanging off a horizontal bar has no
sensible phone form, and pretending otherwise with a breakpoint would produce
something that is neither. Use a disclosure list on small screens.

## Performance

`transform` and `opacity`, plus the arrow's `left`.

The pill is a `layoutId` inside a `LayoutGroup`, so moving between sections is
one shared-layout projection rather than two fades. The `layoutId` is scoped
with `useId`, so two navs on a page do not fight over one pill — the original's
global `"active-pill"` string meant the second instance would steal it.

The arrow's offset is measured in `useLayoutEffect`, not `useEffect`. Measuring
after paint means the first open renders the arrow at the previous item's
offset and then jumps to the right one.

A `layoutId="dropdown-background"` element is gone. It was an absolutely
positioned `bg-surface` layer inside a `bg-surface` panel — invisible, and
animating on every section change.

## Source

The full component is [`MegaNav.tsx`](./MegaNav.tsx). The docs site renders it
inline here with a copy button — this is a copy-paste library, so the source is
the delivery mechanism, not an appendix.

## Technologies

|           |                                                        |
| --------- | ------------------------------------------------------ |
| Framework | React 19                                               |
| Motion    | Motion 12 (`motion/react`), `LayoutGroup` + `layoutId` |
| Styling   | Tailwind CSS v4                                        |
| Icons     | `lucide-react`                                         |
| Types     | TypeScript 5.9, strict                                 |

## Credits

Adapted from [Stripe](https://stripe.com)'s product navigation. Renamed from
Stripe Navigation, since the library names patterns for the job rather than for
whoever shipped them first. Rebuilt with a props API, a keyboard path, focus
restoration, themed colours and reduced-motion handling. The 300/30 pill
spring, the lighter-mass panel entrance, the 400/40 arrow and the 200ms content
slide are unchanged.
