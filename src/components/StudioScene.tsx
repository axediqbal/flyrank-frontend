'use client';

// The 3D scene for /3d (FE-AA2): a procedural "studio product shot".
// No external models, no external HDRs — the sculpture is torus-knot
// geometry, the accent spheres are spheres, and every light is defined
// in code below. The configurator lives in ThreeExperience.tsx; this
// file only renders what it is told.

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type LightPreset = 'studio' | 'daylight' | 'dusk';

export type SceneConfig = {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  autoRotate: boolean;
  preset: LightPreset;
};

const LIGHTS: Record<
  LightPreset,
  {
    ambient: number;
    keyColor: string;
    keyIntensity: number;
    keyPosition: [number, number, number];
    fillColor: string;
    fillIntensity: number;
  }
> = {
  studio: {
    ambient: 0.45,
    keyColor: '#ffffff',
    keyIntensity: 2.2,
    keyPosition: [4, 6, 4],
    fillColor: '#d97706',
    fillIntensity: 0.5,
  },
  daylight: {
    ambient: 0.7,
    keyColor: '#ffffff',
    keyIntensity: 3.0,
    keyPosition: [2, 8, 2],
    fillColor: '#dbeafe',
    fillIntensity: 0.4,
  },
  dusk: {
    ambient: 0.25,
    keyColor: '#f59e0b',
    keyIntensity: 1.4,
    keyPosition: [-4, 3, 4],
    fillColor: '#1e3a5f',
    fillIntensity: 0.6,
  },
};

// OrbitControls from three/examples, wrapped for R3F: damping needs a
// per-frame update, and autoRotate must follow its prop without
// recreating the controls (recreating would reset the camera).
function Controls({ autoRotate }: { autoRotate: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const ref = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 9;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.autoRotateSpeed = 1.0;
    ref.current = controls;
    return () => {
      controls.dispose();
      ref.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    if (ref.current) ref.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useFrame(() => {
    ref.current?.update();
  });

  return null;
}

// In frameloop="demand" (reduced-motion fallback) R3F renders only when
// asked. Config changes must therefore invalidate explicitly, or the
// static frame would never show the new material or lighting.
function Invalidator({ configKey }: { configKey: string }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [configKey, invalidate]);
  return null;
}

export default function StudioScene({ config }: { config: SceneConfig }) {
  const lights = LIGHTS[config.preset];
  const configKey = JSON.stringify(config);

  return (
    <>
      <ambientLight intensity={lights.ambient} />
      <directionalLight
        position={lights.keyPosition}
        color={lights.keyColor}
        intensity={lights.keyIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-4, 2, -2]}
        color={lights.fillColor}
        intensity={lights.fillIntensity}
      />

      <group position={[0, 0.2, 0]}>
        <mesh castShadow>
          <torusKnotGeometry args={[1, 0.32, 220, 36]} />
          <meshStandardMaterial
            color={config.color}
            metalness={config.metalness}
            roughness={config.roughness}
            wireframe={config.wireframe}
          />
        </mesh>
        <mesh castShadow position={[-1.7, -0.7, 0.4]}>
          <sphereGeometry args={[0.32, 48, 48]} />
          <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[1.7, -0.9, -0.3]}>
          <sphereGeometry args={[0.22, 48, 48]} />
          <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.4} />
        </mesh>
      </group>

      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -1.4, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#e8e5de" roughness={1} metalness={0} />
      </mesh>

      <Controls autoRotate={config.autoRotate} />
      <Invalidator configKey={configKey} />
    </>
  );
}
