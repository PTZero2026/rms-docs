# Kho tệp minh chứng

Nest sử dụng một bucket S3 private. Cấp cho API quyền POST/Put, Get và Delete trên prefix `quarantine/`, Put, Get và Delete trên `files/`. Tách bucket và credential giữa local, preview và pilot. Cấu hình `RMS_S3_BUCKET`, `AWS_REGION` và credential bằng cơ chế của AWS SDK. Với dịch vụ tương thích S3, đặt thêm `RMS_S3_ENDPOINT`. CORS cho phép POST trực tiếp từ đúng origin web của môi trường.

1. Client tính SHA-256, gửi metadata, project ID và version hiện tại tới operation createFileIntent. Giới hạn 20 MiB. Backend kiểm quyền của actor trên đề tài và trả URL + fields có hiệu lực 5 phút.
2. Browser đưa các fields vào FormData rồi thêm phần file ở cuối và POST trực tiếp tới bucket. Policy giới hạn key staging, MIME và dung lượng khai báo.
3. Client gọi finalizeFile. Backend kiểm lại actor đã tạo intent, project version và quyền, xác nhận byte thực tế, dung lượng, MIME và checksum, rồi ghi bản private đã xác nhận. Retry cùng intent trả lại cùng ID.
4. getFileDownload kiểm quyền hiện tại trước khi ký GET 60 giây. URL đã phát còn dùng được đến TTL. Đặt lifecycle hết hạn cho prefix quarantine sau một ngày để dọn cả các POST đang truyền khi intent hết hạn. Lịch Ops theo từng tenant chạy `node apps/backend/scripts/clean-staging.mjs <slug>` sau build. Lệnh giữ tệp đã gắn, xóa cả bản đích mồ côi nếu giao dịch finalize bị rollback sau khi ghi S3.

QA đã chạy native SeaweedFS 4.55 trên 127.0.0.1:8333 với credential tạm và bucket riêng mỗi lượt. Đặt `RMS_S3_ENDPOINT=http://127.0.0.1:8333`, credential của kho thử và `AWS_REGION=us-east-1` trước `corepack pnpm test:db` để chạy ca S3. Đối chiếu policy bucket và cấu hình CORS của nhà cung cấp khi thực hiện N11. [Ca upload và cleanup](../../apps/backend/test/db/attachments.test.mjs)
