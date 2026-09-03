const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8098/nafoud-proposal-review.html', { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const slides = [...document.querySelectorAll('.slide')];
    const nums = slides.map(s => s.querySelector('.num')?.textContent?.trim()).filter(Boolean);
    return {
      title: document.title,
      slides: slides.length,
      logos: document.querySelectorAll('.brand-logo').length,
      hasAuditFree: document.body.textContent.includes('مشمولة مجانًا'),
      hasHireComparison: document.body.textContent.includes('11,667 ريال'),
      hasModularPage: document.body.textContent.includes('مرونة الاعتماد'),
      nums
    };
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.slides !== 18) throw new Error('Expected 18 slides');
  if (result.logos !== 18) throw new Error('Expected logo on every slide');
  if (!result.hasAuditFree || !result.hasHireComparison || !result.hasModularPage) throw new Error('Missing requested content');

  await page.locator('.slide').nth(13).screenshot({ path: '/opt/data/nahr-proposal-generator/test-results/nafoud-review-slide14.png' });
  await page.locator('.slide').nth(14).screenshot({ path: '/opt/data/nahr-proposal-generator/test-results/nafoud-review-slide15.png' });
  await page.pdf({ path: '/opt/data/nahr-proposal-generator/public/nafoud-proposal-review.pdf', format: 'A4', landscape: true, printBackground: true });
  await browser.close();
})();
