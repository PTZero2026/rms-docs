import { test, expect } from '../lib/fixtures';

/**
 * KHỐI F — luồng lõi tồn tại & điều hướng được (smoke các route feature).
 * F01 đề xuất/đăng ký · F02 đợt đăng ký · F03 hội đồng · cuộc họp.
 * Không tạo/sửa dữ liệu — chỉ kiểm route render đúng tiêu đề (B06 deep-link đích).
 */
const ADMIN_ROUTES: Array<{ path: string; heading: RegExp; feature: string }> = [
  { path: '/projects', heading: /Quản lý Đề tài/i, feature: 'F01 Danh sách đề tài' },
  { path: '/projects/create', heading: /đề tài/i, feature: 'F01 Đăng ký đề tài' },
  { path: '/projects/rounds', heading: /Đợt đăng ký/i, feature: 'F02 Đợt đăng ký' },
  { path: '/councils', heading: /Quản lý Hội đồng/i, feature: 'F03 Hội đồng' },
  { path: '/meetings', heading: /cuộc họp/i, feature: 'Cuộc họp' },
];

test.describe('F. Luồng lõi — route feature render đúng (admin)', () => {
  for (const r of ADMIN_ROUTES) {
    test(`${r.feature}: ${r.path}`, async ({ adminPage }) => {
      await adminPage.goto(r.path);
      await expect(adminPage.getByRole('heading', { name: r.heading }).first()).toBeVisible();
    });
  }

  test('F02: đợt đăng ký có nút Tạo mới (điều kiện tiên quyết mở kỳ)', async ({ adminPage }) => {
    await adminPage.goto('/projects/rounds');
    await expect(adminPage.getByRole('button', { name: /Tạo mới/i })).toBeVisible();
  });

  test('F03: hội đồng có nút Tạo hội đồng', async ({ adminPage }) => {
    await adminPage.goto('/councils');
    await expect(adminPage.getByRole('button', { name: /Tạo hội đồng/i })).toBeVisible();
  });
});

test.describe('F. Giảng viên truy cập được luồng của mình', () => {
  test('Giảng viên vào Danh sách đề tài (phạm vi dữ liệu của mình)', async ({ lecturerPage }) => {
    await lecturerPage.goto('/projects');
    await expect(lecturerPage.getByRole('heading', { name: /Quản lý Đề tài/i })).toBeVisible();
  });

  test('Giảng viên vào Đăng ký đề tài', async ({ lecturerPage }) => {
    await lecturerPage.goto('/projects/create');
    await expect(lecturerPage).toHaveURL(/\/projects\/create/);
  });
});
