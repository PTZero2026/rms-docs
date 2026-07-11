// Map form tạo "Đề tài cấp cơ sở" (chỉ đọc, KHÔNG submit).
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: 'state-giangvien.json' });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
const snap = async (tag) => {
  const info = await page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.display !== 'none'; };
    const q = (s) => [...document.querySelectorAll(s)].filter(vis);
    const t = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45);
    return {
      url: location.href,
      headings: [...new Set(q('h1,h2,h3,h4,h5,.ant-card-head-title,.ant-steps-item-title').map(t).filter(Boolean))].slice(0, 20),
      labels: [...new Set(q('label,.ant-form-item-label').map(t).filter(Boolean))].slice(0, 40),
      fields: q('input,select,textarea').map((e) => ({ n: e.name || e.id || '', t: e.type || e.tagName.toLowerCase(), ph: e.placeholder || '', req: e.required || e.getAttribute('aria-required') === 'true' })).slice(0, 40),
      buttons: [...new Set(q('button').map(t).filter(Boolean))].filter((x) => !/Quản lý|Toggle|^NA$|^\d+$/.test(x)).slice(0, 25),
    };
  });
  console.log(`\n### ${tag}`);
  console.log(JSON.stringify(info, null, 1));
};

await page.goto(BASE + '/projects/create', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await snap('CREATE step0 (chọn loại)');

// click "Đề tài cấp cơ sở"
try {
  await page.getByText('Đề tài cấp cơ sở', { exact: false }).first().click();
  await page.waitForTimeout(3000);
  await snap('AFTER chọn cấp cơ sở');
  // nếu có nút Tiếp/Bắt đầu
  for (const nb of ['Tiếp tục', 'Tiếp theo', 'Bắt đầu', 'Tạo mới', 'Chọn']) {
    const b = page.getByRole('button', { name: new RegExp('^' + nb, 'i') });
    if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(2500); await snap('AFTER ' + nb); break; }
  }
} catch (e) { console.log('ERR', e.message); }
await browser.close();
