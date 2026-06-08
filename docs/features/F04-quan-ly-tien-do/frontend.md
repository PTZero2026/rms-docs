---
title: "Quản lý tiến độ — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-05
---

# Quản lý tiến độ — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Chủ nhiệm đề tài** (FE): nộp và theo dõi báo cáo tiến độ của đề tài mình chủ trì.
- **Thành viên đề tài** (FE): chỉ **xem** lịch và báo cáo của đề tài mình tham gia (BR-11).

Vào từ danh sách "Đề tài của tôi" → chọn một đề tài đang `IN_PROGRESS`/`SUSPENDED` → tab **Tiến độ**.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tổng quan tiến độ đề tài | Xem trạng thái đề tài, thông tin giao đề tài, lịch các kỳ báo cáo, cờ trễ hạn |
| FE-02 | Nộp / nộp lại báo cáo kỳ | Nhập nội dung, đính kèm, nộp báo cáo (`PENDING_SUBMISSION`/`REVISION_REQUESTED` → `SUBMITTED`) |
| FE-03 | Chi tiết báo cáo kỳ | Xem nội dung đã nộp, nhận xét chuyên viên, lịch sử nộp |

## 3. Mô tả màn hình & thao tác

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

## 4. Thông báo & trạng thái

| Tình huống | Thông báo cho người dùng |
|---|---|
| Đề tài được giao + có lịch báo cáo | "Đề tài đã được giao, xem lịch báo cáo tiến độ." |
| Hồ sơ giao đề tài có hiệu lực | "Đề tài đã được giao chính thức, xem thông tin giao đề tài." |
| Nộp báo cáo thành công | "Đã nộp báo cáo kỳ {period}." |
| Nộp khi đề tài tạm dừng | (Chặn) "Đề tài đang tạm dừng, không thể nộp báo cáo." |
| Chuyên viên yêu cầu chỉnh sửa | "Báo cáo kỳ {period} cần chỉnh sửa: {nhận xét}." |
| Báo cáo được duyệt đạt | "Báo cáo kỳ {period} đã được duyệt đạt." |
| Sắp đến hạn nộp | "Còn {N} ngày đến hạn nộp báo cáo kỳ {period}." (B04) |

## 5. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (xem thông tin giao đề tài), AC-06 (xem trạng thái tạm dừng), AC-08 (nhãn trễ hạn) |
| FE-02 | AC-03 (nộp), AC-05 (nộp lại sau yêu cầu sửa), AC-08 (nộp trễ), AC-09 (chặn khi tạm dừng) |
| FE-03 | AC-04 (xem kết quả duyệt), AC-05 (xem nhận xét) |
