---
title: "Thông báo — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Thông báo — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

Cùng một web app — mọi vai trò vào chung; màn hình/hành động hiển thị theo quyền (overview §4.1).
Mô tả persona: `../../product/personas.md`.

**Người dùng cuối (người nhận thông báo):**

- **Chủ nhiệm đề tài, thành viên đề tài** và mọi vai trò khác (chuyên viên, hội đồng…) đều là người
  nhận: xem thông báo của chính mình qua cùng thành phần in-app. Người nhận thường không có quyền nào
  trong ma trận quản trị bên dưới — họ chỉ xem thông báo của chính mình (BR-10).

Điểm vào của người dùng cuối:

- **Chuông thông báo** ở thanh điều hướng (mọi trang) — hiển thị số chưa đọc (badge), bấm mở dropdown nhanh.
- **Trung tâm thông báo** (trang đầy đủ) — vào từ dropdown ("Xem tất cả") hoặc menu tài khoản.
- **Tùy chọn nhận thông báo** — trong trang Cài đặt cá nhân.
- **Deep-link**: bấm một thông báo điều hướng tới đối tượng nguồn qua `Notification.link` (đề tài, báo cáo…).

**Nhóm quản trị nghiệp vụ:**

- **Quản trị hệ thống** (Admin): quản lý mẫu thông báo, cấu hình ma trận sự kiện ↔ kênh, sửa tham số nhắc hạn/retry.
- **Chuyên viên QL KHCN**: theo dõi nhật ký gửi (SUBMITTED/ERROR), gửi lại thông báo lỗi trong phạm vi đơn vị/kỳ phụ trách.

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử theo `MODULE.ACTION` (module `notification`), gom vào vai trò ở B03.

| Hành động | Quản trị hệ thống | Chuyên viên QL KHCN | Thành viên hội đồng |
|-----------|:-----------------:|:-------------------:|:-------------------:|
| Xem nhật ký gửi (`NOTIFICATION.LOG_VIEW`) | ✓ (toàn hệ thống) | ✓ (theo phạm vi đơn vị/kỳ) | – |
| Gửi lại thông báo lỗi (`NOTIFICATION.RESEND`) | ✓ | ✓ (trong phạm vi) | – |
| Xem mẫu thông báo (`NOTIFICATION.TEMPLATE_VIEW`) | ✓ | ✓ (chỉ xem) | – |
| Tạo/sửa mẫu thông báo (`NOTIFICATION.TEMPLATE_EDIT`) | ✓ | – | – |
| Bật/tắt kênh theo sự kiện (`NOTIFICATION.CHANNEL_CONFIG`) | ✓ | – | – |
| Sửa tham số nhắc hạn/retry (`NOTIFICATION.PARAM_CONFIG`) | ✓ | – | – |

> Phạm vi dữ liệu (data scoping) áp dụng cho Chuyên viên theo `overview.md` §4.1: chỉ thấy thông báo của
> đề tài/kỳ thuộc phạm vi mình phụ trách. Người nhận thường không có quyền nào ở bảng này — họ chỉ
> xem thông báo của chính mình (BR-10).

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Chuông & dropdown thông báo | Xem nhanh thông báo mới, số chưa đọc, mở nhanh đối tượng nguồn |
| FE-02 | Trung tâm thông báo | Danh sách đầy đủ, lọc, phân trang, đánh dấu đã đọc (đơn lẻ/tất cả) |
| FE-03 | Chi tiết / điều hướng từ thông báo | Mở nội dung và điều hướng tới đối tượng nguồn; tự đánh dấu đã đọc |
| FE-04 | Tùy chọn nhận thông báo | Bật/tắt EMAIL/SMS theo nhóm sự kiện (trong giới hạn luật) |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Quản lý mẫu thông báo | Tạo/sửa mẫu theo `eventType` × kênh; biến ngữ cảnh; xem trước |
| BO-02 | Ma trận sự kiện ↔ kênh | Bật/tắt IN_APP/EMAIL/SMS theo từng `eventType`; đánh dấu bắt buộc |
| BO-03 | Nhật ký gửi thông báo | Theo dõi bản ghi SUBMITTED/ERROR; lọc; gửi lại đơn lẻ/hàng loạt |
| BO-04 | Cấu hình tham số thông báo | Số ngày nhắc hạn, `maxRetry`, backoff (trỏ B01 `SystemSetting`) |

## 3. Mô tả màn hình & thao tác

> Wireframe/ảnh (nếu có) đặt trong [`assets/`](./assets/); link Figma khi sẵn sàng.

### FE-01 — Chuông & dropdown thông báo

- **Vị trí:** icon chuông trên thanh điều hướng, có **badge số chưa đọc** (IN_APP, `status != READ`).
  Badge hiển thị tối đa "99+".
- **Dropdown:** danh sách rút gọn 5–10 thông báo mới nhất, mỗi dòng gồm: icon theo `eventType`, tiêu đề,
  thời gian tương đối ("2 giờ trước"), chấm đậm nếu chưa đọc.
- **Thao tác:** bấm một dòng → điều hướng theo `link` và đánh dấu dòng đó `READ`; link "Xem tất cả" → FE-02;
  nút "Đánh dấu tất cả đã đọc" (xác nhận nhẹ).
