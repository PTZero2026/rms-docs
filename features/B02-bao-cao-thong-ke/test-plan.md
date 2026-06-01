---
title: "Báo cáo & thống kê — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-01
---

# Báo cáo & thống kê — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong `spec.md`. Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

Mặt nào được test (FE / BO / API), môi trường, dữ liệu mẫu.

## 2. Test cases

| ID    | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại     |
|-------|-------------|----------------|----------------|------------------|----------|
| TC-01 | AC-01       | ...            | ...            | ...              | Happy    |
| TC-02 | AC-01       | ...            | ...            | ...              | Biên/Lỗi |

## 3. Trường hợp biên & negative

Liệt kê các tình huống dễ sót: dữ liệu rỗng, quá hạn, trùng, sai quyền.

## 4. Checklist hồi quy

Những luồng cũ cần test lại khi feature này thay đổi.
