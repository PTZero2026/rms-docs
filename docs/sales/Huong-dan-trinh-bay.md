---
title: "Hướng dẫn nội bộ — Bản chào giải pháp RMS"
status: Draft
updated: 2026-09-17
---

# Hướng dẫn nội bộ cho sales

Tài liệu này dùng nội bộ, tách khỏi hai file gửi đối tác.

- **PowerPoint:** `RMS-Chao-giai-phap.pptx` — 22 slide, tỷ lệ 16:9; không chứa ghi chú nội bộ.
- **PDF:** `RMS-Chao-giai-phap.pdf` — cùng nội dung và bố cục; đã nhúng font tiếng Việt.
- **Hình giao diện:** trong `assets/`, gồm tổng quan desktop, hồ sơ desktop và mobile. Đây là hình thiết kế minh họa với dữ liệu giả lập, không phải ảnh chụp phần mềm đã triển khai.
- **Font PowerPoint:** Be Vietnam Pro (Google Fonts, OFL). Cài font khi chỉnh sửa để giữ bố cục.

## Cách trình bày trong 15–20 phút

1. Slide 1–5: bài toán và giải pháp.
2. Chọn slide ngành phù hợp trong nhóm 6–8.
3. Slide 9–12: vai trò và hình minh họa desktop/mobile.
4. Slide 13–17: quản trị, kết nối và cấu hình.
5. Slide 18–22: triển khai, hiệu quả, đầu tư và trao đổi tiếp theo.

## Ghi chú từng slide

### 01. Quản lý nghiên cứu khoa học
Tập trung. Minh bạch. Xuyên suốt.

Mở đầu bằng câu hỏi: Khi lãnh đạo cần biết toàn bộ danh mục nghiên cứu đang ở đâu, đơn vị mất bao lâu để có câu trả lời? Bộ tài liệu trình bày giải pháp đề xuất dựa trên đặc tả RMS, không phải xác nhận phần mềm đã triển khai. Dùng khoảng 15–20 phút; ưu tiên slide ngành phù hợp với người nghe.

**Cơ sở nội dung:** docs/product/vision.md; AGENTS.md; ADR-0011

### 02. Một nguồn dữ liệu cho cả vòng đời nghiên cứu

Trình bày ba lợi ích theo đúng vai trò người nghe. Không mở đầu bằng danh sách chức năng. Kết quả cần đạt sau buổi làm việc là được thống nhất khảo sát, chưa phải chốt ngay toàn bộ dự án.

**Cơ sở nội dung:** docs/product/vision.md; docs/product/personas.md

### 03. Dữ liệu rời rạc làm chậm quyết định

Hỏi đối tác chọn hai điểm nghẽn gây nhiều công sức nhất. Xin một ví dụ gần đây và số giờ/ngày đã mất để xử lý. Đây là dữ liệu đầu vào cho phạm vi và chỉ số đánh giá thí điểm.

**Cơ sở nội dung:** docs/product/vision.md §Vấn đề

### 04. Từ tiếp nhận đến kết quả, trên một luồng

Đi theo luồng từ trái sang phải. Nhấn mạnh một hồ sơ đề tài được nối với các bước tiếp theo để giảm việc tổng hợp rời rạc. Đây là vòng đời cốt lõi; quy trình cấp tỉnh/bộ hoặc chuyên ngành cần đối chiếu trong khảo sát.

**Cơ sở nội dung:** docs/product/vision.md; docs/architecture/overview.md; AGENTS.md §3–4

### 05. Ba nhóm năng lực tạo thành một hệ thống

Nếu đối tác hỏi một tính năng rất cụ thể, ghi nhận để đối chiếu đặc tả và đưa vào phạm vi nghiệm thu. Các nhóm năng lực ở đây là thiết kế giải pháp; không dùng để khẳng định mọi chức năng đã sẵn sàng.

**Cơ sở nội dung:** AGENTS.md §3; docs/product/vision.md; docs/architecture/overview.md

### 06. Quản lý danh mục nhiệm vụ theo trách nhiệm

Hỏi đơn vị đang quản lý đề tài nội bộ hay quản lý chương trình/nhiệm vụ cấp tỉnh, bộ. Lõi hiện mô tả vòng đời đề tài cấp cơ sở. F09 chỉ định hướng quản lý đầu mục đề tài cấp trên, không phải đầy đủ quy trình quản lý nhà nước. Nhu cầu tuyển chọn, đặt hàng, giao trực tiếp hoặc báo cáo chuyên ngành phải được phân tích thành phạm vi bổ sung.

