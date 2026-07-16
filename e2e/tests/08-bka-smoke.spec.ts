import { test, expect } from '@playwright/test';
import { ACCOUNTS_BKA, BRANDS } from '../lib/accounts';
import { login } from '../lib/login';

/**
 * Tenant thứ hai — Trường Đại học Bách Khoa Hà Nội (realm bka-uni, nckh.vnest.vn).
 * Khác Thủy Lợi: đăng nhập KHÔNG có bước OTP (username → vào thẳng).
 * Smoke: 4 vai trò (user/author/staff/admin) đăng nhập được + phân quyền nav đúng.
 */
const BKA = BRANDS.bka.baseUrl;

// Nav kỳ vọng theo vai trò (link phải thấy / phải KHÔNG thấy).
const NAV: Record<string, { show: RegExp[]; hide: RegExp[] }> = {
  admin: {
    show: [/Danh sách người dùng/i, /Quản lý Hội đồng/i, /Đăng ký đề tài/i],
    hide: [],
  },
  author: {
    show: [/Đăng ký đề tài/i, /Danh sách đề tài/i],
    hide: [/Danh sách người dùng/i, /Quản lý Hội đồng/i],
  },
  staff: {
    show: [/Hoạt động của tôi/i, /Quy đổi giờ giảng/i],
    hide: [/Đăng ký đề tài/i, /Danh sách người dùng/i],
  },
  user: {
    show: [/Hoạt động của tôi/i, /Quy đổi giờ giảng/i],
    hide: [/Đăng ký đề tài/i, /Danh sách người dùng/i],
  },
};

test.describe('BKA · Đăng nhập & phân quyền (tenant bka-uni)', () => {
  for (const [role, acc] of Object.entries(ACCOUNTS_BKA)) {
    test(`Vai trò ${role} đăng nhập + nav đúng quyền`, async ({ browser }) => {
      const ctx = await browser.newContext({ baseURL: BKA });
      const page = await ctx.newPage();
      try {
        await login(page, acc);
        await expect(page).toHaveTitle(/Tổng quan/i);

        const nav = NAV[role];
        for (const re of nav.show) {
          await expect(page.getByRole('link', { name: re }), `${role} phải thấy ${re}`).toBeVisible();
        }
        for (const re of nav.hide) {
          await expect(page.getByRole('link', { name: re }), `${role} KHÔNG được thấy ${re}`).toHaveCount(0);
        }
      } finally {
        await ctx.close();
      }
    });
  }
});
