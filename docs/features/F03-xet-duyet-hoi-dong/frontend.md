---
title: "Xét duyệt hội đồng — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Xét duyệt hội đồng — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [`spec.md`](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Đối tượng:** **Chủ nhiệm đề tài** (nhà khoa học) — xem [personas](../../product/personas.md#chủ-nhiệm-đề-tài).
- **Ngữ cảnh:** Chủ nhiệm **không** tham gia chấm điểm; ở FE họ chỉ **theo dõi tiến trình và kết quả**
  xét duyệt đề tài của mình:
  - Xem trạng thái đề tài đang `UNDER_REVIEW` / `APPROVED` / `REJECTED`.
  - Nhận thông báo khi đề tài vào xét duyệt và khi có kết luận.
  - Xem nhận xét của hội đồng **nếu được công khai** (BR-11), với danh tính người chấm ẩn.
- **Lối vào:** từ danh sách đề tài của tôi (F01) → chi tiết đề tài → tab "Xét duyệt"; hoặc từ chuông
  thông báo (B04) bấm vào liên kết kết quả.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Tiến trình xét duyệt (trong chi tiết đề tài) | Hiển thị trạng thái xét duyệt hiện tại và mốc thời gian |
| FE-02 | Kết quả xét duyệt | Xem kết luận APPROVED/REJECTED, điểm tổng hợp (nếu công khai) và nhận xét hội đồng (nếu công khai) |
| FE-03 | Thông báo kết quả (in-app) | Banner/mục thông báo khi đề tài vào xét duyệt hoặc có kết luận |

## 3. Mô tả màn hình & thao tác

### FE-01 — Tiến trình xét duyệt
- Là một tab/section trong màn chi tiết đề tài (F01). Chỉ hiển thị khi đề tài đã từng vào xét duyệt
  (`UNDER_REVIEW` trở đi).
- Thành phần: chip trạng thái (`Đang xét duyệt` / `Đã duyệt` / `Từ chối`); timeline mốc:
  "Vào xét duyệt" (ngày tạo `EvaluationRound`), "Có kết luận" (ngày `CONCLUDED`).
- Trạng thái:
  - **Đang tải:** skeleton timeline.
  - **Rỗng / chưa xét duyệt:** ẩn tab hoặc hiển thị "Đề tài chưa vào vòng xét duyệt".
  - **Lỗi:** "Không tải được tiến trình xét duyệt" + nút thử lại.
- Chủ nhiệm **chỉ đọc** — không có hành động nào trên màn này.

### FE-02 — Kết quả xét duyệt
- Hiển thị khi đề tài đã `APPROVED` hoặc `REJECTED`.
- Thành phần:
  - Kết luận nổi bật: "Đề tài được duyệt" / "Đề tài không được duyệt".
  - `aggregateScore` — **chỉ hiển thị nếu** cấu hình công khai cho phép; nếu không, ẩn điểm.
  - Khối "Nhận xét hội đồng" — **chỉ hiển thị khi** `PROPOSAL_REVIEW.PUBLIC_COMMENTS=true` (BR-11);
    danh tính người chấm ẩn (hiển thị "Thành viên hội đồng 1/2/..." hoặc gộp chung).
  - Với `APPROVED`: ghi chú "đề tài sẽ được chuyển sang giai đoạn thực hiện" (F04).
- Trạng thái:
  - **Chưa có kết luận:** điều hướng về FE-01 (đang xét duyệt).
  - **Nhận xét bị ẩn:** hiển thị "Hội đồng không công khai nhận xét cho đợt này".
  - **Lỗi:** thông báo lỗi + thử lại.

### FE-03 — Thông báo kết quả (in-app)
- Mục thông báo (chuông) nhận sự kiện từ B04: "Đề tài *X* đã vào vòng xét duyệt", "Đề tài *X* đã được
  duyệt", "Đề tài *X* không được duyệt".
- Bấm thông báo → mở FE-01/FE-02 tương ứng. Đánh dấu đã đọc khi mở.

> Không có validate nhập liệu ở FE (màn hình thuần đọc). Mọi luật hiển thị/ẩn dữ liệu do backend
> quyết định theo cấu hình & quyền (overview §4.1).

## 4. Thông báo & trạng thái

| Tình huống | Thông báo hiển thị |
|---|---|
| Đề tài vào xét duyệt | "Đề tài của bạn đã được đưa vào vòng xét duyệt hội đồng." |
| Có kết luận APPROVED | "Chúc mừng! Đề tài *X* đã được hội đồng thông qua." |
| Có kết luận REJECTED | "Đề tài *X* không được hội đồng thông qua." |
| Nhận xét không công khai | "Hội đồng không công khai nhận xét cho đợt xét duyệt này." |
| Lỗi tải dữ liệu | "Không tải được thông tin xét duyệt, vui lòng thử lại." |

## 5. Liên kết AC

| Màn hình | AC liên quan (xem [spec §6](./spec.md#6-acceptance-criteria)) |
|----------|----------------------------------------------------------------|
| FE-01 | AC-01 (vào xét duyệt → hiển thị trạng thái `UNDER_REVIEW`) |
| FE-02 | AC-03 (kết quả APPROVED), AC-04 (kết quả REJECTED), liên quan BR-11 (công khai nhận xét) |
| FE-03 | AC-01, AC-03, AC-04 (thông báo các sự kiện trạng thái cho chủ nhiệm) |
