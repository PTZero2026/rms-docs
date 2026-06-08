---
title: "Quản lý kinh phí — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-05
---

# Quản lý kinh phí — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Chủ nhiệm đề tài** (FE): xem kinh phí được giao, khoán kinh phí theo khoản mục, đợt cấp, dự toán vs thực
  chi của đề tài mình, giải trình khoản chi, đính chứng từ. **Không** chạy đối soát, **không** đổi
  `reconciliationStatus`, **không** sửa dự toán/khoán kinh phí (BR-08).

Vào từ "Đề tài của tôi" → đề tài `IN_PROGRESS`/`SUSPENDED`/`PASSED` → tab **Kinh phí**.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan kinh phí đề tài | Kinh phí được giao, khoán theo khoản mục vs thực chi, tỷ lệ giải ngân, cảnh báo vượt |
| FE-02 | Đợt cấp & giao dịch | Danh sách `BudgetAllocation`/`BudgetTransaction`, trạng thái đối soát; giải trình & đính chứng từ |

## 3. Mô tả màn hình & thao tác

### FE-01 — Tổng quan kinh phí đề tài
- Thẻ tổng: kinh phí được giao từ F04 (`approvedBudget`), tổng khoán/dự toán, tổng đã cấp, tổng chi, còn lại
  (định dạng VND).
- Bảng theo khoản mục: `estimatedAmount`, `settlementMode` (`LUMP_SUM`/`ACTUAL_EXPENSE`/`MIXED`), tổng đã chi,
  còn lại, % giải ngân; tô cảnh báo khi chi vượt/đạt ngưỡng.
- Chỉ đọc; mọi số liệu lấy từ backend (chủ nhiệm không sửa).
- **Trạng thái rỗng:** chưa có dự toán → "Chưa có dự toán cho đề tài." **Đang tải:** skeleton. **Lỗi:** thử lại.

### FE-02 — Đợt cấp & giao dịch
- Bảng `BudgetAllocation`: `allocationNo`, `plannedDate`, `actualDate`, `amount`, `status`
  (`PLANNED`/`DISBURSED`/`CANCELLED`).
- Bảng `BudgetTransaction`: `date`, `budgetLine`, `type` (DISBURSEMENT/EXPENSE), `amount`, `reconciliationStatus`
  (`UNRECONCILED`/`MATCHED`/`MISMATCHED` — gắn nhãn màu).
- Với mỗi giao dịch chi, đặc biệt khoản `ACTUAL_EXPENSE`: chủ nhiệm có thể **giải trình** (nhập diễn giải)
  và **đính chứng từ** (`Attachment`).
- Hiển thị giao dịch `MISMATCHED` nổi bật kèm ghi chú "đang chờ chuyên viên xử lý".
- Giao dịch thuộc đề tài `COMPLETED` ở chế độ khóa, chỉ đọc (BR-10).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đính chứng từ thành công | "Đã lưu chứng từ cho giao dịch." |
| Phát hiện chênh lệch đối soát | "Giao dịch ngày {date} có chênh lệch, đang được xử lý." (B04) |
| Đợt cấp kinh phí đã giải ngân | "Đợt cấp kinh phí {allocationNo} đã được ghi nhận." |
| Đề tài được quyết toán & đóng | "Đề tài đã được quyết toán và hoàn thành." |
| Cố sửa dự toán/đối soát | (Ẩn nút) — không khả dụng với chủ nhiệm |

## 5. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (xem khoán kinh phí), AC-09 (cảnh báo vượt), AC-11 (chỉ thấy đề tài của mình), AC-14 (không vượt kinh phí giao) |
| FE-02 | AC-02 (xem giao dịch chi), AC-03 (trạng thái đối soát), AC-10 (không được đối soát/sửa dự toán), AC-15 (xem đợt cấp), AC-16 (chứng từ khoản thực thanh) |
