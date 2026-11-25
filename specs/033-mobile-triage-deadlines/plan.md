---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-22
---

# Kế hoạch · Tìm việc quá hạn trên điện thoại

[Đặc tả](spec.md) · [B06](../../docs/features/B06-trang-chu/spec.md) · [Backlog INVEST](../../docs/product/mobile-invest.md).

## Summary và ngữ cảnh kỹ thuật

Dùng dashboardTasks và cùng tập rowVisible, hiển thị số quá hạn và liên kết đến từng đích theo thứ tự hạn. Dùng React/TypeScript trong apps/web, theme và component shadcn/ui của packages/ui. V0 đọc fixture tenant hiện hành. Bản tích hợp thật nhận kiểu sinh từ packages/api-contracts và phân quyền tại module home ở backend.

## Kiểm hiến pháp

| Nguyên tắc | Cách áp dụng |
|---|---|
| Nguồn nghiệp vụ, quyền | Đối chiếu BR-01–05, BR-08–09 và AC-03–05, AC-09–11 ở [B06](../../docs/features/B06-trang-chu/spec.md). Mọi truy vấn máy chủ áp tenant, người dùng và quyền đối tượng trước khi trả danh sách hoặc số đếm. |
| Vòng đời, audit | Đọc hoặc lọc giữ nguyên trạng thái nghiệp vụ và nhật ký. Chuyển bước đề tài thuộc dịch vụ miền. |
| Kênh, dữ liệu | Một web responsive, giờ Asia/Ho_Chi_Minh. Bản mẫu dùng ngày nghiệp vụ của bộ fixture hiện hành. |

[Thiết kế và truy vết BR/AC](design.md) · [Hành vi giao diện](ui.md) · [Các ca nghiệm thu](test-plan.md).

**Tài liệu đầu vào cho tasks** — [Nghiên cứu](research.md) · [Dữ liệu](data-model.md) · [Hợp đồng](contracts/interaction.md) · [Ca thử](quickstart.md).
