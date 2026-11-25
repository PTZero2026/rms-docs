# US-31 · Đối chiếu thuyết minh

Ca Chrome chạy ngay trong màn hình soạn F01. Chủ nhiệm lưu hai đoạn đã gán vào mục Phương pháp. Sau khi cấp quyền xử lý nguồn, trợ lý trỏ về đúng đoạn 1 và bản mẫu. Bấm mở căn cứ mở lại theo quyền hiện tại. Bác gợi ý giữ nguyên revision và nội dung thuyết minh. Thu quyền xử lý trong trường rồi gọi lại, hoặc gọi từ trường khác, máy chủ trả 404. Dịch vụ mô hình nhận 0 lượt mới chứa đoạn bị thu quyền. Khi mô hình trả 503, chủ nhiệm vẫn sửa và lưu nháp bằng F01. [Ca Chromium](acceptance.ts) · [Ảnh của chủ nhiệm](../../../docs/reviews/screenshots/assistant/chu-nhiem-ra-thuyet-minh.png)

Đây là bộ chọn đoạn thử qua HTTP theo giao diện chat completions. Môi trường triển khai dùng phiên bản mô hình do trường phê duyệt. Chưa có bộ 50 thuyết minh gán nhãn độc lập và quyết định cho dùng dữ liệu. T007/T008 chưa đủ điều kiện xác nhận chất lượng pilot. QA ghi số mục thiếu đúng/tổng mục thiếu, báo sai/tổng cảnh báo, số lộ nguồn và số dẫn bịa trên bộ đó.

## Chấm SC-003 trên hồ sơ được duyệt

1. Chủ dữ liệu duyệt danh sách 50 hồ sơ, quyền đọc và quyền xử lý cho phép thử. Trong kho bằng chứng của trường, lưu mã quyết định, người duyệt, thời hạn và danh sách đối chiếu giữa mã ẩn danh với hồ sơ gốc.
2. Trước khi chạy mô hình, người gán nhãn lấy UUID trường (`tenantId`) và UUID đề xuất (`sourceId`) từ danh sách đối chiếu đã duyệt. Ghi hai UUID cùng mã ẩn danh, phiên bản thuyết minh, phiên bản mẫu và nhãn cho từng mục bắt buộc vào `gold.json`. Giá trị `missing: true` nghĩa là mục thực sự thiếu căn cứ. Chốt tệp và SHA-256 trước khi giao kết quả cho QA.
3. Với mỗi mã hồ sơ, QA đối chiếu mã với URL yêu cầu tạo gợi ý, lưu nguyên phản hồi thành công đầu tiên vào thuộc tính `card` trong `run.json`. Dùng một phiên bản mô hình và mẫu lệnh cho cả lượt. Khi dịch vụ lỗi, ghi riêng lỗi và kết quả rà thủ công theo TC-03. Một lượt thiếu kết quả cho bất kỳ hồ sơ nào chưa đủ để chấm 50 hồ sơ.
4. Người kiểm quyền đối chiếu log dữ liệu gửi tới mô hình và nội dung trả cho người dùng với quyền nguồn tại thời điểm chạy. Ghi số lần vượt quyền vào `unauthorizedDisclosures`. Người kiểm dẫn chứng mở từng trích dẫn theo phiên bản, vị trí và nội dung gốc, ghi số dẫn bịa vào `fabricatedCitations`. Gắn cả hai số đếm với đúng `suggestionId` và lưu chứng cứ trong kho được cấp quyền. Chỉ điền 0 sau khi đã kiểm.

Hai ví dụ dưới mô tả **một hồ sơ tổng hợp**. Trong tệp kết quả thực, giữ các thuộc tính API của từng `card`, gồm cả văn bản/vị trí trả về. Mã `batch` phải trùng giữa hai tệp.

`gold.json`

```json
{
  "batch": "vi-du",
  "cases": [{
    "dossier": "HS-01", "tenantId": "cdd1eb46-c566-4b6d-a48d-1885d22ef061",
    "sourceId": "b6f21c9c-eec3-4986-806c-01aef064b540", "sourceVersion": "r2", "templateVersion": "form-abc",
    "fields": [{"key": "method", "missing": true}]
  }]
}
```

`run.json` (chỉ minh họa các thuộc tính được đọc)

```json
{
  "batch": "vi-du",
  "cases": [{
    "dossier": "HS-01",
    "card": {
      "id": "5f27eab1-cf27-4886-8a04-49a93aa5802a", "tenantId": "cdd1eb46-c566-4b6d-a48d-1885d22ef061",
      "sourceKind": "proposal", "sourceId": "b6f21c9c-eec3-4986-806c-01aef064b540",
      "sourceVersion": "r2", "templateVersion": "form-abc",
      "model": "fixture", "prompt": "v1",
      "fields": [{"key": "method", "text": null, "location": null}]
    },
    "audit": {"suggestionId": "5f27eab1-cf27-4886-8a04-49a93aa5802a", "unauthorizedDisclosures": 0, "fabricatedCitations": 0}
  }]
}
```

Từ gốc repo, đặt đường dẫn của kho bằng chứng có quyền truy cập vào biến `RMS_REVIEW_DIR` rồi chạy tại máy được cấp quyền.

```sh
node e2e/proposal/ai-proposal-evidence/score.mjs \
  "$RMS_REVIEW_DIR/gold.json" "$RMS_REVIEW_DIR/run.json" > "$RMS_REVIEW_DIR/sc-003.json"
```

Công cụ tìm kết quả theo mã ẩn danh, sau đó đối chiếu UUID trường, UUID đề xuất, loại nguồn `proposal`, phiên bản nguồn/mẫu, mã gợi ý trong biên bản rà và khóa từng mục. Hai mã ẩn danh trỏ cùng một đề xuất của một trường làm lượt chấm dừng với mã 2. Với bản xuất cũ thiếu thông tin nhận diện nguồn, QA thu một lượt mới trên các phiên bản đã được duyệt và lưu nguyên phản hồi ngay khi tạo gợi ý.

Khi cả `text` và `location` là `null`, API đã báo thiếu căn cứ. Mỗi mục bắt buộc được tính một lần. Hai tỷ lệ trong JSON có thang 0–1 và dùng tổng số mục của cả bộ. Mẫu số 0 trả `null`. Báo cáo chứa số đếm, tỷ lệ, phiên bản mô hình/mẫu lệnh, tiêu chí trượt và SHA-256 của hai tệp. UUID trường, UUID hồ sơ và trích đoạn chỉ nằm trong bằng chứng chi tiết của trường.

| Mã thoát | QA ghi vào biên bản |
|---|---|
| 0 | Đủ 50 hồ sơ, phát hiện ≥90% mục thiếu, ≤10% cảnh báo sai và người rà ghi 0 vi phạm ở cả hai nhóm. Chủ dữ liệu đối chiếu chữ ký, bằng chứng gán nhãn và log gốc trước khi quyết định. |
| 1 | Đã chấm. Xem `failedCriteria` để xác định cỡ mẫu, tỷ lệ hoặc số vi phạm chưa đạt. |
| 2 | Dữ liệu thiếu hoặc lệch. Sửa bản ghép/phiên bản theo chứng cứ gốc rồi chạy lại. |

QA lưu báo cáo bên cạnh hai tệp đã chốt trong kho của trường. Dữ liệu thật và trích đoạn nguồn thuộc phạm vi truy cập của kho đó. [Bộ chấm](score.mjs) · [Kiểm thử bằng dữ liệu tổng hợp](score.test.mjs)
