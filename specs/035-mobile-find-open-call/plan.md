---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-22
---

# Kế hoạch · Tra kỳ đang nhận theo mã trên điện thoại

[Đặc tả](spec.md) · [F02](../../docs/features/F02-dot-keu-goi/spec.md) · [Backlog INVEST](../../docs/product/mobile-invest.md).

## Summary và ngữ cảnh kỹ thuật

Dùng callVisible trước receiving, lọc tên hoặc mã không phân biệt hoa thường và hiển thị ngày bằng dateLabel. Chi tiết dùng lại route F02 hiện hành. Dùng React/TypeScript trong apps/web, theme và component shadcn/ui của packages/ui. V0 đọc fixture tenant hiện hành. Bản tích hợp thật nhận kiểu sinh từ packages/api-contracts và phân quyền tại module call ở backend.

## Kiểm hiến pháp

| Nguyên tắc | Cách áp dụng |
|---|---|
| Nguồn nghiệp vụ, quyền | Đối chiếu BR-01, BR-04–05 và AC-03–04, AC-08 ở [F02](../../docs/features/F02-dot-keu-goi/spec.md). Mọi truy vấn máy chủ áp tenant, người dùng và quyền đối tượng trước khi trả danh sách hoặc số đếm. |
| Vòng đời, audit | Đọc hoặc lọc giữ nguyên trạng thái nghiệp vụ và nhật ký. Chuyển bước đề tài thuộc dịch vụ miền. |
| Kênh, dữ liệu | Một web responsive, giờ Asia/Ho_Chi_Minh. Bản mẫu dùng ngày nghiệp vụ của bộ fixture hiện hành. |

[Thiết kế và truy vết BR/AC](design.md) · [Hành vi giao diện](ui.md) · [Các ca nghiệm thu](test-plan.md).

**Tài liệu đầu vào cho tasks** — [Nghiên cứu](research.md) · [Dữ liệu](data-model.md) · [Hợp đồng](contracts/interaction.md) · [Ca thử](quickstart.md).
