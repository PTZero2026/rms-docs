---
title: "E2 — Thực hiện & Nghiệm thu"
id: "E2"
status: Draft
updated: 2026-06-12
---

# E2 — Thực hiện & Nghiệm thu

## Mục tiêu (outcome)
Một đề tài đã duyệt được theo dõi tới khi đóng: **giao đề tài → báo cáo tiến độ → ghi nhận & đối soát
kinh phí → nghiệm thu qua hội đồng → quyết toán & hoàn thành**.

## Pha
Next.

## Feature thành phần
| Mã | Feature | Module | Vai trò trong Epic |
|---|---|---|---|
| [F04](../features/F04-quan-ly-tien-do/) | Quản lý tiến độ | `progress` | Giao đề tài, báo cáo định kỳ, tạm dừng/tiếp tục |
| [F05](../features/F05-quan-ly-kinh-phi/) | Quản lý kinh phí | `budget` | Dự toán, cấp, giao dịch, đối soát tài chính |
| [F06](../features/F06-nghiem-thu/) | Nghiệm thu | `acceptance` | Hội đồng nghiệm thu, chấm, kết luận đạt/không đạt, chứng nhận |

## Phụ thuộc
- **Epic**: E0, E1 (đề tài phải APPROVED mới vào E2).
- **ADR**: [0004 Đối soát kinh phí qua API](../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md) ·
  [0003 Hội đồng dùng chung](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md) —
  **F06 dùng lại mô hình hội đồng của F03** (`type=ACCEPTANCE`).
- **Nội bộ**: F05 phụ thuộc dự toán (F01) & quyết định giao (F04); F06 gọi F05 khi quyết toán.

## Open questions
- **F06 test-plan còn khung** — cần viết test case bám AC.
- Đồng bộ mô hình cuộc họp/biên bản nghiệm thu (F06) với F03.
- Điều kiện vào nghiệm thu ("đủ sản phẩm cam kết") đối chiếu F04/F07 — nguồn dữ liệu & cách kiểm.

## Định nghĩa hoàn thành (Exit criteria)
- [ ] Giao đề tài & nộp/duyệt báo cáo tiến độ định kỳ (F04).
- [ ] Ghi nhận giao dịch kinh phí & đối soát với hệ thống tài chính (F05).
- [ ] Nghiệm thu qua hội đồng, kết luận đạt/không đạt; cho làm lại có thời hạn khi không đạt (F06).
- [ ] Quyết toán & chuyển đề tài sang `COMPLETED`.
