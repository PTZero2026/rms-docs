---
title: "Đợt kêu gọi đề xuất — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đợt kêu gọi đề xuất — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN** — vai trò chính: tạo, cấu hình, mở/đóng/hủy đợt, theo dõi số đề xuất.
- **Quản trị hệ thống** — gián tiếp: cấp quyền `DOT_KEU_GOI.QUAN_LY` và quản lý danh mục nền (B01/B03).
- **Thành viên hội đồng** — không thao tác F02 (chỉ tiêu thụ bộ tiêu chí của đợt qua F03).

Xem chi tiết persona ở `../../product/personas.md`.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử theo quy ước `MODULE.HANH_DONG` (data-model §4.1). Backend kiểm tra mọi API;
BO chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Chuyên viên QL KHCN | Quản trị hệ thống | Thành viên hội đồng |
|-----------|:-------------------:|:-----------------:|:-------------------:|
| Xem danh sách / chi tiết đợt | ✓ | ✓ | – |
| Tạo / sửa đợt (`NHAP`) | ✓ | – | – |
| Cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí | ✓ | – | – |
| Mở đợt (`NHAP → MO`) | ✓ | – | – |
| Đóng đợt (`MO → DONG`) | ✓ | – | – |
| Hủy đợt (`→ HUY`) | ✓ | – | – |
| Gia hạn `denNgay` | ✓ | – | – |
| Theo dõi số đề xuất | ✓ | ✓ | – |

> Quyền vận hành đợt gắn với `DOT_KEU_GOI.QUAN_LY`. Người không có quyền bị từ chối 403 (AC-08).

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đợt kêu gọi | Liệt kê mọi đợt theo trạng thái, lọc/tìm, vào tạo mới |
| BO-02 | Tạo / sửa đợt | Nhập tên/mã, thời gian, cấu hình lĩnh vực + biểu mẫu + bộ tiêu chí |
| BO-03 | Chi tiết đợt & vận hành | Mở/đóng/hủy/gia hạn, theo dõi số đề xuất đã nộp |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách đợt kêu gọi

- **Bộ lọc:** theo `trangThai` (`NHAP`/`MO`/`DONG`/`HUY`), theo lĩnh vực, theo khoảng thời gian;
  tìm theo `ten`/`ma`. Phân trang server-side.
- **Cột bảng:** `ma`, `ten`, `tuNgay`–`denNgay`, trạng thái (badge), số đề xuất, người tạo, cập nhật.
- **Thao tác:** "Tạo đợt mới" → BO-02; bấm dòng → BO-03.
- **Trạng thái:** đang tải (skeleton bảng); rỗng ("Chưa có đợt kêu gọi nào — Tạo đợt mới"); lỗi + "Thử lại".

### BO-02 — Tạo / sửa đợt

- **Trường nhập:** `ma` (unique — BR-02), `ten`, `tuNgay`, `denNgay`, chọn nhiều `LinhVuc`
  (`linhVucIds`, nguồn B01), chọn biểu mẫu thuyết minh (`bieuMauThuyetMinhId`), chọn bộ tiêu chí
  xét duyệt (`tieuChiXetDuyetId`). Chỉ hiện danh mục B01 đang `ACTIVE` (BR-04).
- **Validate khi Lưu:** `denNgay ≥ tuNgay` (BR-01); `ma` chưa tồn tại (BR-02). Lỗi inline tại trường.
- **Khóa cấu hình (chế độ sửa):** nếu đợt đã `MO` và đã có ≥1 đề tài `DA_NOP`, vô hiệu hóa
  `tuNgay`/`linhVucIds`/`bieuMauThuyetMinhId`/`tieuChiXetDuyetId`; chỉ cho sửa `denNgay` (gia hạn) — BR-06.
- **Lưu:** tạo/cập nhật đợt ở `NHAP` (đợt mới); chuyển BO-03 sau khi lưu.

### BO-03 — Chi tiết đợt & vận hành

- **Khối thông tin:** toàn bộ cấu hình + trạng thái hiện tại + **số đề xuất** (đếm `DeTai` theo đợt,
  tách theo trạng thái: nháp / đã nộp / đang xét duyệt…).
- **Hành động vận hành (hiện theo trạng thái & quyền):**
  - "Mở đợt" (`NHAP → MO`): kiểm BR-03 (đủ trường) + BR-04 (danh mục hiệu lực); xác nhận trước khi mở.
  - "Đóng đợt" (`MO → DONG`): xác nhận; sau khi đóng, F01 ngừng nhận đề xuất mới (BR-05).
  - "Gia hạn" (`MO` hoặc mở lại `DONG → MO`): nhập `denNgay` mới về tương lai (BR-06/BR-01).
  - "Hủy đợt" (`→ HUY`): chỉ bật khi đợt **chưa có** đề tài `DA_NOP`; nếu có → chặn với thông báo
    phải "Đóng" thay vì "Hủy" (BR-07). Yêu cầu nhập `lyDo`.
- **Liên kết:** từ số đề xuất có thể điều hướng sang danh sách đề tài của đợt (F01) — ngoài phạm vi F02.

## 5. Audit & nhật ký

Ghi `NhatKyHeThong` (append-only, data-model §4.7) cho các hành động đổi trạng thái/cấu hình quan trọng:

| Hành động | Ghi log | Giá trị lưu |
|---|---|---|
| Tạo đợt | ✓ | `giaTriMoi` = cấu hình đợt |
| Sửa cấu hình / gia hạn | ✓ | `giaTriCu` → `giaTriMoi` các trường thay đổi |
| Mở / Đóng đợt | ✓ | chuyển `trangThai`, người + thời điểm |
| Hủy đợt | ✓ | `trangThai = HUY`, kèm `lyDo` |

Người xem nhật ký: chuyên viên QL KHCN và quản trị hệ thống (theo quyền xem audit ở B03).

## 6. Liên kết AC

| Màn hình | AC liên quan (xem `spec.md` §6) |
|----------|----------------------------------|
| BO-01 | AC-01 (đợt mới xuất hiện danh sách), AC-08 (chặn truy cập trái quyền) |
| BO-02 | AC-01 (tạo `NHAP`), AC-05 (validate thời gian/mã), AC-06 (khóa cấu hình) |
| BO-03 | AC-02 (mở đợt), AC-04 (đóng đợt), AC-06 (gia hạn), AC-07 (chặn hủy), AC-08 (quyền) |
