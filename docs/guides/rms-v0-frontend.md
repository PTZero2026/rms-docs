# Thử giao diện RMS V0

Từ gốc monorepo, chạy `pnpm install --frozen-lockfile` rồi `pnpm dev`. Mở địa chỉ Vite hiển thị. Trang đầu là tổng quan của chủ nhiệm Lê Thanh Mai tại Đại học Thủy lợi. Ngày nghiệp vụ mẫu là **21/11/2026**. Có thể mở trực tiếp các đường dẫn sau dấu `#`, dùng nút quay lại của trình duyệt hoặc tìm theo mã hồ sơ.

Mở [bộ demo và review của hai trường](demo-rms/README.md) để chọn ca có dữ liệu nhập, vai thao tác và số liệu đối chứng.

## Chọn phiên

Nút **Phiên mô phỏng** nằm ở góc trên bên phải. Chọn trường rồi chọn người dùng. Mỗi tab có thể giữ một danh tính riêng, các tab cùng trình duyệt và cùng địa chỉ web chia sẻ thay đổi. Dữ liệu mẫu của hai trường có phạm vi riêng. Với tài khoản tự tạo, chọn **Đăng nhập bằng email mẫu** và nhập địa chỉ thuộc `@example.invalid`. Mã xác nhận hiển thị ngay trong biểu mẫu.

| Người dùng mẫu | Các luồng nên thử |
|---|---|
| Lê Thanh Mai, chủ nhiệm | Lập và nộp đề xuất, nộp báo cáo, kê khai sản phẩm, đăng ký nghiệm thu, xuất lý lịch |
| Nguyễn Hoài An, chuyên viên | Mở kỳ, trả bổ sung, lập hội đồng, giao đề tài, quản lý kinh phí và chốt quyết toán |
| Trương Hoàng Nam, chuyên viên Khoa Công trình | Tìm hồ sơ, lọc báo cáo và xem lịch sử trong phạm vi một khoa |
| Phạm Quang Minh, thành viên hội đồng | Chấm hồ sơ được giao, kiểm tra phiếu đã khóa và hồ sơ có xung đột lợi ích |
| Nguyễn Khánh Linh, sinh viên | Đăng ký đề tài sinh viên và theo dõi xác nhận của người hướng dẫn |
| Đỗ Bảo Ngọc, người dùng | Xin nâng quyền tác giả, theo dõi quyết định của quản trị |
| Trần Thu Hà, quản trị đơn vị | Khóa hoặc mở lại tài khoản, duyệt nâng quyền, tạo bản ghi đè cấu hình và kích hoạt quy trình |
| Vũ Ngọc Lan, quản trị nền tảng | Sửa giá trị cấu hình dùng chung, kiểm tra giá trị áp dụng ở cả hai trường |

## Đối chiếu màn hình với đặc tả

