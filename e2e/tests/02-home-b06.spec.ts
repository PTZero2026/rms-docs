import { test, expect } from '../lib/fixtures';
import { BRAND, ACCOUNTS } from '../lib/accounts';

/**
 * KHỐI G/B — Trang chủ B06 (dashboard cá nhân) + VP-BRAND (branding tenant).
 * B06 read-only, cá nhân hoá theo vai trò; hiển thị các widget chuẩn.
 */
test.describe('B06. Trang chủ & branding tenant', () => {
  test('Home admin hiển thị đầy đủ thông tin cá nhân hoá và widget chuẩn (TC-01, TC-02)', async ({ adminPage }) => {
    await adminPage.goto('/');
    
    // Kiểm tra title trang
    await expect(adminPage).toHaveTitle(/Tổng quan/i);
    
    // Kiểm tra lời chào cá nhân hoá đúng tên của admin (BR-01, AC-01)
    await expect(adminPage.getByText(new RegExp(`Xin chào, ${ACCOUNTS.admin.displayName}`, 'i'))).toBeVisible();
    
    // Kiểm tra hiển thị các khối widget chuẩn theo cấu hình vai trò của Admin (BR-04, AC-02)
    const expectedWidgets = ['Số liệu nhanh', 'Thông báo gần đây', 'Lối tắt'];
    for (const widget of expectedWidgets) {
      await expect(adminPage.getByRole('heading', { name: widget })).toBeVisible();
    }
  });

  test('Home admin hiển thị các thẻ số liệu thống kê nhanh trong phạm vi (BR-06, AC-06)', async ({ adminPage }) => {
    await adminPage.goto('/');

    // Kiểm tra các nhãn số liệu nhanh đặc thù của Admin
    const expectedAdminStats = [
      'Đề tài đang thực hiện',
      'Đợt kêu gọi đang mở',
      'Đề tài trễ hạn báo cáo',
      'Sản phẩm chờ duyệt'
    ];
    for (const statName of expectedAdminStats) {
      await expect(adminPage.getByText(statName, { exact: false })).toBeVisible();
    }
  });

  test('Home admin hoạt động điều hướng từ Lối tắt thao tác nhanh (BR-02, AC-05, AC-07)', async ({ adminPage }) => {
    await adminPage.goto('/');

    // Kiểm tra sự xuất hiện của các lối tắt thao tác nhanh dành cho Admin
    const adminShortcuts = [
      'Mở Đợt Đăng ký Mới',
      'Lập Hội đồng Xét duyệt',
      'Xem Đề tài Trễ hạn',
      'Duyệt Kinh phí'
    ];

    for (const shortcut of adminShortcuts) {
      await expect(adminPage.getByText(shortcut)).toBeVisible();
    }

    // Kiểm tra tính năng điều hướng (deep-link) từ lối tắt mà không sửa dữ liệu nghiệp vụ trực tiếp (AC-05)
    // 1. Thao tác điều hướng tới "Mở Đợt Đăng ký Mới" (F02)
    await adminPage.getByText('Mở Đợt Đăng ký Mới').click();
    await expect(adminPage).toHaveURL(/\/projects\/rounds/);
    
    // Quay lại Trang chủ
    await adminPage.goto('/');

    // 2. Thao tác điều hướng tới "Lập Hội đồng Xét duyệt" (F03)
    await adminPage.getByText('Lập Hội đồng Xét duyệt').click();
    await expect(adminPage).toHaveURL(/\/councils/);
  });

  test('Home giảng viên hiển thị và cá nhân hoá theo người dùng (TC-02, AC-02)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/');
    
    // Kiểm tra lời chào cá nhân hoá đúng tên của giảng viên (BR-01, AC-01)
    await expect(lecturerPage.getByRole('heading', { name: /Xin chào/i })).toBeVisible();
    await expect(lecturerPage.getByText(new RegExp(ACCOUNTS.giangvien.displayName, 'i'))).toBeVisible();
    
    // Kiểm tra các nhãn số liệu nhanh đặc thù của giảng viên
    const expectedLecturerStats = [
      'Đề tài Chủ nhiệm',
      'Bài báo khoa học',
      'Giờ chuẩn NCKH đạt được'
    ];
    for (const statName of expectedLecturerStats) {
      await expect(lecturerPage.getByText(statName, { exact: false })).toBeVisible();
    }
  });

  test('Home giảng viên hoạt động điều hướng từ Lối tắt thao tác nhanh (AC-05)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/');

    // Kiểm tra sự xuất hiện của các lối tắt dành cho giảng viên
    const lecturerShortcuts = [
      'Đăng ký Đề cương mới',
      'Khai báo Bài báo / SP',
      'Xem Quy đổi Giờ NCKH'
    ];
    for (const shortcut of lecturerShortcuts) {
      await expect(lecturerPage.getByText(shortcut)).toBeVisible();
    }

    // Kiểm tra điều hướng tới "Đăng ký Đề cương mới"
    await lecturerPage.getByText('Đăng ký Đề cương mới').click();
    await expect(lecturerPage.getByRole('heading', { name: /Đề tài của tôi/i })).toBeVisible();
  });

  test('VP-BRAND: footer mang thương hiệu ĐH Thủy Lợi (AC-01, VP-BRAND)', async ({ adminPage }) => {
    await adminPage.goto('/');
    await expect(adminPage.getByText(BRAND, { exact: false })).toBeVisible();
  });
});

