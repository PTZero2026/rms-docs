---
title: "Xét duyệt hội đồng — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Xét duyệt hội đồng — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

Hai vai trò ([personas](../../product/personas.md)):

- **Chuyên viên QL KHCN** — tổ chức xét duyệt: lập `HoiDong` (loai `XET_DUYET`), phân công
  `ThanhVienHoiDong`, tạo `DotDanhGia` cho từng đề tài, theo dõi tiến độ chấm, xem bảng tổng hợp
  điểm và ra kết luận `DUYET`/`TU_CHOI` theo ngưỡng.
- **Thành viên hội đồng** — chuyên gia chấm điểm: xem hồ sơ đề tài được phân công, điền `PhieuCham`
  theo `TieuChiDanhGia`, gửi phiếu. **Không** lập hội đồng, **không** ra kết luận (BR-09).

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử RBAC ở backend (overview §4.1). FE/BO chỉ ẩn/hiện theo quyền.

| Hành động | Chuyên viên QL KHCN | Thành viên hội đồng |
|-----------|:-------------------:|:-------------------:|
| Xem danh sách hội đồng & đợt đánh giá | ✓ | – |
| Lập / sửa hội đồng (`HoiDong` XET_DUYET) | ✓ | – |
| Phân công thành viên (`ThanhVienHoiDong`) | ✓ | – |
| Tạo `DotDanhGia` (mở xét duyệt → đề tài `DANG_XET_DUYET`) | ✓ | – |
| Xem hồ sơ đề tài được phân công chấm | ✓ | ✓ (chỉ đề tài được giao, trừ xung đột lợi ích — BR-03) |
| Tạo/sửa `PhieuCham` của chính mình (NHAP) | – | ✓ |
| Gửi phiếu (`NHAP → DA_GUI`) | – | ✓ |
| Xem bảng tổng hợp điểm (`diemTongHop`) | ✓ | – |
| Ra kết luận `DUYET`/`TU_CHOI` | ✓ | – |
| Mở lại đợt đã kết luận (có `lyDo`) | ✓ | – |

> Quyền tham chiếu B03: vd `HOI_DONG.QUAN_LY`, `DOT_DANH_GIA.TAO`, `PHIEU_CHAM.CHAM`,
> `DOT_DANH_GIA.KET_LUAN`. Tên quyền cụ thể chốt cùng B03.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Vai trò | Mục đích |
|-------|--------------|---------|----------|
| BO-01 | Quản lý hội đồng xét duyệt | Chuyên viên | Lập/sửa `HoiDong` XET_DUYET, phân công thành viên & chức danh |
| BO-02 | Mở & theo dõi đợt đánh giá | Chuyên viên | Tạo `DotDanhGia` cho đề tài, theo dõi tiến độ thu phiếu |
| BO-03 | Bảng tổng hợp điểm & kết luận | Chuyên viên | Xem `diemTongHop`, kiểm tra đủ phiếu, ra kết luận DUYET/TU_CHOI |
| BO-04 | Hàng chờ chấm của tôi | Thành viên HĐ | Danh sách đề tài cần chấm (đã loại trừ xung đột lợi ích) |
| BO-05 | Màn hình chấm điểm (PhieuCham) | Thành viên HĐ | Đọc hồ sơ, nhập điểm từng tiêu chí + nhận xét, gửi phiếu |

## 4. Mô tả màn hình & thao tác

### BO-01 — Quản lý hội đồng xét duyệt (Chuyên viên)
- Danh sách `HoiDong` loai `XET_DUYET` với bộ lọc theo trạng thái/đợt kêu gọi.
- Form lập/sửa hội đồng: mã, tên, loai cố định `XET_DUYET`.
- Phân công thành viên: chọn `NguoiDung` + `chucDanh` (`CHU_TICH`/`PHAN_BIEN`/`UY_VIEN`/`THU_KY`);
  chặn trùng người (unique cặp khóa, data-model §5).
- Trạng thái: rỗng ("chưa có hội đồng"), đang tải, lỗi.

### BO-02 — Mở & theo dõi đợt đánh giá (Chuyên viên)
- Chọn các đề tài `DA_NOP` (đã chốt danh sách F01) gắn vào hội đồng → tạo `DotDanhGia` cho từng đề tài.
- Khi tạo: hệ thống lấy `BoTieuChi` từ đợt kêu gọi của đề tài (BR-02), chặn nếu chưa gán bộ tiêu chí;
  chuyển `DeTai` sang `DANG_XET_DUYET` (BR-01) và gửi thông báo chủ nhiệm.
