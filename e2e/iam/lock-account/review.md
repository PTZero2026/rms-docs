# US-01 · Hai yêu cầu đầu tiên sau khi khóa

| Ca | Đối chiếu trên local |
|---|---|
| TC-01 | Quản trị A khóa nhân sự A qua giao diện. HTTP 200, isActive=false, event có actorId là quản trị. Gửi lại lệnh có cùng event ID trong ca DB. |
| TC-02 | Tài khoản thường gửi lệnh khóa, API trả 403. Tài khoản đích vẫn lưu được họ tên trước lúc admin khóa. |
| TC-03 | Vòng một khóa rồi chọn tải lại, GET hồ sơ là request nghiệp vụ đầu tiên sau khóa và trả 403. Mở khóa, đọc lại họ tên, sửa trên màn hình nhưng chưa lưu. Vòng hai khóa lại rồi bấm lưu, PATCH đầu tiên trả 403. Người có quyền đọc tên cũ, revision vẫn là 1. DB có đúng một PROFILE_UPDATED từ lần lưu trước khóa. |
| TC-04 | Quản trị B dùng ID của A tại đường dẫn B nhận 404. |

Ca DB cho hai admin khóa nhau đồng thời. Chỉ một người khóa thành công. Lệnh còn lại đọc lại trạng thái người gửi và nhận 403. [Ca DB](../../../apps/backend/test/db/lock-account.test.mjs) · [Ca Chrome](acceptance.spec.ts) · [Hướng dẫn](../../../docs/guides/nguoi-dung/quan-tri-khoa-tai-khoan.md)

Trong lượt tích hợp ngày 24/11/2026, cùng phiên user gửi POST tới API tạo trước tài khoản của trường và nhận 403. Ca DB chứng minh quyền quản trị được kiểm trước khi đặt giữ email. Hai realm trong diễn tập IdP đã cấp danh tính hợp lệ và đăng nhập thành công sau phục hồi. [Ca cấp trước](../../../apps/backend/test/db/precreate.test.mjs) · [Kết quả IdP](../../release/idp-result.json)

Ca cấp trước xuyên suốt đi từ form quản trị tới API RMS và Keycloak dùng service account riêng cho từng realm. Gửi lại cùng lệnh trả cùng ID và còn một audit. Lần đăng nhập OTP đầu của người được cấp trả đúng ID, vai trò author, đơn vị và ba quyền. [Kết quả](../../release/provision-result.json)

**B03/TC-05, AC-07.** Một chủ nhiệm đã nộp, được trả để bổ sung và nộp lại đề xuất F01. Quản trị dùng hai bước xác nhận ngừng hoạt động. API trả 200 với đúng ID, `isActive=false` và `deletedAt` có giá trị. Phiên của chủ nhiệm đọc lại đề xuất nhận 403. Chuyên viên cùng khoa đọc lại đề xuất và nhật ký P02 qua API, cả hai kết quả khớp từng trường với trước lúc ngừng hoạt động, gồm mã đề tài và liên kết tác giả chính. [Ca Chrome](inactive-principal.ts) · [Ảnh kết quả](../../../docs/reviews/screenshots/iam/ngung-hoat-dong-chu-nhiem.png)
