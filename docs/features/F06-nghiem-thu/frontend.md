---
title: "Nghiệm thu — Frontend (người dùng)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Nghiệm thu — Mặt người dùng cuối

> Chỉ mô tả phần **đặc thù giao diện người dùng**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Đối tượng & ngữ cảnh

- **Chủ nhiệm đề tài** (FE): đăng ký nghiệm thu, nộp hồ sơ cuối, theo dõi lịch & kết quả nghiệm thu.
- **Thành viên đề tài** (FE): xem trạng thái & kết quả nghiệm thu của đề tài mình tham gia.

Vào từ "Đề tài của tôi" → đề tài `DANG_THUC_HIEN`/`CHO_NGHIEM_THU`/`DANG_NGHIEM_THU` → tab **Nghiệm thu**.

## 2. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Đăng ký nghiệm thu | Kiểm tra điều kiện, nộp hồ sơ cuối, gửi đăng ký |
| FE-02 | Theo dõi nghiệm thu | Trạng thái đề tài, lịch hội đồng, kết quả `DAT`/`KHONG_DAT` + nhận xét (nếu công khai) |

## 3. Mô tả màn hình & thao tác

### FE-01 — Đăng ký nghiệm thu
- Bảng **điều kiện** (checklist): kỳ báo cáo cuối đã `DAT`? đủ sản phẩm cam kết `DA_DUYET`? — hiển thị
  rõ mục nào chưa đạt và link tới F04/F07 để bổ sung (BR-01).
- Khu vực nộp **hồ sơ nghiệm thu cuối** (`TaiLieuDinhKem`): kéo-thả, validate dung lượng/định dạng.
- Nút **Gửi đăng ký** chỉ bật khi đủ điều kiện → `DeTai: DANG_THUC_HIEN → CHO_NGHIEM_THU`.
- **Trạng thái rỗng/lỗi:** nếu chưa đủ điều kiện, nút bị vô hiệu kèm giải thích.

### FE-02 — Theo dõi nghiệm thu
- Hiển thị trạng thái đề tài theo chuỗi nghiệm thu; lịch họp/đợt đánh giá (thời điểm, hội đồng — ẩn danh
  tính người chấm nếu cấu hình ẩn).
- Khi có kết luận: hiển thị `DAT`/`KHONG_DAT`; nếu `KHONG_DAT` kèm **thời hạn làm lại** và hướng dẫn;
  nhận xét hội đồng hiển thị khi `NGHIEM_THU.CONG_KHAI_NHAN_XET=true`.
- **Đang tải:** skeleton; **Lỗi:** thông báo + thử lại.

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|---|---|
| Đăng ký nghiệm thu thành công | "Đề tài đã chuyển sang chờ nghiệm thu." |
| Chưa đủ điều kiện | (Chặn) "Chưa đủ điều kiện nghiệm thu: {danh sách thiếu}." |
| Có lịch nghiệm thu | "Đề tài của bạn sẽ được hội đồng nghiệm thu đánh giá." (B04) |
| Kết luận đạt | "Đề tài đã nghiệm thu ĐẠT." |
| Kết luận không đạt | "Đề tài chưa đạt, được làm lại đến {hạn}." |

## 5. Liên kết AC

| Màn hình | AC liên quan (spec) |
|---|---|
| FE-01 | AC-01 (đăng ký), AC-07 (chặn khi chưa đủ điều kiện) |
| FE-02 | AC-04 (xem kết quả đạt), AC-05 (xem kết quả không đạt + làm lại) |
