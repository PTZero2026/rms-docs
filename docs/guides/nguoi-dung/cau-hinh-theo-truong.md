# Ghi đè cấu hình cho một trường

Đăng nhập vào đường dẫn của trường và mở **Cấu hình hệ thống**. Cột **Phạm vi** cho biết bản thuộc trường hay đang dùng chung. Bấm **Đọc hiệu lực** để xem giá trị mà ứng dụng nhận tại trường hiện tại.

1. Với quyền quản trị của trường, tìm dòng Chung cần điều chỉnh. Chọn **Tạo bản riêng**.
2. Kiểm tra mã, chọn văn bản, base64 hoặc tệp. Nhập giá trị riêng rồi chọn **Xem trước** để kiểm loại nội dung và dung lượng. Mỗi cấu hình nhận tối đa 20 MiB.
3. Chọn **Lưu cấu hình**. Phần đọc hiệu lực hiển thị giá trị mới. Trong ca thử, trường A nhận “Kỳ riêng A” ngay khi lưu. [Ảnh quản trị A](../../reviews/screenshots/catalog/truong-a-ban-rieng.png)
4. Thành viên trường B mở cùng mã và chọn **Đọc hiệu lực**. Trường B vẫn nhận “Kỳ chung”. Người đọc có thể tải nội dung. [Ảnh thành viên B](../../reviews/screenshots/catalog/truong-b-ban-chung.png)
5. Muốn quay về bản chung, quản trị A mở **Sửa** trên dòng của trường, chọn **Xóa cấu hình** rồi kiểm đúng mã và phạm vi trước khi xác nhận. Lần đọc tiếp theo dùng bản chung nếu bản này còn tồn tại.

Danh tính vận hành được cấp quyền shared sẽ thấy phạm vi **Chung** khi sửa. Khi thay hoặc xóa bản chung, bước xác nhận hiển thị mã và phạm vi ảnh hưởng đến các trường đang dùng mặc định.

## Đọc tệp và tìm cấu hình theo ngày

1. Mở **Bộ lọc cấu hình**. Để xem các bản được tạo trong một ngày, chọn cùng ngày ở **Tạo từ** và **Tạo đến**. Dùng **Sửa từ** và **Sửa đến** khi cần tìm theo lần cập nhật. Mỗi ngày tính từ nửa đêm theo giờ Việt Nam.
2. Chọn **Đọc hiệu lực** ở dòng cần xem. Ảnh PNG hiển thị trực tiếp. Với văn bản, đối chiếu dòng **Bảng mã** và nội dung bên dưới. Khi văn bản vượt 64 KiB, màn hình hiển thị phần đầu. **Tải nội dung** lấy toàn bộ tệp theo bảng mã gốc. [Ảnh đọc XML tiếng Việt](../../reviews/screenshots/catalog/van-ban-theo-bang-ma.png)
3. Khi trình duyệt báo chưa đọc được bảng mã, chọn **Tải nội dung** rồi mở bằng ứng dụng hỗ trợ định dạng đó. Cùng nút này dùng để lấy PDF hoặc tệp nhị phân.
4. Nếu trường vừa thay quyền, thao tác kế tiếp có thể báo **Tài khoản thiếu quyền thực hiện**. Chọn **Tải lại danh sách** để tra cứu theo quyền hiện tại. Người còn quyền đọc có thể mở lại giá trị hiệu lực.

Khi sửa bằng **Văn bản**, điền bảng mã mà ứng dụng nhận tệp cần dùng. Ví dụ, một cấu hình XML đang dùng UTF-16LE có thể sửa bằng cách gõ tiếng Việt rồi giữ `utf-16le` ở ô **Bảng mã**. Nếu bảng mã thiếu ký tự cần lưu, màn hình chỉ lỗi và giữ bản trước. Chọn bảng mã phù hợp rồi lưu lại. **Tệp** và **Base64** giữ nguyên bytes người gửi cung cấp.

## Mở đợt đề tài sinh viên

Trong **Cấu hình hệ thống**, tìm `F10.CALLS` và đọc bản hiệu lực. Nếu đã có danh sách, tải nội dung để giữ đủ các đợt khác khi sửa. Nếu chưa có, chọn **Thêm cấu hình**. Kiểm tra phạm vi của trường, nhập `F10.CALLS` làm mã và dùng **Văn bản** hoặc một tệp JSON UTF-8.

