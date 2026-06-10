---
title: "Quản lý tiến độ — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Quản lý tiến độ — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học): nộp và theo dõi báo cáo tiến độ của đề tài mình chủ trì. Vào từ
  danh sách "Đề tài của tôi" → chọn một đề tài đang `IN_PROGRESS`/`SUSPENDED` → tab **Tiến độ**.
- **Thành viên đề tài** (nhà khoa học): chỉ **xem** lịch và báo cáo của đề tài mình tham gia (BR-11).
- **Chuyên viên QL KHCN:** lập hồ sơ giao đề tài, xác nhận giao đề tài, lập lịch kỳ báo cáo, duyệt/yêu cầu
  chỉnh sửa báo cáo, tạm dừng/tiếp tục, chuyển sang chờ nghiệm thu. Thao tác trong phạm vi đơn vị/kỳ được
  phân (BR-11).
- **Quản trị hệ thống:** xem, không trực tiếp xử lý nghiệp vụ tiến độ.

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION` (data-model §4.1). UI chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:---:|:---:|
| Xem tiến độ đề tài & báo cáo | `PROGRESS.VIEW` | ✓ | ✓ |
| Lập/sửa hồ sơ giao đề tài nháp | `PROGRESS.ASSIGNMENT_DRAFT` | ✓ | – |
| Xác nhận giao đề tài (`APPROVED → IN_PROGRESS`) | `PROGRESS.ASSIGN_PROJECT` | ✓ | – |
| Lập/sửa lịch kỳ báo cáo | `PROGRESS.SCHEDULE_PERIOD` | ✓ | – |
| Duyệt báo cáo (`→ PASSED`) | `PROGRESS.APPROVE_REPORT` | ✓ | – |
| Yêu cầu chỉnh sửa báo cáo | `PROGRESS.REQUEST_REVISION` | ✓ | – |
| Tạm dừng / tiếp tục đề tài | `PROGRESS.SUSPEND` | ✓ | – |
| Chuyển sang chờ nghiệm thu | `PROGRESS.REQUEST_ACCEPTANCE` | ✓ | – |
| Mở lại báo cáo đã `PASSED` (ngoại lệ) | `PROGRESS.REOPEN_REPORT` | ✓ | – |

> Chủ nhiệm/thành viên thao tác trên đề tài thuộc quyền sở hữu của mình (nộp/xem báo cáo); chuyên viên
> thao tác trong phạm vi đơn vị/kỳ được phân.

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan tiến độ đề tài | Xem trạng thái đề tài, thông tin giao đề tài, lịch các kỳ báo cáo, cờ trễ hạn |
| FE-02 | Nộp / nộp lại báo cáo kỳ | Nhập nội dung, đính kèm, nộp báo cáo (`PENDING_SUBMISSION`/`REVISION_REQUESTED` → `SUBMITTED`) |
| FE-03 | Chi tiết báo cáo kỳ | Xem nội dung đã nộp, nhận xét chuyên viên, lịch sử nộp |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đề tài đang thực hiện | Lọc theo đơn vị/kỳ/trạng thái/đề tài trễ hạn; vào chi tiết |
| BO-02 | Giao đề tài & lập lịch báo cáo | Lập hồ sơ giao đề tài cho đề tài `APPROVED`, xác nhận giao, tạo các kỳ (`period`, `dueDate`) |
| BO-03 | Chi tiết tiến độ đề tài | Bảng kỳ báo cáo, duyệt/yêu cầu sửa, tạm dừng/tiếp tục, chuyển nghiệm thu |
| BO-04 | Duyệt báo cáo kỳ | Xem nội dung/đính kèm, duyệt đạt hoặc yêu cầu chỉnh sửa kèm nhận xét |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Tổng quan tiến độ đề tài
- Banner trạng thái đề tài (`IN_PROGRESS` / `SUSPENDED` kèm lý do nếu có).
- Khối **Thông tin giao đề tài**: số quyết định/hợp đồng, ngày ký/ngày hiệu lực, thời gian thực hiện,
  tổng kinh phí được phê duyệt (`approvedBudget`, định dạng VND), nguồn kinh phí và file căn cứ để tải xuống
  (chỉ đọc).
- Bảng các kỳ báo cáo: `period`, `dueDate`, trạng thái (`PENDING_SUBMISSION`/`SUBMITTED`/`PASSED`/`REVISION_REQUESTED`), nhãn **Trễ hạn**
  (đỏ) khi quá `dueDate` mà chưa `PASSED` hoặc nộp muộn (BR-09).
- Mỗi kỳ `PENDING_SUBMISSION`/`REVISION_REQUESTED` có nút **Nộp báo cáo** → FE-02; kỳ khác mở **Chi tiết** → FE-03.
- Khi đề tài `SUSPENDED`: nút nộp bị **vô hiệu hóa**, ghi chú "Đề tài đang tạm dừng" (BR-04).
- **Trạng thái rỗng:** chưa có kỳ → "Chưa có lịch báo cáo cho đề tài này." **Đang tải:** skeleton bảng.
  **Lỗi:** thông báo + nút thử lại.

### FE-02 — Nộp / nộp lại báo cáo kỳ
- Form: `content` (bắt buộc), khu vực đính kèm `Attachment` (kéo-thả, hiển thị tên/kích thước, validate
  dung lượng & định dạng phía người dùng).
- Nếu nộp lại từ `REVISION_REQUESTED`: hiển thị nổi bật `officerComment` kỳ trước để đối chiếu.
- Cảnh báo (không chặn) khi nộp quá `dueDate`: "Bạn đang nộp trễ hạn" (BR-09).
- Nút **Nộp**: xác nhận → gọi API; thành công → quay về FE-01, kỳ chuyển `SUBMITTED`.

### FE-03 — Chi tiết báo cáo kỳ
- Hiển thị `content`, đính kèm (tải xuống qua pre-signed URL), `submittedAt`, trạng thái.
- Nếu `REVISION_REQUESTED`/`PASSED`: hiển thị `officerComment` và thời điểm duyệt.
- Báo cáo `PASSED` ở chế độ chỉ đọc (BR-12).

### BO-01 — Danh sách đề tài đang thực hiện
- Danh sách phân trang server-side; bộ lọc trạng thái đề tài, **đề tài có báo cáo trễ hạn**,
  kỳ nhận đề xuất, đơn vị. Cột cảnh báo số kỳ quá hạn.

### BO-02 — Giao đề tài & lập lịch báo cáo
- Chọn đề tài `APPROVED` → lập **Hồ sơ giao đề tài** gồm `assignmentType`
  (`CONTRACT`/`DECISION`), `contractNo`/`decisionNo`, `signedAt`, `effectiveDate`, `startDate`, `endDate`,
  `approvedBudget`, `fundingSource`, file quyết định/hợp đồng đính kèm và `note` nếu khác hồ sơ đề xuất
  (BR-13, BR-15). Nút **Xác nhận giao đề tài** chỉ bật khi hồ sơ hợp lệ → `ProjectAssignment=EFFECTIVE`,
  `ResearchProject=IN_PROGRESS` (BR-01). Sau đó thêm các kỳ báo cáo: nhập `period` và `dueDate`; hệ thống
  chặn `period` trùng (BR-07) và chặn lập kỳ khi đề tài không `IN_PROGRESS` (BR-02).

### BO-03 — Chi tiết tiến độ đề tài
- Banner trạng thái + lý do tạm dừng; bảng kỳ báo cáo với trạng thái & cờ trễ; nút **Tạm dừng**
  / **Tiếp tục** (bắt buộc nhập `reason`, BR-06); nút **Chuyển chờ nghiệm thu** chỉ bật khi kỳ cuối `PASSED` và
  đủ sản phẩm cam kết, nếu thiếu hiển thị rõ điều kiện còn thiếu (BR-10).

### BO-04 — Duyệt báo cáo kỳ
- Mở từ một báo cáo `SUBMITTED`; hai hành động: **Duyệt đạt** (`→ PASSED`) hoặc **Yêu cầu chỉnh sửa**
  (`→ REVISION_REQUESTED`, bắt buộc nhập `officerComment`, để trống → chặn, BR-05).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đề tài được giao + có lịch báo cáo | "Đề tài đã được giao, xem lịch báo cáo tiến độ." |
| Hồ sơ giao đề tài có hiệu lực | "Đề tài đã được giao chính thức, xem thông tin giao đề tài." |
| Nộp báo cáo thành công | "Đã nộp báo cáo kỳ {period}." |
| Nộp khi đề tài tạm dừng | (Chặn) "Đề tài đang tạm dừng, không thể nộp báo cáo." |
| Chuyên viên yêu cầu chỉnh sửa | "Báo cáo kỳ {period} cần chỉnh sửa: {nhận xét}." |
| Báo cáo được duyệt đạt | "Báo cáo kỳ {period} đã được duyệt đạt." |
| Sắp đến hạn nộp | "Còn {N} ngày đến hạn nộp báo cáo kỳ {period}." (B04) |

- **Trạng thái rỗng:** chưa có kỳ báo cáo, chưa có đính kèm — đều có minh họa + hướng dẫn.
- **Đang tải:** skeleton/spinner cho danh sách, form, upload.
- **Lỗi:** lỗi mạng/máy chủ → banner + "Thử lại"; lỗi nhập liệu → inline cạnh trường.

## 5. Audit & nhật ký

Ghi `AuditLog` cho: lập/sửa hồ sơ giao đề tài nháp, xác nhận giao đề tài, điều chỉnh căn cứ giao đề tài,
lập/sửa kỳ báo cáo, duyệt báo cáo, yêu cầu chỉnh sửa, tạm dừng/tiếp tục (kèm `reason`), chuyển chờ nghiệm
thu, mở lại báo cáo `PASSED`. Chuyên viên/quản trị xem được nhật ký theo phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (xem thông tin giao đề tài), AC-06 (xem trạng thái tạm dừng), AC-08 (nhãn trễ hạn) |
| FE-02 | AC-03 (nộp), AC-05 (nộp lại sau yêu cầu sửa), AC-08 (nộp trễ), AC-09 (chặn khi tạm dừng) |
| FE-03 | AC-04 (xem kết quả duyệt), AC-05 (xem nhận xét) |
| BO-01 | AC-08 (lọc trễ hạn) |
| BO-02 | AC-01 (giao đề tài), AC-02 (lập kỳ), AC-13 (chặn sai trạng thái/trùng kỳ), AC-14 (thiếu căn cứ), AC-15 (điều chỉnh khác hồ sơ đề xuất) |
| BO-03 | AC-06 (tạm dừng/tiếp tục), AC-07 (chuyển nghiệm thu), AC-12 (chặn khi kỳ cuối chưa đạt) |
| BO-04 | AC-04 (duyệt đạt), AC-05 (yêu cầu sửa), AC-10 (chặn yêu cầu sửa thiếu nhận xét), AC-11 (sai quyền) |
