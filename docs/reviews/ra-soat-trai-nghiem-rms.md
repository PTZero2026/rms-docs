# Rà soát trải nghiệm người dùng RMS

Ngày rà soát 25/11/2026. Bản đối chiếu ban đầu là `7466d1c`. Mục tiêu của lượt này là giúp người dùng tìm đúng hồ sơ, đọc được kết quả và tiếp tục công việc khi đổi màn hình, đổi thiết bị hoặc mở liên kết cũ.

## Ba thay đổi dễ thấy

| Tình huống | Trước | Sau |
|---|---|---|
| Chủ nhiệm tra dự án sản xuất trên điện thoại 390 px | Tên dự án xuống dòng sau vài chữ. Phải cuộn bảng thêm 140 px để thấy hết các cột. | Tên nằm đầu mỗi mục. Loại dự án, số tiền và trạng thái có nhãn ngay dưới tên. Có thể tìm theo tên, mã hoặc đối tác khi bộ lọc đang đóng. [Ảnh F11](screenshots/ux/f11.png) |
| Chuyên viên đối chiếu giờ giảng | Sáu ô lọc và ba thẻ chỉ số đẩy liên kết nguồn đầu tiên xuống vị trí 793 px, ngay dưới thanh điều hướng cố định ở màn hình cao 844 px. | Tổng giờ, số giảng viên và số nguồn nằm trong một cụm. Liên kết đầu tiên ở 460 px. Có thể đọc người nhận, kỳ, phiên bản và giờ ngay ở danh sách. [Ảnh P03](screenshots/ux/p03.png) |
| Người đã đăng nhập mở nghiệp vụ từ trang tài khoản | Các nút kỳ nhận, xét duyệt, nghiệm thu, lý lịch và sản phẩm nằm nối tiếp nhau. Nội dung một số mục mở sau nút của mục khác. Vai trò hiển thị bằng mã kỹ thuật. | Thông tin tài khoản và việc cần làm đứng đầu trang. Mỗi nút có trạng thái mở/đóng, nối tới nội dung ngay dưới nó. Lối tắt đến lý lịch, báo cáo và kỳ nhận đưa tiêu điểm tới đúng mục. [Ảnh tài khoản](screenshots/ux/account.png) |

Nút mở biểu mẫu cấu hình và quy đổi giờ trước đây làm mất tiêu điểm khi đóng bằng Escape. Hai ca kiểm thử đã tái hiện được lỗi. Sau sửa, tiêu điểm trở lại đúng nút vừa mở. Người dùng có thể nhấn Tab để tiếp tục ở cùng vị trí.

## Kết quả theo màn hình

Bảng ghi màn hình đã mở, việc giao cho người dùng và dấu hiệu để người dẫn demo đối chiếu. Mã ca trong sổ tay chọn sẵn trường, vai và đường dẫn. Số đo trong bảng lấy từ Chromium ở 390 × 844 px. [Sổ tay hai trường](../guides/demo-rms/README.md)

