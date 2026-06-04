---
title: "Đề xuất đề tài — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đề xuất đề tài — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & ngữ cảnh

- **Chủ nhiệm đề tài** (nhà khoa học): tạo, soạn, lưu nháp, nộp đề xuất; xem trạng thái & lý do
  trả lại; nộp lại sau khi được trả lại bổ sung.
- **Thành viên đề tài** (nhà khoa học): xem thông tin đề tài mình tham gia; **không** chỉnh sửa nội
  dung hồ sơ (BR-05). Quyền sửa nội dung mặc định chỉ thuộc chủ nhiệm.

Vào từ Portal người dùng (FE): menu "Đề xuất của tôi" hoặc từ một đợt kêu gọi đang `OPEN` → "Tạo đề
xuất". Đăng nhập qua SSO.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Danh sách đề xuất của tôi | Xem các đề xuất của chủ nhiệm theo trạng thái; tạo mới. |
| FE-02 | Tạo/sửa đề xuất — form nhiều bước | Soạn thuyết minh theo biểu mẫu đợt, lưu nháp. |
| FE-03 | Bước thành viên | Thêm/sửa/xóa thành viên đề tài (`ProjectMember`). |
| FE-04 | Bước dự toán kinh phí | Nhập `requestedBudget` và `durationMonths`. |
| FE-05 | Bước tài liệu đính kèm | Tải lên/xóa file (`Attachment`). |
| FE-06 | Xem lại & nộp | Tổng hợp, kiểm tra hợp lệ, nộp (`DRAFT` → `SUBMITTED`). |
| FE-07 | Chi tiết đề xuất (chỉ đọc) | Xem hồ sơ đã nộp, trạng thái, `projectCode`, lý do trả lại. |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### FE-01 — Danh sách đề xuất của tôi
- **Bố cục:** bảng các đề xuất của người dùng (cột: `projectCode` hoặc "—" khi chưa nộp, tên, đợt kêu
  gọi, lĩnh vực, trạng thái, cập nhật gần nhất). Nút **Tạo đề xuất**.
- **Tạo đề xuất:** mở dialog chọn **đợt kêu gọi đang `OPEN`** (chỉ liệt kê đợt `OPEN` còn hạn). Chọn
  xong → tạo `ResearchProject` ở `DRAFT`, điều hướng tới FE-02. → AC-01.
- **Badge trạng thái:** `DRAFT` (xám "Nháp"), `SUBMITTED` (xanh "Đã nộp"), `CANCELLED` (đỏ "Đã hủy").
- **Trạng thái rỗng:** chưa có đề xuất → minh họa + CTA "Tạo đề xuất". Nếu không có đợt nào `OPEN`:
  thông báo "Hiện chưa có đợt kêu gọi nào đang mở".
- **Đang tải:** skeleton bảng. **Lỗi:** banner + nút "Thử lại".

### FE-02 — Tạo/sửa đề xuất (form nhiều bước)
- **Stepper:** Thông tin chung → Thuyết minh → Thành viên (FE-03) → Dự toán (FE-04) → Tài liệu
  (FE-05) → Xem lại & nộp (FE-06). Cho phép nhảy bước; mọi bước **Lưu nháp** giữ `DRAFT`.
- **Thông tin chung:** `name` (bắt buộc), `researchFieldId` (chọn trong lĩnh vực của đợt — BR-03),
  `hostUnitId`, `abstract`.
- **Thuyết minh:** render động theo `proposalTemplateId` của đợt (lưu vào `proposalDocument` jsonb).
  Đánh dấu trường bắt buộc bằng dấu *.
- **Chỉ sửa khi `DRAFT`:** nếu đề xuất ở `SUBMITTED`, form chuyển chế độ chỉ đọc và hiện banner "Hồ sơ
  đã nộp, chỉ sửa được sau khi chuyên viên trả lại bổ sung" (BR-05) → AC-05.
- **Lưu nháp:** lưu mọi thay đổi, hiển thị "Đã lưu nháp lúc HH:mm". Tự lưu nháp khi rời bước (tùy
  chọn). → AC-01.

