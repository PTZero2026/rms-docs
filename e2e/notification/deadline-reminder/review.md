# US-16 · Nhắc hạn báo cáo

Ngày 24/11/2026, thử trên PostgreSQL 16, B01 với DB riêng, worker, Keycloak, Mailpit và Chromium cục bộ.

| Ca | Kết quả quan sát |
|---|---|
| TC-01 | Đặt hạn 10/12, B01 của trường đặt N = 7. Lúc 16:59:59 UTC ngày 02/12 chưa phát. Tại 17:00:00 UTC, chủ nhiệm nhận tin ghi kỳ 2 và ngày 10/12. Đề tài tạm dừng và kỳ đã duyệt được bỏ qua. |
| TC-02 | Hai transaction cùng quét nhận số sự kiện lần lượt là 0 và 1 theo thứ tự hoàn tất. Quét lại không tạo thêm. Quá hạn dùng mốc riêng và cũng chỉ phát một lần. |
| TC-03 | Bộ thử trả SMTP 451 trước khi chấp nhận thư. Bản giao trong ứng dụng đã thành công. Sau backoff mô phỏng, cùng event có SMTP sent/2, in_app sent/1. Vòng trình duyệt dùng SMTP Mailpit thật. |
| TC-04 | Chạy cùng đồng hồ ở trường khác cho 0 sự kiện của trường nguồn. Cùng trường khác người và khác trường đều trả 404 khi mở riêng ID tin. Credential của người dùng không có quyền thực thi hàm enqueue. |

Đường chạy thực tế gồm [kiểm cạnh tranh và SMTP](../../../apps/backend/test/db/reminders.test.mjs), [fixture B01/F04 và worker](../../../apps/backend/test/db/seed-reminder-case.mjs) và [kiểm qua trình duyệt](acceptance.spec.ts). Lát này quan sát SMTP và IN_APP. Phần SMS và tùy chọn cá nhân được đối chiếu ở các ca theo kênh bên dưới. Việc đổi người phụ trách sau giao còn cần đối chứng với danh sách phân công của trường.

## B04/TC-22 · Khôi phục danh sách chưa đọc

Trên Chrome 360 px, chủ nhiệm có hai tin chưa đọc. Bộ kiểm trả 503 giả lập cho lần đầu mở bộ lọc **Chưa đọc**. Ở bản cũ, ca kiểm dừng vì thiếu nút **Thử lại**. Trên bản sửa, chủ nhiệm vẫn mở và đóng được tùy chọn nhận thông báo trong lúc danh sách lỗi. Một lần bấm **Thử lại** gửi đúng một yêu cầu đọc nữa cho cùng bộ lọc. API thật trả hai tin chưa đọc, URL giữ nguyên và thông báo lỗi biến mất. Mở tin nhắc kỳ 2 sau đó làm số chưa đọc giảm còn một. [Kịch bản](acceptance.spec.ts) · [Ảnh tại thời điểm gián đoạn](../../../docs/reviews/screenshots/notifications/thu-lai-hop-thu.png)

## B04/TC-17 · Mẫu theo kênh

Quản trị thử một biến ngoài danh sách và nhận lỗi ngay khi xem trước. Với biến hợp lệ, bản xem trước cho tiêu đề và nội dung theo ngày Việt Nam. Quản trị lưu hai mẫu cho cùng sự kiện rồi gỡ riêng mẫu trong ứng dụng. Chuyên viên xem được trạng thái thiếu mẫu, API ghi trả 403 cho vai trò này. Khi quản trị bị hạ xuống người dùng cơ bản, yêu cầu tải lại gỡ mẫu đang xem. [Ca Chrome](../preferences/templates.spec.ts) · [Ảnh xem trước](../../../docs/reviews/screenshots/notifications/xem-truoc-mau.png)

Trong ca PostgreSQL, tin đã xếp hàng giữ nội dung cũ dù quản trị vừa thay hoặc gỡ mẫu. Sự kiện mới sau khi gỡ tạo một lượt IN_APP có cờ thiếu mẫu và nội dung chung. Email cùng sự kiện vẫn nhận mẫu SMTP. Khi chuyển chủ nhiệm xuống vai trò người dùng trước lúc giao, dữ liệu đề tài bị ẩn. Đường SMTP production đã gửi thư qua Mailpit và đối chiếu người nhận, Message-ID, tiêu đề có tên đề tài và nội dung có ngày hạn. [Ca quyền và dữ liệu](../../../apps/backend/test/db/notice-templates.test.mjs) · [Ca SMTP](../../../apps/worker/test/mailpit.mjs)

Sau khi mẫu trong ứng dụng được lưu, bộ kiểm phát sự kiện nhắc quá hạn cho kỳ 4 của đề tài “Chất lượng nước hồ”. Quản trị gỡ mẫu rồi chuyên viên mở lại tin vừa tạo qua đăng nhập theo trường. Hộp thư hiện “Nhắc kỳ 4” và “Chất lượng nước hồ · hạn 09/12/2026”. [Ảnh đọc tin](../../../docs/reviews/screenshots/notifications/tin-theo-mau.png)

## B04/TC-05, TC-06 và TC-18 · SMS theo mức ưu tiên

Ngày 25/11/2026, ca PostgreSQL dùng hai tài khoản cùng trường, trong đó một tài khoản thiếu số điện thoại. Khi phát sự kiện ưu tiên thường, cả hai nhận lượt trong ứng dụng và email. Dù cấu hình cũ có bật SMS, số lượt SMS bằng 0. Sự kiện giao đề tài ưu tiên cao tạo đúng một SMS cho số hợp lệ. Gateway loopback nhận đúng số thử, nội dung sau khi thay biến và UUID của lượt giao. Tắt kênh toàn trường hoặc tắt tùy chọn cá nhân đều ngăn xếp lượt mới. Rút tùy chọn hoặc xóa số khi đang chờ khiến worker bỏ qua lượt đó. Sau HTTP 422, lệnh gửi lại giữ nguyên UUID. Với 429 worker xếp thử lại, còn 503 chuyển sang đối soát. [Ca PostgreSQL và gateway](../../../apps/backend/test/db/notice-sms.test.mjs)

Trên Chrome, người dùng mở lại nhóm nghiệm thu và thấy tùy chọn SMS đã lưu. Email bắt buộc vẫn được bật. Quản trị lưu và xem trước mẫu SMS, sau đó tắt kênh ở trường. Khi người dùng mở lại nhóm, công tắc SMS bị khóa và giải thích đúng nguyên nhân. [Ca Chrome](../preferences/sms.spec.ts) · [Ảnh tùy chọn trên điện thoại](../../../docs/reviews/screenshots/notifications/tuy-chon-sms.png)

Trong lượt chạy CLI, worker lấy lượt SMS từ PostgreSQL bằng role riêng và đẩy qua HTTP tới gateway loopback. Đối chứng đúng số tổng hợp, nội dung mặc định, UUID và trạng thái `sent` với một lần thử. Cùng lượt chạy đã đối chiếu hai mẫu SMTP qua Mailpit. [Kịch bản tiến trình worker](../../../apps/worker/test/mailpit.mjs)
