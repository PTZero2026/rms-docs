# Demo RMS tại Đại học Thủy lợi và Đại học Y Hà Nội

Hai bộ hồ sơ giả lập chạy trong ứng dụng web V0. Mỗi trường có 43 ca trải trên 20 phân hệ E0–E4. Mỗi ca ghi lời hỏi của người dùng, tài khoản, trạng thái đầu, dữ liệu cần nhập và kết quả để đối chiếu. Ngày nghiệp vụ trong bản demo là **21/11/2026**. Tên người, dữ liệu chuyên môn, chứng từ, quyết định và định mức đều dùng để trình diễn.

## Mang đi trình diễn

Giải nén [gói demo hai trường](rms-demo-tlu-hmu.zip). Mở terminal trong thư mục chứa `BAT-DAU.txt` rồi chạy lệnh sau bằng Python 3.

```sh
python3 demo-server.py
```

Mở [sổ tay demo](http://127.0.0.1:4173/demo.html), chọn trường rồi bấm **Mở ca trong RMS**. Liên kết chọn sẵn tài khoản và mở đúng màn hình. Khi một ca cần người thứ hai, dùng **Phiên mô phỏng**, giữ nguyên trường, chọn người tiếp theo rồi mở lại hồ sơ theo tên hoặc mã. Các ca có điều kiện phụ thuộc được ghi ngay trên thẻ.

Gói có bản web chạy cục bộ, hai sổ tay HTML có thể in, hai bộ JSON đầy đủ trong `data/`, hai phiếu Markdown để ghi kết quả thực tế, cùng đặc tả và kế hoạch kiểm thử của 20 phân hệ trong `criteria/`. Có thể chạy buổi demo trên máy có Python 3 và trình duyệt khi ngắt Internet. Ô trạng thái kết nối API phản ánh tình trạng máy chủ. V0 lưu tên hoặc metadata của minh chứng, xuất báo cáo CSV và lý lịch HTML.

Để trình diễn trên điện thoại, mở TLU-28, quay về **Dự án sản xuất** và thử tìm theo đối tác. Tên dự án, giá trị hợp đồng và trạng thái nằm trong cùng một mục. Với TLU-31, mở **Bộ lọc** trong sổ giờ để đối chiếu hai giảng viên. [Ảnh và kết quả rà soát từng phân hệ](../../reviews/ra-soat-trai-nghiem-rms.md)

## Hai hành trình cho buổi đầu

| Chặng | Hồ sơ và vai | Số liệu để hỏi ngay tại màn hình |
|---|---|---|
| Thủy lợi · Tiến độ → sản phẩm → nghiệm thu | TLU-12, TLU-17 · Mai nộp báo cáo kỳ 2 cho đề tài TLU-26-014. An duyệt sáng chế cụm gá cảm biến. | Có một bài báo đã duyệt. Sau khi An duyệt, cam kết sáng chế tăng từ 0/1 lên 1/1. Kỳ 3 chưa đạt vẫn chặn đăng ký nghiệm thu. |
| Thủy lợi · Quyết toán | TLU-16 · An mở đề tài TLU-26-005 đã đạt nghiệm thu. | PC-19 là 45 triệu, PC-20 là 12 triệu nhưng số chuyển ban đầu 11,8 triệu. Đối soát đủ hai khoản rồi chốt. |
| Y Hà Nội · Xét duyệt → đạo đức | HMU-07, HMU-08 · Minh chấm NC04 về tài liệu giáo dục sức khỏe. An chốt và ghi kết quả thẩm định. | Ba phiếu 8, 7, 9 cho trung bình 8/10. Hồ sơ chỉ chuyển sang đã duyệt sau khi có kết quả đạo đức phù hợp. |
| Y Hà Nội · Hợp đồng → giờ giảng | HMU-24, HMU-29, HMU-31 · Hà bật E4 riêng cho trường. An xác nhận bàn giao công cụ lập lịch trạm thực hành. | Hợp đồng 180 triệu thuộc bậc 40 giờ. Mai nhận 24 giờ, Minh nhận 16 giờ. Điều chỉnh −2 cho Mai tạo dòng mới và còn 22 giờ theo nguồn. |

Trong mỗi bộ, ca 10 đối chiếu báo cáo có **ba mã**, gồm một bản nháp đã từng được cấp mã. Ca 20 cho phép thử hai kết luận nghiệm thu từ hai cặp điểm. Ca 33, 34 và 39 cho phép rà quyền nguồn AI. Ca 42 và 43 dùng cho điện thoại.

## Dùng ngay trong dự án

Từ gốc repo, `pnpm --filter @rms/web dev` mở ứng dụng qua Vite. Thêm `/?cas=TLU-16` hoặc `/?cas=HMU-07` vào địa chỉ Vite để vào ca tương ứng. Cách chọn trường và vai bằng tay vẫn dùng được.

Dùng cửa sổ riêng tư mới cho lần trình diễn đầu tiên. RMS giữ các thao tác và cấu hình đã sửa trong trình duyệt tại cùng địa chỉ. Để lặp lại từ dữ liệu gốc, đóng toàn bộ cửa sổ riêng tư rồi mở phiên riêng tư mới. Một số ca cần làm nối tiếp trong cùng phiên, ví dụ HMU-07 → HMU-08. Thủy lợi mặc định bật AI và E4. Y Hà Nội mặc định tắt cả hai. Các ca Y Hà Nội ghi rõ lúc nào cần quản trị bật quyền.

Chạy `pnpm demo:pack` để dựng lại gói từ phiên bản hiện tại của repo, dùng Node và pnpm theo README dự án cùng Python 3 để đóng ZIP. Kết quả nằm ở `dist/demo-rms/` và `dist/rms-demo-tlu-hmu.zip`. Dữ liệu nghiệp vụ, nhật ký đầu kỳ và nội dung ca nằm trong [bộ Thủy lợi](../../../apps/web/src/demo/datasets/tlu.json) và [bộ Y Hà Nội](../../../apps/web/src/demo/datasets/hmu.json). Snapshot xuất ra gói bổ sung tài khoản, cấu hình, thông báo và sổ giờ qua cùng hàm khởi tạo mà ứng dụng dùng.

## Review theo tiêu chí nghiệm thu

Chọn **Tiêu chí và ca kiểm thử** trong sổ tay để tra ca theo F01–F12, B01–B04, B06 và P01–P03. Dùng phiếu của từng trường để ghi kết quả thực tế, mã AC/TC, ảnh hoặc tệp xuất và điểm cần sửa. PO/BA có thể xem đủ bối cảnh và trường hợp biên trong bản đặc tả và test plan đính kèm.

Phạm vi trình diễn là V0 trên trình duyệt. Đăng nhập SSO, kiểm quyền tại API, lưu tệp thật, tính bất biến của audit trong cơ sở dữ liệu và xử lý đồng thời cần môi trường tích hợp để nghiệm thu. B05 là mã dành cho cổng công khai trong lộ trình. [Phạm vi sản phẩm](../../features/README.md) · [Cách chạy kiểm thử tích hợp](../../../e2e/README.md)
