import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShaderHero, { cappedDPR } from '@/components/ShaderHero';

describe('cappedDPR', () => {
  it('caps high ratios at 1.5', () => {
    expect(cappedDPR(2)).toBe(1.5);
    expect(cappedDPR(3)).toBe(1.5);
  });

  it('passes normal ratios through', () => {
    expect(cappedDPR(1)).toBe(1);
    expect(cappedDPR(1.25)).toBe(1.25);
    expect(cappedDPR(1.5)).toBe(1.5);
  });

  it('falls back to 1 for invalid input', () => {
    expect(cappedDPR(0)).toBe(1);
    expect(cappedDPR(-2)).toBe(1);
    expect(cappedDPR(NaN)).toBe(1);
  });
});

describe('ShaderHero', () => {
  it('renders the CSS fallback when WebGL is unavailable (jsdom has no WebGL)', () => {
    render(<ShaderHero />);
    expect(screen.getByTestId('shader-fallback')).toBeInTheDocument();
  });
});
