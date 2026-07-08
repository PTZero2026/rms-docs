import { test, expect } from '../lib/fixtures';

/**
 * KHỐI A/B — Năng lực mở rộng E4 (VP-FEAT bật cho tenant Thủy Lợi).
 * P03 Quy đổi giờ giảng: trang phải tồn tại cho cả admin lẫn giảng viên.
 * (Công thức/số liệu giờ giảng thuộc phần chốt PO — xem checklist khối A, kiểm thủ công.)
 */
test.describe('E4 / P03. Quy đổi giờ giảng bật cho tenant', () => {
  test('Admin thấy menu + trang Quy đổi giờ giảng', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByRole('link', { name: /Quy đổi giờ giảng/i })).toBeVisible();
    await adminPage.goto('/teaching-hours');
    await expect(adminPage).toHaveTitle(/tính giờ/i);
    await expect(adminPage.getByRole('heading', { name: /Quy đổi giờ giảng/i })).toBeVisible();
  });

  test('Giảng viên thấy trang giờ giảng của mình (nguồn nuôi lý lịch F08)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/teaching-hours');
    await expect(lecturerPage.getByRole('heading', { name: /Quy đổi giờ giảng/i })).toBeVisible();
  });
});
