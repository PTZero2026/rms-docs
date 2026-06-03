---
title: "Quản lý kinh phí — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Quản lý kinh phí — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN**: lập dự toán, ghi giao dịch cấp/chi, chạy đối soát (API hoặc nhập file), xử lý
  giao dịch `LECH`, quyết toán & đóng đề tài. Phạm vi theo đơn vị/đợt được phân.
- **Quản trị hệ thống**: xem; cấu hình tham số kinh phí qua B01 (`CHE_DO_VUOT_DU_TOAN`...).

## 2. Phân quyền (Permission matrix)

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:---:|:---:|
| Xem kinh phí đề tài | `KINH_PHI.XEM` | ✓ | ✓ |
| Lập/sửa dự toán | `KINH_PHI.DU_TOAN` | ✓ | – |
| Ghi/sửa giao dịch cấp/chi | `KINH_PHI.GIAO_DICH` | ✓ | – |
| Chạy đối soát (API) | `KINH_PHI.DOI_SOAT` | ✓ | – |
| Nhập file đối soát (degrade) | `KINH_PHI.DOI_SOAT_FILE` | ✓ | – |
| Xử lý giao dịch `LECH` | `KINH_PHI.XU_LY_LECH` | ✓ | – |
| Quyết toán & đóng đề tài | `KINH_PHI.QUYET_TOAN` | ✓ | – |

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Dự toán kinh phí đề tài | Lập/sửa `DuToanKinhPhi` theo khoản mục |
| BO-02 | Sổ giao dịch kinh phí | Ghi/sửa `GiaoDichKinhPhi` cấp/chi, lọc theo trạng thái đối soát |
| BO-03 | Đối soát | Chạy đối soát API hoặc nhập file; xem kết quả khớp/lệch |
| BO-04 | Xử lý chênh lệch | Danh sách giao dịch `LECH`; điều chỉnh/khớp lại/đánh dấu giải quyết kèm lý do |
| BO-05 | Quyết toán & đóng đề tài | Kiểm tra điều kiện, quyết toán, chuyển `DAT → HOAN_THANH` |

## 4. Mô tả màn hình & thao tác

- **BO-01:** chỉ thao tác khi đề tài `DANG_THUC_HIEN` (BR-01); nhập `khoanMuc`, `soTienDuToan` (validate
  số nguyên VND > 0, BR-02); hiển thị tổng dự toán.
- **BO-02:** thêm giao dịch `CAP`/`CHI`, `khoanMuc`, `soTien`, `ngay`, `maGiaoDichTaiChinh` (tùy chọn).
  Khi chi vượt dự toán khoản mục: theo `KINH_PHI.CHE_DO_VUOT_DU_TOAN` → cảnh báo hoặc chặn (BR-03). Giao
  dịch mới ở `CHUA_DOI_SOAT`.
- **BO-03:** nút **Đối soát qua API**; nếu API lỗi/không sẵn sàng → **Nhập file CSV/Excel** (BR-05). Kết
  quả: khớp → `KHOP`, lệch/không tìm thấy → `LECH`; chặn khớp trùng `maGiaoDichTaiChinh` (BR-09); phát
  thông báo chênh lệch (BR-06).
- **BO-04:** với mỗi `LECH`: điều chỉnh giao dịch để khớp lại, hoặc đánh dấu **đã giải quyết** kèm `lyDo`
  (→ `KHOP`, BR-05/AC-05).
- **BO-05:** chỉ bật khi đề tài `DAT` và **không còn** giao dịch `LECH` (BR-07); nếu còn → liệt kê giao
  dịch cần xử lý và chặn. Quyết toán → chuyển `DAT → HOAN_THANH` (domain service, phối hợp F06).

## 5. Audit & nhật ký

Ghi `NhatKyHeThong` cho: lập/sửa dự toán, ghi/sửa giao dịch, chạy đối soát (API/file), xử lý lệch (kèm
`lyDo`), quyết toán & đóng đề tài (BR-11). Append-only, xem được theo phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|---|---|
| BO-01 | AC-01 (lập dự toán), AC-08 (số tiền không hợp lệ), AC-12 (chặn khi chưa thực hiện) |
| BO-02 | AC-02 (ghi chi trong dự toán), AC-08, AC-09 (vượt dự toán theo cấu hình), AC-12 |
| BO-03 | AC-03 (đối soát API), AC-04 (nhập file degrade), AC-13 (mã trùng) |
| BO-04 | AC-05 (xử lý lệch) |
| BO-05 | AC-06 (quyết toán & đóng), AC-07 (chặn khi còn LECH) |
| (RBAC chung) | AC-10, AC-11 (sai quyền / sai phạm vi) |