- Bảng theo dõi tiến độ: mỗi đề tài hiển thị số phiếu `DA_GUI` / tổng thành viên hợp lệ (đã trừ xung đột
  lợi ích), cảnh báo nếu chưa đủ `SO_PHIEU_TOI_THIEU`.
- Hành động hàng loạt: tạo đợt đánh giá cho nhiều đề tài cùng lúc.

### BO-03 — Bảng tổng hợp điểm & kết luận (Chuyên viên)
- Hiển thị từng đề tài: danh sách phiếu `DA_GUI` (ẩn/hiện danh tính theo cấu hình), `tongDiem` từng phiếu,
  `diemTongHop` (BR-06), so với `NGUONG_DAT`.
- Nút "Ra kết luận": chỉ bật khi đủ phiếu (BR-07); kết luận tự gợi ý DAT/KHONG_DAT theo ngưỡng (BR-08),
  chuyên viên xác nhận. Sau xác nhận: `DotDanhGia=DA_KET_LUAN`, `DeTai=DUYET|TU_CHOI`, thông báo chủ nhiệm.
- Nếu thiếu phiếu: nút bị khóa + thông báo số phiếu còn thiếu (AC-05).
- "Mở lại đợt": yêu cầu nhập `lyDo`, ghi audit (BR-10).

### BO-04 — Hàng chờ chấm của tôi (Thành viên hội đồng)
- Danh sách `DotDanhGia` mà thành viên được phân công và đang `DANG_CHAM`; **không** hiển thị đề tài
  xung đột lợi ích (BR-03) và đề tài đã `DA_KET_LUAN`.
- Mỗi dòng: tên đề tài, đợt kêu gọi, trạng thái phiếu của tôi (`Chưa chấm`/`Nháp`/`Đã gửi`).

### BO-05 — Màn hình chấm điểm (Thành viên hội đồng)
- Trái: hồ sơ đề tài (thuyết minh, tài liệu đính kèm — chỉ đọc). Phải: form `PhieuCham`.
- Form: mỗi `TieuChiDanhGia` một dòng nhập `diem` (gợi ý khoảng `[0, diemToiDa]`), ô `nhanXet` chung.
- Validate phía người dùng: số trong khoảng, không bỏ trống tiêu chí; backend kiểm tra lại (BR-05).
- Lưu nháp (`NHAP`, sửa được) → Gửi (`DA_GUI`, khóa). Sau khi gửi, form chuyển chỉ đọc (BR-10).
- Chặn tạo phiếu thứ hai cho cùng đợt (BR-04); chặn nếu đợt đã `DA_KET_LUAN` (AC-10).

## 5. Audit & nhật ký

Ghi `NhatKyHeThong` (append-only, overview §4.2) cho các hành động:

| Hành động | Người thực hiện | Đối tượng |
|---|---|---|
| Lập / sửa hội đồng, phân công thành viên | Chuyên viên | `HoiDong`, `ThanhVienHoiDong` |
| Tạo đợt đánh giá (đề tài vào `DANG_XET_DUYET`) | Chuyên viên | `DotDanhGia`, `DeTai` |
| Gửi phiếu chấm (`NHAP → DA_GUI`) | Thành viên HĐ | `PhieuCham` |
| Ra kết luận (`DUYET`/`TU_CHOI`) | Chuyên viên | `DotDanhGia`, `DeTai` |
| Mở lại đợt đã kết luận (kèm `lyDo`) | Chuyên viên | `DotDanhGia` |

Ai xem được nhật ký: chuyên viên (trong phạm vi đơn vị/đợt) và admin (B03). Thành viên hội đồng không
xem nhật ký xét duyệt của người khác.

## 6. Liên kết AC

| Màn hình | AC liên quan (xem [spec §6](./spec.md#6-acceptance-criteria)) |
|----------|----------------------------------------------------------------|
| BO-01 | AC-01 (tiền đề: có hội đồng + thành viên), AC-09 (sai quyền lập HĐ) |
| BO-02 | AC-01 (tạo đợt → `DANG_XET_DUYET`), AC-06 (loại trừ xung đột lợi ích khỏi tiến độ) |
| BO-03 | AC-03 (kết luận DUYET), AC-04 (kết luận TU_CHOI), AC-05 (thiếu phiếu), AC-09 (sai quyền kết luận), AC-10 (khóa sau kết luận) |
| BO-04 | AC-06 (ẩn đề tài xung đột lợi ích) |
| BO-05 | AC-02 (chấm & gửi phiếu), AC-07 (điểm vượt diemToiDa), AC-08 (một thành viên một phiếu), AC-10 (đợt đã kết luận) |