**Cơ sở nội dung:** docs/epics/E4-hoat-dong-mo-rong.md; docs/architecture/variation-points.md; kịch bản ngành là đề xuất áp dụng

### 07. Kết nối đề tài với thành quả học thuật

Đây là nhóm đối tượng có nền tảng tài liệu phù hợp nhất. Hỏi cách trường ghi nhận công bố và giờ nghiên cứu hiện nay. Quy đổi giờ giảng, đề tài sinh viên và hoạt động mở rộng thuộc E4 Draft, chỉ đưa vào hợp đồng khi đã chốt đặc tả. Luận án, luận văn và khóa luận là định hướng dài hạn.

**Cơ sở nội dung:** docs/product/vision.md; docs/epics/E4-hoat-dong-mo-rong.md; F07/F08

### 08. Quản lý đề tài gắn với khoa, phòng và chủ nhiệm

Phân biệt hội đồng khoa học với hội đồng đạo đức trong nghiên cứu y sinh. Tài liệu hiện chưa đặc tả quy trình đạo đức, quản lý thử nghiệm lâm sàng, dữ liệu người bệnh hoặc tích hợp HIS/EMR. Những nhu cầu này cần phạm vi riêng. Không trình bày RMS như hệ thống quản lý bệnh án hay hệ thống thử nghiệm lâm sàng đã sẵn có.

**Cơ sở nội dung:** docs/product/vision.md; kịch bản bệnh viện là đề xuất áp dụng cần khảo sát

### 09. Cùng một nền tảng, rõ việc của từng người

Diễn giải rằng trải nghiệm khác nhau nhưng dữ liệu thống nhất. Một người có thể mang nhiều vai trò; phạm vi xem và thao tác phải được kiểm tra ở hệ thống, không chỉ ẩn nút trên giao diện. Hỏi ai là người duyệt và ai chỉ được xem ở mỗi cấp.

**Cơ sở nội dung:** AGENTS.md §4; docs/product/personas.md; B03; B06

### 10. Bao quát công việc trong một màn hình

Giới thiệu trang chủ theo vai trò. Chỉ số và hồ sơ trong ảnh là dữ liệu minh họa. Trang chủ đọc và điều hướng đến nghiệp vụ nguồn, không thực hiện phê duyệt trực tiếp.

**Cơ sở nội dung:** docs/features/B06-trang-chu/ui.md

### 11. Hồ sơ đề tài được tổ chức xuyên suốt

Dùng một đề tài để kể câu chuyện từ hồ sơ đến tiến độ và kết quả. Ảnh được thiết kế để minh họa cách tổ chức thông tin, không phải ảnh chụp sản phẩm đang vận hành.

**Cơ sở nội dung:** docs/product/vision.md; F01/F04/F05/F07

### 12. Theo dõi công việc ngay trên điện thoại

Minh họa giao diện web thích ứng trên điện thoại, không giới thiệu ứng dụng native hay khả năng offline. Dữ liệu trong ảnh là dữ liệu minh họa.

**Cơ sở nội dung:** AGENTS.md §4; docs/features/B06-trang-chu/ui.md

### 13. Từ câu hỏi của lãnh đạo đến dữ liệu cần có

Đây là khung yêu cầu báo cáo đề xuất, không phải ảnh chụp màn hình hiện hữu. Đặc tả B02 còn ở mức khung nên cần lấy 2–3 mẫu báo cáo thật từ đơn vị để chốt chỉ tiêu, phân quyền, bộ lọc và cách tính. Không hứa mọi báo cáo đều có sẵn.

**Cơ sở nội dung:** docs/product/vision.md; docs/features/B02-bao-cao-thong-ke/spec.md; B06

### 14. Theo dõi kinh phí gắn với hồ sơ đề tài

Làm rõ ngay ranh giới với phần mềm kế toán. RMS theo dõi kinh phí nghiên cứu, không thay thế sổ cái hay quy trình kế toán. Khả năng tự động đối soát phụ thuộc dữ liệu và phương thức trao đổi được phía tài chính cung cấp.

**Cơ sở nội dung:** docs/architecture/integrations.md §4; ADR-0004; F05

### 15. Truy cập đúng phạm vi. Thay đổi có dấu vết.

