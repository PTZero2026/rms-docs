---
title: "Thiết kế B04 · notification"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Thông báo · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02, BR-03, BR-05, BR-06, BR-08 | AC-01, AC-02, AC-03, AC-08, AC-09, AC-10 | Khi nhận event đã commit, tạo tin in-app cho người nhận. Tính các kênh giao từ ma trận tenant, mức ưu tiên, tùy chọn cá nhân và cờ bắt buộc. Chọn mẫu theo eventType/kênh, dùng mẫu mặc định khi thiếu. |
| BR-04, BR-07 | AC-04, AC-05, AC-07 | Nhắc hạn lấy từ kỳ F04 còn hiệu lực. Unique (tenant, đề tài, kỳ, mốc, người nhận) cho tin logic và một dòng giao cho mỗi kênh. Worker claim lease, lưu số lần thử, backoff và lỗi cuối. Replay tiếp tục đúng dòng. |
| BR-09, BR-10 | AC-06 | Truy vấn IN_APP theo tenant và recipientId từ phiên. Mở chi tiết cập nhật READ có điều kiện, mở lại giữ cùng readAt. Đếm chưa đọc từ cùng tập sau commit. Bộ lọc Chưa đọc thuộc URL danh sách. |

Module `notification` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/notification/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-16](../../../specs/016-shared-deadline-reminder/tasks.md), [US-34](../../../specs/034-mobile-read-inbox/tasks.md).

## Giữ bộ lọc hộp thư

| Truy vết | Hành vi |
|---|---|
| BR-11, AC-11 | Cập nhật theo tenant, recipientId và id trong một giao dịch, danh sách và tổng cùng phạm vi. |

**BR-05/10 và AC-05.** BO-03 dùng quyền B03 `notifications.send`. Truy vấn kiểm vai trò hiện hành và đơn vị đề tài nguồn. Quản trị có phạm vi trường. Một lệnh gửi lại mang danh sách ID cùng phiên bản của từng lượt. Giao dịch khóa theo thứ tự ID, chỉ chuyển email lỗi xác định về hàng đợi, ghi một audit cho mỗi lượt và hoàn tác cả nhóm khi có dòng đã thay đổi hoặc ngoài phạm vi. Thư chưa xác định kết quả đi qua đối soát vận hành bằng Message-ID. [Hợp đồng](../../../packages/api-contracts/notification/deliveries.yaml) · [Hàm cơ sở dữ liệu](../../../apps/backend/prisma/migrations/0039_delivery_resend/migration.sql)

Với AC-06/TC-22, lỗi tải danh sách được xử lý ngay trong hộp thông báo. **Thử lại** đọc cùng bộ lọc và vị trí phân trang qua API của phiên hiện tại. Khi lỗi kết nối hoặc dịch vụ phục hồi, số chưa đọc đến từ chính phản hồi mới. [Ca trình duyệt](../../../e2e/notification/deadline-reminder/acceptance.spec.ts)

## Mẫu thông báo và quyền trên hồ sơ nguồn

Với BR-05 và AC-10, BO-01 đọc, xem trước và cập nhật mẫu theo trường, mã sự kiện và kênh. Migration 0047 hỗ trợ IN_APP và EMAIL. Migration 0048 bổ sung SMS cho sự kiện ưu tiên cao. Quản trị lưu được mẫu, chuyên viên được đọc và xem trước. BO-01 dùng chung tiêu đề và phiên bản với ma trận kênh hiện có. Lưu từ phiên bản cũ trả 409. Khi gỡ mẫu của một kênh, B04 ghi rõ trạng thái thiếu mẫu. Khi trường chưa từng chỉnh, B04 dùng mẫu ban đầu của loại sự kiện. [Hợp đồng](../../../packages/api-contracts/notification/templates.yaml)

Khi tạo sự kiện, trigger ghi tiêu đề và nội dung đã thay biến trên từng lượt giao. Biến trong giá trị nguồn được giữ nguyên dưới dạng văn bản. Hộp thư và worker đọc lại quyền trên đề tài trước khi trả nội dung chứa dữ liệu nguồn. SMTP cũng đọc lại trạng thái tài khoản và email hiện hành. Thiếu mẫu dùng nội dung chung và đặt cờ cảnh báo ngay trên lượt giao. Bản ghi cũ trước migration 0047 giữ đường đọc tương thích. [Migration](../../../apps/backend/prisma/migrations/0047_notification_templates/migration.sql) · [Ca PostgreSQL](../../../apps/backend/test/db/notice-templates.test.mjs)

## SMS ưu tiên cao

Migration 0048 bổ sung kênh SMS vào ma trận, tùy chọn cá nhân, trình soạn mẫu và bảng giao. Năm sự kiện có SMS mặc định theo bảng §3 của spec. Trường có thể bật kênh ở các sự kiện ưu tiên cao khác. API từ chối bật SMS cho sự kiện thường, và hàm xếp hàng vẫn kiểm độ ưu tiên nếu dữ liệu cấu hình cũ chứa giá trị sai. Tùy chọn cá nhân cho SMS độc lập với email bắt buộc. [Migration](../../../apps/backend/prisma/migrations/0048_notification_sms/migration.sql)

Worker kiểm lại quyền xem nội dung, chính sách kênh, tài khoản và số điện thoại ngay trước khi giao. Với số Việt Nam dạng nội địa hợp lệ, B04 đổi tiền tố 0 sang +84. Số quốc tế giữ mã nước. Gateway nhận nội dung văn bản và mã lượt giao dùng làm khóa chống trùng. HTTP 202 ghi nhận tiếp nhận, 429 thử lại theo B01, lỗi từ chối xác định chuyển sang lỗi và phản hồi không rõ kết quả chuyển đối soát. Khi thiếu cấu hình gateway, giữ hàng đợi và kiểm lại sau 5 phút. [Giao thức gateway](../../../apps/backend/src/modules/notification/sms.ts) · [Phiếu vận hành](../../../infra/pilot/README.md#kết-nối-relay-sms)
