'use client';

// /3d — the FE-AA2 interactive 3D experience: a studio product shot
// with a custom configurator. The canvas loads lazily (next/dynamic,
// ssr:false) and sits in a fixed-height container, so opening the page
// never shifts the layout. Touch orbit + pinch zoom come from
// OrbitControls; the configurator is plain HTML controls in the site kit.

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LightPreset, SceneConfig } from './StudioScene';

const StudioCanvas = dynamic(() => import('./StudioCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      Loading the 3D scene…
    </div>
  ),
});

const SWATCHES: { name: string; value: string }[] = [
  { name: 'Ink', value: '#1e3a5f' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Porcelain', value: '#fafaf7' },
  { name: 'Coal', value: '#12151a' },
];

const PRESETS: { name: string; value: LightPreset; blurb: string }[] = [
  { name: 'Studio', value: 'studio', blurb: 'Neutral key + warm amber fill' },
  { name: 'Daylight', value: 'daylight', blurb: 'Bright, even, cool fill' },
  { name: 'Dusk', value: 'dusk', blurb: 'Low warm key, deep blue fill' },
];

export default function ThreeExperience() {
  const [color, setColor] = useState('#1e3a5f');
  const [metalness, setMetalness] = useState(0.6);
  const [roughness, setRoughness] = useState(0.35);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [preset, setPreset] = useState<LightPreset>('studio');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reduced motion wins over the auto-rotate toggle: the fallback is
  // one static frame, not a loop.
  const config: SceneConfig = {
    color,
    metalness,
    roughness,
    wireframe,
    autoRotate: autoRotate && !reducedMotion,
    preset,
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="h-[420px] sm:h-[520px]">
          <StudioCanvas config={config} reducedMotion={reducedMotion} />
        </div>
      </div>
      {reducedMotion && (
        <p className="mt-3 text-sm text-neutral-600" role="status">
          Animation is off: your system prefers reduced motion, so the
          scene renders as a single static frame. The configurator below
          still updates the material and lighting.
        </p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
            Material
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SWATCHES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setColor(s.value)}
                aria-pressed={color === s.value}
                aria-label={`Material colour ${s.name}`}
                title={s.name}
                className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === s.value
                    ? 'border-ink ring-2 ring-ink/20'
                    : 'border-line'
                }`}
                style={{ backgroundColor: s.value }}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {SWATCHES.find((s) => s.value === color)?.name} — drag to orbit,
            pinch or scroll to zoom.
          </p>

          <label className="mt-6 block">
            <span className="flex justify-between text-sm font-medium text-coal">
              <span>Metalness</span>
              <span>{Math.round(metalness * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={metalness}
              onChange={(e) => setMetalness(Number(e.target.value))}
              className="mt-2 w-full accent-[#1e3a5f]"
            />
          </label>
          <label className="mt-4 block">
            <span className="flex justify-between text-sm font-medium text-coal">
              <span>Roughness</span>
              <span>{Math.round(roughness * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={roughness}
              onChange={(e) => setRoughness(Number(e.target.value))}
              className="mt-2 w-full accent-[#1e3a5f]"
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWireframe((w) => !w)}
              aria-pressed={wireframe}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                wireframe
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-paper text-coal hover:border-accent'
              }`}
            >
              Wireframe {wireframe ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((a) => !a)}
              aria-pressed={autoRotate}
              disabled={reducedMotion}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                autoRotate && !reducedMotion
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-paper text-coal hover:border-accent'
              }`}
            >
              Auto-rotate {autoRotate && !reducedMotion ? 'on' : 'off'}
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest eyebrow">
            Lighting
          </p>
          <div className="mt-3 space-y-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPreset(p.value)}
                aria-pressed={preset === p.value}
                className={`block w-full rounded-xl border p-4 text-left transition-colors ${
                  preset === p.value
                    ? 'border-ink bg-white'
                    : 'border-line bg-paper hover:border-accent'
                }`}
              >
                <span className="block font-medium text-coal">{p.name}</span>
                <span className="mt-0.5 block text-sm text-neutral-600">
                  {p.blurb}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-neutral-600">
            Performance, honestly: no model is downloaded and no HDR
            environment is fetched — the sculpture is generated geometry
            and the lights are code, so the only weight is the 3D
            renderer itself, loaded only when this page opens. Full
            numbers are in the README.
          </p>
        </div>
      </div>
    </div>
  );
}
