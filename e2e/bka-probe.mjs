// Verify luồng ghi trên BKA (tenant test): login author -> tạo đề tài BASIC -> gate -> xoá.
import { chromium } from '@playwright/test';
const BASE = 'https://nckh.vnest.vn';
const email = process.argv[2] || 'bka.author@gmail.com';
const OTP = '123456';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
p.setDefaultTimeout(20000);

// login (OTP-optional)
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.locator('#email').fill(email);
await p.getByRole('button', { name: /Đăng nhập/i }).click();
await p.waitForURL(/keycloak/i, { timeout: 20000 }).catch(() => {});
const u = p.locator('#username');
if (await u.count()) { if (!(await u.inputValue())) await u.fill(email); await p.locator('#kc-login, input[name=login], button[type=submit]').first().click(); }
const otp = p.locator('#emailCode');
if (await otp.isVisible({ timeout: 5000 }).catch(() => false)) { await otp.fill(OTP); await p.locator('input[name=login], #kc-login, button[type=submit]').first().click(); }
await p.waitForURL((x) => !/keycloak/i.test(x.host) && !x.pathname.startsWith('/signin'), { timeout: 20000 }).catch(() => {});
await p.context().storageState({ path: `state-bka-author.json` });
console.log('login OK, url:', p.url());

// create BASIC
await p.goto(`${BASE}/projects/create`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const types = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,button,a')].map((e) => e.textContent.trim()).filter((t) => /Đề tài cấp|Dự án phục vụ|sinh viên/i.test(t)).slice(0, 6));
console.log('create types:', JSON.stringify(types));
await p.getByText('Đề tài cấp cơ sở', { exact: false }).first().click().catch((e) => console.log('pick type err', e.message));
await p.waitForTimeout(2500);
console.log('after pick url:', p.url());
const skip = p.getByText('Không chọn đợt', { exact: false }).first();
if (await skip.count()) { await skip.click(); await p.waitForTimeout(2500); }
console.log('form url:', p.url());
const hasTitle = await p.locator('#input-title').count();
const editors = await p.locator('.tiptap[contenteditable="true"]').count();
const submitBtn = await p.getByRole('button', { name: 'Đăng ký đề tài', exact: true }).count();
console.log(JSON.stringify({ hasTitleInput: hasTitle, tiptapEditors: editors, submitBtn }));

if (hasTitle && submitBtn) {
  const name = `E2E-TEST-BKA-probe`;
  await p.locator('#input-title').fill(name);
  const fillEd = async (label, v) => { const ed = p.locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::div[contains(@class,"tiptap")][1]`).first(); await ed.click(); await ed.fill(v).catch(async () => { await ed.pressSequentially(v); }); };
  for (const [l, v] of [['Đặt vấn đề', 'x'], ['Mục tiêu', 'x'], ['Đối tượng & Phương pháp', 'x'], ['Đạo đức nghiên cứu', 'x']]) await fillEd(l, v).catch(() => {});
  await p.getByRole('button', { name: 'Đăng ký đề tài', exact: true }).click();
  await p.waitForURL(/\/projects\/[0-9a-f-]{36}/, { timeout: 25000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const detail = p.url();
  console.log('created detail:', detail.replace(BASE, ''));
  const info = await p.evaluate(() => ({ status: (document.body.innerText.match(/Nháp[^\n]{0,20}/) || ['?'])[0], del: [...document.querySelectorAll('button')].some((b) => /^Xo[áa]$/.test(b.textContent.trim())), chuyen: [...document.querySelectorAll('button')].some((b) => /Chuyển trạng thái/.test(b.textContent)) }));
  console.log('detail info:', JSON.stringify(info));
  // gate: chuyển trạng thái options
  await p.getByRole('button', { name: /Chuyển trạng thái/i }).click().catch(() => {});
  await p.waitForTimeout(1500);
  const opts = await p.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.textContent.trim()).filter((t) => /Gửi|Hủy|nghiệm thu|Hoàn thành|duyệt/i.test(t)).slice(0, 8));
  console.log('transition opts:', JSON.stringify(opts));
  await p.keyboard.press('Escape');
  // delete
  await p.goto(detail, { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Xoá', exact: true }).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await p.getByRole('button', { name: 'Xoá', exact: true }).first().click().catch(() => {});
  await p.waitForTimeout(800);
  await p.locator('.modal').getByRole('button', { name: 'Xóa', exact: true }).click().catch(() => {});
  await p.waitForTimeout(2500);
  await p.goto(`${BASE}/projects`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  console.log('còn E2E-TEST-BKA:', await p.locator('table tbody tr', { hasText: 'E2E-TEST-BKA' }).count());
}
await b.close();
