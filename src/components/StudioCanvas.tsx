'use client';

// The R3F canvas for /3d, kept in its own module so the page can load
// it with next/dynamic + ssr:false — the three.js code never ships to
// a visitor who never opens /3d.

import { Canvas } from '@react-three/fiber';
import StudioScene, { type SceneConfig } from './StudioScene';

export default function StudioCanvas({
  config,
  reducedMotion,
}: {
  config: SceneConfig;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 5], fov: 40 }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#fafaf7']} />
      <StudioScene config={config} />
    </Canvas>
  );
}
