'use client';

// Route-level error boundary (FE-08). A render or data failure anywhere
// in the app lands here instead of on a blank screen: what happened, in
// plain words, and one action that actually recovers — reset() re-renders
// the segment. Styled in the identity kit, calm on purpose (no red
// flash-bang; errors are information, not alarms).

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
        Something broke
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        This page hit an error
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-neutral-700">
        The page failed to load — this is the designed failure state, not a
        blank screen. Trying again re-renders the page; if it keeps failing,
        the home page and the contact form there are the fallback.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
