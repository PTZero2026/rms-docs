// Chu trình có kiểm soát: TẠO đề tài nháp test -> xem status + nút -> XOÁ. Báo cáo từng bước.
import { chromium } from '@playwright/test';
const BASE = 'https://tl-nckh.vnest.vn';
const NAME = 'E2E-TEST-INT01-probe';
const browser = await chromium.launch();
const ctx = await browser.newContext({ storageState: 'state-giangvien.json' });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

const fillEditor = async (label, val) => {
  const ed = page.locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::div[contains(@class,"tiptap")][1]`).first();
  await ed.click();
  await ed.fill(val).catch(async () => { await ed.pressSequentially(val, { delay: 3 }); });
  console.log(`  filled editor "${label}"`);
};
const fill = async (label, val) => {
  if (label === 'Tên đề tài') { await page.locator('#input-title').fill(val); console.log('  filled title'); return; }
  await fillEditor(label, val);
};

await page.goto(BASE + '/projects/create?type=BASIC&roundId=none', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
console.log('STEP fill form');
await fill('Tên đề tài', NAME);
await fill('Đặt vấn đề', 'probe đặt vấn đề');
await fill('Mục tiêu', 'probe mục tiêu');
await fill('Đối tượng & Phương pháp', 'probe phương pháp');
await fill('Đạo đức nghiên cứu', 'probe đạo đức');

console.log('STEP submit "Đăng ký đề tài"');
await page.getByRole('button', { name: /^Đăng ký đề tài$/ }).click();
await page.waitForTimeout(4000).catch(() => {});
console.log('URL sau submit:', page.url());
// dump status + buttons trên trang hiện tại
const dump = async (tag) => {
  const info = await page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.display !== 'none'; };
    const q = (s) => [...document.querySelectorAll(s)].filter(vis);
    const t = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return {
      url: location.href,
      status: (document.body.innerText.match(/(Nháp[^.]{0,25}|Đã nộp|Đang xét duyệt|Chờ duyệt)/g) || []).slice(0, 2),
      buttons: [...new Set(q('button').map(t).filter(Boolean))].filter((x) => !/Quản lý|Toggle|^NA$|^PT$|^\d+$/.test(x)).slice(0, 25),
      toast: (document.body.innerText.match(/(thành công|thất bại|lỗi|bắt buộc|required)/gi) || []).slice(0, 3),
    };
  });
  console.log(`\n### ${tag}\n` + JSON.stringify(info, null, 1));
  return info;
};
const after = await dump('AFTER SUBMIT');

// nếu chưa ở detail, mở từ danh sách theo tên
if (!/\/projects\/[0-9a-f-]{36}/.test(page.url())) {
  await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const row = page.locator('table tbody tr', { hasText: NAME }).first();
  if (await row.count()) { await row.locator('td').first().click(); await page.waitForTimeout(2500); await dump('DETAIL via list'); }
  else console.log('KHÔNG tìm thấy đề tài trong danh sách theo tên', NAME);
}

// thử XOÁ
console.log('\nSTEP xoá');
const del = page.getByRole('button', { name: /^Xo[áa]$/ }).first();
if (await del.count()) {
  await del.click().catch((e) => console.log('del click err', e.message));
  await page.waitForTimeout(1200);
  await dump('DELETE dialog');
  const confirm = page.getByRole('button', { name: /^(Xo[áa]|Đồng ý|OK|Xác nhận)$/ }).last();
  await confirm.click({ timeout: 5000 }).catch((e) => console.log('confirm err', e.message));
  await page.waitForTimeout(2000);
  console.log('URL sau xoá:', page.url());
} else console.log('KHÔNG thấy nút Xoá');
await browser.close();
