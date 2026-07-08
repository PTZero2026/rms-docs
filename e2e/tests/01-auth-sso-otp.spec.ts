import { test, expect } from '@playwright/test';
import { ACCOUNTS } from '../lib/accounts';
import { login } from '../lib/login';

/**
 * KHỐI C — SSO + OTP (checklist: đăng nhập qua IdP, bước OTP bắt buộc).
 * Xác nhận flow thật: app -> Keycloak realm thuyloi-tenant -> OTP email -> app.
 */
test.describe('C. Đăng nhập SSO + OTP', () => {
  test('C1. Trang /signin hiển thị ô email + nút Đăng nhập', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible();
  });

  test('C2. Nhập email chuyển hướng sang Keycloak (IdP) đúng realm tenant', async ({ page }) => {
    await page.goto('/signin');
    await page.locator('#email').fill(ACCOUNTS.admin.email);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
    await page.waitForURL(/keycloak/i, { timeout: 30_000 });
    expect(page.url()).toContain('realms/thuyloi-tenant');
  });

  test('C3. Admin đăng nhập đủ bước OTP và vào được hệ thống', async ({ page }) => {
    await login(page, ACCOUNTS.admin);
    await expect(page.getByText(new RegExp(ACCOUNTS.admin.displayName, 'i'))).toBeVisible();
    expect(page.url()).toContain('tl-nckh.vnest.vn');
  });

  test('C4. Giảng viên đăng nhập đủ bước OTP và vào được hệ thống', async ({ page }) => {
    await login(page, ACCOUNTS.giangvien);
    await expect(page.getByRole('heading', { name: /Xin chào/i })).toBeVisible();
  });

  test('C5. OTP sai bị từ chối (không cho vào hệ thống)', async ({ page }) => {
    await page.goto('/signin');
    await page.locator('#email').fill(ACCOUNTS.admin.email);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();
    await page.waitForURL(/keycloak/i, { timeout: 30_000 });
    const username = page.locator('#username');
    if (await username.count()) {
      if ((await username.inputValue()) === '') await username.fill(ACCOUNTS.admin.email);
      await page.locator('#kc-login, input[name="login"], button[type="submit"]').first().click();
    }
    await expect(page.locator('#emailCode')).toBeVisible({ timeout: 20_000 });
    await page.locator('#emailCode').fill('000000');
    await page.locator('#kc-login, input[name="login"], button[type="submit"]').first().click();
    // Vẫn ở Keycloak (không redirect về app) => OTP sai bị chặn.
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/keycloak/i);
  });
});
