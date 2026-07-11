// Xoá mọi đề tài E2E-TEST của giảng viên. Dùng domcontentloaded (tránh treo networkidle).
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: 'state-giangvien.json' });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

const listCount = async () => {
  await page.goto(BASE + '/projects', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table tbody tr', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  return page.locator('table tbody tr', { hasText: 'E2E-TEST' }).count();
};

let guard = 0;
while ((await listCount()) > 0 && guard++ < 12) {
  const row = page.locator('table tbody tr', { hasText: 'E2E-TEST' }).first();
  await row.locator('td').first().click().catch(() => {});
  await page.waitForURL(/\/projects\/[0-9a-f-]{36}/, { timeout: 12000 }).catch(() => {});
  const uuid = (page.url().match(/projects\/([0-9a-f-]{36})/) || [])[1] || '?';
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Xoá', exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(700);
  await page.locator('.modal').getByRole('button', { name: 'Xóa', exact: true }).click({ force: true }).catch(() => {});
  await page.waitForURL(/\/projects$/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1200);
  // verify: mở lại detail
  await page.goto(`${BASE}/projects/${uuid}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1500);
  const gone = /Bị từ chối|Không tìm thấy/i.test(await page.locator('body').innerText().catch(() => ''));
  console.log(`xoá ${uuid}: ${gone ? 'OK (đã biến mất)' : 'còn?'}`);
}
console.log('CÒN LẠI E2E-TEST:', await listCount());
await browser.close();
