---
title: "Thiết kế F02 · call"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Kỳ nhận đề xuất · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02 | AC-01, AC-05 | Validate khoảng ngày, đặt unique trên mã kỳ toàn hệ thống theo BR-02. Truy vấn dữ liệu và lỗi trả về giữ phạm vi tenant. Tạo nháp riêng với thao tác mở. |
| BR-03, BR-04, BR-05, BR-08 | AC-02, AC-03, AC-04, AC-08 | Khi mở kiểm lại tham chiếu còn ACTIVE và ghim revision. Cùng predicate OPEN và khoảng ngày Việt Nam cho tra cứu mobile và F01. Dùng quyền của phiên trước khi lọc. Job đóng kỳ và lệnh đóng tranh chấp theo version. |
| BR-06, BR-07 | AC-06, AC-07 | Khóa dòng kỳ trước khi sửa/hủy và lúc nhận đề xuất. Kiểm hồ sơ từ SUBMITTED trở đi theo BR-07 khi xét hủy. Gia hạn kỳ đã đóng cập nhật hạn tương lai và trạng thái trong cùng transaction có audit. |

Module `call` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/call/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-05](../../../specs/005-web-open-call/tasks.md), [US-35](../../../specs/035-mobile-find-open-call/tasks.md).

## Tra kỳ trên điện thoại

| Truy vết | Hành vi |
|---|---|
| BR-09, AC-09 | Dùng cùng điều kiện ngày với F01, áp scope trước lọc và trước mở chi tiết. |

**Căn cứ mở lại hoặc hủy kỳ (BR-06/07).** API kiểm phiên bản của kỳ trong giao dịch có khóa. Khi hủy hoặc mở lại kỳ đã đóng, yêu cầu lý do trước khi cập nhật. Nhật ký CALL_EXTENDED và CALL_CANCELLED lưu hạn cũ, hạn mới và lý do. [Ca PostgreSQL](../../../apps/backend/test/db/call.test.mjs)

## Đóng kỳ sau ngày hết hạn

F01 và danh sách **Đang nhận** kiểm hạn theo ngày Việt Nam ở mỗi yêu cầu. Worker F02 kiểm các trường đang hoạt động khi khởi động và khoảng một phút mỗi lượt. Mỗi giao dịch của một trường lấy tối đa 200 kỳ OPEN đã qua ngày kết thúc, theo thứ tự hạn rồi đến ID. Dòng đang được chỉnh sửa sẽ được xét lại ở lượt sau. Cập nhật CLOSED, tăng phiên bản và ghi CALL_CLOSED vào P02 cùng thành công hoặc cùng hoàn tác. Nhật ký giữ hạn nhận và định danh dịch vụ `call-expiry-worker`. [Migration 0049](../../../apps/backend/prisma/migrations/0049_call_expiry/migration.sql) · [Worker F02](../../../apps/backend/src/modules/call/expiry.ts)

Worker chỉ có quyền gọi hàm đóng kỳ trong tenant. Hàm giới hạn mốc xét bằng đồng hồ DB và kiểm tenant còn hoạt động. Nếu chuyên viên gia hạn trước khi worker lấy khóa, lần quét sau dùng hạn mới. Nếu worker đóng trước, lệnh sửa từ màn hình cũ nhận 409. [Ca tranh chấp và hoàn tác](../../../apps/backend/test/db/call-expiry.test.mjs)

F01 trả `submitUntil` trên bản nháp người dùng có quyền nộp. Giá trị là mốc UTC của 00:00 ngày kế tiếp tại Việt Nam khi kỳ đang nhận, còn lại là null. Màn hình đặt hẹn giờ theo mốc này. Sau xung đột lúc nộp, F01 đọc lại bản hiện hành. Điểm nộp tiếp tục khóa kỳ và kiểm trạng thái, hạn và phiên bản trong giao dịch. [Hợp đồng F01](../../../packages/api-contracts/proposal/draft-proposal.yaml) · [Kiểm trên tab đã mở](../../../e2e/call/open-call/expiry.spec.ts)
