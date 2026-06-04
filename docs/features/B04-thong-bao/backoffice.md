---
title: "Thông báo — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Thông báo — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Vai trò sử dụng

- **Quản trị hệ thống** (Admin): quản lý mẫu thông báo, cấu hình ma trận sự kiện ↔ kênh, sửa tham số nhắc hạn/retry.
- **Chuyên viên QL KHCN**: theo dõi nhật ký gửi (SUBMITTED/ERROR), gửi lại thông báo lỗi trong phạm vi đơn vị/đợt phụ trách.

Mô tả persona: `../../product/personas.md`. Quyền cụ thể: §2 dưới đây.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử theo `MODULE.ACTION` (module `notification`), gom vào vai trò ở B03.

| Hành động | Quản trị hệ thống | Chuyên viên QL KHCN | Thành viên hội đồng |
|-----------|:-----------------:|:-------------------:|:-------------------:|
| Xem nhật ký gửi (`NOTIFICATION.LOG_VIEW`) | ✓ (toàn hệ thống) | ✓ (theo phạm vi đơn vị/đợt) | – |
| Gửi lại thông báo lỗi (`NOTIFICATION.RESEND`) | ✓ | ✓ (trong phạm vi) | – |
| Xem mẫu thông báo (`NOTIFICATION.TEMPLATE_VIEW`) | ✓ | ✓ (chỉ xem) | – |
| Tạo/sửa mẫu thông báo (`NOTIFICATION.TEMPLATE_EDIT`) | ✓ | – | – |
| Bật/tắt kênh theo sự kiện (`NOTIFICATION.CHANNEL_CONFIG`) | ✓ | – | – |
| Sửa tham số nhắc hạn/retry (`NOTIFICATION.PARAM_CONFIG`) | ✓ | – | – |

> Phạm vi dữ liệu (data scoping) áp dụng cho Chuyên viên theo `overview.md` §4.1: chỉ thấy thông báo của
> đề tài/đợt thuộc phạm vi mình phụ trách. Người nhận thường (FE) không có quyền nào ở bảng này — họ chỉ
> xem thông báo của chính mình (BR-10).

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Quản lý mẫu thông báo | Tạo/sửa mẫu theo `eventType` × kênh; biến ngữ cảnh; xem trước |
| BO-02 | Ma trận sự kiện ↔ kênh | Bật/tắt IN_APP/EMAIL/SMS theo từng `eventType`; đánh dấu bắt buộc |
| BO-03 | Nhật ký gửi thông báo | Theo dõi bản ghi SUBMITTED/ERROR; lọc; gửi lại đơn lẻ/hàng loạt |
| BO-04 | Cấu hình tham số thông báo | Số ngày nhắc hạn, `maxRetry`, backoff (trỏ B01 `SystemSetting`) |

## 4. Mô tả màn hình & thao tác

### BO-01 — Quản lý mẫu thông báo

- **Danh sách mẫu** theo `eventType` × `channel`: hiển thị tiêu đề mẫu, kênh, trạng thái (có mẫu / thiếu mẫu).
- **Soạn mẫu:** trường `templateTitle`, `templateContent` với **biến ngữ cảnh** chèn được (ví dụ `{{projectName}}`, `{{dueDate}}`,
  `{{result}}`, `{{link}}`). Danh sách biến hợp lệ tùy `eventType`.
- **Xem trước (preview):** render mẫu với dữ liệu mẫu để kiểm tra trước khi lưu.
- **Validate:** chặn lưu nếu dùng biến không hợp lệ; cảnh báo nếu một `eventType` × kênh đang bật nhưng **thiếu mẫu**
  (liên quan AC-10 / BR-05).
- **Trạng thái:** rỗng ("Chưa có mẫu, tạo mẫu đầu tiên"), tải (skeleton), lỗi lưu (giữ nội dung đang soạn + báo lỗi).

### BO-02 — Ma trận sự kiện ↔ kênh

