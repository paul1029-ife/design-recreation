# Interaction Patterns

A library of production-ready interaction patterns for React. Every pattern is
accessible, respects `prefers-reduced-motion`, ships with a props API and
documentation, and is free to copy.

**[Browse the patterns →](https://design-recreation.vercel.app)**

---

## What this is

Most animation collections show you a effect and leave you to work out what it
was for. This one starts from the problem.

Every pattern here answers a question a PM would recognise — *"how do we let
someone rename this without leaving the page?"* — and the animation is the
answer to that question rather than the point of the exercise. Each one is
documented with the problem it solves, the cases it is **not** for, its
keyboard contract, its accessibility guarantees, and what it costs.

They are recreations. The visual ideas come from designers credited on every
pattern page; what is added is the part that makes an idea shippable — a props
API, a keyboard path, focus management, reduced-motion handling, and a written
account of the trade-offs.

## Using a pattern

This is a copy-paste library. There is no package to install and no version to
keep up with — you take the file and it is yours.

**Copy it.** Every pattern page renders its full source with a copy button.
Paste it into your project, adjust the tokens, done.

**Or install it.** Patterns are published as
[shadcn](https://ui.shadcn.com)-compatible registry items:

```bash
npx shadcn@latest add https://design-recreation.vercel.app/r/inline-confirm.json
```

Each pattern depends only on `motion` (or `gsap`), `lucide-react`, and a local
`cn` helper. None of them import from each other.

## Running it locally

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run audit:library` | Structural audit of the pattern library |
| `npm run check` | All three of the above |

## How it is built

| | |
| --- | --- |
| Framework | Next.js 16, App Router |
| Language | TypeScript 5.9, strict |
| Styling | Tailwind CSS v4, tokens in `@theme inline` |
| Motion | Motion 12 (`motion/react`), GSAP where a timeline earns it |
| Docs | The pattern's own README, rendered at build time |

### Layout

```
src/
  patterns/<slug>/       one folder per pattern
    <Name>.tsx           the component — props only, no demo chrome
    <Name>.demo.tsx      the gallery demo — owns sample data and spacing
    meta.ts              typed metadata: problem, category, support flags
    README.md            the documentation you see on the site
    index.ts             barrel
  patterns/registry.ts   metadata only, server-importable
  patterns/demos.ts      slug → dynamically imported demo
  app/                   routes, including /r/[slug].json
```

`registry.ts` is deliberately free of component imports so server components can
read metadata without pulling every pattern's JavaScript into the bundle. Demos
resolve separately through `next/dynamic`, so a pattern page ships one pattern.

### The standard

Every pattern has to clear the same bar before it is `stable`:

- **It works.** Every affordance that looks interactive is interactive. This
  sounds obvious; it was the single most common defect in the originals.
- **Keyboard.** The task is completable without a pointer, against the
  relevant [APG](https://www.w3.org/WAI/ARIA/apg/) contract. Focus goes
  somewhere deliberate when a surface opens, and comes back when it closes.
- **Reduced motion.** Travel is removed, information is kept. A reduced
  variant that silently drops a state change is worse than no variant.
- **Honest metadata.** `keyboard`, `touch`, `reducedMotion` and `responsive`
  are claims that get audited. Setting one `true` without the support behind it
  is worse than setting it `false`, because it is a promise the library breaks.
- **Documented trade-offs.** Every pattern's README has a "Not for" section and
  states its known limitations.

`npm run audit:library` enforces the structural half of this: folder shape,
registry and demo wiring, metadata completeness, naming, and a set of
smells worth failing a build over.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Credits

Every pattern page credits the designer whose work it recreates. The library
exists because they published the idea first.

## Licence

MIT — see [LICENSE](./LICENSE).
