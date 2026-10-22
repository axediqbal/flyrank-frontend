import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// FE-09 test setup: Vitest + React Testing Library, jsdom environment.
// The AI route is always mocked in tests — the suite never calls the
// real API (brief rule 3).
export default defineConfig({
  // Next's tsconfig sets jsx: preserve (Next compiles it later), which
  // Vitest's esbuild path rejects — the React plugin compiles JSX here.
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
