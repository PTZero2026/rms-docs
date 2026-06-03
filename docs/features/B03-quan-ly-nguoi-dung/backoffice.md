---
title: "Quản lý người dùng — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Quản lý người dùng — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

| Vai trò | Mức dùng |
|---------|----------|
| **Quản trị hệ thống** (`QUAN_TRI_HE_THONG`) | Toàn quyền: quản lý tài khoản, vai trò, quyền, gán/gỡ. |
| **Chuyên viên QL KHCN** (`CHUYEN_VIEN_QL_KHCN`) | Chỉ **xem** danh sách & chi tiết người dùng/đơn vị để phối hợp; không sửa, không gán quyền. |

Các vai trò FE (chủ nhiệm, thành viên đề tài) và thành viên hội đồng **không** truy cập feature này.

## 2. Phân quyền (Permission matrix)

Cột là vai trò liên quan thực tế. Quyền nguyên tử (`MODULE.HANH_DONG`) ghi trong ngoặc để khớp `spec.md` §5.

| Hành động | Quyền | Quản trị hệ thống | Chuyên viên QL KHCN |
|-----------|-------|:-----------------:|:-------------------:|
| Xem danh sách & chi tiết người dùng | `NGUOI_DUNG.XEM` | ✓ | ✓ |
| Tạo tài khoản nội bộ | `NGUOI_DUNG.TAO` | ✓ | – |
| Sửa thông tin tài khoản | `NGUOI_DUNG.SUA` | ✓ | – |
| Khóa / mở khóa tài khoản | `NGUOI_DUNG.KHOA` | ✓ | – |
| Vô hiệu / kích hoạt lại tài khoản | `NGUOI_DUNG.VO_HIEU` | ✓ | – |
| Gán / gỡ vai trò cho người dùng | `NGUOI_DUNG.GAN_VAI_TRO` | ✓ | – |
| Xem danh sách vai trò & quyền | `VAI_TRO.XEM` | ✓ | ✓ |
| Tạo / sửa vai trò | `VAI_TRO.QUAN_LY` | ✓ | – |
| Xóa vai trò (không phải hệ thống) | `VAI_TRO.XOA` | ✓ | – |
| Cấu hình quyền cho vai trò | `VAI_TRO.GAN_QUYEN` | ✓ | – |
| Quản lý danh mục quyền nguyên tử | `QUYEN.QUAN_LY` | ✓ | – |
| Xem nhật ký người dùng/quyền | `NHAT_KY.XEM` | ✓ | ✓ |

> Backend là lớp thực thi quyền duy nhất (BR-08). BO chỉ ẩn/hiện theo quyền; gọi API thiếu quyền trả 403.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách người dùng | Tra cứu, lọc, phân trang danh sách `NguoiDung`; vào chi tiết. |
| BO-02 | Tạo / sửa người dùng | Tạo tài khoản nội bộ, sửa thông tin; xem thông tin tài khoản SSO. |
| BO-03 | Chi tiết người dùng & vai trò | Xem hồ sơ, khóa/mở/vô hiệu, gán/gỡ vai trò. |
| BO-04 | Danh sách & cấu hình vai trò | CRUD `VaiTro`; cấu hình tập `Quyen` cho mỗi vai trò. |
| BO-05 | Danh mục quyền | Quản lý `Quyen` nguyên tử (`MODULE.HANH_DONG`). |
| BO-06 | Nhật ký người dùng & phân quyền | Tra cứu `NhatKyHeThong` liên quan tài khoản/vai trò/quyền. |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách người dùng
- **Bộ lọc:** từ khóa (họ tên / email / mã), đơn vị (`donViId`), vai trò, `nguonTaiKhoan` (SSO / NOI_BO),
  `trangThai` (ACTIVE / LOCKED / INACTIVE).
- **Bảng:** Họ tên · Email · Đơn vị · Vai trò (chip nhiều) · Nguồn · Trạng thái (badge màu) · Hành động.
- **Phân trang server-side** (NFR < 2s). Hành động hàng: Xem chi tiết. Nút: "Tạo người dùng" (cần `NGUOI_DUNG.TAO`).

### BO-02 — Tạo / sửa người dùng
- **Trường:** `hoTen`*, `email`*, `maNguoiDung`, `soDienThoai`, `donViId`*, `hocHamHocVi`.
- Tạo mới: mặc định `nguonTaiKhoan = NOI_BO`, `trangThai = ACTIVE`. Kiểm tra trùng email (không phân biệt hoa/thường, BR-01) trước khi lưu.
- Với tài khoản `nguonTaiKhoan = SSO`: trường `email` **chỉ đọc** (BR-09); cảnh báo "Email đồng bộ từ SSO".
- Lưu thành công → ghi `NhatKyHeThong` `TAO_NGUOI_DUNG` hoặc `SUA_NGUOI_DUNG`.

