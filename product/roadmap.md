---
title: "Roadmap — RMS"
status: Draft
updated: 2026-06-01
---

# Roadmap (Now / Next / Later)

Lộ trình theo khung **Now / Next / Later** — ưu tiên dựng xong khúc đầu vòng đời (kêu gọi →
đề xuất → xét duyệt) cùng các nền tảng dùng chung, rồi tới thực hiện đề tài, cuối cùng là
công bố và phân tích. Xem vòng đời tổng thể ở `vision.md`.

## Now — Nền tảng & đầu vòng đời

Mục tiêu: nhận và xét duyệt được một đề xuất từ đầu đến cuối, trên nền người dùng + danh mục.

- **B03 — Quản lý người dùng**: tài khoản, vai trò, phân quyền (nền cho mọi feature).
- **B01 — Danh mục & cấu hình**: dữ liệu dùng chung (lĩnh vực, đơn vị, loại…).
- **F02 — Đợt kêu gọi đề xuất**: mở kỳ nhận, đặt thời gian & tiêu chí.
- **F01 — Đề xuất đề tài**: nộp thuyết minh trong một đợt kêu gọi.
- **F03 — Xét duyệt hội đồng**: hội đồng chấm điểm, chấp nhận/từ chối.

## Next — Thực hiện đề tài

Mục tiêu: theo dõi đề tài đã được duyệt cho tới khi hoàn thành.

- **F04 — Quản lý tiến độ**: báo cáo tiến độ định kỳ.
- **F05 — Quản lý kinh phí**: giao dịch & đối soát với hệ thống tài chính.
- **F06 — Nghiệm thu**: hội đồng đánh giá kết quả cuối.

## Later — Công bố & phân tích

Mục tiêu: khai thác đầu ra và dữ liệu tích lũy.

- **F07 — Sản phẩm khoa học**: kê khai sản phẩm, gắn về đề tài nguồn.
- **F08 — Lý lịch khoa học**: hồ sơ năng lực nhà khoa học.
- **B02 — Báo cáo & thống kê (nâng cao)**: tổng hợp toàn hệ thống.

## Xuyên suốt (cross-cutting)

- **F-B04 — Thông báo**: chạy kèm các feature (email/SMS), phục vụ nhắc hạn báo cáo, kết quả
  xét duyệt/nghiệm thu… Triển khai theo nhu cầu của feature đang làm.

## Bảng ánh xạ feature ↔ giai đoạn

| Mã | Feature | FE | BO | Giai đoạn |
|----|---------|:--:|:--:|-----------|
| B03 | Quản lý người dùng | – | ✓ | Now |
| B01 | Danh mục & cấu hình | – | ✓ | Now |
| F02 | Đợt kêu gọi đề xuất | ✓ | ✓ | Now |
| F01 | Đề xuất đề tài | ✓ | ✓ | Now |
| F03 | Xét duyệt hội đồng | ✓ | ✓ | Now |
| F04 | Quản lý tiến độ | ✓ | ✓ | Next |
| F05 | Quản lý kinh phí | ✓ | ✓ | Next |
| F06 | Nghiệm thu | ✓ | ✓ | Next |
| F07 | Sản phẩm khoa học | ✓ | ✓ | Later |
| F08 | Lý lịch khoa học | ✓ | ✓ | Later |
| B02 | Báo cáo & thống kê | – | ✓ | Later |
| B04 | Thông báo | ✓ | ✓ | Xuyên suốt |

## Phụ thuộc chính

- F01 cần **F02** (phải có đợt kêu gọi) và **B01/B03** (danh mục + người dùng).
- F03, F06 cùng dùng **HoiDong / PhieuCham** — nên thống nhất mô hình từ F03.
- F05 phụ thuộc tích hợp **hệ thống tài chính** (đối soát) — xem `../architecture/integrations.md`.
- B02 phụ thuộc dữ liệu do các feature F sinh ra → đặt ở Later là hợp lý.

> Roadmap là tài liệu sống. Khi đổi thứ tự ưu tiên, cập nhật cả bảng ánh xạ và `updated` ở frontmatter.
