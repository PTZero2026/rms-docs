---
title: "ADR-0014 · Kênh sản phẩm và phạm vi lập kế hoạch từ INVEST"
status: Proposed
date: 2026-11-18
deciders: "PO, kiến trúc sư, chủ dữ liệu"
---

# Kênh sản phẩm và phạm vi lập kế hoạch từ INVEST

Phòng khoa học cần xử lý một kỳ trên máy tính trong khi chủ nhiệm thường mở việc cần làm trên điện thoại. Nhu cầu thử AI ở F01/F07 đặt thêm câu hỏi về quyền đọc nguồn và trách nhiệm với kết quả. [Nghiên cứu thị trường](../../sales/thi-truong-viet-nam-2026/README.md)

## Khuyến nghị

Giữ web phân quyền theo ADR-0009. Nghiệm thu tương tác màn hình hẹp trong cùng ứng dụng. Mỗi lát INVEST có một tiền tố kênh theo nơi chịu trách nhiệm chính. Dịch vụ dùng chung sở hữu kiểm tra quyền, dữ liệu và chuyển bước. Chỉ mở E4 hoặc AI theo cấu hình tổ chức. Với AI, người dùng có thể truy lại căn cứ và bác đề xuất. Xác định nguồn được phép, kiểm soát truy xuất và giữ được luồng thủ công trước khi mở thử.

Ghi kế hoạch và tasks trong xưởng Spec Kit để PO/BA, QA và kiến trúc sư cùng rà. Repo code nhận các task đã chọn sau khi người phụ trách quyết định các vấn đề còn mở. Việc ký BR/AC vẫn theo quy trình của feature. [Hiến pháp](../../../AGENTS.md) · [Sổ khuyến nghị](../../../specs/review-decisions.md)

## Các lựa chọn và hệ quả

App native có thể phục vụ push và ngoại tuyến nhưng kéo theo lưu trữ và thu hồi dữ liệu trên thiết bị. Thu thập cùng một nhu cầu ở ít nhất hai đơn vị trước khi lập luận chứng. Việc gắn AI trực tiếp vào khâu phê duyệt sẽ chuyển trách nhiệm quyết định của hội đồng sang hệ thống. Hai lát đầu chỉ rà căn cứ và hỗ trợ đọc tài liệu. [ADR-0009](0009-hop-nhat-mot-web-phan-quyen.md) · [ADR-0010](0010-chuan-du-lieu-cho-ai-tham-gia.md) · [ADR-0012](0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)