| Phân hệ | Màn hình và thao tác đã rà | Kết quả quan sát hoặc thay đổi |
|---|---|---|
| B06 Tổng quan | Mở trang của chủ nhiệm và chuyên viên, chọn việc quá hạn, đi tới hồ sơ nguồn | Thanh điều hướng nhanh giữ trạng thái trang hiện tại. Ca TLU-01 và TLU-35 thể hiện hai phạm vi công việc. |
| B04 Thông báo | Hộp thư, chưa đọc, chi tiết, tùy chọn nhận, nhật ký gửi và kênh/mẫu gửi | Nhóm mục thông báo có tên cho trình đọc màn hình. Khi đọc một tin, mục Hộp thư vẫn được nhận diện là mục hiện tại. |
| F02 Kỳ nhận | Danh sách, kỳ đang nhận, kỳ nháp, mở form lập kỳ, tra hạn trên điện thoại | Đối chiếu ngày hạn trên chi tiết và đi tiếp tới đề xuất. Liên kết tới kỳ đã ra ngoài phạm vi có đường về danh sách. |
| F01 Đề xuất | Danh sách, lập đề xuất, nháp, trả bổ sung, minh chứng | Xóa từ khóa, kỳ và trạng thái bằng một thao tác. Liên kết hồ sơ sai có tiêu đề, lý do và đường về danh sách dùng được bằng bàn phím. |
| F03 Hội đồng | Hàng đợi, lập hội đồng, chi tiết hội đồng, phiếu của người chấm và kết quả của chuyên viên | Ca TLU-09 cho thấy nhánh không xem được hồ sơ. Người dùng có thể về danh sách xét duyệt ngay tại đó. |
| F04 Tiến độ | Danh sách, chọn đề tài để giao, chi tiết báo cáo của chủ nhiệm và chuyên viên | Dòng đầu từ 629 lên 461 px. Mốc báo cáo và trạng thái hiển thị cùng chủ nhiệm. Có thể bỏ cả điều kiện quá hạn và trạng thái một lần. |
| F05 Kinh phí | Danh sách, chọn đề tài, chi tiết khoản cấp, chi và quyết toán | Số còn lại có nhãn dưới tên đề tài. Bảng danh sách từ cuộn thêm 88 px xuống 0 px. Đối chiếu hai khoản chi theo TLU-16. |
| F06 Nghiệm thu | Danh sách, chọn đề tài, điều kiện đăng ký, phiếu và kết quả | Có thể đọc hội đồng và trạng thái trên cùng một mục. TLU-19 và TLU-20 mở ở hai vai khác nhau. |
| F07 Sản phẩm | Danh mục, theo đề tài, kê khai mới, duyệt, sửa kê khai và minh chứng | Loại, năm và trạng thái đọc được theo từng sản phẩm. Bỏ bộ lọc để trở lại danh mục. TLU-17 mở sản phẩm đang chờ duyệt. |
| F08 Lý lịch | Hồ sơ, quá trình công tác, đề tài/sản phẩm và liên kết nguồn | Bảng chi tiết dùng nhãn cột trên điện thoại. Tên trường, tài khoản và quyền trên bản xuất được kiểm tra bằng luồng tích hợp F08. |
| B02 Báo cáo | Lập báo cáo, mở bản chụp, nhóm kết quả và xem danh sách nguồn | TLU-10 mở đúng bản chụp. Với liên kết bản chụp không còn xem được, có đường trở về danh sách báo cáo. |
| F09 Đề tài cấp trên | Danh sách, hàng chờ, kê khai, hồ sơ chờ duyệt | Bộ lọc cấp đề tài, đơn vị và trạng thái nằm sau nút Bộ lọc trên điện thoại. Bảng từ cuộn thêm 25 px xuống 0 px. |
| F10 Đề tài sinh viên | Danh sách, đợt đăng ký, đăng ký, xác nhận hướng dẫn và xem kết quả | Trưởng nhóm và người hướng dẫn nằm dưới tên đề tài. Bảng từ cuộn thêm 178 px xuống 0 px. TLU-26 và TLU-27 phân biệt hai vai. |
| F11 Dự án sản xuất | Danh sách, kê khai, dự án nháp và dự án bàn giao | Dòng đầu từ 533 lên 425 px. Ca hồi quy kiểm tìm không có kết quả, bỏ lọc, lấy lại tiêu điểm và mở hồ sơ ở 320, 390 và 1280 px. |
| F12 Hoạt động khoa học | Danh sách, kê khai, minh chứng hội nghị và phục vụ cộng đồng | Loại hoạt động, đơn vị và trạng thái đều hiện theo từng hồ sơ. Bảng từ cuộn thêm 79 px xuống 0 px. |
| P03 Giờ giảng | Sổ chi tiết, lọc theo kỳ và người nhận, mở dòng gốc/điều chỉnh | Số giờ và phiên bản công thức có nhãn. Người dùng có thể bỏ lọc ngay khi sổ trống. Bảng từ cuộn thêm 150 px xuống 0 px. |
| B01 Cấu hình | Danh mục, chi tiết ghi đè và bố cục trang chủ | Liên kết danh mục và bố cục biểu đạt mục hiện tại. Ở trang tích hợp, phần xem trước XML dùng bảng mã từ phản hồi HTTP để đọc nội dung tiếng Việt. Vào từ TLU-24 hoặc TLU-39 sẽ thấy nhóm Quản trị đã mở trong menu. |
| B03 Tài khoản | Danh sách và chi tiết quản trị, tài khoản cá nhân, yêu cầu nâng quyền, quyền theo vai trò | Đang xem tài khoản nào thì vẫn xác định được mục cha. TLU-22 và TLU-23 cho phép đối chiếu quyền cá nhân và quản trị. |
| P01 Quy trình | Phiên bản đang áp dụng và chi tiết phiên bản | Liên kết sâu tới phiên bản mở sẵn nhóm Quản trị. Có thể thu gọn nhóm thủ công hoặc tới phiên bản khác. |
| P02 Nhật ký | Nhật ký chung và lịch sử của một đối tượng | Liên kết từ hồ sơ giữ vị trí Nhật ký trong điều hướng. TLU-06 mở đối tượng cho chuyên viên. |

