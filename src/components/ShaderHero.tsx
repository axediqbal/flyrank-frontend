'use client';

// FE-AA3 Signature Hero — fullscreen GLSL shader behind the home headline.
// Raw WebGL, no new dependency: the shader is a light aurora in the site
// kit (paper base, ink + amber flows at low alpha), so the ink headline
// stays readable by construction. Guards: capped DPR, a static frame for
// reduced motion, pause when the tab is hidden, CSS fallback when WebGL
// is unavailable.

import { useEffect, useRef, useState } from 'react';

export const DPR_CAP = 1.5;

/** Cap the backing-store pixel ratio so a fullscreen shader never pays for 3x screens. */
export function cappedDPR(dpr: number): number {
  if (!Number.isFinite(dpr) || dpr <= 0) return 1;
  return Math.min(Math.max(dpr, 1), DPR_CAP);
}

function prefersReducedMotion(): boolean {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float flow(vec2 p, float t) {
  float v = 0.0;
  v += sin(p.x * 1.4 + t * 0.22);
  v += sin(p.y * 1.7 - t * 0.16 + p.x * 0.6);
  v += sin((p.x + p.y) * 1.1 + t * 0.11);
  return v / 3.0;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  p += u_mouse * 0.12;
  float t = u_time * 0.15;
  float f1 = flow(p * 1.2, t);
  float f2 = flow(p * 2.3 + 4.7, t * 0.7);
  vec3 paper = vec3(0.980, 0.980, 0.969);
  vec3 ink = vec3(0.118, 0.227, 0.373);
  vec3 amber = vec3(0.847, 0.467, 0.024);
  float inkBand = smoothstep(0.15, 0.85, f1 * 0.5 + 0.5) * 0.20;
  float amberBand = smoothstep(0.55, 0.95, f2 * 0.5 + 0.5) * 0.14;
  vec3 col = paper;
  col = mix(col, ink, inkBand);
  col = mix(col, amber, amberBand);
  // Lift toward paper: the field stays light by construction, so the ink
  // headline keeps its contrast without a scrim washing the shader out.
  col = mix(col, paper, 0.25);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      }) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }
    if (!gl) {
      setFailed(true);
      return;
    }
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setFailed(true);
      return;
    }
    const prog = gl.createProgram();
    if (!prog) {
      setFailed(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let raf = 0;
    let running = false;
    let start = performance.now();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let reduced = prefersReducedMotion();

    const resize = () => {
      const dpr = cappedDPR(window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      // Ease the mouse toward its target so the field bends, never jumps.
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 4.0 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const renderStatic = () => {
      stopLoop();
      resize();
      draw(performance.now());
    };

    const onMouse = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const onResize = () => {
      resize();
      if (reduced) draw(performance.now());
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else if (!reduced) {
        startLoop();
      } else {
        renderStatic();
      }
    };

    let mq: MediaQueryList | null = null;
    try {
      mq =
        typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)')
          : null;
    } catch {
      mq = null;
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      if (reduced) renderStatic();
      else startLoop();
    };

    resize();
    if (reduced) {
      renderStatic();
    } else {
      startLoop();
    }
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (mq) mq.addEventListener('change', onMotionChange);

    return () => {
      stopLoop();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (mq) mq.removeEventListener('change', onMotionChange);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  if (failed) {
    // CSS fallback: the same kit wash, no WebGL required.
    return (
      <div
        data-testid="shader-fallback"
        aria-hidden="true"
        className="h-full w-full"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 30%, rgba(30, 58, 95, 0.14), transparent 70%), radial-gradient(50% 45% at 80% 20%, rgba(217, 119, 6, 0.12), transparent 70%), #fafaf7',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="shader-canvas"
      aria-hidden="true"
      className="block h-full w-full"
    />
  );
}
