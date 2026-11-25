# US-28 · Dự án ứng dụng

Bộ PostgreSQL 26/26 ca và kịch bản Chromium với ba tài khoản đã qua. Người kê khai lưu hồ sơ 50.000.000 VND, mở lại và nhận lỗi khi gửi thiếu đối tác. Bổ sung một công ty rồi gửi lại trên cùng mã, trạng thái chuyển sang Chờ duyệt. Bản ghi lưu viện chủ trì và tổng tiền. Phép kiểm phòng thử độc lập xác nhận bảng khoản chi F05 có 0 dòng sau các thao tác.

API từ chối ghi thiếu viện. Khi quản trị tắt F11, cùng phiên đang đăng nhập nhận 404. Ca hai trường không trả bản ghi và ca DB kiểm theo tenant với vai trò runtime. Đối tác ngoài ở lát này được nhập theo tên. [Ca trình duyệt](acceptance.spec.ts) · [Ảnh dự án](../../../docs/reviews/screenshots/extension/du-an-ung-dung.png)

Lượt tích hợp ngày 24/11 có thêm quyết định của người thẩm định. Yêu cầu duyệt thiếu CONTRACT bị chặn. Sau khi trả có lý do, chủ nhiệm tải một PDF thử lên S3, chờ xác nhận và gửi lại. Quản trị duyệt đúng bản 50.000.000 VND, rồi thu hồi với lý do đính chính. Ca DB kiểm ba sự kiện audit riêng, người kê khai tự duyệt bị chặn, lần thu hồi lặp trả xung đột. [Ảnh quyết định](../../../docs/reviews/screenshots/extension/duyet-du-an-ung-dung.png)

## Nghiệm thu và ghi giờ

Chủ nhiệm, quản trị, thư ký và người ngoài trường đăng nhập qua OTP. Chủ nhiệm khai thư ký 30%. Sau khi duyệt hợp đồng, quản trị kiểm dự án chưa phát sinh yêu cầu giờ. Chủ nhiệm gửi thiếu biên bản nhận thông báo về `ACCEPTANCE_MINUTES`, rồi tải biên bản riêng lên S3 và gửi lại. Quản trị xác nhận. Worker chạy hai lần, lần đầu ghi hai dòng và lần sau ghi thêm 0 dòng. Hồ sơ hiển thị 14 giờ cho chủ nhiệm, 6 giờ cho thư ký. Thu hồi có lý do đưa tổng kỳ trên lý lịch của thư ký từ 6 về 0. [Kịch bản bốn phiên](acceptance.spec.ts) · [Ảnh kết quả](../../../docs/reviews/screenshots/extension/ket-qua-gio-f11.png)

Ca PostgreSQL kiểm thêm mốc duyệt kê khai với hợp đồng 350 triệu đồng, bậc 60 giờ và phân bổ 42/18. Hai giao dịch cùng xác nhận chỉ có một giao dịch thành công. Ca còn kiểm đổi quy tắc minh chứng trong khi chờ xác nhận, cận tiền đúng 50 triệu đồng, chặn hai bậc chồng lấn, lưu lại bằng client cũ, thu hồi khi P03 tắt và yêu cầu tệp mới ở lần tái duyệt. [Ca PostgreSQL](../../../apps/backend/test/db/applied-hours.test.mjs)

TC-03 dùng danh mục B01 `EXTERNAL_PARTNER`. Người kê khai chọn mã WATER và nhập thêm một viện ngoài danh mục. Sau khi gửi, cả hai tên xuất hiện trên cùng hồ sơ. [Ảnh bước gửi](../../../docs/reviews/screenshots/extension/du-an-ung-dung.png)
