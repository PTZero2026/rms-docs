# US-02 · Bằng chứng RV-02

Dữ liệu thử có một danh tính vận hành, quản trị A và thành viên B. Hai realm đăng nhập qua Mailpit và Keycloak, hai DB PostgreSQL riêng cho RMS và B01. Redis 7.4.12 chạy qua socket riêng. Các phép đọc qua adapter sử dụng cùng token với UI. [Ca trình duyệt](acceptance.spec.ts) · [Ca dữ liệu](../../../apps/sys-config-service/test/store.test.mjs)

| Ca | Quan sát sau thao tác |
|---|---|
| TC-01 | A mở bản Chung, chọn **Tạo bản riêng**, lưu Kỳ riêng A. Lần đọc tự động sau lưu hiển thị Kỳ riêng A. |
| TC-02 | B mở đúng mã KY.XET. B nhận Kỳ chung và màn hình ghi rõ đang dùng bản Chung. |
| TC-03 | Trước ghi, cả A và B đã đọc hai lần, lần sau HIT. Sau ghi, A đọc bản riêng và B đọc bản chung. PUT qua adapter đổi thành Kỳ A đợt 2. GET ngay qua adapter nhận Kỳ A đợt 2 ở A, B vẫn nhận Kỳ chung. |
| TC-04 | Token B gọi đường dẫn A nhận 401. Thành viên B ghi tại B nhận 403. Hạ quyền admin A khi token còn hạn rồi ghi nhận 403. Khóa B rồi đọc khóa đã cache nhận 403. Bản chung ở danh tính vận hành vẫn nguyên. |

Trên cùng bộ thử, file 6 MiB qua HTTP giữ checksum. File 20 MiB + 1 byte bị từ chối 413. Lỗi ghi audit rollback câu INSERT trước đó. Xóa override đưa A về đúng bản chung mới. [Ảnh và hướng dẫn cho hai vai trò](../../../docs/guides/nguoi-dung/cau-hinh-theo-truong.md)

## Hai tiến trình B01, một Redis

Ca RV-02 mở hai tiến trình trên cổng 3192 và 3194. Cả hai dùng riêng kết nối IAM, DB và Redis. Trường A và B đọc cùng khóa chung. Lượt MISS ở một tiến trình được tiếp nối bằng HIT ở tiến trình kia. Khi A tạo hoặc thay bản riêng, lần đọc tiếp theo qua tiến trình còn lại trả đúng bytes mới. Thay bản chung làm B đọc giá trị mới, A vẫn HIT bản riêng. Xóa override đưa A về bản chung mới nhất. Khóa độc lập vẫn HIT. Xóa tiếp bản chung khiến cả A và B nhận 404. Chạy harness OIDC với biến `RMS_REDIS_SOCKET` hoặc `RMS_REDIS_URL` trỏ tới Redis thử để kiểm các header HIT. [Ca chuyển tiến trình](replicas.ts)

## Định dạng, quyền đọc và ngày tra cứu

Quản trị chọn PNG 3.072 byte có tên đuôi `.bin`. Dry-run nhận đúng MIME và dung lượng, GET trước lưu trả 404. GET sau lưu trả `image/png`, bytes khớp bản gốc và Chrome giải mã được ảnh rộng 32 px. Quản trị thay nội dung bằng XML tiếng Việt UTF-16LE rồi tải lại. Chuỗi hiển thị và từng byte tải về đều khớp. Đã kiểm thêm giới hạn xem 64 KiB khi ký tự cuối cắt ngang, bảng mã chưa được trình duyệt hỗ trợ và dữ liệu nhị phân. [Ca Chrome](formats.spec.ts) · [Ảnh XML](../../../docs/reviews/screenshots/catalog/van-ban-theo-bang-ma.png)

Với ngày 01/01/2027 tại Việt Nam, PostgreSQL đã trả dòng lúc 17:00:00 UTC ngày 31/12 và 16:59:59.999999 UTC ngày 01/01, loại hai dòng ngay ngoài biên. Đổi người đọc sang trường khác trả tập rỗng. Ca ngày sửa dùng tháng khác với ngày tạo để phát hiện trường lọc bị nối nhầm. [Ca DB](../../../apps/sys-config-service/test/store.test.mjs)

Trong lúc quản trị đang sửa mô tả, IAM chuyển tài khoản sang người đọc. Lệnh lưu bị từ chối. Biểu mẫu, nội dung và liên kết tải cũ được gỡ. Tải lại danh sách chỉ còn hành động đọc, mở lại trả đúng XML gốc. Khóa hẳn tài khoản rồi đọc lần nữa làm nội dung và liên kết tải biến mất. [Ca theo phiên đang mở](formats.spec.ts)

Ca nhập văn bản trực tiếp đã ghi đúng bytes UTF-16LE. Khi chọn US-ASCII cho nội dung tiếng Việt, máy chủ trả 400 và GET vẫn đọc được bản trước. Unit kiểm riêng biểu mẫu URL-encoded, multipart, Windows-1252 và tệp có charset chưa biết. Trong phép thử PostgreSQL với client Redis báo lỗi đọc, ghi và xóa cache, DB vẫn ghi và trả bản mới. Khi client hoạt động lại, bản cache cũ bị loại theo revision, lượt đọc tiếp theo HIT. TTL được truyền cho cache là 300 giây. [Ca nội dung](../../../apps/sys-config-service/test/content.test.mjs) · [Ca cache báo lỗi](../../../apps/sys-config-service/test/store.test.mjs)
