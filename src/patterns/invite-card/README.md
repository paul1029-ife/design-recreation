---
title: Invite Card
slug: invite-card
category: input
status: stable
---

## The problem

An invitation sent to the wrong address cannot be taken back by the sender.
A bare text field gives you nothing to check before you commit — you read back
your own typing, which is exactly the thing you already got wrong.

Resolving the address into a named chip inside the field puts the confirmation
where the mistake would be made, while it is still free to fix. The chip then
travels into the list, so it is obvious where what you typed ended up rather
than a row simply appearing somewhere below.

## Use cases

- Share and permission dialogs for a document, project or workspace
- Seat or member invitations in a team settings page
- Any commit-once action where the target is typed rather than picked

**Not for:** picking from a known set of people — offer a searchable list
instead of asking anyone to type an address you already have. Not for bulk
invites: one chip at a time is the point, and twenty of them wants a paste-
and-parse field.

## Installation

```bash
npm install motion lucide-react
```

Then copy `InviteCard.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import InviteCard from "@/patterns/invite-card/InviteCard";

<InviteCard
  url="acme.com/enterprise/note/1234"
  defaultLinkEnabled
  onInviteesChange={(list) => sync(list)}
  resolveInvitee={(email) => directory.lookup(email)}
/>;
```

`resolveInvitee` is where a directory lookup goes. Without it the chip falls
back to the local part of the address and generated initials — which is the
honest default, because the component cannot know who anyone is.

## API

| Prop                  | Type                                      | Default                           | Description                                        |
| --------------------- | ----------------------------------------- | --------------------------------- | -------------------------------------------------- |
| `url`                 | `string`                                  | —                                 | The link shown in the copy row.                    |
| `title`               | `string`                                  | `"Share"`                         | Card heading.                                      |
| `linkLabel`           | `string`                                  | `"Anyone"`                        | Name of the link-access row and its switch.        |
| `linkDescription`     | `string`                                  | `"Everyone with link can access"` | Supporting line.                                   |
| `placeholder`         | `string`                                  | `"Enter email to share"`          | Field placeholder.                                 |
| `defaultLinkEnabled`  | `boolean`                                 | `false`                           | Uncontrolled initial state.                        |
| `linkEnabled`         | `boolean`                                 | uncontrolled                      | Controlled state. Pass with `onLinkEnabledChange`. |
| `onLinkEnabledChange` | `(enabled: boolean) => void`              | —                                 | Fires on every toggle.                             |
| `defaultInvitees`     | `readonly Invitee[]`                      | `[]`                              | Uncontrolled initial list.                         |
| `invitees`            | `readonly Invitee[]`                      | uncontrolled                      | Controlled list. Pass with `onInviteesChange`.     |
| `onInviteesChange`    | `(invitees: readonly Invitee[]) => void`  | —                                 | Fires on invite and on removal.                    |
| `resolveInvitee`      | `(email: string) => { name, avatarUrl? }` | —                                 | Directory lookup for the chip.                     |

`Invitee`: `{ id: string; email: string; name: string; avatarUrl?: string }`.

`id` is the invitation's own identity, not the address. That distinction is
load-bearing — see below.

## Keyboard

| Key               | Action                                                     |
| ----------------- | ---------------------------------------------------------- |
| `Enter`           | Validate the address and turn it into a chip               |
| `Escape`-free     | Removing the chip is a labelled button, reachable by `Tab` |
| `Enter` / `Space` | On the switch: toggle link access. On Invite: commit       |

Focus returns to the field after every invite, because the next thing anyone
does is type another address.

## Accessibility

**The switch reported one state and drew the opposite.** Its knob sat on the
left when access was on and the right when it was off, so the control read as
off while the invite section it had just revealed sat open underneath. It is a
real `role="switch"` with `aria-checked` now, and the knob moves the right way.

**The button labelled "Invite" did not invite.** It only ever looked at the
staged chip, so typing an address and pressing it did nothing at all — the
`Enter` keystroke was an undocumented prerequisite. It now commits whatever is
pending, chip or raw text.

A malformed address used to fail silently. It now names the problem in a
`role="status"` region, so the failure reaches someone who cannot see the
border colour change.

