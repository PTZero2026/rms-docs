// Khám phá tab Tiến độ / Giao-Khoán + dialog "Chuyển trạng thái" của đề tài IN_PROGRESS.
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const UUID = process.argv[2] || '57984038-bc70-4fce-9c23-6f7f09b202b3';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: 'state-admin.json' });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
const snap = async (tag) => {
  const info = await page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.display !== 'none'; };
    const q = (s) => [...document.querySelectorAll(s)].filter(vis);
    const t = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return {
      headings: [...new Set(q('h1,h2,h3,h4,h5,.ant-modal-title,label').map(t).filter(Boolean))].slice(0, 25),
      buttons: [...new Set(q('button,[role=menuitem],.ant-select-item-option').map(t).filter(Boolean))].filter((x) => !/Quản lý|Toggle|^NA$/.test(x)).slice(0, 30),
      body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300),
    };
  });
  console.log(`\n### ${tag}`);
  console.log(JSON.stringify(info, null, 1));
};

await page.goto(`${BASE}/projects/${UUID}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await snap('DETAIL default');

for (const tab of ['Giao/Khoán', 'Tiến độ']) {
  try {
    await page.getByRole('tab', { name: tab }).click({ timeout: 8000 });
    await page.waitForTimeout(2000);
    await snap(`TAB ${tab}`);
  } catch (e) { console.log(`tab ${tab} ERR ${e.message}`); }
}

// mở dialog Chuyển trạng thái (đọc, không xác nhận)
try {
  await page.getByRole('button', { name: /Chuyển trạng thái/i }).click({ timeout: 8000 });
  await page.waitForTimeout(1800);
  await snap('DIALOG Chuyển trạng thái');
  // nếu có select, mở ra xem option
  const sel = page.locator('.ant-select-selector, select').first();
  if (await sel.count()) { await sel.click().catch(() => {}); await page.waitForTimeout(1200); await snap('DIALOG options'); }
} catch (e) { console.log('dialog ERR', e.message); }
await browser.close();
