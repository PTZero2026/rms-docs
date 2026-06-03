---
title: "Quản lý người dùng — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Quản lý người dùng — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu,
> báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt:** BackOffice (BO-01..BO-06) và **API** (lớp thực thi quyền — bắt buộc test trực tiếp API, BR-08);
  luồng **SSO/JIT** test qua tích hợp xác thực (stub IdP).
- **Ngoài phạm vi:** cơ chế token SSO, gửi thông báo (B04), lý lịch khoa học (F08), CRUD đơn vị (B01).
- **Môi trường:** staging có IdP stub cấu hình được claim `email`; cờ JIT bật/tắt được.
- **Dữ liệu mẫu:** ≥2 đơn vị; vai trò chuẩn đã seed (5 vai trò `laHeThong = true`); 1 admin đang đăng nhập (X);
  1 người dùng U đã là chủ nhiệm ≥1 đề tài; 1 tài khoản LOCKED; 1 tài khoản SSO.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Admin có `NGUOI_DUNG.TAO`; email mới | BO-02 nhập hoTen/email/đơn vị, gán `CHUYEN_VIEN_QL_KHCN`, lưu | Tạo `NguoiDung` `nguonTaiKhoan=NOI_BO`, `ACTIVE`, có vai trò; audit `TAO_NGUOI_DUNG` + `GAN_VAI_TRO` | Happy |
| TC-02 | AC-02 | Cờ JIT bật; email SSO chưa có tài khoản | Đăng nhập SSO lần đầu với email mới | Tạo `NguoiDung` `nguonTaiKhoan=SSO`, `ACTIVE`, chưa có vai trò; audit `TAO_NGUOI_DUNG_JIT` | Happy |
| TC-03 | AC-02 | Cờ JIT **tắt**; email SSO chưa có tài khoản | Đăng nhập SSO lần đầu | Từ chối đăng nhập, không tạo tài khoản, yêu cầu admin tạo trước | Biên/Lỗi |
| TC-04 | AC-03 | Đã có `a@benhvien.vn` | BO-02 tạo tài khoản mới email `A@benhvien.vn` | Báo lỗi trùng email; không tạo bản ghi | Biên/Lỗi |
| TC-05 | AC-03 | Có 2 tài khoản nội bộ | BO-02 sửa email của tài khoản 2 thành email trùng tài khoản 1 | Báo lỗi trùng email; không lưu | Biên/Lỗi |
| TC-06 | AC-04 | Admin X đang đăng nhập | BO-03 mở chính tài khoản X, bấm Khóa | Nút Khóa disabled / API trả lỗi "Không thể khóa tài khoản đang đăng nhập"; `trangThai` không đổi | Biên/Lỗi |
| TC-07 | AC-04 | Admin X đang đăng nhập | Gọi API vô hiệu chính `id` của X | API từ chối; `trangThai` X giữ `ACTIVE` | Biên/Lỗi |
| TC-08 | AC-05 | Vai trò `QUAN_TRI_HE_THONG` `laHeThong=true` | BO-04 cố xóa vai trò này | Nút Xóa ẩn/disabled; API `VAI_TRO.XOA` trả lỗi; vai trò vẫn tồn tại | Biên/Lỗi |
| TC-09 | AC-06 | Người dùng U `ACTIVE` | BO-03 gán U cả `CHU_NHIEM_DE_TAI` và `THANH_VIEN_HOI_DONG` | Tập quyền hiệu lực của U = hợp quyền 2 vai trò; audit `GAN_VAI_TRO` | Happy |
| TC-10 | AC-07 | U có vai trò `CHU_NHIEM_DE_TAI` và đã tạo đề tài | BO-03 gỡ vai trò `CHU_NHIEM_DE_TAI` khỏi U | Đề tài của U còn nguyên, `chuNhiemId/createdBy=U` không đổi; U mất quyền từ vai trò; audit `GO_VAI_TRO` | Happy |
| TC-11 | AC-08 | U đã là chủ nhiệm ≥1 đề tài | Gọi API xóa cứng U | API từ chối xóa cứng; chỉ cho `INACTIVE` | Biên/Lỗi |
| TC-12 | AC-08 | Tài khoản mới tạo, chưa phát sinh dữ liệu | Vô hiệu tài khoản | Chuyển `INACTIVE` thành công; audit `VO_HIEU_NGUOI_DUNG` | Happy |
| TC-13 | AC-09 | Tài khoản U `trangThai=LOCKED` | U đăng nhập qua SSO | Từ chối truy cập; audit `TU_CHOI_DANG_NHAP` | Biên/Lỗi |
| TC-14 | AC-09 | Tài khoản `INACTIVE` | Đăng nhập SSO | Từ chối truy cập; audit `TU_CHOI_DANG_NHAP` | Biên/Lỗi |
| TC-15 | AC-10 | User có vai trò `CHUYEN_VIEN_QL_KHCN` (chỉ xem) | Gọi API `NGUOI_DUNG.TAO` trực tiếp | Backend trả 403 dù BO ẩn nút tạo | Biên/Lỗi |
| TC-16 | AC-10 | User `CHUYEN_VIEN_QL_KHCN` | Mở BO-01/BO-03 xem danh sách & chi tiết | Xem được; không thấy nút sửa/gán quyền | Happy |
| TC-17 | AC-03 (BR-09) | Tài khoản `nguonTaiKhoan=SSO` | BO-02 mở sửa, thử đổi `email` | Trường email chỉ đọc; không sửa được; có cảnh báo "đồng bộ từ SSO" | Biên/Lỗi |
| TC-18 | BR-07 (nền AC-05) | Quyền `DE_TAI.DUYET` đã tồn tại | BO-05 tạo quyền mã `de_tai.duyet` / `DETAI` (sai định dạng/trùng) | Validate lỗi định dạng `MODULE.HANH_DONG` hoặc trùng `ma`; không tạo | Biên/Lỗi |

