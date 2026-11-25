# Bàn giao cấu hình pilot

Manifest liệt kê tiến trình, điểm vào, giới hạn và tên biến cần cấp. Tạo bộ tham chiếu riêng trong secret manager cho từng profile. Client web chỉ nhận địa chỉ HTTPS công khai của B01. Credential migrate dùng kết nối direct trong job riêng. API dùng role runtime trên pool giao dịch, worker dùng role worker. B01 dùng DB riêng và role thành viên rms_config_runtime. [Manifest](environment.json)

Ở gốc monorepo, dùng phiên bản Node trong .nvmrc, cài theo lockfile và chạy pnpm build. Đóng gói API với bundle Nest, phụ thuộc workspace và entry api.mjs. Định tuyến /api tới function, /app/* về index.html, giữ nguyên các đường dẫn asset. Warm invocation dùng lại Nest app và pool. Build web với VITE_RMS_CONFIG_ORIGIN là origin công khai riêng của B01. TLS kết thúc tại ingress B01. Cho phép body JSON 28 MiB, multipart 21 MiB, form URL-encoded 61 MiB ở ingress. Sau giải mã, service kiểm đúng 20 MiB cho mọi định dạng. [Entry cho function](api.mjs)

Ops cấp rms_config_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS tại cluster B01. Tạo login runtime thành viên role này, login migration riêng làm chủ DB và chạy lần lượt các migration chưa áp dụng trong `apps/sys-config-service/db/` theo thứ tự số bằng kết nối direct. Dùng Redis riêng theo môi trường với TLS và ACL. Hai dịch vụ API và B01 cùng nhận secret ngẫu nhiên ít nhất 32 ký tự từ secret manager. Cấp quyền ghi shared bằng bản ghi catalog_operator khớp ID tenant và account do Ops đối chiếu với issuer và subject. Ghi phiếu cấp/thu hồi quyền ở sổ vận hành. Realm có cả hai audience. [Migration B01](../../apps/sys-config-service/db/) · [Hướng dẫn IdP](../keycloak/README.md)

Callback từng realm là https://<web-host>/app/<slug>, webOrigins là đúng origin đó. Cấu hình RMS_WEB_ORIGIN cho CORS tại B01. Gắn DB, SMTP, bucket, Redis và realm của chính môi trường. Tại preview chưa đăng ký, chỉ phục vụ dữ liệu mô phỏng hoặc tắt đăng nhập. Ở pilot, giới hạn truy cập dashboard của IdP, Redis, DB và kho file qua mạng vận hành.

## Phiếu kiểm tại môi trường được cấp

| Bên thực hiện | Phép kiểm | Chứng cứ cần điền |
|---|---|---|
| Ops / DBA | So secret refs preview và pilot, thử kết nối bằng runtime và direct. Xác minh sslmode, role và pool timeout. | Mã môi trường, vùng, ngày và kết quả đã che credential |
| QA / IAM | OTP hai realm. Từ web tải 6 MiB, so SHA-256. Tải 20 MiB + 1 byte, kiểm 413 và số row. Lặp RV-02 qua cache. | Mã ca, response, checksum, thời lượng |
| Ops / PO | Chụp quota egress, storage, function, CPU, SMTP và hóa đơn theo gói đã cấp. | Ngày đo, quota, mức tiền theo hợp đồng, người chịu chi phí |
| Ops / QA | Khôi phục DB RMS, DB B01, IdP và bucket phiên bản vào môi trường riêng theo N14. | Lần backup, checksum, RPO/RTO thực đo và ký duyệt |

Bằng chứng local dùng Keycloak, PostgreSQL, Redis, Mailpit và SeaweedFS. Chưa có hostname, credential và xác nhận quota cho pilot trong lần chạy này. [Nhật ký triển khai](../../docs/reviews/trien-khai-rms.md)

Khi thử F02 ở tenant local mới, chạy psql bằng credential migration với tham số tenant_id tới seed-intake.sql để tạo một lĩnh vực, biểu mẫu hai trường và bộ tiêu chí minh họa. Mở **Cấu hình quy trình** trong app bằng admin và kích hoạt mẫu trước khi tạo hồ sơ F01. Pilot dùng danh mục do trường duyệt. [Seed local](seed-intake.sql)

Để dùng mẫu thông báo theo kênh, áp migration RMS 0047 trước khi chuyển API và worker sang phiên bản đọc nội dung đã render. Khi nghiệm thu, quản trị sửa một mẫu, gửi một sự kiện tới relay thử và đối chiếu tiêu đề, nội dung, người nhận và Message-ID. Chọn một tin nằm trong hàng đợi từ trước lúc nâng cấp để kiểm đường đọc dữ liệu cũ. [Migration](../../apps/backend/prisma/migrations/0047_notification_templates/migration.sql) · [Phép giao SMTP cục bộ](../../apps/worker/test/mailpit.mjs)

## Kết nối relay SMS

Trước migration 0048, dừng các worker chạy bản cũ. Áp migration rồi khởi động worker đã hỗ trợ SMS. Khi rollback ứng dụng, giữ worker hỗ trợ SMS hoạt động cùng schema 0048. Chỉ chuyển về worker cũ sau khi đã ngừng tạo SMS ở mọi trường, xử lý hết các lượt có thể gửi lại và khôi phục schema tương thích. Cấp riêng cho worker biến `RMS_SMS_GATEWAY_URL` và `RMS_SMS_GATEWAY_TOKEN`. Khi cả hai biến đều để trống, worker hoãn SMS năm phút và vẫn xử lý email, hộp tin. [Migration](../../apps/backend/prisma/migrations/0048_notification_sms/migration.sql)

Relay của đơn vị nhận HTTPS POST, header Bearer và `Idempotency-Key` bằng UUID của lượt giao. JSON có hai trường `to` (số quốc tế) và `text` (nội dung SMS). HTTP 202 xác nhận đã nhận, 429 xác nhận quá tải trước tiếp nhận, 400/401/403/404/413/415/422 xác nhận từ chối. Với phản hồi khác, timeout hoặc mất kết nối, Ops tra mã lượt giao và xác nhận kết quả trước khi phát lại. Thống nhất với nhà cung cấp thời gian giữ khóa chống trùng, cách tra biên nhận, số phân đoạn tin tiếng Việt và chi phí. Chỉ cổng thử trên loopback được dùng HTTP. [Adapter](../../apps/backend/src/modules/notification/sms.ts) · [Ca chạy local](../../apps/backend/test/db/notice-sms.test.mjs)

## Kiểm lịch đóng kỳ F02

Áp migration 0049 trước khi chạy worker mới. Worker quét khi khởi động rồi khoảng một phút một lần, trong cùng tiến trình với hàng đợi thông báo. Với một kỳ thử đã qua ngày kết thúc, đối chiếu trạng thái CLOSED, phiên bản tăng một và đúng một dòng audit CALL_CLOSED mang `actor_service=call-expiry-worker`. Nếu màn hình chuyên viên còn ghi **Đã mở**, kiểm tiến trình worker, migration trên DB đích, tình trạng khóa dòng và thời điểm lượt quét. F01 kiểm hạn nộp ngay ở từng yêu cầu. [Hàm đóng kỳ](../../apps/backend/prisma/migrations/0049_call_expiry/migration.sql) · [Ca chạy bằng worker thật](../../e2e/call/open-call/expiry.spec.ts)
