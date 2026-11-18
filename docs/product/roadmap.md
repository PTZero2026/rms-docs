---
title: "Lộ trình sản phẩm RMS"
status: Review
updated: 2026-11-18
---

# Lộ trình sản phẩm RMS

Lộ trình theo kỳ nghiệp vụ. Phòng khoa học và PO chọn kỳ, số hồ sơ, đơn vị tham gia và chụp số liệu ban đầu trước khi thử. Mã US là lát cắt có thể nghiệm thu riêng. Epic E0–E4 và module tiếp tục dùng mã hiện có. [Danh mục INVEST](../sales/thi-truong-viet-nam-2026/feature-list-invest.md) · [Bản đồ epic](../epics/README.md)

| Đợt | Phạm vi ưu tiên | Bằng chứng để chuyển đợt |
|---|---|---|
| A · US-01–13 | B03/B01/P01/P02 làm nền. F02/F01/F03 mở kỳ, nộp lại cùng mã, chấm và kết luận. B06 dẫn tới việc cần xử lý trên điện thoại. B02 đếm theo kỳ. | Chạy một kỳ với hai đơn vị, đối chiếu số đề tài với danh sách đã chốt, kiểm quyền cả dòng và tổng. Đo thời gian xử lý và số hồ sơ phải bổ sung. Nếu có thẩm định đạo đức, xác nhận điểm chặn trước công bố kết quả. |
| B · US-14–25 | F04/B04 giao đề tài, nhắc và nhận báo cáo. F05 ghi cấp/chi. F07 duyệt đầu ra, F06 nghiệm thu. F05 khóa sổ, F08 xuất lý lịch. | Từ quyết định giao đến hồ sơ cuối có đủ chứng cứ và nhật ký. PO, QLKH và tài chính thống nhất điều kiện khóa sổ. Đối soát tự động chỉ lập kế hoạch khi có hệ thống đối tác, dữ liệu mẫu và người chịu trách nhiệm. |
| C · US-26–32 | Kích hoạt riêng F09–F12 và P03 theo quy chế từng trường. Hai thử nghiệm AI rà thuyết minh và tạo thẻ đọc có dẫn nguồn thuộc F01/F07. | Trường ký bộ tính mẫu và sự kiện ghi nhận giờ. Chủ dữ liệu duyệt nguồn AI, QA đo sai dẫn chứng, lọt quyền, độ chính xác và khả năng tiếp tục thủ công. |

Khởi đầu với trường đại học có kỳ cấp cơ sở lặp lại. Bệnh viện cần rà quy trình hội đồng đạo đức và quyền dữ liệu. Sở KH&CN cần đối chiếu biểu mẫu nhiệm vụ và phạm vi liên đơn vị. [Căn cứ thị trường và thiết kế thử nghiệm](../sales/thi-truong-viet-nam-2026/README.md)

## Phạm vi dài hạn còn giữ

Cổng công khai B05 dùng nội dung được phép công bố sau nghiệm thu. Báo cáo liên kỳ B02, đối soát tài chính, SSO của từng đơn vị và di trú dữ liệu lịch sử có phạm vi riêng. Hội đồng và mô hình phiếu của F03 được tái dùng ở F06. Ứng dụng cài trên máy, thông báo đẩy và lưu ngoại tuyến cần bằng chứng nhu cầu từ ít nhất hai đơn vị cùng phương án dữ liệu thiết bị. [Biến thể theo tenant](../architecture/variation-points.md)

## Theo dõi phiên bản

PO/BA duyệt thứ tự đề xuất, mẫu báo cáo và tiêu chí thử. Bản trước giữ lịch sử ưu tiên, chi tiết đăng nhập, E4 và các phụ thuộc dài hạn. [Bản tháng 06](ref/roadmap-2026-06-24.md) · [Báo cáo review](../../specs/README.md)