### BO-03 — Chi tiết người dùng & vai trò
- **Hồ sơ:** thông tin cơ bản + `nguonTaiKhoan`, `trangThai`.
- **Hành động trạng thái:** Khóa / Mở khóa (`NGUOI_DUNG.KHOA`), Vô hiệu / Kích hoạt lại (`NGUOI_DUNG.VO_HIEU`)
  theo state machine spec §3.3. Nút Khóa/Vô hiệu **bị vô hiệu hóa** nếu là tài khoản đang đăng nhập (BR-02).
  Không hiển thị nút "Xóa cứng" nếu tài khoản đã phát sinh dữ liệu (BR-04) — thay bằng "Vô hiệu".
- **Vai trò:** danh sách vai trò đang gán; thêm/gỡ vai trò (multi-select, BR-05/BR-06). Gỡ vai trò hiện cảnh báo
  "Gỡ vai trò không xóa dữ liệu người dùng đã tạo".
- Mỗi thao tác ghi audit tương ứng (xem §5).

### BO-04 — Danh sách & cấu hình vai trò
- Bảng `VaiTro`: Mã · Tên · Mô tả · Hệ thống (`laHeThong`) · Số người gán.
- Vai trò có `laHeThong = true`: ẩn/disable nút Xóa và khóa trường `ma` (BR-03); chỉ sửa `moTa` + tập quyền.
- **Cấu hình quyền:** panel tick các `Quyen` (nhóm theo `MODULE`) thuộc vai trò → cập nhật `VaiTro_Quyen`.
  Lưu → audit `CAU_HINH_QUYEN_VAI_TRO`.

### BO-05 — Danh mục quyền
- CRUD `Quyen`; validate `ma` đúng dạng `MODULE.HANH_DONG`, unique (BR-07). Cảnh báo khi gỡ quyền đang được vai trò dùng.

### BO-06 — Nhật ký người dùng & phân quyền
- Tra cứu `NhatKyHeThong` lọc theo người thực hiện, `loaiDoiTuong` (NGUOI_DUNG / VAI_TRO / QUYEN), khoảng thời gian.
- Hiển thị `giaTriCu` → `giaTriMoi`, `diaChiIp`, `thoiGian`. **Chỉ đọc** (append-only). Cả hai vai trò xem được (`NHAT_KY.XEM`).

## 5. Audit & nhật ký

Mọi hành động dưới đây ghi `NhatKyHeThong` (append-only, không sửa/xóa) với `nguoiThucHienId`, `loaiDoiTuong`,
`doiTuongId`, `giaTriCu`/`giaTriMoi`, `thoiGian`, `diaChiIp`:

| Hành động | `hanhDong` | `loaiDoiTuong` |
|-----------|-----------|----------------|
| Tạo tài khoản nội bộ | `TAO_NGUOI_DUNG` | NGUOI_DUNG |
| Tạo tài khoản JIT từ SSO | `TAO_NGUOI_DUNG_JIT` | NGUOI_DUNG |
| Sửa thông tin tài khoản | `SUA_NGUOI_DUNG` | NGUOI_DUNG |
| Khóa / mở khóa | `KHOA_NGUOI_DUNG` / `MO_KHOA_NGUOI_DUNG` | NGUOI_DUNG |
| Vô hiệu / kích hoạt lại | `VO_HIEU_NGUOI_DUNG` / `KICH_HOAT_NGUOI_DUNG` | NGUOI_DUNG |
| Gán / gỡ vai trò | `GAN_VAI_TRO` / `GO_VAI_TRO` | NGUOI_DUNG |
| Tạo / sửa / xóa vai trò | `TAO_VAI_TRO` / `SUA_VAI_TRO` / `XOA_VAI_TRO` | VAI_TRO |
| Cấu hình quyền cho vai trò | `CAU_HINH_QUYEN_VAI_TRO` | VAI_TRO |
| Tạo / sửa / xóa quyền | `TAO_QUYEN` / `SUA_QUYEN` / `XOA_QUYEN` | QUYEN |
| Từ chối đăng nhập (tài khoản LOCKED/INACTIVE) | `TU_CHOI_DANG_NHAP` | NGUOI_DUNG |

Ai xem được: Quản trị hệ thống và Chuyên viên QL KHCN (quyền `NHAT_KY.XEM`), qua BO-06.

## 6. Liên kết AC

| Màn hình | AC liên quan (spec.md §6) |
|----------|---------------------------|
| BO-02 (Tạo/sửa) | AC-01, AC-03 (trùng email & email SSO chỉ đọc) |
| Luồng SSO JIT (§3.2, không có MH BO) | AC-02, AC-09 |
| BO-03 (Chi tiết & vai trò) | AC-04, AC-06, AC-07, AC-08, AC-10 |
| BO-04 (Vai trò) | AC-05, AC-06 |
| BO-05 (Quyền) | AC-05 (nền), BR-07 |
| BO-06 (Nhật ký) | AC-01, AC-02, AC-06, AC-07, AC-09 (truy vết audit) |
