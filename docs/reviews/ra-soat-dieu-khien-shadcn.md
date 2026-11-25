# Rà soát nút, danh sách chọn và biểu mẫu RMS

Ngày 25/11/2026. Phạm vi gồm ứng dụng React trong `apps/web` và thư viện `packages/ui` dùng cho giao diện mô phỏng, màn hình đăng nhập vào RMS theo đơn vị và thư viện chủ đề. Bản mẫu HTML độc lập trong `wireframe-prototype/` và các trang OTP do Keycloak phục vụ nằm ngoài phạm vi chỉnh giao diện đợt này.

## Thay đổi người dùng thấy được

| Thao tác | Kết quả |
|---|---|
| Chọn từ danh sách | 64 vị trí dùng Select của shadcn. Người dùng có thể dùng phím mũi tên, Enter và Escape. Mục đang chọn có dấu kiểm. Danh sách hiển thị trên cả hộp thoại đang mở. |
| Chọn một bộ lọc, chuyển tab | Bộ lọc loại trừ nhau dùng ToggleGroup với trạng thái chọn cho trình đọc màn hình. Các tab nội dung giữ ngữ nghĩa tab. Bộ lọc báo cáo theo trạng thái giữ được lựa chọn khi quay lại hồ sơ. |
| Chuyển màn hình, chạy lệnh, mở thêm nội dung | 42 vị trí điều hướng được chuyển sang liên kết có địa chỉ đích. Đã thay 24 nút HTML tự dựng và 11 cụm mở rộng. Nút gửi được khai báo rõ trong biểu mẫu. Những nút mở phần nội dung công bố trạng thái mở hoặc đóng. |
| Nhập liệu | 42 ô đánh dấu và 19 ô văn bản nhiều dòng dùng component chung. 27 biểu mẫu dùng lớp xử lý lỗi trong giao diện. Những biểu mẫu có luật nghiệp vụ riêng tiếp tục dùng luật của màn hình. |
| Nhập ngày | Có thể gõ ngày theo `dd/MM/yyyy` hoặc mở lịch tiếng Việt. 14 vị trí dùng lịch trực tiếp và 8 vị trí điều phối theo loại trường. Giá trị chuyển cho nghiệp vụ là ngày ISO. |
| Nhập đối tác | F11 cho phép chọn gợi ý và gõ tên đối tác mới. |
| Đính kèm tệp | Nút **Chọn tệp từ máy** mở trình duyệt tệp của hệ điều hành. Vùng bên cạnh nhận kéo/thả và dán tệp từ clipboard. Cả ba cách chuyển đối tượng File cho màn hình sở hữu, giữ các quy tắc về định dạng và số lượng. |
| Xác nhận thao tác | Khôi phục dữ liệu mẫu, xóa cấu hình và ghi đè cấu hình chung có hộp xác nhận trong ứng dụng. Khi hủy xóa cấu hình, tiêu điểm trở về nút đã mở hộp thoại. |

Các component được đối chiếu với registry đã cấu hình qua skill shadcn và MCP shadcn. Danh sách kiểm kê ghi nhận 559 vị trí JSX trong 95 tệp, gồm cả component dùng chung, nơi gọi theo nghiệp vụ và liên kết. Các điều khiển sinh từ dữ liệu được ghi một lần tại vị trí khai báo. [Xem từng nhãn, hành vi và dòng nguồn](kiem-ke-nut-va-dropdown.md).

## Kiểm chứng

| Kiểm tra | Kết quả |
|---|---|
| Màn hình đầu của 20 phân hệ | Đã mở B01–B04, B06, F01–F12, P01–P03 ở 390 và 1280 px. Đã mở rồi đóng các dropdown khả dụng, kiểm tra tiêu điểm, tên điều khiển và chiều rộng trang. Cả 40 lượt đều đạt. |
| Luồng mô phỏng | 26/26 ca Playwright đạt, gồm chọn bằng bàn phím, lịch, nhập đối tác, chọn tệp, kéo/thả, dán và các luồng ở 320, 360, 390 px. |
| Cấu hình trên trình duyệt | 6/6 ca đạt, gồm giới hạn dung lượng, thử lại khi lưu thất bại và chỉnh sửa đồng thời. |
| Monorepo | Lint, TypeScript và build đạt. 81/81 kiểm thử của workspace và 54/54 kiểm thử với cơ sở dữ liệu đạt. |
| Tích hợp có đăng nhập | 35 kịch bản riêng biệt đã đạt trên PostgreSQL và các dịch vụ thử tại máy. Lượt chạy đầy đủ đạt 33/35. Hai ca về kỳ đề xuất và tùy chọn thông báo đạt khi chạy lại riêng cùng hai ca cấu hình và báo cáo. Ca thông báo cũng đạt thêm một lượt độc lập trên bản bàn giao. |
| Truy cập local | Chrome tải ứng dụng từ localhost, chọn được trường bằng thao tác chạm mô phỏng. API qua proxy của Vite trả về trạng thái OK. |

Kiểm kê mã nguồn bao phủ cả các nút xuất hiện theo vai trò, dữ liệu và trạng thái. Kiểm thử thao tác đi qua các kịch bản nghiệp vụ và màn hình nêu trên. Ca tệp theo dõi sự kiện mở trình chọn của trình duyệt, cấp tệp thử và gửi sự kiện kéo/thả, clipboard có tệp. Việc duyệt thư mục và clipboard vật lý trên từng hệ điều hành cần được nghiệm thu trên thiết bị.

Có thể đối chiếu giao diện qua [màn chọn đơn vị ở 390 px](screenshots/shadcn-controls/chon-don-vi-390.png) và [lịch nhập ngày ở 1280 px](screenshots/shadcn-controls/lich-de-tai-1280.png).

## Việc tiếp theo

Nghiệm thu trên Safari/iPhone và Chrome/Android bằng tệp thật, nhất là thao tác dán từ ứng dụng Tệp hoặc Ảnh. Dùng VoiceOver hoặc TalkBack để đi qua một biểu mẫu có dropdown, lịch, thông báo lỗi và hộp xác nhận trước khi phát hành.
