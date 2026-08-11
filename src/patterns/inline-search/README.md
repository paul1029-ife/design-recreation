---
title: Inline Search
slug: inline-search
category: navigation
status: stable
---

## The problem

Search needs room to type. The browse filters are already using that room. Put
them side by side and both are cramped; move search to its own screen and the
filters go away with it, so choosing "Popular" again means navigating back.

Handing the space over solves both: the field grows out of its own icon while
the filters collapse into the dismiss button. One bar, two jobs, and the
control that undoes the state sits exactly where the thing it replaced was.

## Use cases

- A discovery or browse header with two or three views plus search
- A media, shop or feed toolbar on mobile, where a second row is not free
- Any filter strip that needs search without a separate search screen

**Not for:** search that returns a rich result list needing its own surface —
use a command palette. Not for more than three filters: they have to fit
beside a 250px field on a phone, and four will not. Not for filters that must
stay visible while searching — this pattern's whole trade is that they do not.

This is one of the library's _inline_ family, with `inline-confirm` and
`inline-overflow`. They share one idea: resolve the interaction in the surface
that started it rather than opening another one.

## Installation

```bash
npm install motion lucide-react
```

Then copy `InlineSearch.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import InlineSearch from "@/patterns/inline-search/InlineSearch";
import { Flame, Heart } from "lucide-react";

<InlineSearch
  filtersLabel="Browse"
  defaultFilter="favorites"
  onFilterChange={(id) => setView(id)}
  onQueryChange={(q) => setQuery(q)}
  filters={[
    {
      id: "popular",
      label: "Popular",
      icon: <Flame fill="currentColor" />,
      activeClassName: "bg-rose-100 dark:bg-rose-500/15",
      accentClassName: "text-rose-600 dark:text-rose-400",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart fill="currentColor" />,
      activeClassName: "bg-rose-100 dark:bg-rose-500/15",
      accentClassName: "text-rose-600 dark:text-rose-400",
    },
  ]}
/>;
```

Colour is a prop, not a built-in. The original hardcoded a pink gradient and a
red label, which is a design decision the pattern has no business making — and
one that had no dark-mode answer.

## API

| Prop             | Type                      | Default          | Description                                       |
| ---------------- | ------------------------- | ---------------- | ------------------------------------------------- |
| `filters`        | `readonly SearchFilter[]` | —                | Two or three. Empty renders nothing.              |
| `filtersLabel`   | `string`                  | —                | Names the group for assistive technology.         |
| `defaultFilter`  | `string`                  | first filter     | Uncontrolled initial selection.                   |
| `filter`         | `string`                  | uncontrolled     | Controlled selection. Pass with `onFilterChange`. |
| `onFilterChange` | `(id: string) => void`    | —                | Fires on every selection.                         |
| `defaultQuery`   | `string`                  | `""`             | Uncontrolled initial query.                       |
| `query`          | `string`                  | uncontrolled     | Controlled query. Pass with `onQueryChange`.      |
| `onQueryChange`  | `(query: string) => void` | —                | Fires on every keystroke and on dismiss.          |
| `placeholder`    | `string`                  | `"Search…"`      | Field placeholder.                                |
| `searchLabel`    | `string`                  | `"Search"`       | Accessible name for the trigger and the field.    |
| `closeLabel`     | `string`                  | `"Close search"` | Accessible name for the dismiss button.           |
| `expandedWidth`  | `number`                  | `250`            | Width the field opens to, in px.                  |
| `defaultOpen`    | `boolean`                 | `false`          | Uncontrolled initial state.                       |
| `open`           | `boolean`                 | uncontrolled     | Controlled state — useful for a `/` shortcut.     |
| `onOpenChange`   | `(open: boolean) => void` | —                | Fires on every toggle.                            |

`SearchFilter`: `{ id: string; label: string; icon: ReactNode; activeClassName?: string; accentClassName?: string }`.

## Keyboard

| Key               | Action                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `Tab`             | Enters the bar. The filter group is one stop, not one per filter |
| `←` `→` `↑` `↓`   | Move between filters, selecting as they go, wrapping             |
| `Home` / `End`    | First or last filter                                             |
| `Enter` / `Space` | Open search, or dismiss it                                       |
| `Escape`          | From the field: clear, close, and return focus to the trigger    |

## Accessibility

**Nothing in the bar had a name.** The trigger, the dismiss button and the
field were all unlabelled — three controls that announced as "button",
"button" and "search". All three are named now, and the trigger carries
`aria-expanded` and `aria-controls` pointing at the field.

The filters were plain buttons with no grouping and no selected state, so a
screen reader user could hear "Popular" and "Favorites" without being told
either was a choice or which one was active. They are an APG `radiogroup` with
roving tabindex now.

Focus follows the trade. Opening moves focus into the field — the field is what
the trigger promised. Dismissing returns focus to the trigger, which is where
the dismiss button was standing. Without that second half, closing search drops
focus to the body and a keyboard user restarts from the top of the page.

Dismissing clears the query, matching the browser's own search fields: the
field disappearing with a query still in it leaves results filtered by
something the user can no longer see.

The filter buttons fill the bar's full 48px height rather than the 40px their
padding gives them. The visible pill is still 40px — it is inset inside the
target — so the look is the original's and the touch target clears the 44px
minimum.

Under `prefers-reduced-motion` both pills resize instantly, the field
cross-fades instead of sliding, and the shared-layout pill jumps between
filters. The bar still does everything it did.

**Narrow containers.** Below about 300px the filter labels are dropped and the
strip goes icon-only, because a clipped "Favori…" is worse than the icon alone.
The buttons keep their `aria-label` in both tiers, so nothing is lost to
assistive tech, and the selected pill still shows which filter is active. This
is a container query rather than a media query: the bar is as likely to sit in
a narrow column on a desktop as on a phone, and it is the space it actually has
that decides what fits.

Opening search on a narrow bar shrinks the field rather than the dismiss
button, which stays a full 48px circle on screen. The one control that undoes
the state you are in is the last thing that should be pushed off the edge.

## Performance

`transform` and `opacity` everywhere except the two pill widths, which are the
animation — one grows as the other shrinks, and that handover is the pattern.
They are siblings on one line, so each reflow is contained to that row.

The original carried `willChange: "width, transform, opacity"` as a permanent
inline style on five elements, alongside `translateZ(0)` and
`backfaceVisibility: hidden`. Permanent `will-change` is the documented
anti-pattern: it holds a compositor layer for the entire life of the page to
buy a few frames during a 400ms animation, and `will-change: width` buys
nothing at all, because width is laid out rather than composited. All of it is
gone.

The `type="search"` field keeps its `font-size` at 16px, below which iOS Safari
zooms the page on focus — and having the viewport lurch as the field opens
undoes the smoothness the rest of this is for.

## Source

The full component is [`InlineSearch.tsx`](./InlineSearch.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                                        |
| --------- | ------------------------------------------------------ |
| Framework | React 19                                               |
| Motion    | Motion 12 (`motion/react`), `LayoutGroup` + `layoutId` |
| Styling   | Tailwind CSS v4                                        |
| Icons     | `lucide-react`                                         |
| Types     | TypeScript 5.9, strict                                 |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/1991956289731239936). Renamed from
Discovery Bar, which named the place it might sit rather than what it does.
Rebuilt with a props API, named controls, an APG radiogroup, focus hand-off in
both directions and themeable accents. The 200/19 elastic spring, the 100ms
delay before the dismiss button arrives, and the press that blurs as it shrinks
are all unchanged.
