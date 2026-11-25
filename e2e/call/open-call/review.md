# US-05 · Mở kỳ tiếp nhận

| Ca | Quan sát |
|---|---|
| TC-01 | Chuyên viên lưu nháp, nhà nghiên cứu tra Đang nhận chưa thấy. Sau khi mở thành công, cùng tác nhân tìm được mã không phân biệt hoa thường và đọc đúng tên biểu mẫu. |
| TC-02 | Ngày kết thúc trước ngày bắt đầu trả 400. Tạo lại với cùng mã và khoảng ngày hợp lệ thành công, chứng minh lệnh lỗi chưa chiếm mã. |
| TC-03 | Ca DB lần lượt ngừng lĩnh vực, bộ tiêu chí rồi mở cùng bản nháp. Mỗi lần mở bị từ chối. Ca Chrome thay bộ tiêu chí hết hiệu lực bằng bộ hiện hành, mở lại đúng mã thành công. |
| TC-04 | Trường B tra thẳng ID kỳ A nhận 404. Người không có quyền quản lý không thực hiện được lệnh đóng kỳ. |

Bảng thời gian cố định của phép thử PostgreSQL kiểm hai thời điểm cách nhau một mili giây khi ngày cuối chuyển sang ngày mới tại Việt Nam. Chrome dùng ngày hiện tại của lượt chạy để ảnh hướng dẫn phản ánh một kỳ còn hạn. [Ca DB](../../../apps/backend/test/db/call.test.mjs) · [Ca Chrome](acceptance.spec.ts) · [Hướng dẫn](../../../docs/guides/nguoi-dung/chuyen-vien-mo-ky.md)

## F02/AC-04 và TC-06 · Đóng kỳ quá hạn

Trước migration 0049, kỳ quá hạn đã biến mất khỏi **Đang nhận** nhưng vẫn ở trạng thái OPEN khi chuyên viên xem **Tất cả**. Worker chưa thực hiện chuyển trạng thái. Ca PostgreSQL viết trước thay đổi dừng vì thiếu hàm đóng kỳ. [Kịch bản PostgreSQL](../../../apps/backend/test/db/call-expiry.test.mjs)

Đặt hạn 30/11, lần quét lúc 23:59:59.999 giờ Việt Nam đóng 0 kỳ. Lúc 00:00 ngày 01/12, hai worker xử lý cùng lúc trả tổng cộng 1, phiên bản tăng từ 1 lên 2 và có đúng 1 audit. Giao dịch bị hủy hoàn tác cả trạng thái lẫn audit. Một giao dịch gia hạn giữ khóa khiến lượt quét bỏ qua kỳ và lần sau đọc hạn đã gia hạn. Với 201 kỳ quá hạn, hai lượt xử lý 200 rồi 1, lượt thứ ba trả 0 và có 201 audit cho 201 kỳ. [Migration](../../../apps/backend/prisma/migrations/0049_call_expiry/migration.sql)

Chuyên viên đã mở kỳ bằng API F02, chủ nhiệm tạo nháp trong kỳ. Bộ kiểm đặt hạn của kỳ thử về hôm qua rồi chạy tiến trình worker thật. API từ chối lần nộp của chủ nhiệm với HTTP 409. Lệnh đóng từ màn hình cũ của chuyên viên cũng nhận thông báo xung đột. Chuyên viên mở lại mã kỳ, thấy **Đã đóng**, điền hạn tương lai và lý do. Chủ nhiệm nộp thành công chính bản nháp trước đó và nhận mã. [UAT Chrome](expiry.spec.ts) · [Ảnh trạng thái sau khi đóng](../../../docs/reviews/screenshots/calls/ky-tu-dong-dong.png)

**F01 trên tab chủ nhiệm.** API trả thời điểm hết nhận hồ sơ theo UTC. Ca DB kiểm ngày hết hạn 30/11 kết thúc đúng 17:00 UTC và không còn mốc cho phép nộp từ thời điểm đó. Ca trình duyệt rút ngắn riêng mốc trả về cho một lần đọc để quan sát nút chuyển từ bật sang khóa trong cùng tab. Ca này từng dừng ở bước nút vẫn bật. Sau đó khôi phục API thật và kiểm một màn hình đang mở trước khi worker đóng kỳ, một lần mở hồ sơ đã hết hạn, và nộp cùng bản nháp từ giao diện sau gia hạn. [Ca PostgreSQL F01](../../../apps/backend/test/db/proposals.test.mjs) · [Ảnh của chủ nhiệm](../../../docs/reviews/screenshots/calls/chu-nhiem-het-han.png)
