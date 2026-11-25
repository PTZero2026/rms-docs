# Đo hiệu năng RMS trên môi trường cục bộ

Mỗi lần chạy tạo cluster PostgreSQL trên Unix socket riêng. Bộ k6 đăng nhập bốn tài khoản qua Keycloak và Mailpit, cấp token mới cho từng đoạn đo, tạo 10 kỳ và 1.000 đề tài cho mỗi trường, phân bổ 80/20 giữa hai khoa. Từng đề tài có năm dòng audit bổ sung. Mỗi người dùng ảo nghỉ ngẫu nhiên 1–3 giây. API, Chromium, k6 và các dịch vụ đều chạy trên cùng máy qua loopback.

| Câu hỏi | Kịch bản và cách đọc kết quả |
|---|---|
| Đăng nhập và danh sách có dùng được chưa? | [Số đo Chromium](login-result.json) có năm phiên trình duyệt mới với hạ tầng đang chạy, 30 phiên warm, thời gian trang danh sách hiện hàng đầu và thời gian quan sát thư ở Mailpit. Mốc đầu của trang là thời điểm điều hướng đến tài liệu callback. Tier local luôn chạy nên chưa đo được thời gian DB thức dậy hay chặng SMTP bên ngoài. |
| API đáp ứng thế nào khi nhiều người cùng nộp? | [Từng đoạn k6](results-full.json) ghi số request, số lỗi HTTP, RPS, p50/p95/p99 theo loại yêu cầu. Sau baseline và ramp 2 phút là năm đoạn 20 VU, mỗi đoạn 2 phút, rồi ba đoạn 50 VU, mỗi đoạn 2 phút. Giữ dữ liệu phát sinh trong chuỗi này để thấy ảnh hưởng tích lũy. |
| Cùng nháp, cùng seed, sau khi hết dồn tải? | [Ca đối chứng](deadline.spec.ts) phục hồi toàn bộ DB thử về cùng dump trước lượt 2 và 3, kiểm dấu vân tay nguồn trước mỗi lượt. Gửi đồng thời hai request trên cùng nháp trong khi 50 VU thao tác, đối chiếu mã, số bước và scope trường khác. Ngay sau đó chạy lại 20 VU trong 20 giây và kiểm p95 danh sách, ghi, nộp và báo cáo. [Kết quả ba lượt](deadline-result.json) |
| Một trường lớn ảnh hưởng thế nào đến trường nhỏ? | [Phép đo DB và truy vấn](capacity-result.json) gồm 120 lần đọc/xuất cho mỗi cấu hình, pool 8 kết nối, 12 client, trường A từ 1.000 lên 10.000 đề tài. Có thời gian đợi pool, số câu truy vấn, số dòng, và kế hoạch thực thi. Index thử chỉ tồn tại trong cluster hiệu năng. |

Ở gốc repo, chuẩn bị Keycloak/Mailpit, S3 và Redis thử theo runbook. Dùng môi trường của test với `RMS_K6_BIN` trỏ tới binary k6. Hai lệnh OIDC dùng chung cổng nên chạy tuần tự.

```sh
RMS_BROWSER_CHANNEL=chrome RMS_PERF=full bash apps/backend/test/db/run.sh --oidc perf/load.spec.ts
RMS_BROWSER_CHANNEL=chrome RMS_PERF=deadline bash apps/backend/test/db/run.sh --oidc perf/deadline.spec.ts
bash apps/backend/test/db/run.sh --capacity
```

Một lượt thử ban đầu mất hiệu lực token giữa chặng warm. Harness hiện kiểm thời hạn token trước khi khởi động từng đoạn. Tham khảo [mục tiêu đo của pilot](../../docs/guides/kiem-thu-rms.md).
