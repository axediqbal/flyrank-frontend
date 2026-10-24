import type { Metadata } from 'next';
import ThreeExperience from '@/components/ThreeExperience';

// /3d — the FE-AA2 interactive 3D experience: a procedural studio
// product shot with a material + lighting configurator. Deliberately
// unlinked from the nav: it is an assignment deliverable, not part of
// the portfolio's client-facing flow.

export const metadata: Metadata = {
  title: '3D experience — Ahmed Iqbal',
  description:
    'An interactive 3D studio shot in the browser: orbit it, change its material, relight it — no model downloads, everything generated in code.',
};

export default function ThreeDPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
        FE-AA2 — First 3D experience
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        A studio shot you can relight
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-neutral-700">
        A geometric sculpture rendered live in your browser. Drag to orbit
        it, pinch or scroll to zoom — then change its material and
        lighting below. Nothing here is a downloaded model: the shape,
        the lights, and the floor are all generated in code.
      </p>
      <div className="mt-8">
        <ThreeExperience />
      </div>
    </div>
  );
}
