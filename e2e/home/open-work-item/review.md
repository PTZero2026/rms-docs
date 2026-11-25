# RV-12 · 24/11/2026

Trên Chrome ở 360 và 390 px, chủ nhiệm của hồ sơ vừa được trả thấy một việc, mở thẳng thuyết minh F01, đọc lý do và quay lại cùng thẻ. Vùng chạm cao ít nhất 44 px và trang vừa chiều ngang. Tải thẻ, hạ quyền tác giả rồi bấm liên kết cũ chỉ hiện thông báo ngoài phạm vi và đường về danh sách. Ở trường B, cả số đếm và danh sách đều rỗng, nguồn trả 404. Chủ nhiệm sau khi được khôi phục quyền có thể nộp lại đúng mã hồ sơ. Ca PostgreSQL so số audit trước/sau khi xem và kiểm ngày hôm nay ngay sau 00:00 giờ Việt Nam. Lượt tích hợp đạt 17/17 ca DB, 12/12 ca Chrome.

[Kiểm tra Chrome](acceptance.ts) · [Kiểm tra DB](../../../apps/backend/test/db/home.test.mjs) · [Ảnh 360 px](../../../docs/reviews/screenshots/home/chu-nhiem-viec-can-bo-sung.png)

## B06 và nghiệm thu

Trên cùng đề tài, chuyên viên đi từ **Việc cần làm** tới hồ sơ F06 và mở đợt nghiệm thu. Thư ký lưu nháp từ **Phiếu nghiệm thu**, mở lại từ thẻ **Chấm nghiệm thu**, đối chiếu điểm và nhận xét rồi gửi. Về danh sách sau khi gửi, việc vừa chấm đã được gỡ. Ở PostgreSQL, chủ nhiệm có ghế, chuyên viên khác khoa và tài khoản trường khác đều bị chặn khi mở việc ngoài phạm vi. Mở lại vòng sau khi chốt chỉ khôi phục việc của chuyên viên vì phiếu của thư ký đã gửi. [Đường chạy Chrome](../../acceptance/request-acceptance/acceptance.ts) · [Ca DB](../../../apps/backend/test/db/acceptance.test.mjs) · [Ảnh thẻ cá nhân](../../../docs/reviews/screenshots/acceptance/thanh-vien-viec-nghiem-thu.png)

Đã giao bảy thông báo B04 cho một tài khoản và một tin mới hơn cho tài khoản khác. B06 trả đúng năm ID gần nhất của người đang xem theo thứ tự mới đến cũ. Mở tổng quan giữ nguyên cả bảy tin ở trạng thái chưa đọc. [Ca đối chiếu B04/B06](../../../apps/backend/test/db/inbox.test.mjs)

## TC-18 · Một nguồn tạm gián đoạn

Trên Chrome rộng 390 px, quản trị trường gặp lỗi do cấu hình `PROFILE.FIELDS` của F08 sai cú pháp. Trước khi sửa B06, cả trang chủ hiện lỗi và mất liên kết sang báo cáo. Sau khi tách các đường đọc, thẻ lý lịch hiện **Thử lại**. Người dùng vẫn chọn được **Quá hạn**, xem số liệu và mở được đường dẫn tới B02, B04. Khôi phục cấu hình rồi bấm **Thử lại** chỉ gọi `widgets/profile` và bộ lọc vẫn ở **Quá hạn**.

Ca thứ hai bật E4/P03 và lần lượt giữ phản hồi của việc cần làm, số liệu đề tài, thông báo và giờ giảng. Trong từng lượt, ba thẻ còn lại lấy dữ liệu từ máy chủ, lối tắt vẫn dùng được. Chrome nhận một phản hồi 503 mô phỏng cho thẻ bị giữ. Sau khi gỡ mô phỏng, một lượt bấm gửi đúng một yêu cầu và khôi phục nội dung. Tắt P03 rồi tải lại làm thẻ giờ biến mất, đường đọc của thẻ trả 404. [Kịch bản](../triage-deadlines/isolated-widgets.spec.ts) · [Ảnh lỗi F08 và các thẻ còn hoạt động](../../../docs/reviews/screenshots/home/loi-rieng-ly-lich.png)

## SEC-08 · Tài khoản đổi quyền khi trang chủ đang mở

Hạ quản trị xuống người dùng rồi chọn **Tải lại thông tin** gỡ thẻ số liệu và lối tắt báo cáo. API thẻ số liệu trả 404 cho vai trò mới. Trong cùng phiên, khóa tài khoản rồi đổi bộ lọc công việc khiến IAM trả 403. Trước khi sửa, các thẻ cá nhân khác vẫn còn trên màn hình. Bản sửa gỡ cả phần tài khoản đang mở và hiện **Đăng nhập lại**. Sau khi mở khóa, người dùng vào lại được danh sách việc và thông báo với quyền hiện hành. [Ca Chrome qua IAM](../triage-deadlines/isolated-widgets.spec.ts)

## TC-14 · Quản trị lưu bố cục cho chủ nhiệm

Ở trường thứ hai, quản trị mở **Cấu hình hệ thống**, thêm `HOME.RESEARCHER` rồi lưu `projects,activity`. Đã đối chiếu đúng một dòng tạo mới trong DB B01 gắn với quản trị, trường, khóa vai trò và phiên bản chứa đúng các byte vừa lưu. Chủ nhiệm tải lại thấy số liệu và thông báo theo thứ tự đã đặt. Danh sách việc và đường mở việc cũ đều áp lại bố cục của trường. [Thao tác và audit](../triage-deadlines/acceptance.spec.ts) · [Hướng dẫn quản trị](../../../docs/guides/nguoi-dung/cau-hinh-theo-truong.md#đổi-bố-cục-trang-chủ-theo-vai-trò)

## HOME-11 · Hai quản trị đổi bố cục chuyên viên

Quản trị thứ nhất dùng màn hình 390 px để đưa **Thông báo gần đây** lên trước **Số liệu nhanh**, ẩn hai thẻ khác rồi lưu. Quản trị thứ hai đang mở cùng phiên bản nhận thông báo xung đột. Sau khi tải bản hiện hành, người thứ hai thêm **Lối tắt**. Lịch sử hiển thị hai người ghi cùng giá trị trước và sau của từng lần. Chuyên viên đăng nhập trên điện thoại thấy đúng ba thẻ theo thứ tự mới. API đọc lịch sử trả 403 cho chuyên viên. Khi quản trị thứ nhất bị hạ quyền, thao tác đổi vai trò gỡ biểu mẫu cùng lịch sử đang hiển thị. [Ca Chrome](../triage-deadlines/layout-editor.spec.ts) · [Biểu mẫu](../../../docs/reviews/screenshots/home/quan-tri-bo-cuc.png) · [Lịch sử](../../../docs/reviews/screenshots/home/lich-su-bo-cuc.png)

PostgreSQL kiểm kế thừa bản dùng chung, xóa bản riêng, bố cục rỗng, lưu đồng thời và rollback khi ghi audit thất bại. Đã kiểm 12 bản ghi trên hai trang, gồm một bản thiếu dữ liệu trước migration. Trên kết nối runtime của trường khác chỉ thấy lịch sử của trường đang chọn khi mở quyền đọc lịch sử. Runtime thiếu quyền UPDATE và DELETE trên bảng audit. [Hai ca HOME-11](../../../apps/sys-config-service/test/store.test.mjs)
