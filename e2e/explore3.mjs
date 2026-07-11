// Tìm đề tài IN_PROGRESS + dump tab/section chi tiết để xác minh F04/F05/F06/F07.
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: 'state-admin.json' });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// dump bảng: mỗi dòng lấy text các ô + tìm uuid khi click
const rows = await page.locator('table tbody tr').all();
console.log('Tổng dòng:', rows.length);
const seen = new Set();
const targets = [];
for (let i = 0; i < rows.length; i++) {
  const cells = (await rows[i].innerText()).replace(/\t/g, ' | ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`R${i}: ${cells.slice(0, 140)}`);
}

// Mở lần lượt tối đa 6 đề tài, thu tab + nút + status
for (let i = 0; i < Math.min(rows.length, 8); i++) {
  try {
    await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const r = page.locator('table tbody tr').nth(i);
    await r.locator('td').first().click();
    await page.waitForURL(/\/projects\/[0-9a-f-]{36}/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => {
      const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.display !== 'none'; };
      const q = (s) => [...document.querySelectorAll(s)].filter(vis);
      const t = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return {
        url: location.href,
        status: (document.body.innerText.match(/(Nháp|Đã nộp|Đang xét duyệt|Đã duyệt|Đang thực hiện|Tạm dừng|Chờ nghiệm thu|Đang nghiệm thu|Đạt|Hoàn thành|Từ chối|Đã hủy)/g) || []).slice(0, 3),
        tabs: [...new Set(q('[role=tab], .ant-tabs-tab').map(t))].filter(Boolean),
        buttons: [...new Set(q('button').map(t).filter(Boolean))].filter((x) => !/Quản lý|Toggle|^NA$|^\d+$/.test(x)).slice(0, 25),
      };
    });
    const key = info.tabs.join(',') + '|' + info.status.join(',');
    console.log(`\n#${i} status=${JSON.stringify(info.status)} tabs=${JSON.stringify(info.tabs)}`);
    console.log(`   buttons=${JSON.stringify(info.buttons)}`);
    console.log(`   url=${info.url}`);
  } catch (e) { console.log(`#${i} ERR ${e.message}`); }
}
await browser.close();
