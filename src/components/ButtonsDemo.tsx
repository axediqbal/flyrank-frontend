'use client';

// /buttons — the FE-AA1 demo page. One SmartButton, driven three ways
// (auto with a 20% failure rate, forced success, forced failure — the
// brief's Q&A requires on-demand triggers, not luck), a disabled-state
// toggle, a second button proving the motion language is a system, and
// the written note on duration/easing choices the brief asks for.

import { useState } from 'react';
import SmartButton, {
  type SmartButtonMode,
} from '@/components/SmartButton';

type DemoState = 'idle' | 'loading' | 'success' | 'error';

const MODES: { value: SmartButtonMode; label: string }[] = [
  { value: 'auto', label: 'Auto · 20% fail' },
  { value: 'success', label: 'Force success' },
  { value: 'failure', label: 'Force failure' },
];

const MOTION_NOTES = [
  {
    choice: 'State crossfades — 160–200ms, ease-out',
    why: 'Under ~100ms a change reads as a flicker; over ~300ms the button feels laggy. Ease-out starts fast (the click registers instantly) and settles gently.',
  },
  {
    choice: 'Labels slide 8px while fading',
    why: 'A small vertical drift gives the eye a direction — the old state leaves upward, the new one arrives from below. Pure opacity alone reads as a swap.',
  },
  {
    choice: 'Check draws in 240ms, then a 1.6s hold',
    why: 'The draw is the reward moment; the hold is long enough to register "it worked" and short enough to hand the button back for the next action.',
  },
  {
    choice: 'Error shake — 320ms, once',
    why: 'A single shake says "no" the way a head-shake does. It never loops, and under prefers-reduced-motion it is removed entirely — the red state and the retry label still land, because feedback is not optional, motion is.',
  },
  {
    choice: 'Fixed shell, no width animation',
    why: 'The assignment example animates width; I chose not to. Width changes are layout, and layout animation thrashes. A fixed-size shell with crossfading labels communicates the same states at zero layout cost.',
  },
  {
    choice: 'Only transform + opacity, everywhere',
    why: 'Those are the two properties the compositor can animate without repainting the page — the button stays smooth even on a cheap phone with a busy page behind it.',
  },
];

export default function ButtonsDemo() {
  const [mode, setMode] = useState<SmartButtonMode>('auto');
  const [disabled, setDisabled] = useState(false);
  const [state, setState] = useState<DemoState>('idle');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
        Micro-interactions
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Buttons with a brain
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-neutral-700">
        One button that always tells you what it is doing — idle, working,
        done, failed — and never leaves you guessing. This is the motion
        system the capstone&apos;s own buttons speak.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <SmartButton
            label="Send message"
            mode={mode}
            disabled={disabled}
            onStateChange={setState}
          />
          <p className="text-sm text-neutral-500">
            Current state: <span className="font-semibold text-coal">{state}</span>
            {state === 'error' && ' — click the button to retry'}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Demo mode">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                mode === m.value
                  ? 'bg-ink font-medium text-paper'
                  : 'border border-line text-coal hover:border-accent'
              }`}
            >
              {m.label}
            </button>
          ))}
          <label className="ml-2 inline-flex cursor-pointer items-center gap-2 text-sm text-coal">
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="h-4 w-4 accent-[#D97706]"
            />
            Disabled state
          </label>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Try it like a reviewer: spam-click it mid-send (nothing stacks),
          hover while it works, drive it from the keyboard (Tab + Enter),
          and turn on reduced motion in your OS — the shake disappears, the
          feedback does not.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Same brain, second button
        </p>
        <div className="mt-3">
          <SmartButton label="Start your project" variant="accent" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Different words, different colour, identical state language — a
          system, not a one-off.
        </p>
      </div>

      <h2 className="mt-12 font-display text-2xl font-bold text-ink">
        The motion choices, on purpose
      </h2>
      <div className="mt-4 space-y-4">
        {MOTION_NOTES.map((note) => (
          <div key={note.choice} className="border-l-2 border-line pl-4">
            <p className="font-semibold text-coal">{note.choice}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-neutral-700">{note.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
