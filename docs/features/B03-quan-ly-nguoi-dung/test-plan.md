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
- **Dữ liệu mẫu:** ≥2 đơn vị; vai trò chuẩn đã seed (5 vai trò `isSystem = true`); 1 admin đang đăng nhập (X);
  1 người dùng U đã là chủ nhiệm ≥1 đề tài; 1 tài khoản LOCKED; 1 tài khoản SSO.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Admin có `USER.CREATE`; email mới | BO-02 nhập fullName/email/đơn vị, gán `RESEARCH_MANAGEMENT_OFFICER`, lưu | Tạo `User` `accountSource=INTERNAL`, `ACTIVE`, có vai trò; audit `CREATE_USER` + `ASSIGN_ROLE` | Happy |
| TC-02 | AC-02 | Cờ JIT bật; email SSO chưa có tài khoản | Đăng nhập SSO lần đầu với email mới | Tạo `User` `accountSource=SSO`, `ACTIVE`, chưa có vai trò; audit `CREATE_USER_JIT` | Happy |
| TC-03 | AC-02 | Cờ JIT **tắt**; email SSO chưa có tài khoản | Đăng nhập SSO lần đầu | Từ chối đăng nhập, không tạo tài khoản, yêu cầu admin tạo trước | Biên/Lỗi |
| TC-04 | AC-03 | Đã có `a@benhvien.vn` | BO-02 tạo tài khoản mới email `A@benhvien.vn` | Báo lỗi trùng email; không tạo bản ghi | Biên/Lỗi |
| TC-05 | AC-03 | Có 2 tài khoản nội bộ | BO-02 sửa email của tài khoản 2 thành email trùng tài khoản 1 | Báo lỗi trùng email; không lưu | Biên/Lỗi |
| TC-06 | AC-04 | Admin X đang đăng nhập | BO-03 mở chính tài khoản X, bấm Khóa | Nút Khóa disabled / API trả lỗi "Không thể khóa tài khoản đang đăng nhập"; `status` không đổi | Biên/Lỗi |
| TC-07 | AC-04 | Admin X đang đăng nhập | Gọi API vô hiệu chính `id` của X | API từ chối; `status` X giữ `ACTIVE` | Biên/Lỗi |
| TC-08 | AC-05 | Vai trò `SYSTEM_ADMIN` `isSystem=true` | BO-04 cố xóa vai trò này | Nút Xóa ẩn/disabled; API `ROLE.DELETE` trả lỗi; vai trò vẫn tồn tại | Biên/Lỗi |
| TC-09 | AC-06 | Người dùng U `ACTIVE` | BO-03 gán U cả `PRINCIPAL_INVESTIGATOR` và `COMMITTEE_MEMBER` | Tập quyền hiệu lực của U = hợp quyền 2 vai trò; audit `ASSIGN_ROLE` | Happy |
| TC-10 | AC-07 | U có vai trò `PRINCIPAL_INVESTIGATOR` và đã tạo đề tài | BO-03 gỡ vai trò `PRINCIPAL_INVESTIGATOR` khỏi U | Đề tài của U còn nguyên, `principalInvestigatorId/createdBy=U` không đổi; U mất quyền từ vai trò; audit `REMOVE_ROLE` | Happy |
| TC-11 | AC-08 | U đã là chủ nhiệm ≥1 đề tài | Gọi API xóa cứng U | API từ chối xóa cứng; chỉ cho `INACTIVE` | Biên/Lỗi |
| TC-12 | AC-08 | Tài khoản mới tạo, chưa phát sinh dữ liệu | Vô hiệu tài khoản | Chuyển `INACTIVE` thành công; audit `DISABLE_USER` | Happy |
| TC-13 | AC-09 | Tài khoản U `status=LOCKED` | U đăng nhập qua SSO | Từ chối truy cập; audit `DENY_LOGIN` | Biên/Lỗi |
| TC-14 | AC-09 | Tài khoản `INACTIVE` | Đăng nhập SSO | Từ chối truy cập; audit `DENY_LOGIN` | Biên/Lỗi |
| TC-15 | AC-10 | User có vai trò `RESEARCH_MANAGEMENT_OFFICER` (chỉ xem) | Gọi API `USER.CREATE` trực tiếp | Backend trả 403 dù BO ẩn nút tạo | Biên/Lỗi |
| TC-16 | AC-10 | User `RESEARCH_MANAGEMENT_OFFICER` | Mở BO-01/BO-03 xem danh sách & chi tiết | Xem được; không thấy nút sửa/gán quyền | Happy |
| TC-17 | AC-03 (BR-09) | Tài khoản `accountSource=SSO` | BO-02 mở sửa, thử đổi `email` | Trường email chỉ đọc; không sửa được; có cảnh báo "đồng bộ từ SSO" | Biên/Lỗi |
| TC-18 | BR-07 (nền AC-05) | Quyền `RESEARCH_PROJECT.APPROVE` đã tồn tại | BO-05 tạo quyền mã `research_project.approve` / `RESEARCHPROJECT` (sai định dạng/trùng) | Validate lỗi định dạng `MODULE.ACTION` hoặc trùng `code`; không tạo | Biên/Lỗi |

## 3. Trường hợp biên & negative

- **Dữ liệu rỗng:** tạo người dùng thiếu `fullName`/`email`/`unitId` → validate bắt buộc, chặn lưu.
- **Trùng:** email khác hoa/thường (TC-04/05); mã vai trò trùng; mã quyền trùng (TC-18).
- **Sai định dạng:** email không hợp lệ; `Permission.code` không theo `MODULE.ACTION` (TC-18).
- **Tự khóa hệ thống:** tự khóa/vô hiệu chính mình (TC-06/07); *đề xuất* cảnh báo khi còn ≤1 admin `ACTIVE`.
- **Vai trò hệ thống:** xóa/đổi `code` vai trò `isSystem=true` (TC-08).
- **Toàn vẹn lịch sử:** gỡ vai trò không xóa dữ liệu (TC-10); không xóa cứng tài khoản có dữ liệu (TC-11).
- **Quyền:** gọi thẳng API không đủ quyền trả 403 (TC-15); BO ẩn nút không thay backend (BR-08).
- **Trạng thái:** đăng nhập tài khoản LOCKED/INACTIVE (TC-13/14); JIT khi cờ tắt (TC-03).
- **SSO:** email SSO chỉ đọc tại RMS (TC-17).

## 4. Checklist hồi quy

- [ ] Đăng nhập SSO của tài khoản `ACTIVE` hiện có vẫn vào đúng theo vai trò (không bị JIT ghi đè).
- [ ] Tài khoản nội bộ dự phòng vẫn đăng nhập được khi SSO mô phỏng lỗi.
- [ ] Tập quyền hiệu lực dùng ở các feature khác (vd F01 nộp đề tài, F03 chấm điểm) vẫn đúng sau khi đổi quyền vai trò.
- [ ] Data scoping: chủ nhiệm chỉ thấy đề tài của mình, chuyên viên theo đơn vị/kỳ — không rộng/hẹp hơn.
- [ ] `AuditLog` của các hành động cũ không bị sửa/xóa (append-only).
- [ ] FK `ON DELETE RESTRICT` tới `User` còn nguyên — không có thao tác B03 làm rơi tham chiếu.
- [ ] Phân trang & bộ lọc BO-01 đạt < 2s với dữ liệu lớn (NFR).
