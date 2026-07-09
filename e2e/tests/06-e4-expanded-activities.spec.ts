import { test, expect } from '../lib/fixtures';

/**
 * KHỐI A/B — Năng lực mở rộng E4 (VP-FEAT bật cho tenant Thủy Lợi).
 * F09 Đề tài cấp trên · F10 Đề tài sinh viên · F11 Dự án phục vụ sản xuất · F12 Hoạt động khoa học.
 * Kiểm thử Smoke & RBAC: Đảm bảo menu hiển thị và các route load đúng tiêu đề/form cho các role.
 */
test.describe('E4. Các hoạt động khoa học mở rộng', () => {

  test.describe('Giảng viên truy cập các tính năng kê khai của mình', () => {

    test('F09: Giảng viên thấy menu + vào trang Đề tài Cấp trên', async ({ lecturerPage }) => {
      await lecturerPage.goto('/');
      // Kiểm tra menu sidebar
      const menuLink = lecturerPage.getByRole('link', { name: /Đề tài Cấp trên/i });
      await expect(menuLink).toBeVisible();
      await menuLink.click();

      // Kiểm tra chuyển hướng và tiêu đề trang
      await expect(lecturerPage).toHaveURL(/\/projects\/upper|\/upper-projects/);
      await expect(lecturerPage.getByRole('heading', { name: /đề tài cấp trên/i }).first()).toBeVisible();

      // Giảng viên thấy nút khai báo mới
      await expect(lecturerPage.getByRole('button', { name: /khai báo|tạo mới/i }).first()).toBeVisible();
    });

    test('F10: Giảng viên thấy menu + vào trang Hướng dẫn Sinh viên', async ({ lecturerPage }) => {
      await lecturerPage.goto('/');
      // Giảng viên là người hướng dẫn
      const menuLink = lecturerPage.getByRole('link', { name: /Hướng dẫn Sinh viên/i });
      await expect(menuLink).toBeVisible();
      await menuLink.click();

      // Kiểm tra chuyển hướng và tiêu đề trang
      await expect(lecturerPage).toHaveURL(/\/projects\/student|\/student-projects/);
      await expect(lecturerPage.getByRole('heading', { name: /sinh viên/i }).first()).toBeVisible();
    });

    test('F11: Giảng viên thấy menu + vào trang Dự án phục vụ sản xuất', async ({ lecturerPage }) => {
      await lecturerPage.goto('/');
      const menuLink = lecturerPage.getByRole('link', { name: /Dự án PV Sản xuất|Dự án phục vụ sản xuất/i });
      await expect(menuLink).toBeVisible();
      await menuLink.click();

      // Kiểm tra chuyển hướng và tiêu đề trang
      await expect(lecturerPage).toHaveURL(/\/projects\/applied|\/applied-projects/);
      await expect(lecturerPage.getByRole('heading', { name: /dự án phục vụ sản xuất|dự án sản xuất/i }).first()).toBeVisible();
    });

    test('F12: Giảng viên thấy menu + vào trang Hoạt động khoa học', async ({ lecturerPage }) => {
      await lecturerPage.goto('/');
      const menuLink = lecturerPage.getByRole('link', { name: /Hoạt động Khoa học/i });
      await expect(menuLink).toBeVisible();
      await menuLink.click();

      // Kiểm tra chuyển hướng và tiêu đề trang
      await expect(lecturerPage).toHaveURL(/\/activities|\/scientific-activities/);
      await expect(lecturerPage.getByRole('heading', { name: /hoạt động khoa học/i }).first()).toBeVisible();
    });
  });

  test.describe('Admin/QLKH quản lý và duyệt các hoạt động', () => {

    test('Admin thấy menu quản lý Đề tài cấp trên và Đề tài sinh viên', async ({ adminPage }) => {
      await adminPage.goto('/');
      // Admin thấy menu quản lý chung
      await expect(adminPage.getByRole('link', { name: /Đề tài Cấp trên/i })).toBeVisible();
      await expect(adminPage.getByRole('link', { name: /Đề tài Sinh viên/i })).toBeVisible();
      await expect(adminPage.getByRole('link', { name: /Dự án PV Sản xuất/i })).toBeVisible();
      await expect(adminPage.getByRole('link', { name: /Hoạt động KH/i })).toBeVisible();
    });

    test('Admin truy cập trang duyệt danh sách Đề tài cấp trên', async ({ adminPage }) => {
      await adminPage.goto('/projects/upper');
      // Admin thấy bảng danh sách đề tài chờ duyệt
      await expect(adminPage.getByRole('heading', { name: /đề tài cấp trên/i }).first()).toBeVisible();
      await expect(adminPage.locator('table')).toBeVisible();
    });
  });
});
