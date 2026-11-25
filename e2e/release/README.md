# Diễn tập khôi phục cục bộ

| Thành phần | Điểm bắt đầu và kết thúc phép đo | Bằng chứng |
|---|---|---|
| PostgreSQL RMS và B01 | Tạo backup định dạng custom từ hai DB, phục hồi vào hai DB mới với role/quyền hiện hành, so số dòng và dấu vân tay toàn bộ bảng ứng dụng. Dấu SHA-256 nhận diện từng dump. | [Kết quả gần nhất](restore-result.json) · [Script đối chiếu](db-restore.py) |
| Kho S3 | Tạo bản phục hồi tách bucket nguồn, đọc tệp 1 và 6 MiB từ bucket đích, so SHA-256 với bản ghi đính kèm và số tài nguyên mỗi tenant thấy dưới role runtime. | [Ca S3 và DB](../../apps/backend/test/db/restore-objects.mjs) |
| IdP | Cấp hai danh tính theo realm, kiểm OTP, dừng nguồn, export hai realm, import sang DB Keycloak trống và đăng nhập lại. Hai subject giữ nguyên, bốn lượt đăng nhập xác minh chữ ký và audience. Thời gian từ trước export đến cuối lượt OTP sau phục hồi là 60,106 giây ở lượt có kiểm thêm luồng cấp tài khoản. | [Số đo và checksum](idp-result.json) · [Diễn tập Keycloak](keycloak-rehearsal.mjs) |
| Web tĩnh | Dựng bản `3949a2b` với lockfile tương ứng. Chromium lưu nháp trên bản cũ, mở lại trên bản ứng viên rồi trở về bản cũ tại cùng origin. SHA-256 của trang sau hồi lui khớp bản đầu và nháp vẫn đọc được qua cả ba lượt. | [Ba lượt mở](web-rollback-result.json) · [Ca Chromium](web-rollback.mjs) |

Với dữ liệu giả lập tĩnh, số ghi kiểm soát bị mất bằng 0. Các phép đo DB/kho, IdP và web chạy độc lập. Bản Git trước chỉ có web mô phỏng. Hồi lui API/worker qua migration, RPO theo chu kỳ backup, RTO toàn dịch vụ, quota và ký UAT cần môi trường pilot cùng phiên bản dịch vụ đã phát hành.

Để lặp lại ca web, dựng hai thư mục dist từ hai bộ source/lockfile, rồi chạy `RMS_BROWSER_CHANNEL=chrome node e2e/release/web-rollback.mjs /duong-dan/dist-cu /duong-dan/dist-moi ma-git-cu`. Ca dùng cổng loopback do hệ điều hành cấp.

Tại gốc repo, build theo lockfile. Để chạy DB và S3, cấu hình endpoint loopback SeaweedFS đã ghi ở hướng dẫn object store, rồi chạy `bash apps/backend/test/db/run.sh --rehearse`. Để chạy phần IdP, cấp đường dẫn bộ phân phối Keycloak vào `RMS_KC_ZIP`, JAR OTP vào `RMS_KC_OTP_JAR`, JDK 21 vào `JAVA_HOME`, khởi động Mailpit local và chạy `RMS_BROWSER_CHANNEL=chrome node e2e/release/keycloak-rehearsal.mjs`. Script dùng thư mục tạm riêng, xóa realm export chứa khóa sau khi hoàn tất. [Cấu hình IdP](../../infra/keycloak/README.md) · [Kho đối tượng](../../infra/object-store/README.md)

Để chạy thêm luồng cấp tài khoản từ web, chuẩn bị cùng ba biến môi trường Keycloak và chạy `RMS_BROWSER_CHANNEL=chrome bash apps/backend/test/db/run.sh --idp-ui` sau khi build. Harness dùng cluster riêng, web ở cổng 4197, API ở 3197 và IdP ở 8185. [Đối chiếu ID, quyền và số audit](provision-result.json)
