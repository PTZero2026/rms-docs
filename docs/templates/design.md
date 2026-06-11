---
title: "<Tên feature> — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "<BE DEV>"
status: Draft        # Draft | Review | Approved
updated: 2026-06-01
---

# <Tên feature> — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu và maintain file này.
> PO/BA **không cần đọc chi tiết kỹ thuật** — chỉ soát **§1 Bảng truy vết** để chắc mọi `BR-xx`/`AC-xx`
> trong `spec.md` đều có người hiện thực. Spec đổi → cập nhật file này; file này đổi mà spec không đổi
> thì không cần PO duyệt.
>
> Nguyên tắc DRY: **không chép lại** schema dùng chung — trỏ tới
> [`../../architecture/data-model.md`](../../architecture/data-model.md) và ADR liên quan.

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

> Mỗi `BR`/`AC` trong `spec.md` phải có ít nhất một dòng. Thiếu dòng = chưa có lời giải kỹ thuật → báo lại DEV.

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01     | ...                | data-model §… |
| AC-01     | ...                | ...        |

## 2. Mô hình dữ liệu

Thực thể, trường, kiểu, ràng buộc (unique / FK / `ON DELETE …`), index. Trỏ tới
[`data-model.md`](../../architecture/data-model.md); chỉ ghi phần **đặc thù feature** ở đây.

## 3. Ràng buộc & bất biến kỹ thuật

Máy trạng thái, domain service dùng chung, validate phía backend, transaction, ghi `AuditLog`,
data scoping — những điều DEV phải giữ để không phá luật ở `spec.md` và §4 `AGENTS.md`.

## 4. API / hợp đồng (nếu có)

Endpoint chính, đầu vào/ra, mã lỗi. Trỏ tới `packages/api-contracts` khi đã có.

## 5. Điểm kỹ thuật cần chốt

Quyết định kỹ thuật còn mở (khác với "điểm nghiệp vụ cần chốt" — phần đó nằm ở `spec.md §7`).
