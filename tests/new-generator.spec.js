const { test, expect } = require('@playwright/test');
const base = process.env.BASE_URL || 'https://nahr-proposal-generator.vercel.app';

test.setTimeout(120000);

test('new generator builds a PDF-style proposal deck from sample data', async ({ page }) => {
  await page.goto(`${base}/new-generator.html`, { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/مساحة بناء المولد الجديد/);
  await page.getByRole('button', { name: 'استخدم بيانات تجريبية' }).click();
  await expect(page.locator('.overview-grid b').first()).toHaveText('3');
  await expect(page.getByLabel('متوسط راتب الموظف شهريًا')).toHaveValue('8000');
  await expect(page.getByLabel('ساعات عمل الموظف في الشهر')).toHaveValue('160');
  await page.getByLabel('اسم العميل / الجهة').fill('شركة تجربة');
  await page.getByLabel('لون العرض الأساسي').fill('#123456');
  await page.getByRole('button', { name: 'ولّد العرض صفحة بصفحة' }).click();
  await expect(page.locator('.client-deck .d-slide')).toHaveCount(18);
  await expect(page.getByRole('heading', { name: 'تمكين الطبقة الإشرافية' })).toBeVisible();
  await expect(page.getByText('شركة تجربة').first()).toBeVisible();
  await expect(page.getByText('50%').first()).toBeVisible();
  await expect(page.getByText('دفعة أولية من قيمة الخدمة المرغوبة').first()).toBeVisible();
  await expect(page.getByText('مرونة الاعتماد').first()).toBeVisible();
  await expect(page.locator('.client-deck .d-client').first()).toBeVisible();
});

test('new generator can still run diagnostic and show clean data', async ({ page }) => {
  await page.goto(`${base}/new-generator.html`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'استخدم بيانات تجريبية' }).click();
  await page.getByLabel('متوسط راتب الموظف شهريًا').fill('10000');
  await page.getByLabel('ساعات عمل الموظف في الشهر').fill('160');
  await page.getByRole('button', { name: 'شغّل التشخيص الجديد' }).click();
  await expect(page.getByRole('heading', { name: 'AI Transformation Diagnostic' })).toBeVisible({ timeout: 90000 });
  await expect(page.getByText('تكلفة الساعة', { exact: true })).toBeVisible();
  await expect(page.getByText('١٠٬٠٠٠ ÷ ١٦٠ ساعة')).toBeVisible();
  await expect(page.getByRole('heading', { name: '٣. Data Integrity Scan' })).toBeVisible();
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