| Màn hình | Lát Spec Kit | Thao tác và kết quả có thể kiểm tra |
|---|---|---|
| B03 · Tài khoản và quyền | US-01 | Mở tài khoản Mai ở một tab quản trị, khóa rồi mở lại. Tab đang dùng của Mai phản ánh trạng thái ngay. |
| B01 · Cấu hình đơn vị | US-02 | Tạo giá trị chung, ghi đè ở Thủy lợi, xem giá trị hiệu lực rồi xóa bản riêng để quay về mặc định. |
| P01 · Quy trình | US-03 | Tạo phiên bản nháp, hiệu chỉnh và kích hoạt. Hồ sơ tạo trước và sau thời điểm đổi giữ phiên bản tương ứng. |
| P02 · Nhật ký | US-04 | Từ hồ sơ mở nhật ký, đối chiếu người xử lý, khoa, thời gian và trạng thái trước/sau. |
| F02 · Kỳ nhận đề xuất | US-05 | Tạo kỳ, chọn tiêu chí, mở/đóng kỳ, lập đề xuất từ kỳ đang nhận. |
| F01 · Đề xuất | US-06–08 | Lưu nháp chưa cấp mã, bổ sung thành viên và tệp mẫu, nộp để được cấp mã. Chuyên viên trả bổ sung kèm lý do, chủ nhiệm sửa và nộp lại cùng mã. |
| F03 · Xét duyệt hội đồng | US-09–11 | Phân công hội đồng, loại người xung đột lợi ích, gửi phiếu cá nhân, chốt kết luận và xử lý hồ sơ cần thẩm định đạo đức. |
| B06 · Tổng quan | US-12 | Trên điện thoại, chọn một việc cần làm để mở đúng hồ sơ nguồn. Số liệu và danh sách thay đổi theo phiên. |
| B02 · Báo cáo | US-13 | Chụp báo cáo của kỳ theo khoa, xem danh sách đối chứng và tải CSV. Mở lại bản chụp sau khi hồ sơ nguồn đổi trạng thái. |
| F04 · Tiến độ | US-14, 15, 17 | Giao thực hiện đề tài đã duyệt, lập kỳ, nộp báo cáo với minh chứng, yêu cầu sửa hoặc duyệt đạt. |
| B04 · Thông báo | US-16 | Tạo nhắc hạn từ kỳ báo cáo, xem hộp thư người nhận, chuyển sang hồ sơ, cấu hình kênh và thử gửi lại lần lỗi. |
| F05 · Kinh phí | US-18, 19, 24 | Ghi nhận nguồn cấp, kê khoản chi kèm chứng từ, đối chiếu rồi quyết toán. So sánh phương thức rà thủ công và đối soát qua hai trường mẫu. |
| F07 · Sản phẩm khoa học | US-20, 21 | Kê khai sản phẩm gắn đề tài, sửa minh chứng rồi phê duyệt. Sản phẩm được duyệt cập nhật điều kiện nghiệm thu. |
| F06 · Nghiệm thu | US-22, 23 | Xem điều kiện còn thiếu, đăng ký nghiệm thu, lập hội đồng, chấm phiếu và ghi kết luận cho F05. |
| F08 · Lý lịch khoa học | US-25 | Cập nhật thông tin, xem công trình/sản phẩm/giờ giảng theo nguồn, xuất lý lịch HTML A4 theo mẫu. |
| F09 · Đề tài cấp trên | US-26 | Kê khai nhiệm vụ, cơ quan quản lý và người tham gia, nộp rồi theo dõi kết quả xác nhận. |
| F10 · Đề tài sinh viên | US-27 | Sinh viên gửi đăng ký, giảng viên xác nhận hướng dẫn, chuyên viên duyệt và ghi kết quả. |
| F11 · Dự án sản xuất | US-28 | Kê hợp đồng và tỷ lệ đóng góp, nộp minh chứng, duyệt và theo dõi giờ quy đổi. |
| F12 · Hoạt động khoa học | US-29 | Chọn loại hoạt động, nhập người đóng góp, nộp và duyệt theo cấu hình của trường. |
| P03 · Giờ giảng quy đổi | US-30 | Xem bút toán, nguồn, phiên bản định mức và phân bổ. Ghi điều chỉnh có lý do, gửi lại sự kiện và đối chiếu tổng giờ ở F08. |
| F01 · Rà thuyết minh | US-31 | Chủ nhiệm đồng ý dùng nguồn mẫu, xem căn cứ, dùng hoặc bỏ gợi ý. |
| F07 · Thẻ đọc | US-32 | Tạo thẻ từ nguồn đã khai báo, xem căn cứ theo quyền, dùng hoặc bỏ thẻ và kiểm tra lại sau khi thu hồi quyền toàn văn. |

Thủy lợi bật E4 và trợ lý AI trong bộ mẫu. Đại học Y Hà Nội dùng để kiểm tra khi các tính năng này tắt. Trong B01, quản trị có thể đặt khóa `AI.SOURCE.<id hồ sơ>` ở phạm vi đơn vị, với giá trị bằng số phiên bản nguồn được phép (ví dụ `1`), hoặc `off` để thu hồi. Khi đổi phiên bản, quyền cho bản cũ hết hiệu lực. Chi tiết nghiệp vụ và điều kiện nghiệm thu nằm trong [32 lát Spec Kit](../../specs/README.md) và [danh mục feature](../features/README.md).

## Kiểm tra trên máy

```sh
pnpm test
pnpm lint
pnpm build
npm --prefix e2e ci
npm --prefix e2e exec -- playwright install chromium
npm --prefix e2e run test:v0
```

Để chạy thêm sáu ca kiểm B01/P01 với Chrome cài trên máy, giữ bản preview ở cổng 4187 rồi chạy `RMS_TEST_URL=http://127.0.0.1:4187 node --test apps/web/src/features/platform/platform.browser.mjs`.

Bộ V0 chạy trên bản build cục bộ và tự mở Vite preview ở cổng 4187. Có thể đặt `RMS_BROWSER_CHANNEL=chrome` để dùng Chrome đã cài. Bộ pilot trong [e2e/README.md](../../e2e/README.md) có cấu hình riêng.

Để đo phản hồi với dữ liệu lớn, mở bản build bằng `pnpm --filter @rms/web exec vite preview --host 127.0.0.1 --port 4187 --strictPort`, sau đó chạy `node e2e/v0-load.mjs`. Script đo trang chủ và tìm kiếm với 0, 1.000 và 3.000 đề tài bổ sung, mỗi mức năm lần trong ngữ cảnh trình duyệt riêng.

## Dữ liệu và tích hợp

V0 dùng dữ liệu minh họa trong trình duyệt. Phiên đăng nhập, chuyển quyền, gửi thư/SMS, đối soát kinh phí và trợ lý AI đều được mô phỏng. Lý lịch xuất thành HTML có thể in, báo cáo đối chứng xuất CSV. Phần kiểm thử tại máy chủ về quyền truy cập, tính bất biến của nhật ký, tải đồng thời đa người dùng, SSO và tích hợp hệ thống của trường thuộc giai đoạn triển khai dịch vụ. Nhập liệu thử nghiệm bằng dữ liệu giả.

