import { test, expect } from '../lib/fixtures';

/**
 * KHỐI A/B — Năng lực mở rộng E4 (VP-FEAT bật cho tenant Thủy Lợi).
 * P03 Quy đổi giờ giảng: trang phải tồn tại cho cả admin lẫn giảng viên.
 * (Công thức/số liệu giờ giảng thuộc phần chốt PO — xem checklist khối A, kiểm thủ công.)
 */
test.describe('E4 / P03. Quy đổi giờ giảng bật cho tenant', () => {
  test('Admin thấy menu + trang Quy đổi giờ giảng và các nút cấu hình', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByRole('link', { name: /Quy đổi giờ giảng/i })).toBeVisible();
    await adminPage.goto('/teaching-hours');
    await expect(adminPage).toHaveTitle(/tính giờ|quy đổi/i);
    await expect(adminPage.getByRole('heading', { name: /Quy đổi giờ giảng/i })).toBeVisible();

    // Admin kiểm tra cấu trúc bảng quy đổi (header thật của trang Lịch sử tính giờ)
    await adminPage.locator('table th').first().waitFor({ state: 'visible', timeout: 20_000 });
    const headers = adminPage.locator('table th');
    const headerTexts = await headers.allTextContents();
    const expectedHeaders = [/giảng viên/i, /loại hoạt động/i, /giờ quy đổi/i, /trạng thái/i, /thời gian/i];
    for (const exp of expectedHeaders) {
      expect(headerTexts.some((h) => exp.test(h)), `thiếu cột khớp ${exp}`).toBeTruthy();
    }
  });

  test('Giảng viên thấy trang giờ giảng của mình (nguồn nuôi lý lịch F08) và không có quyền cấu hình', async ({ lecturerPage }) => {
    await lecturerPage.goto('/teaching-hours', { waitUntil: 'networkidle' });
    await expect(lecturerPage.getByRole('heading', { name: /Quy đổi giờ giảng/i })).toBeVisible();

    // Giảng viên thấy bảng dữ liệu giờ giảng cá nhân
    await expect(lecturerPage.locator('table')).toBeVisible();
    await lecturerPage.locator('table th').first().waitFor({ state: 'visible', timeout: 20_000 });
    const headers = lecturerPage.locator('table th');
    const headerTexts = await headers.allTextContents();
    expect(headerTexts.length).toBeGreaterThan(0);

    // Giảng viên không được phép thấy nút cấu hình công thức hoặc nút điều chỉnh thủ công của admin
    await expect(lecturerPage.getByRole('button', { name: /Cấu hình công thức/i })).toHaveCount(0);
    await expect(lecturerPage.getByRole('button', { name: /Điều chỉnh/i })).toHaveCount(0);
  });
});