Mỗi mục trong mảng là một đợt của một khoa. Thay mã đơn vị ví dụ dưới đây bằng UUID của khoa đã đồng bộ. `starts` và `ends` là ngày đầu và ngày cuối nhận đăng ký. `finalDue` là hạn nộp kết quả. `min` và `max` tính cả trưởng nhóm.

```json
[
  {
    "code": "SV-2026",
    "unitId": "00000000-0000-0000-0000-000000000000",
    "starts": "2026-09-01",
    "ends": "2026-12-31",
    "min": 1,
    "max": 5,
    "onApproval": "APPROVED",
    "requireProgress": true,
    "finalDue": "2027-06-30",
    "finalEvidence": [{"code": "REPORT", "label": "Báo cáo tổng kết"}],
    "requireMentorFinal": true,
    "hourCategory": "STUDENT_RESEARCH"
  }
]
```

Chọn **Xem trước**. Nếu quy mô, ngày tháng hoặc minh chứng sai, sửa mục được nêu rồi xem trước lần nữa. Chọn **Lưu cấu hình** và kiểm nội dung ở **Đọc hiệu lực**. Sinh viên của khoa có thể nộp đăng ký trong khoảng ngày đã đặt. Khi điều chỉnh đợt, các hồ sơ đã nộp tiếp tục dùng các điều kiện kết quả đã lưu lúc nộp. [Ảnh đợt có hiệu lực](../../reviews/screenshots/catalog/dot-sinh-vien-hieu-luc.png)

## Đổi bố cục trang chủ theo vai trò

1. Đăng nhập bằng tài khoản quản trị của trường. Mở **Cấu hình hệ thống** → **Bố cục trang chủ theo vai trò**. Chọn **Vai trò áp dụng**. Dòng dưới **Thẻ và thứ tự hiển thị** cho biết mã trường và nguồn của bố cục hiện hành.
2. Đánh dấu những thẻ muốn hiển thị, bỏ dấu ở thẻ muốn ẩn. Dùng **Lên** hoặc **Xuống** bên cạnh tên thẻ để đổi thứ tự. Chẳng hạn, để chuyên viên đọc thông báo trước số liệu, chọn vai **Chuyên viên** và đưa **Thông báo gần đây** lên trên **Số liệu nhanh**. Bỏ chọn tất cả sẽ ẩn toàn bộ thẻ tùy chọn. **Giờ giảng** chỉ hiển thị khi trường bật cả E4 và P03. [Ảnh biểu mẫu trên điện thoại](../../reviews/screenshots/home/quan-tri-bo-cuc.png)
3. Chọn **Lưu bố cục** và chờ dòng **Đã lưu cấu hình trang chủ.** Người dùng cùng vai trò tại trường tải lại trang chủ để thấy thứ tự vừa lưu. Lần lưu đầu tiên tạo bản của trường nếu vai trò đang dùng bố cục mặc định hoặc bản chung.
4. Xem **Lịch sử bố cục** cho vai trò đang chọn. Mỗi dòng cho biết người thao tác, giờ Việt Nam và thứ tự **Trước** / **Sau**. Có thể chuyển trang khi có hơn 10 lần thay đổi. Dòng **Chưa có dữ liệu đối chiếu** xuất hiện ở bản ghi cũ thiếu giá trị lịch sử. [Ảnh hai lần lưu liên tiếp](../../reviews/screenshots/home/lich-su-bo-cuc.png)
5. Nếu thấy **Bố cục đã thay đổi**, một người khác đã lưu trước. Chọn **Tải bản hiện hành**, đối chiếu lịch sử, đặt lại các thay đổi còn cần rồi lưu.

Để trở về bản kế thừa, chọn **Về cấu hình hệ thống**. Tìm mã của vai trò, mở **Sửa** trên bản của trường và dùng **Xóa cấu hình**. Các mã tương ứng là `HOME.USER` (người dùng cơ bản), `HOME.RESEARCHER` (nhà nghiên cứu), `HOME.OFFICER` (chuyên viên) và `HOME.ADMIN` (quản trị). Việc xóa bản riêng cũng xuất hiện trong lịch sử của vai trò.
