# RV-13 · Đối chiếu báo cáo kỳ

Làm việc với hai khoa trong trường A và một tài khoản trường B. Fixture gọi F01 để tạo A1 đã nộp hai lần, A2 bị trả còn mã, A3 chưa có mã và B1 thuộc khoa khác. Trưởng phòng có quyền báo cáo cả hai khoa, chuyên viên có một khoa.

| Ca | Quan sát |
|---|---|
| TC-01 | Ba mã trong bản đầu. Hai Đã nộp, một Nháp. A3 không có trong bản. |
| TC-02 | Chuyên viên nhận 2 dòng của khoa mình. Gửi thêm ID khoa kia trả 403. |
| TC-03 | Sau khi A2 nộp lại, drill-down cũ và CSV vẫn có A2 ở Nháp, giữ thời điểm trích xuất. Bản mới có 3 Đã nộp. Thu hồi khoa B từ trưởng phòng trước lần tải tiếp theo khiến server yêu cầu tạo lại bản và UI xóa dữ liệu cũ. |
| TC-04 | Đọc bản chụp từ trường B trả 404. Chuyên viên cùng trường cũng không đọc được bản của trưởng phòng. |

Ngày 24/11/2026, bộ hồi quy khi đó có 17 ca PostgreSQL và 13 ca Chrome tích hợp. Đã tải CSV thật, kiểm cột mã, trạng thái và thời điểm. Chữ ký danh sách đối chứng của trưởng phòng trường pilot cần dữ liệu do trường cung cấp. [Chrome](acceptance.spec.ts) · [PostgreSQL](../../../apps/backend/test/db/report.test.mjs)

Trong lượt ngày 25/11, A2 đã nộp lại trong khi trưởng phòng đang đối chiếu bản cũ. Trưởng phòng mở A2 từ nhóm Nháp, quay lại, rồi tải lại trang. Cả hai lần đều mở đúng ID bản cũ, tổng ba hồ sơ và một dòng trong nhóm Nháp. CSV từ cùng màn hình có mã bản chụp, số lượng từng trạng thái và định danh từng đề tài. QA có thể so mã trong tệp với ảnh màn hình của chính lượt chạy. [CSV từ bộ dữ liệu thử](doi-chieu-ky-mau.csv) · [Ảnh danh sách ba mã](../../../docs/reviews/screenshots/report/truong-phong-doi-chung.png)

## Phiếu đối chiếu US-13/T008 tại trường

Đã kiểm hai tab của cùng trưởng phòng. Khi tab thứ hai đang xem hồ sơ A2 của khoa A, trường rút quyền thống kê khoa B. Quay lại từ A2 bị chặn đọc bản chụp hai khoa. Tab thứ nhất xuất bản đã mở cũng bị từ chối, danh sách đối chứng được gỡ và bộ lọc chỉ còn khoa A. Chuyên viên khác của trường có quyền B02 mở liên kết của trưởng phòng nhận thông báo giới hạn phạm vi. [Ảnh khi quay lại](../../../docs/reviews/screenshots/report/ban-chup-thu-hep-quyen.png)

Ở lần kiểm thêm B06/TC-08, trưởng phòng mở báo cáo từ số liệu nhanh và tải lại trang. Khoa Công trình vẫn được chọn. Bản đầu có hai dòng thuộc đúng khoa. Chuyển sang tất cả đơn vị được phép cho bản ba dòng. Khi tài khoản chưa gắn khoa, màn hình yêu cầu chọn phạm vi. Chủ nhiệm thiếu quyền B02 mở cùng liên kết thấy thông báo và quay lại trang chủ. [Ca Chrome](acceptance.spec.ts) · [Ảnh bộ lọc](../../../docs/reviews/screenshots/report/tu-trang-chu-pham-vi-khoa.png)

Trưởng phòng KHCN chọn một kỳ và các khoa thuộc quyền. Xác định danh sách mã độc lập từ sổ tiếp nhận tại cùng mốc với bản chụp, ghi nơi lưu sổ và người chốt. Mỗi mã tính một lần kể cả khi đã nộp lại. Hồ sơ từng được cấp mã rồi trả về Nháp vẫn thuộc danh sách. Nháp chưa có mã được loại.

| Thông tin trưởng phòng và QA điền | Giá trị thực tế |
|---|---|
| Trường, kỳ, danh sách khoa, người tạo bản chụp | |
| ID bản chụp, thời điểm UTC trên CSV, giờ quy đổi tại trường | |
| Phiên bản/dấu vết sổ tiếp nhận và người chốt sổ | |
| Tổng và số mã theo từng trạng thái trong sổ, màn hình và CSV | |
| Mã chỉ có ở một nguồn, khác khoa hoặc khác trạng thái, nguyên nhân từng sai khác | |
| Vị trí lưu CSV và bằng chứng chi tiết được phép xem | |
| Kết luận, họ tên trưởng phòng, ngày và tham chiếu chữ ký | |

QA đối từng mã giữa sổ, drill-down và CSV, kể cả khi ba tổng bằng nhau. Khi có hồ sơ nộp lại sau mốc chụp, ghi mã và hai trạng thái trên bản cũ và mới. Trưởng phòng xác nhận kết quả theo quy trình ký của trường. T008 mở cho đến khi có danh sách đối chứng và xác nhận này.
