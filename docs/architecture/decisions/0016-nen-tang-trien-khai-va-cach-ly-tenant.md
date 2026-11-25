---
title: "ADR-0016 · Nền tảng triển khai và cách ly tenant"
status: Accepted
date: 2026-11-24
deciders: "SA theo ủy nhiệm triển khai"
---

# Nền tảng triển khai và cách ly tenant

## Bối cảnh

Các lát A/B cùng dùng danh tính, PostgreSQL và vòng đời đề tài. B01 có DB/cache riêng. N01 cần một đích chạy kiểm được trước khi đội có môi trường pilot.

## Quyết định

Áp dụng [SA-01–06](../rms-v0-sa-review.md) cho N01–N14. Local/CI dùng cùng monorepo, API NestJS và PostgreSQL. Danh tính từ realm của tenant được IAM liên kết với issuer + sub. Mỗi giao dịch nghiệp vụ đặt tenant context trong transaction, dùng runtime role hạn quyền, RLS đọc/ghi và khóa ngoại ghép tenant. N02 chứng minh cách ly ngay trên một kết nối được tái sử dụng. B01 xác thực lại quyền thông qua IAM trước khi truy xuất blob. Lệnh đổi trạng thái ghi audit cùng giao dịch, công việc nền nhận qua outbox.

## Căn cứ và hệ quả

Một DB dùng chung giảm số schema phải vận hành và cho phép chuyển trạng thái, ghi audit nguyên tử. Đội phải kiểm context khi tái dùng kết nối, phạm vi của khóa ngoại, worker và bản xuất. Tách DB theo từng trường sẽ cần nhiều quy trình migrate và restore hơn. Hạ tầng bên ngoài thuộc N11, chủ hệ thống nhận bằng chứng N12–N14 trước pilot. [Phiếu triển khai](../../guides/ke-hoach-implement-rms.md) · [Kế hoạch kiểm thử](../../guides/kiem-thu-rms.md)
