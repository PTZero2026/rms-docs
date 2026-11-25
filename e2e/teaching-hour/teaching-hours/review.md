# US-30 · Giờ giảng từ hoạt động hội nghị

Hoạt động thực của F12 có ngày nguồn 30/09/2026. Trường bật P03, khai lịch năm học 2026–2027, công bố v1 6 giờ đến hết 30/09 và v2 9 giờ từ 01/10 trước lần xử lý đầu. Giảng viên gửi, chuyên viên duyệt, worker đọc lịch B01 bằng credential riêng, ghi một dòng theo v1. Chạy lại cùng worker trả 0 dòng mới. F08 hiển thị 6.00 giờ. Khi quản trị ghi chênh lệch -1.00 kèm lý do, sổ hiển thị tổng 5.00 giờ. [Ca Chromium](acceptance.ts) · [Ảnh F08](../../../docs/reviews/screenshots/extension/ly-lich-so-gio.png)

Bộ DB gồm 29/29 ca, kiểm cả hai consumer đồng thời, công thức chồng hiệu lực, chống ghi trùng điều chỉnh. Các mức 6/9 là ví dụ của bộ kiểm. Nguồn hiện nối tự động F09/F12, một chủ nhiệm hoặc giảng viên nhận 100%. Việc chia phần cho nhiều người và các mốc F07/F10/F11 cần đối chiếu với từng trường.
