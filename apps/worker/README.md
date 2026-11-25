# Worker thông báo

Chạy migration bằng credential của DBA trước khi khởi động. Cấp role `rms_worker` cho login dùng ở `WORKER_DATABASE_URL`. Truy vấn giao thư chỉ trả ID tenant có việc đến hạn. Worker mượn kết nối, đặt context trong transaction và claim một bản giao. Mỗi sự kiện có tối đa một bản giao cho mỗi người nhận và kênh.

`corepack pnpm --filter @rms/backend build` biên dịch bộ xử lý. `corepack pnpm --filter @rms/worker start` chạy liên tục. `node apps/worker/src/main.mjs --once` xử lý tối đa một bản giao. Đặt `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` và credential tương ứng. Local dùng Mailpit. Ngoài host thử cục bộ worker yêu cầu TLS.

Khi SMTP báo lỗi tạm thời trước khi nhận thư, worker dùng giới hạn số lần thử và thời gian chờ của trường. Mặc định tương thích là năm lần, chờ 10 giây sau lần đầu rồi nhân đôi đến tối đa 900 giây. Nếu mất phản hồi sau khi gửi hoặc lease SMTP hết hạn, trạng thái chuyển sang `reconcile`. Ops dùng connection được cấp `rms_dispatch_ops`, chạy `SELECT * FROM rms.delivery_failures($1)` với tham số ID tenant. Đối chiếu Message-ID (ID bản giao đặt trong dấu ngoặc nhọn với domain rms.invalid) và header X-RMS-Event tại relay. Gọi `SELECT rms.review_delivery($1,$2,$3,$4)` với tenant, ID bản giao, kết luận và mã bằng chứng. Dùng `confirmed-delivered` khi relay đã nhận, hoặc `confirmed-not-delivered` để cho phép retry. Hệ thống giữ danh tính DB của người đối soát, kết luận và căn cứ. Từ event_id truy về outbox.audit_id và nguồn phát lệnh.

## Lịch nhắc tiến độ

Đặt cùng secret riêng ngẫu nhiên ít nhất 32 ký tự vào RMS_REMINDER_SERVICE_SECRET của B01 và worker, cấp RMS_CONFIG_ORIGIN cho worker (HTTPS hoặc loopback khi thử). Đặt PROGRESS.REMINDER_DAYS_BEFORE_DUE tại B01 thành số nguyên 0–365, theo ngày Việt Nam. Khi có đủ cấu hình, worker quét các tenant đang bật mỗi 15 phút; tenant thiếu mốc được đếm trong missing. Lỗi đọc cấu hình riêng một trường tăng failed và được thử lại vòng sau. Quét lịch chạy độc lập với lấy bản giao SMTP. Khi quá hạn, báo thêm cho chuyên viên đã xác nhận giao nếu tài khoản còn hoạt động đúng khoa. Nếu cơ sở chỉ định cán bộ mới sau khi giao, cần nối nguồn phân công hiệu lực của cơ sở.

## Chính sách thử lại email

Dịch vụ B01 và worker dùng `RMS_REMINDER_SERVICE_SECRET` hiện có của B04 cho đường đọc nội bộ `/internal/notifications/{tenant}/retry-policy`. Token này chỉ đọc các cấu hình worker tương ứng. Quản trị nhập `notification.maxRetry` (1–20 lần, tính cả lần đầu) và `notification.retryBaseSeconds` (1–900 giây). Khóa thiếu hoặc ngừng hiệu lực dùng mặc định 5 lần và 10 giây. Tiến trình gửi độc lập chưa nối B01 dùng cùng giá trị mặc định.

Khi đã nối B01 mà dịch vụ gián đoạn, worker trả thư về hàng đợi trong 30 giây và hoàn lại lượt thử chưa gọi SMTP. Thư trong ứng dụng vẫn xử lý được. Thư bị từ chối vĩnh viễn chuyển sang lỗi, trạng thái xác nhận chưa rõ đi qua đối soát. Nhật ký web cho phép chuyên viên gửi lại lỗi xác định thuộc đề tài trong phạm vi.
