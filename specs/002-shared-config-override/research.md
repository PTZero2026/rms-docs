---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-02

**Vấn đề.** Làm sao tránh hiển thị cấu hình cũ sau khi lưu?

**Quyết định ngày 21/11/2026.** Ngay từ lần đọc đầu tiên sau khi trường A lưu thành công giá trị riêng, A nhận giá trị mới dù trước đó đã đọc bản chung. Trường B còn dùng mặc định vẫn nhận giá trị chung.

**Lý do.** Trong trường hợp A và B đã đọc khóa dùng chung trước khi A ghi đè, người dùng cần thấy kết quả “A dùng bản riêng, B vẫn dùng bản chung”. Phương án khác: Đợi hết thời gian lưu đệm năm phút. Dùng TC-03 để phân biệt hai phương án. [RV-02](../review-decisions.md#rv-02)

**Tài liệu đối chiếu.** [B01](../../docs/features/B01-danh-muc-cau-hinh/spec.md) — AC-02, AC-05, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-02** — Quản trị X lưu bản riêng cho cùng key. Lần đọc đầu tiên tại X trả giá trị mới, còn Y chưa cấu hình riêng vẫn nhận bản chung dù cả hai đã đọc trước khi X ghi. *(BR-01/BR-03/BR-04)*

- **AC-05** — Given key `"CONFIG.FE"` chỉ có bản shared, When user tenant X đọc, Then trả về nội dung bản shared với header `X-Cache: MISS` ở lần đầu, `HIT` ở lần thứ hai trong vòng 5 phút. *(happy, BR-04)*

- **AC-07** — Given user chỉ có vai trò `user` (không admin/tenant_admin), When họ POST/PUT/DELETE một key, Then hệ thống từ chối với 403 Forbidden. *(quyền, BR-02)*

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/B01-danh-muc-cau-hinh/test-plan.md) · [ui.md](../../docs/features/B01-danh-muc-cau-hinh/ui.md)
