---
title: "Lý lịch khoa học — Test plan"
spec: "./spec.md"
owner: "TEST"
status: Review
version: 0.2
updated: 2026-06-25
---

# Lý lịch khoa học — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt:** FE (Hồ sơ của tôi, Lý lịch của tôi), BO (sửa hộ, lý lịch người dùng), API (kiểm quyền + phạm vi
  dữ liệu ở backend).
- **Môi trường:** tenant pilot "ĐH Thủy Lợi" + ≥1 tenant cấu hình VP-PROFILE khác (để test ẩn/bắt buộc trường).
- **Dữ liệu mẫu:** user chủ hồ sơ U; chuyên viên C trong/ngoài phạm vi của U; danh mục `POSITION`,
  `ACADEMIC_RANK`, `ACADEMIC_DEGREE` đã seed; U có ≥2 đề tài & ≥3 sản phẩm đã duyệt; tenant bật & tenant tắt P03.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | U đăng nhập | Mở "Hồ sơ của tôi", sửa giới tính, ngày sinh, SĐT, lưu (đủ trường bắt buộc) | Lưu thành công; audit `UPDATE_PROFILE` với `actorId = targetId` | Happy |
| TC-02 | AC-02 | U mở hồ sơ | Thử sửa trường email | Email **chỉ đọc**, có badge đồng bộ; không có cách lưu email mới | Biên |
| TC-03 | AC-03 | Tenant T: địa chỉ=ẩn, chức vụ=bắt buộc | Mở hồ sơ của user thuộc T; bỏ trống chức vụ rồi lưu | Trường địa chỉ **không hiển thị**; lưu bị chặn báo "Chức vụ bắt buộc" | Biên |
| TC-04 | AC-04 | U thuộc tenant "ĐH Thủy Lợi" | Xem mục cơ quan công tác | "Trường/Viện" = "ĐH Thủy Lợi" tự động, **không có ô nhập tay** | Happy |
| TC-05 | AC-05 | U mở hồ sơ | Thêm học vị "Tiến sĩ — 2015" và học hàm "Phó giáo sư — 2021" | Hai dòng lưu vào **đúng nhóm** (DEGREE/RANK), mỗi dòng có loại + năm | Happy |
| TC-06 | AC-06 | Năm hiện tại 2026 | Nhập học vị năm nhận 2030, lưu | Từ chối "Năm nhận không hợp lệ"; dòng không lưu | Lỗi |
| TC-07 | AC-06 | U có năm sinh 1990 | Nhập học vị năm nhận 1985 | Từ chối (năm nhận < năm sinh) | Lỗi |
| TC-08 | AC-07 | U mở hồ sơ | Thêm dòng công tác "từ 2020", "đến" trống, lưu | Lưu thành công; dòng hiển thị badge **"Đang công tác"** | Happy |
| TC-09 | AC-08 | U mở hồ sơ | Nhập dòng công tác "từ 2022 đến 2019", lưu | Từ chối "Từ ngày phải ≤ đến ngày" | Lỗi |
| TC-10 | AC-09 | U có 2 đề tài + 3 sản phẩm **đã duyệt** | Mở "Lý lịch khoa học của tôi" | Hiển thị đúng 2 vai trò đề tài + 3 sản phẩm, lấy trực tiếp, **không có ô nhập tay** | Happy |
| TC-11 | AC-09 | U có 1 sản phẩm **chưa duyệt** | Mở lý lịch | Sản phẩm chưa duyệt **không** xuất hiện trong lý lịch | Biên |
| TC-12 | AC-10 | Tenant **tắt** P03 | Mở lý lịch của U | Mục "giờ giảng quy đổi" **không hiển thị** | Biên |
| TC-13 | AC-10 | Tenant **bật** P03 | Mở lý lịch của U | Hiển thị tổng giờ giảng quy đổi | Happy |
| TC-14 | AC-11 | C có quyền + U trong phạm vi của C | C mở BO-01 hồ sơ U, sửa SĐT, lưu | Lưu thành công; audit `UPDATE_PROFILE` với `actorId = C ≠ U` (sửa hộ) | Happy |
| TC-15 | AC-12 | K **không** có `PROFILE.VIEW` | K gọi API/màn hình xem hồ sơ U | Backend trả **403** dù UI ẩn nút; không lộ dữ liệu | Lỗi/Bảo mật |
| TC-16 | AC-12 | C có quyền nhưng U **ngoài** phạm vi dữ liệu của C | C mở hồ sơ U | Từ chối ở máy chủ (ngoài phạm vi), không render | Lỗi/Bảo mật |
| TC-17 | AC-13 | Tenant T có mẫu lý lịch riêng | Trích xuất lý lịch của U | Dữ liệu đổ vào **mẫu của T**, xuất tài liệu in/ký; audit `EXPORT_CV` kèm mã mẫu | Happy |

## 3. Trường hợp biên & negative

- **Hồ sơ rỗng:** user mới auto-provision, chưa nhập gì → các nhóm hiển thị trạng thái rỗng, chỉ trường lõi (họ tên) bắt buộc.
- **Năm nhận biên:** năm nhận = năm hiện tại (hợp lệ); = năm sinh (hợp lệ); chuỗi/không phải số (chặn ở input).
- **Quá trình công tác chồng lấp:** hai dòng cùng "đang công tác" → cho phép (không có luật cấm), chỉ kiểm Từ ≤ Đến từng dòng.
- **Email đồng bộ:** đổi email ở hệ thống xác thực rồi đồng bộ → F08 hiển thị email mới (chỉ đọc), không cho sửa tại F08.
- **VP-PROFILE đổi khi đang có dữ liệu:** tenant chuyển trường từ "hiển thị" → "ẩn" khi user đã nhập → dữ liệu cũ giữ nguyên trong DB, chỉ ẩn ở UI (không xóa).
- **Phạm vi dữ liệu rỗng:** chuyên viên không có đơn vị nào trong phạm vi → không xem được hồ sơ ai ngoài chính mình.

## 4. Checklist hồi quy

- [B03](../B03-quan-ly-nguoi-dung/): thêm trường `gender`/`dateOfBirth`/`address`/`positionId` vào `User` không phá màn tạo/sửa người dùng (BO-02 của B03) và kiểm tra trùng email.
- [F07](../F07-san-pham-khoa-hoc/): đổi trạng thái duyệt sản phẩm phản ánh đúng vào lý lịch (TC-10/TC-11).
- [P03](../P03-quy-doi-gio-giang/): bật/tắt feature per-tenant phản ánh đúng mục giờ giảng (TC-12/TC-13).
- [B01](../B01-danh-muc-cau-hinh/): thêm danh mục `ACADEMIC_RANK`/`ACADEMIC_DEGREE` không xung đột danh mục sẵn có; sửa nhãn danh mục cập nhật hiển thị hồ sơ.
- Audit: mọi `UPDATE_PROFILE`/`EXPORT_CV` ghi đúng `actorId`/`targetId`, append-only, xem được qua B03 BO-06.
