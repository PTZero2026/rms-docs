// Discovery v2: đi đúng flow app->keycloak(username)->OTP->app, dump DOM + selector.
import { chromium } from '@playwright/test';

const BASE = 'https://tl-nckh.vnest.vn/';
const OTP = '123456';
const email = process.argv[2] || 'tuanphamhong@gmail.com';
const label = process.argv[3] || 'admin';

const dump = async (page, tag) => {
  const info = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const q = (sel) => [...document.querySelectorAll(sel)].filter(vis);
    const acc = (el) => (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') ||
      el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    return {
      url: location.href, title: document.title,
      headings: q('h1,h2,h3').map((e) => e.textContent.trim().slice(0, 60)).slice(0, 12),
      inputs: q('input,textarea,select').map((e) => ({ type: e.type || e.tagName.toLowerCase(), name: e.name, id: e.id, ph: e.placeholder, al: e.getAttribute('aria-label') })),
      buttons: q('button,[role=button],input[type=submit]').map(acc).filter(Boolean).slice(0, 30),
      links: q('a[href]').map((e) => ({ t: acc(e), href: e.getAttribute('href') })).filter((x) => x.t).slice(0, 60),
      navText: q('nav,[role=navigation],aside,.menu,.sidebar,.ant-menu').map((e) => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 400)).slice(0, 6),
    };
  });
  console.log(`\n===== [${tag}] ${info.url}`);
  console.log(JSON.stringify(info, null, 2));
};

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(25000);
const shot = (n) => page.screenshot({ path: `shot-${label}-${n}.png`, fullPage: true }).catch(() => {});
try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await dump(page, 'APP-LOGIN'); await shot('1-applogin');

  await page.locator('#email').fill(email);
  await page.getByRole('button', { name: /Đăng nhập/i }).click();
  await page.waitForURL(/keycloak/, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await dump(page, 'KC-USERNAME'); await shot('2-kc-username');

  // Keycloak username step
  const u = page.locator('#username');
  if (await u.count()) {
    if (!(await u.inputValue())) await u.fill(email);
    await page.locator('#kc-login, button[type=submit], input[type=submit]').first().click().catch(() => {});
    await page.waitForTimeout(3000);
    await dump(page, 'KC-OTP'); await shot('3-kc-otp');
  }

  // OTP step (email code) — field #emailCode, submit input[name=login]
  await page.locator('#emailCode').fill(OTP);
  await page.locator('input[name=login], #kc-login, button[type=submit]').first().click();
  await page.waitForURL(/tl-nckh\.vnest\.vn/, { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(4000);
  await dump(page, 'APP-HOME'); await shot('4-apphome');

  await page.context().storageState({ path: `state-${label}.json` });
  console.log(`\nSaved storageState -> state-${label}.json`);
} catch (e) {
  console.log('ERR', e.message); await shot('ERR');
} finally {
  await browser.close();
}
