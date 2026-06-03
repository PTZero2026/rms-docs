---
title: "Quản lý tiến độ — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Quản lý tiến độ — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN**: giao đề tài, lập lịch kỳ báo cáo, duyệt/yêu cầu chỉnh sửa báo cáo, tạm dừng/tiếp
  tục, chuyển sang chờ nghiệm thu. Thao tác trong phạm vi đơn vị/đợt được phân (BR-11).
- **Quản trị hệ thống**: xem, không trực tiếp xử lý nghiệp vụ tiến độ.

## 2. Phân quyền (Permission matrix)

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:---:|:---:|
| Xem tiến độ đề tài & báo cáo | `TIEN_DO.XEM` | ✓ | ✓ |
| Giao đề tài (`DUYET → DANG_THUC_HIEN`) | `TIEN_DO.GIAO_DE_TAI` | ✓ | – |
| Lập/sửa lịch kỳ báo cáo | `TIEN_DO.LAP_KY` | ✓ | – |
| Duyệt báo cáo (`→ DAT`) | `TIEN_DO.DUYET_BAO_CAO` | ✓ | – |
| Yêu cầu chỉnh sửa báo cáo | `TIEN_DO.YEU_CAU_SUA` | ✓ | – |
| Tạm dừng / tiếp tục đề tài | `TIEN_DO.TAM_DUNG` | ✓ | – |
| Chuyển sang chờ nghiệm thu | `TIEN_DO.CHUYEN_NGHIEM_THU` | ✓ | – |
| Mở lại báo cáo đã `DAT` (ngoại lệ) | `TIEN_DO.MO_LAI` | ✓ | – |

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đề tài đang thực hiện | Lọc theo đơn vị/đợt/trạng thái/đề tài trễ hạn; vào chi tiết |
| BO-02 | Giao đề tài & lập lịch báo cáo | Giao đề tài `DUYET`, tạo các kỳ (`ky`, `kyHan`) |
| BO-03 | Chi tiết tiến độ đề tài | Bảng kỳ báo cáo, duyệt/yêu cầu sửa, tạm dừng/tiếp tục, chuyển nghiệm thu |
| BO-04 | Duyệt báo cáo kỳ | Xem nội dung/đính kèm, duyệt đạt hoặc yêu cầu chỉnh sửa kèm nhận xét |

## 4. Mô tả màn hình & thao tác

- **BO-01:** danh sách phân trang server-side; bộ lọc trạng thái đề tài, **đề tài có báo cáo trễ hạn**,
  đợt kêu gọi, đơn vị. Cột cảnh báo số kỳ quá hạn.
- **BO-02:** chọn đề tài `DUYET` → nút **Giao đề tài** (xác nhận → `DANG_THUC_HIEN`, BR-01). Sau đó thêm các
  kỳ báo cáo: nhập `ky` và `kyHan`; hệ thống chặn `ky` trùng (BR-07) và chặn lập kỳ khi đề tài không
  `DANG_THUC_HIEN` (BR-02).
- **BO-03:** banner trạng thái + lý do tạm dừng; bảng kỳ báo cáo với trạng thái & cờ trễ; nút **Tạm dừng**
  / **Tiếp tục** (bắt buộc nhập `lyDo`, BR-06); nút **Chuyển chờ nghiệm thu** chỉ bật khi kỳ cuối `DAT` và
  đủ sản phẩm cam kết, nếu thiếu hiển thị rõ điều kiện còn thiếu (BR-10).
- **BO-04:** mở từ một báo cáo `DA_NOP`; hai hành động: **Duyệt đạt** (`→ DAT`) hoặc **Yêu cầu chỉnh sửa**
  (`→ YEU_CAU_CHINH_SUA`, bắt buộc nhập `nhanXetChuyenVien`, để trống → chặn, BR-05).

## 5. Audit & nhật ký

Ghi `NhatKyHeThong` cho: giao đề tài, lập/sửa kỳ báo cáo, duyệt báo cáo, yêu cầu chỉnh sửa, tạm dừng/tiếp
tục (kèm `lyDo`), chuyển chờ nghiệm thu, mở lại báo cáo `DAT`. Chuyên viên/quản trị xem được nhật ký theo
phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|---|---|
| BO-01 | AC-08 (lọc trễ hạn) |
| BO-02 | AC-01 (giao đề tài), AC-02 (lập kỳ), AC-13 (chặn sai trạng thái/trùng kỳ) |
| BO-03 | AC-06 (tạm dừng/tiếp tục), AC-07 (chuyển nghiệm thu), AC-12 (chặn khi kỳ cuối chưa đạt) |
| BO-04 | AC-04 (duyệt đạt), AC-05 (yêu cầu sửa), AC-10 (chặn yêu cầu sửa thiếu nhận xét), AC-11 (sai quyền) |