Không quy đổi nguyên tắc thiết kế thành chứng nhận an toàn thông tin hay cam kết đáp ứng mọi quy định ngành. Yêu cầu vận hành, sao lưu, phục hồi và thời gian hỗ trợ phải được thống nhất và nghiệm thu trong phương án triển khai.

**Cơ sở nội dung:** AGENTS.md §4; docs/architecture/integrations.md §5; docs/architecture/variation-points.md

### 16. Kế thừa hệ thống đơn vị đang sử dụng

Hỏi đối tác đang dùng hệ thống định danh nào và ai quản trị. Kiến trúc có hướng SSO, nhưng lựa chọn IdP cụ thể cần đối chiếu ADR-0008 và cấu hình triển khai. Đồng bộ nhân sự/sinh viên chưa phải một kết nối có sẵn. Không khẳng định tích hợp Microsoft Entra hoặc HIS/EMR đã hoàn tất.

**Cơ sở nội dung:** docs/architecture/integrations.md; docs/architecture/variation-points.md §2; docs/epics/E4-hoat-dong-mo-rong.md

### 17. Thống nhất nền tảng, phù hợp cách quản lý

Giải thích cấu hình giúp thích ứng nhưng có giới hạn. Sổ điểm biến thiên hiện là Draft; khả năng cụ thể phải được xác nhận trong phương án triển khai. Đặc thù cấp nhiệm vụ và chuyên ngành y cần phân tích riêng, không chỉ đổi tên biểu mẫu.

**Cơ sở nội dung:** docs/architecture/variation-points.md; ADR-0007; ADR-0012

### 18. Bắt đầu có trọng tâm, mở rộng theo kết quả

Không đưa lịch 4–8 tuần khi chưa có số liệu về phạm vi, sản phẩm thực thi và nguồn lực. Chốt đầu ra từng giai đoạn để quyết định có chuyển tiếp hay cần điều chỉnh. Đơn vị cần cử chủ trì nghiệp vụ, đầu mối CNTT và nhóm người dùng thí điểm.

**Cơ sở nội dung:** Lộ trình tư vấn đề xuất, dựa trên phạm vi RMS; không phải lịch triển khai đã cam kết

### 19. Đánh giá bằng kết quả, không chỉ bằng tính năng

Mốc giảm 30% lấy từ vision và chỉ là mục tiêu đề xuất. Thời gian xử lý tính từ nộp đến có kết quả xét duyệt; cần thống nhất cách xử lý thời gian chờ hội đồng và hồ sơ bổ sung. Nếu chu kỳ quá dài, chọn thêm chỉ số sớm như thời gian rà soát hoặc lập báo cáo để đánh giá thí điểm.

**Cơ sở nội dung:** docs/product/vision.md §Success metrics; phương án thí điểm đề xuất

### 20. Định giá theo phạm vi và điều kiện triển khai

Không có dữ liệu giá hay chính sách thương mại trong repo nên không điền con số giả định. Hỏi số đơn vị, số người dùng, số đề tài hoạt động, dung lượng tệp và số năm dữ liệu cần chuyển. Mô hình cấp phép, hạ tầng và hỗ trợ phải được chốt trong báo giá riêng.

**Cơ sở nội dung:** Khung thương mại đề xuất; chưa có bảng giá hoặc chính sách cấp phép được phê duyệt

### 21. Thống nhất khảo sát để có phương án cụ thể

Kết thúc bằng hành động cụ thể: thống nhất người phụ trách và thời điểm buổi khảo sát tiếp theo. Đọc lại hai vấn đề ưu tiên đã nghe từ đối tác và ghi vào biên bản. Không để cuộc họp kết thúc chỉ bằng việc gửi tài liệu chung.

**Cơ sở nội dung:** Đề xuất bước tiếp theo của hoạt động tư vấn giải pháp

### 22. Sáu thông tin để xây dựng đề xuất sát nhu cầu

Ghi câu trả lời vào biên bản và xác định người cung cấp tài liệu còn thiếu. Với bệnh viện, bổ sung câu hỏi về hồ sơ đạo đức và dữ liệu người bệnh; với sở/ban/ngành, hỏi cấp nhiệm vụ và căn cứ quy trình; với đại học, hỏi định mức và cách ghi nhận thành tích.

**Cơ sở nội dung:** Bộ câu hỏi tư vấn đề xuất, đối chiếu docs/product/vision.md và docs/architecture/variation-points.md
