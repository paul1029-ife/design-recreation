---
title: Editable Label
slug: editable-label
category: input
status: stable
---

## The problem

Renaming something usually means opening a settings screen or a dialog, which
puts the thing you are renaming out of sight at exactly the moment you are
deciding what to call it. Editing where the name already sits keeps the
context — and the surrounding layout — visible the whole time, and makes the
commit obvious rather than implied by a Save button somewhere else.

## Use cases

- Renaming a board, project, or document from its own header
- Editing a tag or label without opening a manager
- Naming something that starts as "Untitled"

**Not for:** multi-field editing. Once a second field exists this becomes a
form with no submit button, and forms want a real one.

## Installation

```bash
npm install motion lucide-react
```

Then copy `EditableLabel.tsx`. It depends only on `@/lib/cn` and
`@/lib/motion`.

## Usage

```tsx
import EditableLabel from "@/patterns/editable-label/EditableLabel";

<EditableLabel
  defaultValue="Design Review"
  fieldLabel="Board name"
  onValueChange={(name) => renameBoard(name)}
/>;
```

`onValueChange` fires on commit, never on keystroke — this is a rename, not a
text field.

## API

| Prop            | Type                         | Default      | Description                                      |
| --------------- | ---------------------------- | ------------ | ------------------------------------------------ |
| `defaultValue`  | `string`                     | `""`         | Uncontrolled initial text.                       |
| `value`         | `string`                     | uncontrolled | Controlled text. Pass with `onValueChange`.      |
| `onValueChange` | `(value: string) => void`    | —            | Fires on commit only.                            |
| `placeholder`   | `string`                     | `"Untitled"` | Shown when the value is empty.                   |
| `fieldLabel`    | `string`                     | `"Name"`     | Names what is being renamed, for assistive tech. |
| `validate`      | `(draft: string) => boolean` | —            | Return false to reject and keep editing.         |
| `disabled`      | `boolean`                    | `false`      | Disables the edit trigger.                       |
| `restingWidth`  | `number`                     | `190`        | Pill width in px when not editing.               |
| `editingWidth`  | `number`                     | `260`        | Pill width in px while editing.                  |
| `className`     | `string`                     | —            | Merged onto the root.                            |

## Keyboard

| Key               | Action                               |
| ----------------- | ------------------------------------ |
| `Tab`             | Focus the edit button                |
| `Enter` / `Space` | Enter edit mode                      |
| `Enter`           | Commit the rename                    |
| `Escape`          | Cancel and restore the previous name |
| `Tab`             | Commit and move on                   |

## Accessibility

Both controls are real buttons with names that say what they act on — "Edit
board name", not "Edit". The input is labelled by `fieldLabel` rather than
relying on a visible label that does not exist in this layout.

**Focus returns to the edit button** after commit or cancel. Without that,
focus dies with the unmounting input and a keyboard user is dropped at the top
of the document.

Entering edit mode selects the whole value, because renaming usually replaces
a name rather than appending to it — the common case should cost one keystroke.

The confirm button uses `onMouseDown` with `preventDefault` before its click
handler. The input's `onBlur` commits, and without that guard blur would fire
first, unmount the button, and the click would land on nothing.

An empty rename is treated as a mistake rather than an instruction: the old
value is kept. `Escape` restores it explicitly.

Under `prefers-reduced-motion` the scale and blur are dropped and the icons
cross-fade.

**Known limitation:** blur commits rather than cancelling. That matches most
rename affordances, but it means clicking elsewhere saves — if your data model
makes an accidental rename expensive, pass `validate` or wire `onValueChange`
to something undoable.

## Performance

The container animates `width` between two values, `restingWidth` and
`editingWidth`, which are props.

This was briefly Motion's `layout` prop instead, sizing the pill to its
content. That was tidier and wrong. A text field has no intrinsic width, so
entering edit mode collapsed the pill to almost nothing and then grew it one
character at a time as you typed — and the resize, which is the whole gesture,
had no fixed distance to travel. Two numbers you have to maintain are the
right trade here: the pill is a control with a resting size, not a box that
hugs whatever is in it.

The fill and the ring transition together over 200ms. Only the shadow was
transitioned before, so the background snapped to white while the ring eased
in, and the two arriving at different times read as a hard edge at the end of
an otherwise smooth move.

Icons animate `transform`, `opacity` and `filter` only. Blur is capped at 6px
on 40px buttons, so paint stays negligible.

## Source

The full component is [`EditableLabel.tsx`](./EditableLabel.tsx). The docs site
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
[@nitishkmrk](https://x.com/nitishkmrk/status/2049797627580207241). Rebuilt
with a props API, controlled and uncontrolled modes, focus restoration,
Escape to cancel, and reduced-motion handling. The 190/260 width pair and the
spring's character are the original's.