## Phạm vi kiểm chứng

- Áp dụng `ui-ux-pro-max` cho kích thước vùng chạm, khoảng cách giữa các thao tác, thứ tự bàn phím, tiêu điểm và khả năng đọc bảng ở chiều rộng nhỏ. Dùng số đo DOM, ảnh trước/sau và thao tác trên bản chạy để quyết định sửa.
- Lượt so sánh cùng điều kiện trước và sau gồm 177 lần mở ở 390 và 1280 px. Mỗi chiều rộng có 43 điểm vào theo ca, 20 danh sách và 24 đường dẫn bổ sung cho màn hình con, biểu mẫu hoặc trạng thái thiếu hồ sơ. Thêm thư viện giao diện ở hai chiều rộng và khung điện thoại ở desktop. Đây là số lượt mở, một màn hình có thể xuất hiện với nhiều vai.
- Rà tiếp 908 lượt ở 320, 390, 768 và 1280 px. Ở mỗi chiều rộng đã mở 93 trang theo vai, chọn 23 thẻ và mở 111 hộp thoại. Không phát hiện trang bị tràn ngang hoặc lỗi JavaScript trong lượt này. Nhãn trạng thái dài của đề tài sinh viên xuống dòng ở 320 px. [Kết quả từng lượt, mỗi dòng một bản ghi JSON](ra-soat-trai-nghiem-rms.jsonl)
- Tại mỗi điểm vào, ghi tiêu đề, độ rộng trang, độ tràn trong bảng, vị trí liên kết hồ sơ đầu tiên (nếu có) và liên kết hiện tại trong menu. Chín danh sách E4/quản trị ban đầu có mục đang xem nằm trong nhóm đóng. Sau sửa, menu của cả 20 danh sách đều chứa vị trí hiện tại. Ca hồi quy F11 còn thu gọn và mở lại nhóm bằng nút điều hướng.
- Trên trang tích hợp, đăng nhập OTP ở đơn vị thử, mở lần lượt 18 mục nghiệp vụ bằng tài khoản quản trị ở 390 và 1280 px trên cả hai phiên bản. Không lượt nào làm trang rộng hơn khung nhìn. Thư viện DOI, định mức và các nghiệp vụ mở rộng dùng cấu hình của đơn vị thử. Các quyền và trường hợp chuyên môn được thử riêng qua bộ kiểm thử tích hợp.
- Kiểm thử chức năng có 35 ca V0, 35 ca tích hợp qua OTP, sáu ca trình duyệt quản trị B01/P01, 85 kiểm thử đơn vị và 54 kiểm thử cơ sở dữ liệu. Đã chạy kiểm tra kiểu TypeScript, lint và build. Trong ca B01, đối chiếu riêng loại nội dung, bảng mã UTF-16LE, byte tải về và chuỗi XML hiển thị để giữ đúng dấu tiếng Việt.
- Bản ZIP có sẵn `demo-server.py`. Khi mở liên tiếp các ca, máy chủ Python mặc định có lúc ngắt kết nối lúc trình duyệt tải song song các mô-đun. Chương trình đi kèm phục vụ thư mục đã giải nén trên loopback và tăng hàng đợi kết nối.
- Gói mang đi demo được giải nén rồi phục vụ qua loopback. Cả 86 đường vào trong hai sổ tay đều mở đúng vai và đơn vị. Các số đo hình học được lấy trên Chromium. Việc người dùng hai trường hoàn thành công việc nhanh hơn bao nhiêu cần đo trong buổi dùng thử thực tế.

## Chạy lại

Từ gốc repo, chạy `pnpm build`, rồi `npm --prefix e2e run test:v0` để thử điều hướng, bàn phím, bộ lọc và tình huống theo vai. Muốn lấy số liệu theo màn hình và thẻ, mở Vite preview, sau đó chạy lệnh dưới đây. Tệp `screens.json` ghi chiều rộng, màn hình, trạng thái người dùng đã mở, tiêu đề và hai phép đo cuộn. [Các ca hồi quy đọc hồ sơ](../../e2e/v0/read-records.spec.ts) · [Cách mở bản demo](../guides/rms-v0-frontend.md)

```sh
pnpm --filter @rms/web exec vite preview --host 127.0.0.1 --port 4187
# Chạy trong terminal thứ hai
node e2e/ux-survey.mjs http://127.0.0.1:4187
```
