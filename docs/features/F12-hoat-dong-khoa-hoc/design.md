---
title: "Thiết kế F12 · activity"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Hoạt động khoa học & minh chứng · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02 | AC-01, AC-02 | Lấy loại hoạt động và requiredEvidence theo tenant/giai đoạn. Khi gửi kiểm đủ loại tệp và quyền đọc từng tệp. Trả danh sách còn thiếu. |
| BR-03, BR-04 | AC-03, AC-04 | Chỉ luồng phê duyệt thành công ghi kinh phí hỗ trợ nếu có và phát sự kiện sang P03 bằng khóa nguồn. Từ chối lưu lý do và audit. P03 dùng công thức hiệu lực theo ngày nguồn. |

Module `activity` kiểm tenant và phạm vi ở máy chủ. F12 dùng hai operation chung với F09 là `saveEvidenceEntry` và `changeEvidenceEntry`. [Hợp đồng dùng chung](../../../packages/api-contracts/extension/evidence.yaml) · [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

**BR-03, AC-03/04.** Chuyên viên cùng đơn vị hoặc quản trị có thể duyệt hoạt động của người khác và ghi tổng tiền hỗ trợ. API nhận số nguyên VND ở dạng chuỗi và dùng cùng giới hạn với F05. Bỏ trống hoặc nhập 0 tương ứng với hồ sơ được duyệt không có khoản hỗ trợ. Hồ sơ tạo trước migration 0044 cũng có giá trị trống. Mỗi quyết định khóa bản ghi, so phiên bản, lưu số tiền hiện hành và audit trước/sau trong cùng giao dịch. Khi P03 bật, yêu cầu tính giờ thuộc giao dịch duyệt.

Trả bổ sung đưa hồ sơ về nháp. Từ chối có lý do đưa hồ sơ sang `REJECTED`, kết thúc lần kê khai. Thu hồi quyết định đã duyệt đưa hồ sơ về nháp, xóa số tiền đang có hiệu lực và đảo giờ đã ghi hoặc hủy yêu cầu đang chờ. Audit bảo toàn số tiền của lần duyệt trước. Thông tin này thể hiện tổng mức được duyệt. Kế toán thực hiện giải ngân theo quy trình của trường. [Migration 0044](../../../apps/backend/prisma/migrations/0044_activity_support/migration.sql) · [Ca nguồn](../../../apps/backend/test/db/activity-support.test.mjs)

Các phiếu giao việc gồm [US-29](../../../specs/029-web-submit-activity/tasks.md).
