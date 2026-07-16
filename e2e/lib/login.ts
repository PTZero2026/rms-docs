import { expect, type Page } from '@playwright/test';
import { OTP_CODE, type Account } from './accounts';

/**
 * Đăng nhập đầy đủ qua flow thật:
 *   App /signin (#email) -> Keycloak realm thuyloi-tenant (#username)
 *   -> nhập OTP email (#emailCode) -> quay lại app.
 * Khẳng định luôn có bước OTP (chứng cứ Block C — SSO + OTP).
 */
export async function login(page: Page, account: Account): Promise<void> {
  await page.goto('/signin', { waitUntil: 'networkidle' });

  // Bước 1: app nhập email
  await expect(page.locator('#email')).toBeVisible();
  await page.locator('#email').fill(account.email);
  await page.getByRole('button', { name: /Đăng nhập/i }).click();

  // Bước 2: redirect sang Keycloak
  await page.waitForURL(/keycloak/i, { timeout: 30_000 });

  // Bước 2a: trang username (login_hint có thể đã điền sẵn)
  const username = page.locator('#username');
  if (await username.count()) {
    await username.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    if ((await username.inputValue()) === '') await username.fill(account.email);
    await clickKcSubmit(page);
  }

  // Bước 3: OTP email — TÙY realm. thuyloi-tenant yêu cầu OTP; bka-uni đăng nhập thẳng.
  const otp = page.locator('#emailCode');
  const needsOtp = await otp.isVisible({ timeout: 6_000 }).catch(() => false);
  if (needsOtp) {
    await otp.fill(OTP_CODE);
    await clickKcSubmit(page);
  }

  // Bước 4: quay lại app (bất kỳ tenant), không còn ở /signin hay Keycloak
  await page.waitForURL((url) => !/keycloak/i.test(url.host) && !url.pathname.startsWith('/signin'), {
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page).toHaveTitle(/Tổng quan|Hệ thống quản lý nghiên cứu khoa học/i, { timeout: 20_000 });
}

async function clickKcSubmit(page: Page): Promise<void> {
  const btn = page.locator('#kc-login, input[name="login"], button[type="submit"]').first();
  await btn.click();
}

export function isOtpVisible(page: Page) {
  return page.locator('#emailCode');
}
