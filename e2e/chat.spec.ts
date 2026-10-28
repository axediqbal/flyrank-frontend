import { expect, test } from '@playwright/test';

// The primary flow, end to end: land on the home page, open the project
// chat, run the lead-scoring tool to its result card, then hold a
// streamed conversation turn.
test('primary flow: home -> chat -> tool result -> streamed reply', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Chat' }).first().click();
  await expect(page.getByRole('heading', { name: /scope your project/i })).toBeVisible();

  // Crit fix (Oct 2026) gated the tool-demo + failure-drill controls
  // behind /chat?demo=1 — on plain /chat the sample-lead button does
  // not render, which is what turned CI red. The demo steps below
  // therefore run in demo mode; the home -> chat navigation above
  // already covered the public path.
  await page.goto('/chat?demo=1');

  // The tool demo runs the score_lead lifecycle to a real component.
  await page.getByRole('button', { name: /score a sample lead/i }).click();
  await expect(page.getByText('Strong fit')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Lead score')).toBeVisible();

  // A typed message streams a reply.
  await page.getByLabel(/describe your project/i).fill('I need a landing page for my cafe');
  await page.getByRole('button', { name: /^send$/i }).click();
  await expect(page.getByText(/kind of build Ahmed ships|launch date/i).first()).toBeVisible({
    timeout: 20_000,
  });
});
