---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-22
---

# Kế hoạch · Đọc lần lượt tin cá nhân chưa đọc

[Đặc tả](spec.md) · [B04](../../docs/features/B04-thong-bao/spec.md) · [Backlog INVEST](../../docs/product/mobile-invest.md).

## Summary và ngữ cảnh kỹ thuật

Ràng buộc nguồn hộp thư theo inbox, lưu bộ lọc trong route và đánh dấu đúng tin khi mở. Kiểm lại người nhận ở thao tác ghi. Dùng React/TypeScript trong apps/web, theme và component shadcn/ui của packages/ui. V0 đọc fixture tenant hiện hành. Bản tích hợp thật nhận kiểu sinh từ packages/api-contracts và phân quyền tại module notification ở backend.

## Kiểm hiến pháp

| Nguyên tắc | Cách áp dụng |
|---|---|
| Nguồn nghiệp vụ, quyền | Đối chiếu BR-09–10 và AC-06 ở [B04](../../docs/features/B04-thong-bao/spec.md). Mọi truy vấn máy chủ áp tenant, người dùng và quyền đối tượng trước khi trả danh sách hoặc số đếm. |
| Vòng đời, audit | B04 chỉ đổi trạng thái đọc của thông báo trong phạm vi, lưu vết thay đổi theo chính sách audit. Chuyển bước đề tài thuộc dịch vụ miền. |
| Kênh, dữ liệu | Một web responsive, giờ Asia/Ho_Chi_Minh. Bản mẫu dùng ngày nghiệp vụ của bộ fixture hiện hành. |

[Thiết kế và truy vết BR/AC](design.md) · [Hành vi giao diện](ui.md) · [Các ca nghiệm thu](test-plan.md).

**Tài liệu đầu vào cho tasks** — [Nghiên cứu](research.md) · [Dữ liệu](data-model.md) · [Hợp đồng](contracts/interaction.md) · [Ca thử](quickstart.md).