## 3. Trường hợp biên & negative

- **Dữ liệu rỗng:** tạo người dùng thiếu `hoTen`/`email`/`donViId` → validate bắt buộc, chặn lưu.
- **Trùng:** email khác hoa/thường (TC-04/05); mã vai trò trùng; mã quyền trùng (TC-18).
- **Sai định dạng:** email không hợp lệ; `Quyen.ma` không theo `MODULE.HANH_DONG` (TC-18).
- **Tự khóa hệ thống:** tự khóa/vô hiệu chính mình (TC-06/07); *đề xuất* cảnh báo khi còn ≤1 admin `ACTIVE`.
- **Vai trò hệ thống:** xóa/đổi `ma` vai trò `laHeThong=true` (TC-08).
- **Toàn vẹn lịch sử:** gỡ vai trò không xóa dữ liệu (TC-10); không xóa cứng tài khoản có dữ liệu (TC-11).
- **Quyền:** gọi thẳng API không đủ quyền trả 403 (TC-15); BO ẩn nút không thay backend (BR-08).
- **Trạng thái:** đăng nhập tài khoản LOCKED/INACTIVE (TC-13/14); JIT khi cờ tắt (TC-03).
- **SSO:** email SSO chỉ đọc tại RMS (TC-17).

## 4. Checklist hồi quy

- [ ] Đăng nhập SSO của tài khoản `ACTIVE` hiện có vẫn vào đúng theo vai trò (không bị JIT ghi đè).
- [ ] Tài khoản nội bộ dự phòng vẫn đăng nhập được khi SSO mô phỏng lỗi.
- [ ] Tập quyền hiệu lực dùng ở các feature khác (vd F01 nộp đề tài, F03 chấm điểm) vẫn đúng sau khi đổi quyền vai trò.
- [ ] Data scoping: chủ nhiệm chỉ thấy đề tài của mình, chuyên viên theo đơn vị/đợt — không rộng/hẹp hơn.
- [ ] `NhatKyHeThong` của các hành động cũ không bị sửa/xóa (append-only).
- [ ] FK `ON DELETE RESTRICT` tới `NguoiDung` còn nguyên — không có thao tác B03 làm rơi tham chiếu.
- [ ] Phân trang & bộ lọc BO-01 đạt < 2s với dữ liệu lớn (NFR).
