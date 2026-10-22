import { defineConfig } from '@playwright/test';

// FE-09 end-to-end: one Playwright test walks the primary flow against
// a production build served locally (demo mode — deterministic, no API
// key needed). CI builds first, then runs this config.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3100' },
  webServer: {
    command: 'npm run start -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
