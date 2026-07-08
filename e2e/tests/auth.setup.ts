import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import { ACCOUNTS } from '../lib/accounts';
import { login } from '../lib/login';

// Đăng nhập từng role một lần, lưu phiên để các spec dùng lại (nhanh + ổn định).
if (!fs.existsSync('.auth')) fs.mkdirSync('.auth');

for (const account of Object.values(ACCOUNTS)) {
  setup(`đăng nhập ${account.role}`, async ({ page }) => {
    await login(page, account);
    await page.context().storageState({ path: account.storageState });
  });
}
