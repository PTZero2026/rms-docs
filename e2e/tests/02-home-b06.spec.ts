import { test, expect } from '../lib/fixtures';
import { BRAND, ACCOUNTS } from '../lib/accounts';

/**
 * KHỐI G/B — Trang chủ B06 (dashboard cá nhân) + VP-BRAND (branding tenant).
 * B06 read-only, cá nhân hoá theo vai trò.
 *
 * TRẠNG THÁI THẬT (khảo sát 2026-07-11): B06 còn ở giai đoạn PLACEHOLDER (khớp spec B06 v0.1).
 *  - "Số liệu nhanh" hiển thị widget khung: "Thống kê Đề tài", "Thống kê Sản phẩm" (mã W-KPI-*).
 *  - "Lối tắt" mới là khung "Các nút Lối tắt" — CHƯA có nút thao tác nhanh / deep-link theo vai trò.
 * ⇒ Các assertion về nhãn số liệu chi tiết & lối tắt điều hướng để test.fixme (chờ B06 dựng đủ).
 */
test.describe('B06. Trang chủ & branding tenant', () => {
  test('Home admin hiển thị cá nhân hoá + widget chuẩn (TC-01)', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage).toHaveTitle(/Tổng quan/i);
    await expect(adminPage.getByText(new RegExp(`Xin chào, ${ACCOUNTS.admin.displayName}`, 'i'))).toBeVisible();
    for (const widget of ['Số liệu nhanh', 'Thông báo gần đây', 'Lối tắt']) {
      await expect(adminPage.getByRole('heading', { name: widget })).toBeVisible();
    }
  });

  test('Home admin: khu "Số liệu nhanh" có widget thống kê', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByRole('heading', { name: 'Số liệu nhanh' })).toBeVisible();
    // Widget hiện có (khung placeholder W-KPI-*)
    await expect(adminPage.getByText('Thống kê Đề tài', { exact: false })).toBeVisible();
    await expect(adminPage.getByText('Thống kê Sản phẩm', { exact: false })).toBeVisible();
  });

  test('Home admin: có khu "Lối tắt"', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByRole('heading', { name: 'Lối tắt' })).toBeVisible();
  });

  // 🟡 Chờ B06 dựng đủ: nhãn số liệu chi tiết + nút lối tắt điều hướng theo vai trò.
  test.fixme('Home admin: số liệu chi tiết + lối tắt điều hướng (B06 đầy đủ)', async ({ adminPage }) => {
    await adminPage.goto('/');
    // Ví dụ khi dựng đủ: "Đề tài đang thực hiện", "Đợt kêu gọi đang mở", nút "Mở Đợt Đăng ký Mới" -> /projects/rounds ...
    await adminPage.getByText('Mở Đợt Đăng ký Mới').click();
    await expect(adminPage).toHaveURL(/\/projects\/rounds/);
  });

  test('Home giảng viên hiển thị và cá nhân hoá theo người dùng (TC-02)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/');
    await expect(lecturerPage.getByRole('heading', { name: /Xin chào/i })).toBeVisible();
    await expect(lecturerPage.getByText(new RegExp(ACCOUNTS.giangvien.displayName, 'i'))).toBeVisible();
    await expect(lecturerPage.getByText('Thống kê Đề tài', { exact: false })).toBeVisible();
  });

  test('VP-BRAND: footer mang thương hiệu ĐH Thủy Lợi (VP-BRAND)', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByText(BRAND, { exact: false })).toBeVisible();
  });
});