- **Trạng thái:**
  - *Tải:* skeleton 3–5 dòng.
  - *Rỗng:* "Bạn chưa có thông báo nào." kèm icon.
  - *Lỗi tải:* "Không tải được thông báo." + nút "Thử lại" (không chặn các phần khác của trang).

### FE-02 — Trung tâm thông báo

- **Danh sách:** phân trang server-side (NFR < 2s, xem `overview.md` §4.5), mỗi mục: tiêu đề, trích nội dung,
  `eventType` (nhãn dễ đọc), thời gian, trạng thái đọc.
- **Bộ lọc:** theo **trạng thái đọc** (Tất cả / Chưa đọc / Đã đọc), theo **nhóm sự kiện** (đề xuất, xét duyệt,
  tiến độ, kinh phí, nghiệm thu, sản phẩm), theo **khoảng thời gian**. Lọc giữ trên URL để chia sẻ/refresh.
- **Thao tác:** mở một mục (→ FE-03, đánh dấu đã đọc), **đánh dấu đã đọc đơn lẻ**, **đánh dấu tất cả đã đọc**.
  Lưu ý: chỉ tác động bản ghi IN_APP của chính người dùng (BR-09, BR-10 trong spec).
- **Trạng thái:**
  - *Tải:* skeleton danh sách.
  - *Rỗng (không có dữ liệu):* "Chưa có thông báo."
  - *Rỗng do lọc:* "Không có thông báo khớp bộ lọc." + nút "Xóa bộ lọc".
  - *Lỗi:* thông báo lỗi inline + "Thử lại"; giữ bộ lọc hiện tại.

### FE-03 — Chi tiết / điều hướng từ thông báo

- Mở từ FE-01/FE-02. Hiển thị tiêu đề + nội dung đầy đủ (đã render từ mẫu), thời gian, nút điều hướng tới
  đối tượng nguồn (`link`).
- **Tự động đánh dấu `READ`** khi mở (nếu đang chưa đọc).
- **Trạng thái lỗi:** nếu `link` trỏ tới đối tượng người dùng không còn quyền xem → hiển thị nội dung
  thông báo nhưng nút điều hướng báo "Bạn không còn quyền truy cập mục này." (không lỗi cứng).

### FE-04 — Tùy chọn nhận thông báo

- **Bố cục:** bảng theo **nhóm sự kiện** × **kênh** (EMAIL, SMS), mỗi ô là công tắc bật/tắt. IN_APP **luôn bật**,
  hiển thị mờ/khóa (BR-01).
- **Ràng buộc UI (theo spec):**
  - Nhóm sự kiện **bắt buộc** (BR-08): công tắc EMAIL bị khóa ở trạng thái bật, có chú thích "Bắt buộc nhận".
  - Kênh SMS chỉ hiện công tắc cho nhóm có sự kiện **ưu tiên cao** (BR-03); nhóm còn lại hiển thị "—".
  - Người chưa có `phoneNumber` (B03): công tắc SMS hiển thị gợi ý "Cập nhật số điện thoại để nhận SMS".
- **Thao tác:** đổi công tắc → lưu (tự lưu hoặc nút "Lưu thay đổi"), hiển thị toast xác nhận.
- **Trạng thái:** *Tải* skeleton; *Lỗi lưu* giữ nguyên giá trị cũ + toast lỗi + cho thử lại.

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
  - Cờ **Bắt buộc** cho từng sự kiện (BR-08) — khi bật, người dùng không tắt EMAIL được.
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

## 4. Thông báo & trạng thái

| Tình huống | Hiển thị cho người dùng |
|---|---|
| Đánh dấu đã đọc thành công | Cập nhật badge/đếm tức thì (optimistic), không cần toast. |
| Đánh dấu tất cả đã đọc | Toast "Đã đánh dấu tất cả là đã đọc." |
| Lưu tùy chọn thành công | Toast "Đã lưu tùy chọn nhận thông báo." |
| Lỗi tải danh sách/đếm | Inline "Không tải được thông báo." + "Thử lại". |
| Lỗi lưu tùy chọn | Toast lỗi + rollback giá trị công tắc. |
| Cố tắt nhóm bắt buộc | Tooltip "Nhóm thông báo này bắt buộc nhận, không thể tắt." |

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
| FE-01 Chuông & dropdown | AC-01 (hiển thị IN_APP), AC-06 (đếm/đã đọc) |
| FE-02 Trung tâm thông báo | AC-01, AC-06 (lọc, đánh dấu tất cả đã đọc) |
| FE-03 Chi tiết / điều hướng | AC-01 (deep-link), AC-06 (tự đánh dấu đã đọc) |
| FE-04 Tùy chọn nhận | AC-02 (tôn trọng tắt EMAIL), AC-03 (SMS chỉ sự kiện cao), AC-09 (không tắt nhóm bắt buộc) |
| BO-01 Quản lý mẫu | AC-10 (thiếu mẫu = lỗi cấu hình, BR-05) |
| BO-02 Ma trận sự kiện ↔ kênh | AC-03 (SMS chỉ sự kiện cao), AC-08 (tắt EMAIL cấp sự kiện), AC-09 (cờ bắt buộc) |
| BO-03 Nhật ký gửi | AC-04 (ERROR sau retry), AC-05 (gửi lại) |
| BO-04 Cấu hình tham số | AC-04 (`maxRetry`/backoff), AC-07 (số ngày nhắc hạn) |
