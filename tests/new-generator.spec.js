const { test, expect } = require('@playwright/test');
const base = 'https://nahr-proposal-generator.vercel.app';

test.setTimeout(120000);

test('new generator base page extracts sample data without proposal generation', async ({ page }) => {
  await page.goto(`${base}/new-generator.html`, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/مساحة بناء المولد الجديد/);
  await expect(page.getByText('بدون توليد عرض').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'ولّد نظرة الشركة والعرض' })).toHaveCount(0);
  await expect(page.getByText('المسودة الناتجة')).toHaveCount(0);
  await page.getByRole('button', { name: 'استخدم بيانات تجريبية' }).click();
  await expect(page.locator('.overview-grid b').first()).toHaveText('3');
  await expect(page.getByText('مخرجات التشخيص والبيانات')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'ريم أحمد' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'فهد سالم' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'سارة علي' }).first()).toBeVisible();
  await expect(page.getByLabel('متوسط راتب الموظف شهريًا')).toHaveValue('8000');
  await expect(page.getByLabel('ساعات عمل الموظف في الشهر')).toHaveValue('160');
  await page.getByLabel('متوسط راتب الموظف شهريًا').fill('10000');
  await page.getByLabel('ساعات عمل الموظف في الشهر').fill('160');
  await page.getByRole('button', { name: 'شغّل التشخيص الجديد' }).click();
  await expect(page.getByRole('heading', { name: 'AI Transformation Diagnostic' })).toBeVisible({ timeout: 90000 });
  await expect(page.getByText('تكلفة الساعة', { exact: true })).toBeVisible();
  await expect(page.getByText('١٠٬٠٠٠ ÷ ١٦٠ ساعة')).toBeVisible();
  await expect(page.getByRole('heading', { name: '٣. Data Integrity Scan' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '١٠. Before → Intervention → After' })).toBeVisible();
  await page.getByRole('button', { name: 'عرض كل الأعمدة' }).click();
  await expect(page.getByRole('columnheader', { name: 'Timestamp' })).toBeVisible();
});

test('new generator page uses existing sheet reader api', async ({ page }) => {
  await page.goto(`${base}/new-generator.html`, { waitUntil: 'networkidle' });
  await page.getByLabel('رابط Google Sheet').fill(`${base}/example-responses.csv`);
  await page.getByRole('button', { name: 'اقرأ الشيت' }).click();
  await expect(page.getByText('تمت قراءة 3 رد من الشيت')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.overview-grid b').first()).toHaveText('3');
});
