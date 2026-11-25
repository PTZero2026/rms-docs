# F05 · Đối chứng US-18, US-19 và US-24

Ngày 24/11/2026 dùng cluster PostgreSQL riêng, B01 thật, hai realm Keycloak, S3 cục bộ và Chromium. [Ca trình duyệt](acceptance.spec.ts) · [Ca dịch vụ với PostgreSQL](../../../apps/backend/test/db/budget.test.mjs).

| Ca | Kết quả thực đo |
|---|---|
| US-18 · TC-01–04 | Cấp 100 triệu có 5 triệu phí; cấp 300 triệu có 10 triệu phí. Tỷ lệ chung đổi lên 6% sau xác nhận vẫn giữ phí cũ. Hai lệnh cấp đồng thời chỉ một lệnh thành công. Chủ nhiệm nhận 403 khi tự cấp, trường khác nhận 404 khi mở sổ. |
| US-19 · TC-01–04 | Số tiền 0 bị từ chối. Sau khoản 93 triệu, còn 2 triệu. Chi đúng 2 triệu đưa số dư về 0. Sửa thành 3 triệu ghi số vượt 1 triệu. Trình duyệt tải chứng từ PDF qua kho tệp thử. DB từ chối chứng từ của đề tài khác, ngày 30/02 và sửa bằng phiên bản cũ. |
| US-24 · TC-01–04 | Thiếu xác nhận rà thủ công làm lệnh đóng thất bại. Chế độ đối soát liệt kê từng UUID và trạng thái vướng. Đã thử từng trạng thái riêng và cả hai cùng lúc. Khớp hết mới đóng. Hai yêu cầu đóng đồng thời chỉ có một sự kiện COMPLETED. Sau khóa, sửa/hủy khoản chi đều bị chặn. |

Nguồn PASSED được đặt tại biên fixture F06 để kiểm F05 độc lập. Mã giao dịch do chuyên viên nhập từ bộ đối chứng tổng hợp. Trường cần cung cấp tỷ lệ, trần và quy chế đối soát để nghiệm thu pilot. [Hướng dẫn và ảnh](../../../docs/guides/nguoi-dung/so-kinh-phi.md).
