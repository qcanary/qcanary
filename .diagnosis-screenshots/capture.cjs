const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join('c:', 'Qcanary', '.diagnosis-screenshots');
const BASE = 'http://localhost:3000';
const URLS = [
  { slug: 'home', path: '/' },
  { slug: 'pricing', path: '/pricing' },
  { slug: 'docs', path: '/docs' },
  { slug: 'features', path: '/features' },
  { slug: 'compare', path: '/compare' },
  { slug: 'settings', path: '/settings' },
  { slug: 'sign-in', path: '/sign-in' },
];
const KEYWORDS = ['$9', '$39', 'Starter', 'Team', 'Solo'];
const EXTRACT_SLUGS = new Set(['pricing', 'docs', 'settings']);

function extractMatches(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const hits = new Set();
  for (const line of lines) {
    for (const kw of KEYWORDS) {
      if (line.includes(kw)) hits.add(line);
    }
  }
  return [...hits];
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = { baseUrl: BASE, capturedAt: new Date().toISOString(), pages: [], errors: [] };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  for (const { slug, path: p } of URLS) {
    const url = BASE + p;
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(String(err)));

    let httpStatus = null;
    let finalUrl = url;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
      httpStatus = resp ? resp.status() : null;
      finalUrl = page.url();
      await page.waitForTimeout(1500);
      const shot = path.join(OUT, `${slug}.png`);
      await page.screenshot({ path: shot, fullPage: true });

      const title = await page.title();
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const pricingTextMatches = EXTRACT_SLUGS.has(slug) ? extractMatches(bodyText) : [];

      report.pages.push({
        slug,
        requestedUrl: url,
        finalUrl,
        httpStatus,
        title,
        screenshot: shot,
        consoleErrors,
        pageErrors,
        pricingTextMatches,
      });
    } catch (e) {
      report.errors.push({ slug, url, error: String(e), consoleErrors, pageErrors });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  const reportPath = path.join(OUT, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportPath, pageCount: report.pages.length, errors: report.errors.length }, null, 2));
})();
