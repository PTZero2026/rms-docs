---
title: "ADR-0015: Phát triển frontend trong monorepo RMS"
status: Accepted
date: 2026-11-20
deciders: "Chủ dự án"
supersedes: ADR-0011
---

# ADR-0015 · Phát triển frontend trong monorepo RMS

## Bối cảnh

RMS bắt đầu triển khai web. Đặc tả, bản mẫu HTML và bộ kiểm thử pilot đã có trong repo. Kế hoạch v0 chọn React, TypeScript, Vite và shadcn/ui. [Hồ sơ kiến trúc v0](../rms-v0-sa-review.md)

## Quyết định

Dùng pnpm workspace ngay tại gốc repo. Ứng dụng web ở `apps/web` dùng các component shadcn và theme từ `packages/ui`. Đặc tả nghiệp vụ tiếp tục được quản lý trong `docs/features/`. [Quyết định về một ứng dụng web](0009-hop-nhat-mot-web-phan-quyen.md)

## Hệ quả

Đội phát triển có thể cập nhật giao diện và đặc tả liên quan trong cùng một thay đổi. Mỗi checkout dùng chung lockfile cho web và UI. Thêm workspace backend và hợp đồng API khi bắt đầu hiện thực các phần tương ứng. Bộ Playwright pilot trong `e2e/` tiếp tục dùng quy trình npm hiện có.