Every control has a name: the copy button says whether it has copied, and both
remove buttons say who they remove rather than being three identical
"Remove"s in a row.

Under `prefers-reduced-motion` the section opens without the height animation,
the chip does not morph into the row, and the copy icon cross-fades in place.

## The state leak, and why `layoutId` caused it

The original derived every `layoutId` from the email address —
``layoutId={`email-${email}`}``. That works right up until the same address
exists in two places at once, which happens the moment you stage an address
that is already in the list.

Two live elements then claim one layout identity. Motion resolves that by
handing the projection to one of them, so the **existing invited row was
visibly stolen out of the list and flown into the field**, leaving a hole
behind while the underlying array still held the entry. The rendered UI and
the state had come apart.

The fix is two-part, and both halves matter:

1. Each invitation gets an `id` of its own when it is staged, and carries it
   into the list. The chip→row morph still works, because it is the same
   invitation either way — but no two live elements ever share an identity.
2. Staging an address that is already invited is refused, with a message.

The second alone would have hidden the symptom. The first is what makes the
identity model correct, and it is the one that keeps holding if the same
person is ever legitimately listed twice.

Removal is by `id` too. The original filtered on address equality, which would
have removed every copy.

## Performance

The section animates `height` to `auto` rather than the original's
`maxHeight: 350`. That number silently clipped the card once five people were
invited, and it had to be re-guessed for any change to the contents.

Removing the cap meant retuning the easing, and the reason is worth writing
down because the cap had been hiding it. The section is ~126px tall, so
`overflow: hidden` ran out of content to reveal about 60% of the way through
the original's 260ms: the visible reveal was only ~153ms and it ended while
still travelling at ~1600px/s. That is an abrupt stop, but at 153ms there is
no time to track the box, so it reads as a flick.

Animating the real height made the whole 260ms visible. A 70% longer reveal on
a curve that is _still accelerating_ at the end gives the eye time to follow
that acceleration and expect it to continue — and the stop becomes legible as
a snap. The curve was never good; the magic number was concealing it.

Opening now uses the original's tempo with a decelerating curve: ~167ms of
visible reveal ending at ~36px/s instead of ~750. Closing keeps the original's
curve at 150ms — behind the cap its visible portion had been about 52ms, close
enough to instant that there was nothing there to smooth.

The card's width is a property of the space it sits in, never of what is
currently inside it. Its wrapper is `w-full min-w-0`; without that the wrapper
is sized by its own content, the card's `w-full` resolves against a box that
shrinks the moment the invite section unmounts, and the whole card visibly
narrows on every toggle — a horizontal motion nobody asked for, on an axis
where nothing is supposed to be happening.

The chip→row transition is a shared-layout morph, so it moves one element
rather than cross-fading two. It runs on `transform`, and at 170ms it reads as
a hand-off rather than a journey.

Avatars are generated initials on a hue derived from the address, so the same
person is the same colour every render and there is no network request. The
original pointed every avatar at one hardcoded remote image, which meant every
invitee had the same face — and a copy-paste component that reaches out to a
third-party host on mount.

The copy confirmation's timer is cleared on unmount. The original left it
running.

## Source

The full component is [`InviteCard.tsx`](./InviteCard.tsx). The docs site
renders it inline here with a copy button — this is a copy-paste library, so
the source is the delivery mechanism, not an appendix.

## Technologies

|           |                                                      |
| --------- | ---------------------------------------------------- |
| Framework | React 19                                             |
| Motion    | Motion 12 (`motion/react`), `layoutId` shared layout |
| Styling   | Tailwind CSS v4                                      |
| Icons     | `lucide-react`                                       |
| Types     | TypeScript 5.9, strict                               |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/1803335945120514234). Rebuilt with
a props API, a correct identity model, a working Invite button, validation
feedback and generated avatars. The 170ms chip morph and the 80ms name hand-off
are unchanged. The section's expand curve is not: removing the `maxHeight` cap
exposed an accelerating curve that had only ever been played two-thirds of the
way through, so opening now decelerates into place at the same tempo the capped
version actually ran at.