### FE-03 — Bước thành viên
- Danh sách thành viên hiện có; dòng chủ nhiệm gắn cố định vai trò `PRINCIPAL_INVESTIGATOR`, không xóa được
  (BR-04). Thêm thành viên: tìm `User` theo tên/email, chọn `projectRole`
  (`MEMBER`/`SECRETARY`), nhập `responsibility`.
- **Validate:** không cho thêm trùng người dùng → cảnh báo "Thành viên đã có trong đề tài" (BR-08)
  → AC-09.

### FE-04 — Bước dự toán kinh phí
- `requestedBudget` (VND, định dạng nhóm nghìn, số nguyên ≥ 0 — BR-09), `durationMonths` (số tháng,
  > 0). Validate tại chỗ: số âm/0/không phải số → báo lỗi inline.

### FE-05 — Bước tài liệu đính kèm
- Kéo-thả/chọn file → tải lên object storage, tạo `Attachment` (`targetType='ResearchProject'`). Hiển
  thị tên, dung lượng, loại; cho xóa khi `DRAFT`. Báo lỗi nếu vượt dung lượng/định dạng không hỗ
  trợ. Trong khi upload: progress; lỗi mạng → cho thử lại từng file.

### FE-06 — Xem lại & nộp
- Tổng hợp toàn bộ hồ sơ. **Kiểm tra hợp lệ phía người dùng** (phản ánh sớm BR-01..BR-04): liệt kê
  trường thiếu/sai và liên kết về bước tương ứng; vô hiệu hóa nút **Nộp** khi chưa hợp lệ.
- **Nộp:** xác nhận → gọi API nộp. Backend là nơi quyết định (validate lại). Thành công → chuyển
  `SUBMITTED`, hiển thị `projectCode` và `submittedAt` → AC-02. Nếu backend báo hết hạn (AC-03) hoặc thiếu
  trường (AC-04): hiển thị lỗi tương ứng, giữ `DRAFT`.

### FE-07 — Chi tiết đề xuất (chỉ đọc)
- Xem hồ sơ đã nộp: `projectCode`, trạng thái, `submittedAt`, thuyết minh, thành viên, dự toán, tài liệu.
- **Lý do trả lại:** khi đề xuất bị trả về `DRAFT`, hiển thị banner nổi bật với `reason` của chuyên
  viên và nút "Sửa & nộp lại" (mở FE-02 ở chế độ sửa) → AC-07. `projectCode` giữ nguyên ở lần nộp lại
  → AC-11.
- **Hủy đề xuất:** nút "Hủy đề xuất" cho `DRAFT`/`SUBMITTED` (trước xét duyệt), yêu cầu nhập lý do
  (BR-10).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|------------|-----------|
| Lưu nháp thành công | "Đã lưu nháp lúc HH:mm." |
| Nộp thành công | "Đã nộp đề xuất. Mã đề tài: {projectCode}." |
| Quá hạn nộp | "Đã hết hạn nộp của đợt kêu gọi. Không thể nộp." (AC-03) |
| Thiếu trường bắt buộc | "Vui lòng hoàn thiện các trường: {danh sách}." (AC-04) |
| Sửa sau khi nộp | "Hồ sơ đã nộp, chỉ sửa được sau khi được trả lại bổ sung." (AC-05) |
| Thành viên trùng | "Thành viên đã có trong đề tài." (AC-09) |
| Bị trả lại bổ sung | Banner: "Hồ sơ được trả lại để bổ sung. Lý do: {reason}." (AC-07) |
| Không có quyền | "Bạn không có quyền truy cập đề xuất này." (AC-06) |

- **Trạng thái rỗng:** danh sách trống, không có đợt `OPEN`, chưa có thành viên/tài liệu — đều có
  minh họa + hướng dẫn.
- **Đang tải:** skeleton/spinner cho danh sách, form, upload.
- **Lỗi:** lỗi mạng/máy chủ → banner + "Thử lại"; lỗi nhập liệu → inline cạnh trường.

## 5. Liên kết AC

| Màn hình | AC liên quan |
|----------|--------------|
| FE-01 | AC-01, AC-06 |
| FE-02 | AC-01, AC-04, AC-05, AC-11 |
| FE-03 | AC-09 |
| FE-04 | AC-04 |
| FE-05 | AC-04 |
| FE-06 | AC-02, AC-03, AC-04 |
| FE-07 | AC-02, AC-05, AC-07, AC-11 |
