const { test, expect } = require('@playwright/test');
const base = 'https://nahr-proposal-generator.vercel.app';

test('internal proposal generator creates a draft from sample data', async ({ page }) => {
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/مولد عروض نهر/);
  await expect(page.getByRole('link', { name: 'قالب PowerPoint' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'معاينة القالب' })).toBeVisible();
  await page.getByRole('button', { name: 'استخدم بيانات تجريبية' }).click();
  await page.getByLabel('الشركة أو الجهة').fill('شركة الاختبار');
  await expect(page.locator('.overview-grid b').first()).toHaveText('3');
  await page.getByRole('button', { name: 'ولّد نظرة الشركة والعرض' }).click();
  await expect(page.getByText('عرض فني ومالي مبدئي')).toBeVisible();
  await expect(page.getByText('عدد الردود المحللة')).toBeVisible();
  await expect(page.getByText('تجهيز تقرير التدريب الأسبوعي').first()).toBeVisible();
  await expect(page.getByText('تحويل ملاحظات المكالمة').first()).toBeVisible();
  await expect(page.getByText('تصنيف الشكاوى').first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('sheet reader api parses a csv url', async ({ request }) => {
  const res = await request.get(`${base}/api/read-sheet?url=${encodeURIComponent(base + '/example-responses.csv')}`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(data.headers).toContain('الاسم');
  expect(data.rows[0]).toContain('ريم أحمد');
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
