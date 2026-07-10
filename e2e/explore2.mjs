// Khảo sát sâu: dump form/tab/nút của các trang nghiệp vụ (dùng state admin).
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const label = process.argv[2] || 'admin';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: `state-${label}.json` });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const dump = async (tag) => {
  const info = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
    const q = (s) => [...document.querySelectorAll(s)].filter(vis);
    const txt = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45);
    return {
      url: location.href, title: document.title,
      headings: q('h1,h2,h3,h4').map(txt).filter(Boolean).slice(0, 12),
      tabs: q('[role=tab], .ant-tabs-tab, .tab, nav a[aria-selected]').map(txt).filter(Boolean).slice(0, 20),
      fields: q('input,select,textarea').map((e) => ({ n: e.name || e.id, t: e.type || e.tagName.toLowerCase(), ph: e.placeholder || e.getAttribute('aria-label') || '' })).slice(0, 40),
      buttons: [...new Set(q('button,[role=button],a.btn,input[type=submit]').map(txt).filter(Boolean))].slice(0, 30),
      rowLinks: q('table tbody tr a[href], table tbody tr [role=link]').map((e) => e.getAttribute('href')).filter(Boolean).slice(0, 5),
      rows: q('table tbody tr').length,
    };
  });
  console.log(`\n#### [${tag}] ${info.url}`);
  console.log(JSON.stringify(info, null, 1));
  return info;
};

const go = async (path, tag) => { try { await page.goto(BASE + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500); return await dump(tag); } catch (e) { console.log(`\n#### [${tag}] ${path} ERR ${e.message}`); return null; } };

await go('/projects', 'projects-list');
// mở chi tiết đề tài đầu tiên
try {
  const href = await page.locator('table tbody tr a[href]').first().getAttribute('href').catch(() => null);
  const row = page.locator('table tbody tr').first();
  if (href) { await page.goto(BASE + href, { waitUntil: 'networkidle' }); }
  else { await row.click({ timeout: 5000 }).catch(() => {}); }
  await page.waitForTimeout(3000);
  await dump('project-detail');
} catch (e) { console.log('detail ERR', e.message); }

await go('/projects/create', 'project-create');
await go('/projects/rounds', 'rounds-list');
await go('/councils', 'councils-list');
await go('/meetings', 'meetings-list');
await go('/meetings/create', 'meeting-create');
await go('/teaching-hours', 'teaching-hours');

await browser.close();
