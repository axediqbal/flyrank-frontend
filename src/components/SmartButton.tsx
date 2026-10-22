'use client';

// SmartButton (FE-AA1 — Buttons with a Brain).
//
// One button, its full lifecycle, communicated through motion:
//   idle → hover/focus (lift) → loading (label crossfades to a spinner)
//   → success (a check draws itself, holds, fades back) / error (one
//   shake, error colour, "retry" label — and it STAYS in error until
//   the person acts; errors you must notice should not auto-vanish).
//
// Motion rules it lives by (also written out on the /buttons demo page):
//  - Only transform and opacity animate. The shell has a fixed size, so
//    labels crossfade inside it — zero layout shift, no thrash.
//  - State changes take 160–200ms ease-out: fast enough to feel instant,
//    slow enough to be seen. The success hold is 1.6s — long enough to
//    register, short enough not to block the next action.
//  - The shake lives behind prefers-reduced-motion: no-preference; under
//    reduced motion the error still lands (colour + label), the
//    movement does not.
//  - Interruptible by construction: clicks during loading are ignored,
//    hovers mid-transition just retarget the running transition, and an
//    error click retries immediately.

import { useEffect, useRef, useState } from 'react';

export type SmartButtonMode = 'auto' | 'success' | 'failure';
type ButtonState = 'idle' | 'loading' | 'success' | 'error';

const LABELS: Record<ButtonState, string> = {
  idle: '', // the caller's label
  loading: 'Sending',
  success: 'Sent',
  error: 'Failed — tap to retry',
};

export default function SmartButton({
  label = 'Send message',
  mode = 'auto',
  disabled = false,
  variant = 'ink',
  onStateChange,
}: {
  label?: string;
  mode?: SmartButtonMode;
  disabled?: boolean;
  variant?: 'ink' | 'accent';
  onStateChange?: (state: ButtonState) => void;
}) {
  const [state, setState] = useState<ButtonState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function run() {
    if (disabled || state === 'loading') return;
    setState('loading');
    const delay = 900 + Math.random() * 700;
    timer.current = setTimeout(() => {
      const fail =
        mode === 'failure' || (mode === 'auto' && Math.random() < 0.2);
      if (fail) {
        setState('error');
      } else {
        setState('success');
        timer.current = setTimeout(() => setState('idle'), 1600);
      }
    }, delay);
  }

  const shown = state === 'idle' ? label : LABELS[state];
  const shell =
    variant === 'ink'
      ? 'bg-ink text-paper hover:bg-coal'
      : 'bg-accent text-white hover:bg-ink';

  return (
    <button
      type="button"
      onClick={run}
      disabled={disabled}
      aria-busy={state === 'loading'}
      data-state={state}
      className={`relative inline-flex h-12 min-w-44 items-center justify-center overflow-hidden rounded-full px-6 font-medium shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none ${
        state === 'error' ? 'bg-red-700 text-white hover:bg-red-700' : shell
      } ${state === 'error' ? 'smart-shake' : ''}`}
    >
      {/* Spinner layer */}
      <span
        aria-hidden="true"
        className={`absolute inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out ${
          state === 'loading'
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Sending
      </span>
      {/* Check layer */}
      <span
        aria-hidden="true"
        className={`absolute inline-flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out ${
          state === 'success'
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M2.5 8.5 6 12 13.5 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={state === 'success' ? 'smart-check' : ''}
            strokeDasharray="16"
            strokeDashoffset={state === 'success' ? '0' : '16'}
            style={{ transition: 'stroke-dashoffset 240ms ease-out 60ms' }}
          />
        </svg>
        Sent
      </span>
      {/* Text label layer (idle + error) */}
      <span
        className={`transition-[opacity,transform] duration-160 ease-out ${
          state === 'idle' || state === 'error'
            ? 'translate-y-0 opacity-100'
            : '-translate-y-2 opacity-0'
        }`}
      >
        {shown}
      </span>
      <span className="sr-only" role="status">
        {state === 'loading'
          ? 'Sending'
          : state === 'success'
            ? 'Sent successfully'
            : state === 'error'
              ? 'Sending failed. Activate to retry.'
              : ''}
      </span>
    </button>
  );
}
