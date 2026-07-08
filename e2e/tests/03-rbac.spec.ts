import { test, expect } from '../lib/fixtures';
import { DENIED_TEXT } from '../lib/accounts';

/**
 * KHỐI F — RBAC + luật bất biến #1 (phân quyền ở backend, UI chỉ ẩn/hiện).
 * Chứng minh: giảng viên bị chặn cả ở MENU (ẩn) lẫn ở DEEP-LINK (backend từ chối).
 */
test.describe('F. Phân quyền theo vai trò (RBAC)', () => {
  test('Admin thấy menu quản trị (Người dùng, Hội đồng)', async ({ adminPage }) => {
    await adminPage.goto('/');
    const nav = adminPage.locator('nav, aside, .ant-menu').first();
    await expect(nav.getByRole('link', { name: /Danh sách người dùng/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Quản lý Hội đồng/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Yêu cầu nâng cấp/i })).toBeVisible();
  });

  test('Giảng viên KHÔNG thấy menu quản trị', async ({ lecturerPage }) => {
    await lecturerPage.goto('/');
    await expect(lecturerPage.getByRole('link', { name: /Danh sách người dùng/i })).toHaveCount(0);
    await expect(lecturerPage.getByRole('link', { name: /Quản lý Hội đồng/i })).toHaveCount(0);
    await expect(lecturerPage.getByRole('link', { name: /Tạo cuộc họp/i })).toHaveCount(0);
  });

  test('Deep-link /users: giảng viên bị backend từ chối', async ({ lecturerPage }) => {
    await lecturerPage.goto('/users');
    await expect(lecturerPage.getByText(DENIED_TEXT, { exact: false })).toBeVisible();
    await expect(lecturerPage.locator('table tbody tr')).toHaveCount(0);
  });

  test('Deep-link /councils: giảng viên bị backend từ chối', async ({ lecturerPage }) => {
    await lecturerPage.goto('/councils');
    await expect(lecturerPage.getByText(DENIED_TEXT, { exact: false })).toBeVisible();
  });

  test('Admin truy cập /users bình thường (có bảng dữ liệu)', async ({ adminPage }) => {
    await adminPage.goto('/users');
    await expect(adminPage.getByRole('heading', { name: /Quản lý người dùng/i })).toBeVisible();
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible();
  });
});
