---
title: Voice Transcript
slug: voice-transcript
category: feedback
status: stable
---

## The problem

A voice note is opaque. You cannot skim it, cannot search it, and cannot tell
whether it is worth forty seconds until you have already spent them — and you
cannot play it at all on a quiet train or in an open office.

Sweeping the transcript in time with playback fixes all of that at once. You
can read ahead of the audio, skip on the strength of the first line, or read
the note instead of hearing it. The sweep is what ties the two together: text
alone would be a wall, and audio alone is unskimmable.

## Use cases

- Voice messages in a chat thread
- Recorded meeting notes or memos with a stored transcript
- Any short audio where the words matter more than the voice

**Not for:** long recordings — a 300-word bubble is a wall of text, and this
has no scrubbing. Not for music or ambience, where there is nothing to
transcribe. Not as a substitute for real captions on video.

## Installation

```bash
npm install motion lucide-react
```

Then copy `VoiceTranscript.tsx`. It depends only on `@/lib/cn`.

## Usage

```tsx
import VoiceTranscript from "@/patterns/voice-transcript/VoiceTranscript";

<VoiceTranscript
  transcript="Hey! Just brewed a fresh cup of coffee…"
  durationSeconds={4}
/>;
```

Playback is simulated on a timer. Wiring it to a real `HTMLAudioElement` means
replacing the one interval with `timeupdate` and driving `progress` from
`currentTime / duration` — everything else already derives from `progress`.

## API

Deliberately small: the content and its length, and the shape of the bars.

| Prop              | Type                | Default       | Description                                                |
| ----------------- | ------------------- | ------------- | ---------------------------------------------------------- |
| `transcript`      | `string`            | a sample note | Split on spaces; each word reveals in turn.                |
| `durationSeconds` | `number`            | `4`           | Length of the note.                                        |
| `waveform`        | `readonly number[]` | 36 bars       | Bar heights in px. Any length — the sweep is proportional. |
| `className`       | `string`            | —             | Merged onto the root.                                      |

## Keyboard

| Key               | Action                                            |
| ----------------- | ------------------------------------------------- |
| `Tab`             | Move between the transcript toggle and play/pause |
| `Enter` / `Space` | Activate the focused control                      |

Both controls are buttons, so this is the browser's behaviour rather than
anything this component adds. There is no scrubbing to operate — a real
implementation would need a slider on the waveform.

## Accessibility

**The transcript ran away from the audio.** The word reveal was a second
interval keyed only on whether the bubble was open, so pausing playback left
the words marching on and the transcript ended up describing audio that was not
playing. The visible word count is now derived from playback progress, which
makes the desync unrepresentable rather than merely fixed — and removes an
effect that closed over the count it was incrementing.

The countdown is a `role="progressbar"` reporting seconds elapsed with an
`aria-valuetext` of "3 seconds remaining". The waveform is `aria-hidden`:
reading out thirty-six bars is noise, and the progressbar already carries the
position.

The transcript toggle carries `aria-expanded` and `aria-controls`. Unrevealed
words sit at low opacity rather than being absent from the DOM, so a screen
reader gets the whole transcript the moment the bubble opens instead of having
it dribbled out a word at a time — which is the right trade: someone reading
rather than listening wants the text, not the performance.

**Every colour was hardcoded.** The icon, the waveform bars, the play glyph
and the bubble's tail were all fixed hex values, so in dark mode the icon
turned near-invisible and the tail detached from the bubble it belonged to.
All of it is tokens or `currentColor` now.

Under `prefers-reduced-motion` the bubble cross-fades without rising or
scaling, words appear without the blur burning off, the icons cross-fade in
place, and the bars change colour instantly. Unrevealed words sit at 0.25
rather than 0.07, because without the motion cue the contrast has to do more
of the work.

## Performance

One interval, at 50ms. Everything else — the visible word count, the seconds
remaining, which bars are lit — is derived from `progress` during render, so
there is a single source of truth and no second clock to fall out of step.

The bars are CSS `transition-colors`, not thirty-six Motion values. Motion
animating `background-color` on each bar meant thirty-six animation instances
for a property CSS transitions on its own.

The bubble is absolutely positioned, so opening it does not move the player.
Unrevealed words hold their space at low opacity, which keeps the bubble at its
final height from the first frame — otherwise it would grow line by line and
drag its own tail up the screen.

Permanent `will-change` on four elements is gone.

## Source

The full component is [`VoiceTranscript.tsx`](./VoiceTranscript.tsx). The docs
site renders it inline here with a copy button — this is a copy-paste library,
so the source is the delivery mechanism, not an appendix.

## Technologies

|           |                            |
| --------- | -------------------------- |
| Framework | React 19                   |
| Motion    | Motion 12 (`motion/react`) |
| Styling   | Tailwind CSS v4            |
| Icons     | `lucide-react`             |
| Types     | TypeScript 5.9, strict     |

## Credits

Original design by
[nitishkmrk](https://x.com/nitishkmrk/status/2057363853986701646). Renamed from
Voice Note Transcription. Rebuilt with a props API, a single clock, a
progressbar contract, themed colours and reduced-motion handling. The 290/30
bubble spring, the 320/28 layout spring, the 280ms word reveal on its
`[0.22, 1, 0.36, 1]` curve and the blurred icon swap are unchanged.
