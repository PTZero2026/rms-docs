import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import { ACCOUNTS, ACCOUNTS_BKA, BRANDS } from '../lib/accounts';
import { login } from '../lib/login';

// Đăng nhập từng role một lần, lưu phiên để các spec dùng lại (nhanh + ổn định).
if (!fs.existsSync('.auth')) fs.mkdirSync('.auth');

// --- Thủy Lợi (baseURL config) ---
for (const account of Object.values(ACCOUNTS)) {
  setup(`đăng nhập ${account.role}`, async ({ page }) => {
    await login(page, account);
    await page.context().storageState({ path: account.storageState });
  });
}

// --- BKA (tenant test cho các luồng ghi dữ liệu) — chỉ author + admin ---
for (const account of [ACCOUNTS_BKA.author, ACCOUNTS_BKA.admin]) {
  setup(`đăng nhập BKA ${account.role}`, async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BRANDS.bka.baseUrl });
    const page = await ctx.newPage();
    await login(page, account);
    await ctx.storageState({ path: account.storageState });
    await ctx.close();
  });
}
