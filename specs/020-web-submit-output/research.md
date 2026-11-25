---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-20

**Vấn đề.** Một tệp có trong thư viện nhưng người dùng vừa mất quyền có thể làm minh chứng không?

**Quyết định triển khai.** Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực.

**Lý do.** Trong trường hợp tệp đính kèm đã bị thu quyền trước khi gửi, người dùng cần thấy kết quả “báo minh chứng chưa hợp lệ, giữ nháp”. Phương án khác: Chỉ kiểm khi chọn tệp trên giao diện. Dùng TC-03 để phân biệt hai phương án. [RV-20](../review-decisions.md#rv-20)

**Tài liệu đối chiếu.** [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) — AC-01, AC-05, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01 (Happy — kê khai và gửi duyệt)** — Given chủ nhiệm đề tài có đề tài đang `IN_PROGRESS`; When tạo sản phẩm, chọn loại, nhập tên/năm/thông tin công bố/tác giả, gắn đề tài, đính minh chứng và gửi duyệt; Then sản phẩm chuyển `PENDING_APPROVAL`, chuyên viên nhận thông báo, ghi audit (BR-02..BR-07, BR-14).

- **AC-05 (Biên — thiếu minh chứng)** — Given sản phẩm thiếu minh chứng; When người kê khai gửi duyệt; Then hệ thống chặn, giữ bản nháp/chưa gửi, báo cần đính kèm minh chứng (BR-07).

- **AC-07 (Negative — gắn đề tài không thuộc phạm vi)** — Given người dùng không là chủ nhiệm/thành viên và không có quyền chuyên viên trong phạm vi; When cố gắn sản phẩm vào đề tài đó; Then backend trả 403, không lưu liên kết (BR-03, BR-13).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F07-san-pham-khoa-hoc/design.md) · [test-plan.md](../../docs/features/F07-san-pham-khoa-hoc/test-plan.md) · [ui.md](../../docs/features/F07-san-pham-khoa-hoc/ui.md)
