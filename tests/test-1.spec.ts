import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/home');
  await page.getByRole('link', { name: 'Buy more credits' }).click();
  await page.getByRole('button', { name: 'Increase bronze credit' }).click();
  await page.getByRole('button', { name: 'Increase bronze credit' }).click();
  await page.getByRole('button', { name: 'Increase silver credit' }).click();
  await page.getByRole('button', { name: 'Increase silver credit' }).click();
  await page.getByRole('button', { name: 'Increase gold credit' }).click();
  await page.getByRole('button', { name: 'Increase gold credit' }).click();
  await page.getByRole('button', { name: 'Pay NGN' }).click();
  await page.getByRole('button', { name: 'Proceed to checkout' }).click();
  await page.getByRole('button', { name: 'Pay NGN' }).first().click();
  await page.locator('#inline-checkout-ZVJLP').contentFrame().getByText('Success').click();
  await page.locator('#inline-checkout-ZVJLP').contentFrame().getByTestId('testCardsPaymentButton').click();
  await page.goto('http://localhost:3000/designs');
  await expect(page.getByRole('status')).toContainText('action performed successfully');
});