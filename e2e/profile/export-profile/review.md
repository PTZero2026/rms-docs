# US-25 · Đối chiếu lý lịch khoa học

Chromium đăng nhập bốn tài khoản qua hai realm. Chủ hồ sơ vừa là người kê khai vừa là tác giả của một sản phẩm đã duyệt. Phép kiểm đọc trực tiếp văn bản trong hai PDF bằng Poppler, đếm đúng một tên sản phẩm và kiểm tên bản chờ duyệt vắng mặt. Tài khoản khác cùng trường và người ở trường thứ hai nhận 404. Kiểm thử PostgreSQL còn thử đổi tiêu đề với cùng mã và cùng phiên bản, giao dịch bị từ chối.

| Lần | Tiêu đề trong PDF | Bản ghi đối chiếu |
|---|---|---|
| 1 | [Lý lịch nghiên cứu](evidence/cv-v1.pdf) | CV-01 · v1 |
| 2 | [Lý lịch khoa học cấp trường](evidence/cv-v2.pdf) | CV-01 · v2 |

Hai sự kiện chứa đúng người xuất, hồ sơ, mã tệp và phiên bản. Hai PDF A4 đã được render để kiểm chữ tiếng Việt và số trang. [Hai sự kiện thực của bộ thử](evidence/exports.json) · [Ca trình duyệt](acceptance.spec.ts)

F08 đã đối chiếu 6.00 giờ theo v1, sau điều chỉnh còn 5.00 giờ. [Kiểm tích hợp P03](../../teaching-hour/teaching-hours/review.md)
