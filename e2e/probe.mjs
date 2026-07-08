// Probe các trang bằng storageState đã lưu (không đăng nhập lại).
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const label = process.argv[2] || 'admin';
const paths = process.argv.slice(3);

const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: `state-${label}.json` });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
for (const p of paths) {
  try {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const t = (s) => [...document.querySelectorAll(s)];
      return {
        url: location.href, title: document.title,
        headings: t('h1,h2,h3').map((e) => e.textContent.trim().slice(0, 50)).filter(Boolean).slice(0, 10),
        tables: t('table').length,
        rows: t('table tbody tr, [role=row]').length,
        buttons: [...new Set(t('button').map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean))].slice(0, 20),
        bodyHint: document.body.innerText.replace(/\s+/g, ' ').slice(0, 220),
      };
    });
    console.log(`\n### [${label}] GET ${p}`);
    console.log(JSON.stringify(info, null, 2));
  } catch (e) { console.log(`\n### [${label}] GET ${p} -> ERR ${e.message}`); }
}
await browser.close();
