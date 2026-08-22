# Contributing

Thanks for looking. This is a small, opinionated library — the bar is less
about code style than about whether a pattern earns its place.

## Before you build anything

**A pattern needs a problem, not an effect.** The test: can you finish the
sentence *"this exists because otherwise people have to…"* without describing
the animation? If not, it is a nice effect and does not belong here yet.

**It has to be distinct.** If an existing pattern solves the same problem
better on every axis, the honest outcome is to improve that one. `speed-dial`
and `create-menu` both reveal a set of actions; they are both here because one
is about thumb reach and the other about scanning a grid.

Open an issue describing the problem before writing the component. It is much
cheaper to disagree about whether a pattern should exist than about how it is
built.

## Adding a pattern

Copy the shape of an existing folder — `inline-confirm` is a good small one.

```
src/patterns/<slug>/
  <Name>.tsx          the component
  <Name>.demo.tsx     the gallery demo
  meta.ts             typed metadata
  README.md           documentation
  index.ts            barrel
```

Then register it in **both** places, or the pattern will half-exist:

- `src/patterns/registry.ts` — import the meta and add it to the `ALL` array
- `src/patterns/demos.ts` — add the dynamic import

Missing the second one produces a detail page with no demo and no error of any
kind. `npm run audit:library` checks for it.

### The component

- **Props, not constants.** Sample data, labels and colours are the consumer's.
  If the demo needs a fixed height or padding to look right, that belongs in
  `<Name>.demo.tsx`, not in the component.
- **Controlled and uncontrolled.** `value` + `onValueChange` alongside
  `defaultValue`, following the shape the other patterns use.
- **Tokens only.** No hardcoded hex. A colour that is genuinely part of the
  design — a card that is dark in both themes — is fine, but say so in a
  comment, and make sure its contents do not invert underneath it.
- **One dependency budget.** `motion` or `gsap`, `lucide-react`, and `@/lib/cn`.
  Reach for anything else and expect to justify it in review.

### Accessibility

Not a checklist item; it is most of the work.

- Every interactive thing is a real `button`, `a`, or `input`.
- The right APG contract for the archetype — menu, listbox, radiogroup,
  toolbar, disclosure, combobox — including roving tabindex where it applies.
- Focus moves deliberately when a surface opens and returns when it closes.
- `Escape` closes anything that opened.
- `prefers-reduced-motion` removes travel and keeps information.
- Touch targets ≥ 44px. Use a pseudo-element to grow the hit area rather than
  padding, when padding would change the layout.

### Motion

**Match the original's feel.** If you are recreating something, keep its
springs, easings and delays verbatim and comment anything that looks strange —
the odd values are usually load-bearing. Consolidating a spring onto a shared
token because the numbers are close is how character gets lost.

If motion reads as flat, check how far the thing actually travels before you
touch the spring. Overshoot is a percentage of distance, so a layout change
that shortens the travel drains the animation without touching a constant.

### The README

Twelve sections, in the order the existing ones use. The two that matter most:

- **The problem** — in the language of the person with the problem.
- **Not for** — where this pattern is the wrong choice, and what to use
  instead. A pattern with no stated limits has not been thought about.

Also document what was wrong with the original and what you changed. That
record is a large part of what makes this a library rather than a gallery.

## Before opening a PR

```bash
npm run check   # typecheck, lint, audit
npm run build
```

Then open the pattern's page and **look at it**. Assertions on the DOM pass
happily while a control sits half outside its own container — check the pixels,
in both themes, at 320px, and with reduced motion on.

## Commits

Present tense, explaining the *why*. `fix: stop the toggle being clipped at
narrow widths` beats `fix styles`.
