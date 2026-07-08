import { test, expect } from '../lib/fixtures';
import { BRAND, ACCOUNTS } from '../lib/accounts';

/**
 * KHỐI G/B — Trang chủ B06 (dashboard cá nhân) + VP-BRAND (branding tenant).
 * B06 read-only, cá nhân hoá theo vai trò; hiển thị các widget chuẩn.
 */
test.describe('B06. Trang chủ & branding tenant', () => {
  test('Home admin có đủ widget chuẩn + chào đúng tên', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage).toHaveTitle(/Tổng quan/i);
    await expect(adminPage.getByText(new RegExp(`Xin chào, ${ACCOUNTS.admin.displayName}`, 'i'))).toBeVisible();
    for (const w of ['Số liệu nhanh', 'Thông báo gần đây', 'Lối tắt']) {
      await expect(adminPage.getByRole('heading', { name: w })).toBeVisible();
    }
  });

  test('Home giảng viên hiển thị và cá nhân hoá theo người dùng', async ({ lecturerPage }) => {
    await lecturerPage.goto('/');
    await expect(lecturerPage.getByRole('heading', { name: /Xin chào/i })).toBeVisible();
    await expect(lecturerPage.getByText('Số liệu nhanh', { exact: false })).toBeVisible();
  });

  test('VP-BRAND: footer mang thương hiệu ĐH Thủy Lợi', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByText(BRAND, { exact: false })).toBeVisible();
  });
});
