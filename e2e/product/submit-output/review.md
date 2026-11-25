# F07 · Đối chiếu US-20 và US-21

Bộ DB chạy trên hai tenant thử. [Kiểm nghiệp vụ và quyền](../../../apps/backend/test/db/products.test.mjs) · [Ca giao diện tích hợp](acceptance.ts).

| Điều kiện | Kết quả |
|---|---|
| Thiếu minh chứng, tệp bị thu quyền hoặc loại đã tắt | Từ chối nộp, giữ nguyên nháp và revision. Sau khi thay bằng PDF xác nhận ở SeaweedFS, gửi thành công và vào hàng chờ. |
| Chủ nhiệm hoặc phiên khác trường tự duyệt/tra nguồn | Kiểm quyền ở backend. Ngoài vai duyệt nhận 403, đề tài thuộc tenant khác nhận 404. |
| Duyệt đồng thời cùng một sản phẩm | Một sự kiện PRODUCT_APPROVED. Cam kết hai bài còn thiếu một. Minh chứng kỳ trước hết quyền dùng cho F07 nên được thay bằng bài báo mới. |
| Dùng ở F06 | Chỉ đếm sản phẩm đã APPROVED cùng đề tài và loại. Kỳ cuối chưa đạt hoặc thiếu một sáng chế đều giữ hồ sơ ở IN_PROGRESS. |

Ca US-20/21 ở trên dùng sản phẩm gắn đề tài. F07/AC-02 có ca riêng từ tệp của sản phẩm độc lập đến lý lịch đồng tác giả. [Kiểm F07/F08](../independent/acceptance.spec.ts) [Hướng dẫn và ảnh](../../../docs/guides/nguoi-dung/san-pham-va-nghiem-thu.md).

**Danh mục động của trường, ngày 25/11/2026.** Kịch bản Chrome riêng đã xác minh mã BASIN_MAP có nhãn Bản đồ nghiên cứu, kiểm lại hiệu lực ngay khi gửi dù tác giả đang mở bản nháp và sử dụng lại tệp đã xác nhận sau khi bật lại mã. PostgreSQL đối chiếu loại theo tenant và cam kết định lượng. [Ca danh mục](../../catalog/product-types/acceptance.spec.ts) · [Ảnh màn hình](../../../docs/reviews/screenshots/product/loai-san-pham-cua-truong.png)

**F07 → P03 → F08.** Sản phẩm độc lập có một tác giả thuộc Viện Khoa học và một đồng tác giả thuộc Khoa Quan trắc. Trong Chrome, chuyên viên chọn tác giả chính, điền 70/30 và duyệt. Worker ghi hai khoản đúng một lần dù chạy hai lượt. Đồng tác giả đối chiếu sổ 3,00 giờ trên F08. Mở lại bản kê khai với nhận xét khiến sản phẩm rời danh sách công bố đã duyệt và số giờ kỳ trở về 0,00. Ca DB kiểm thêm khoản 14,00 của tác giả chính, từ chối người nhận ngoài danh sách và nguồn gắn đề tài chỉ có một tác giả. [Ca Chrome](../independent/acceptance.spec.ts) · [Ảnh sổ giờ](../../../docs/reviews/screenshots/product/gio-dong-tac-gia.png)
