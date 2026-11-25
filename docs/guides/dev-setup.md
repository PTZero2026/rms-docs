---
title: "Dev setup — RMS"
status: Draft
updated: 2026-11-24
---

# Thiết lập môi trường phát triển

Chạy từ gốc repo bằng Node theo .nvmrc và pnpm theo packageManager. Cài phụ thuộc với `corepack pnpm install --frozen-lockfile`, rồi chạy `corepack pnpm dev` để mở web với seed v0. Lệnh test, lint và build nằm ở [README](../../README.md).

N01 bổ sung backend và OpenAPI, sinh client và gọi health từ web. N02–N04 bổ sung PostgreSQL, realm và SMTP thử với seed A/B. Khi kiểm service, dùng chính workspace và fixture của task. [Phiếu N01–N04](ke-hoach-implement-rms.md)

## Chạy backend và kiểm hợp đồng

Từ gốc repo, `corepack pnpm dev` khởi động Vite cùng NestJS. Mặc định Nest lắng nghe ở 127.0.0.1:3100. Web gọi `/api` cùng origin và Vite proxy tới Nest. Mở **Phiên mô phỏng** để xem kết quả gọi health. Khi đổi cổng backend, đặt `PORT` cho Nest và `RMS_API_ORIGIN` cho Vite cùng trỏ đến địa chỉ mới. Bản triển khai cần reverse proxy cho `/api`.

Sau khi đổi hợp đồng trong `packages/api-contracts`, chạy `corepack pnpm --filter @rms/api-contracts generate`. Lệnh `check` so bản sinh với nguồn. Chạy `corepack pnpm build` trước `npm --prefix e2e run test:integrated`. Cài browser Playwright hoặc đặt `RMS_BROWSER_CHANNEL=chrome` nếu đã có Chrome.

Để chạy ca PostgreSQL, đặt PostgreSQL 16 và `pg_config` trong PATH rồi chạy `corepack pnpm test:db` bằng tài khoản hệ điều hành thường. Script khởi tạo cluster dùng một lần trong thư mục riêng, tạo role runtime hạn quyền, chạy migration, kiểm A/B rồi dừng và dọn cluster. Với DB riêng do Ops quản lý, tạo role theo `apps/backend/prisma/bootstrap-roles.sql` một lần mỗi cluster, cấp CREATE trên database cho `rms_migrate`, dùng credential migration được phép SET ROLE đó. Chỉ cấp `rms_runtime` cho login của API.