- **Bảng** dòng = `eventType` (theo bảng `spec.md` §3), cột = IN_APP / EMAIL / SMS, mỗi ô là công tắc.
- **Ràng buộc (theo spec):**
  - Cột IN_APP **luôn bật**, khóa (BR-01).
  - Cột SMS chỉ bật được cho sự kiện **ưu tiên cao** (BR-03); sự kiện thường khóa SMS, hiển thị "—".
  - Cờ **Bắt buộc** cho từng sự kiện (BR-08) — khi bật, người dùng FE không tắt EMAIL được.
- **Thao tác:** đổi công tắc → lưu; thay đổi áp dụng cho sự kiện phát sinh **sau khi lưu** (AC-08).
- **Audit:** mọi thay đổi ma trận ghi `AuditLog` (giá trị cũ/mới).

### BO-03 — Nhật ký gửi thông báo

- **Bảng bản ghi `Notification`** (chủ yếu EMAIL/SMS, và IN_APP khi cần): cột người nhận, `eventType`, kênh,
  `status`, `retryCount`, `lastAttemptAt`, `failureReason`, thời gian tạo, liên kết đối tượng.
- **Bộ lọc:** theo `status` (SUBMITTED / ERROR / PENDING_SEND), kênh, `eventType`, khoảng thời gian, người nhận, đề tài.
  Lọc nhanh "Chỉ lỗi (ERROR)".
- **Gửi lại:**
  - *Đơn lẻ:* nút "Gửi lại" trên bản ghi `ERROR` → reset `PENDING_SEND`, `retryCount = 0`, đẩy lại hàng đợi (AC-05).
  - *Hàng loạt:* chọn nhiều bản ghi `ERROR` (theo bộ lọc) → "Gửi lại đã chọn"; hiển thị tiến trình + kết quả.
- **Phạm vi:** Chuyên viên chỉ thấy/gửi lại bản ghi trong phạm vi mình phụ trách (data scoping).
- **Trạng thái:** rỗng ("Không có bản ghi khớp bộ lọc"), tải (skeleton), lỗi tải (thử lại), kết quả gửi lại
  (toast "Đã đưa N thông báo vào hàng đợi gửi lại").

### BO-04 — Cấu hình tham số thông báo

- Trỏ tới B01 (`SystemSetting`): `progressReport.reminderDaysBeforeDue` (nhắc hạn), `notification.maxRetry`, `notification.backoff`.
- Có thể hiển thị read-through tại đây cho tiện vận hành, nhưng **nguồn sự thật là B01**. Sửa giá trị ghi audit.

## 5. Audit & nhật ký

Ghi `AuditLog` (`../../architecture/data-model.md` §4.7, append-only) cho:

- Tạo/sửa/xóa **mẫu thông báo** (BO-01) — lưu giá trị cũ/mới.
- Thay đổi **ma trận sự kiện ↔ kênh** và cờ bắt buộc (BO-02).
- **Gửi lại** thông báo (BO-03) — ai gửi lại, bản ghi nào, thời điểm (phục vụ AC-05).
- Sửa **tham số** nhắc hạn/retry (BO-04).

Ai xem: Quản trị xem toàn bộ; Chuyên viên xem nhật ký gửi trong phạm vi của mình. Việc gửi thực tế của
worker (thành công/lỗi gateway) được phản ánh ở `Notification.status`/`failureReason`, không lặp lại trong audit nghiệp vụ.

## 6. Liên kết AC

| Màn hình | AC liên quan (xem [`spec.md`](./spec.md) §6) |
|---|---|
| BO-01 Quản lý mẫu | AC-10 (thiếu mẫu = lỗi cấu hình, BR-05) |
| BO-02 Ma trận sự kiện ↔ kênh | AC-03 (SMS chỉ sự kiện cao), AC-08 (tắt EMAIL cấp sự kiện), AC-09 (cờ bắt buộc) |
| BO-03 Nhật ký gửi | AC-04 (ERROR sau retry), AC-05 (gửi lại) |
| BO-04 Cấu hình tham số | AC-04 (`maxRetry`/backoff), AC-07 (số ngày nhắc hạn) |
