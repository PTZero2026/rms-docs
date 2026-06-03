---
title: "Quản lý kinh phí — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Quản lý kinh phí — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Chủ nhiệm đề tài** (FE): xem dự toán vs thực chi của đề tài mình, giải trình khoản chi, đính chứng từ.
  **Không** chạy đối soát, **không** đổi `trangThaiDoiSoat`, **không** sửa dự toán (BR-08).

Vào từ "Đề tài của tôi" → đề tài `DANG_THUC_HIEN`/`TAM_DUNG`/`DAT` → tab **Kinh phí**.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan kinh phí đề tài | Dự toán theo khoản mục vs thực chi, tỷ lệ giải ngân, cảnh báo vượt |
| FE-02 | Chi tiết giao dịch | Danh sách `GiaoDichKinhPhi`, trạng thái đối soát; giải trình & đính chứng từ |

## 3. Mô tả màn hình & thao tác

### FE-01 — Tổng quan kinh phí đề tài
- Bảng theo khoản mục: `soTienDuToan`, tổng đã chi, còn lại, % giải ngân; tô cảnh báo khi chi vượt/đạt ngưỡng.
- Thẻ tổng: tổng dự toán, tổng cấp, tổng chi (định dạng VND).
- Chỉ đọc; mọi số liệu lấy từ backend (chủ nhiệm không sửa).
- **Trạng thái rỗng:** chưa có dự toán → "Chưa có dự toán cho đề tài." **Đang tải:** skeleton. **Lỗi:** thử lại.

### FE-02 — Chi tiết giao dịch
- Bảng `GiaoDichKinhPhi`: `ngay`, `khoanMuc`, `loai` (CAP/CHI), `soTien`, `trangThaiDoiSoat`
  (`CHUA_DOI_SOAT`/`KHOP`/`LECH` — gắn nhãn màu).
- Với mỗi giao dịch chi: chủ nhiệm có thể **giải trình** (nhập diễn giải) và **đính chứng từ** (`TaiLieuDinhKem`).
- Hiển thị giao dịch `LECH` nổi bật kèm ghi chú "đang chờ chuyên viên xử lý".
- Giao dịch thuộc đề tài `HOAN_THANH` ở chế độ khóa, chỉ đọc (BR-10).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đính chứng từ thành công | "Đã lưu chứng từ cho giao dịch." |
| Phát hiện chênh lệch đối soát | "Giao dịch ngày {ngay} có chênh lệch, đang được xử lý." (B04) |
| Đề tài được quyết toán & đóng | "Đề tài đã được quyết toán và hoàn thành." |
| Cố sửa dự toán/đối soát | (Ẩn nút) — không khả dụng với chủ nhiệm |

## 5. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (xem dự toán), AC-09 (cảnh báo vượt), AC-11 (chỉ thấy đề tài của mình) |
| FE-02 | AC-02 (xem giao dịch chi), AC-03 (trạng thái đối soát), AC-10 (không được đối soát/sửa dự toán) |
