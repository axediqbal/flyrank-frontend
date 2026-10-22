import { expect, test } from '@playwright/test';

// The primary flow, end to end: land on the home page, open the project
// chat, run the lead-scoring tool to its result card, then hold a
// streamed conversation turn.
test('primary flow: home -> chat -> tool result -> streamed reply', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Chat' }).first().click();
  await expect(page.getByRole('heading', { name: /scope your project/i })).toBeVisible();

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
