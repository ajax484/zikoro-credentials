import { test, expect } from '@playwright/test';

test('login and logout', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('body')).toContainText('Empower Achievements with Verifiable Certificates & Badges');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Email Address' }).fill('ubahyusuf484@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('Bilal@ubah484');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('combobox').click();
  await page.getByText('integration_workspace').click();
  await page.getByRole('button', { name: 'Select' }).click();
  await expect(page.getByRole('main')).toContainText('What will you be working on today?');
  await page.getByRole('button', { name: 'Log Out' }).click();
  await expect(page.locator('body')).toContainText('Empower Achievements with Verifiable Certificates & Badges');
});