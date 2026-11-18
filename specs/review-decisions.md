---
title: "Sổ quyết định cần review"
status: Review
updated: 2026-11-18
---

# Sổ quyết định cần review

PO/BA có thể bắt đầu từ RV-11 (hai hội đồng), RV-13 (số liệu kỳ), RV-24 (khóa sổ), RV-30 (giờ giảng), RV-31/32/35 (AI). Mỗi mã dưới đây là một quyết định có thể duyệt riêng. Mã RV-01–32 đi cùng AC-03 và TC-03 của thẻ tương ứng. [Báo cáo và danh mục](README.md)

**Cách xử lý.** Người chịu trách nhiệm ghi kết quả `Chấp thuận`, `Sửa` hoặc `Hoãn`, ngày, tên/vai trò, căn cứ và nội dung thay thế. AI có thể rà kết quả với spec → plan → tasks → quickstart, nêu tệp và mã còn lệch. Người duyệt nghiệp vụ ký trước khi cập nhật BR/AC nguồn hoặc đưa cam kết vào pilot. “Chờ review” là trạng thái của quyết định, kể cả khi tài liệu lập kế hoạch đã đầy đủ.

## RV-01

**Có chờ hết phiên khi nhân sự rời trường?** · Chờ review · Quản trị IAM và phụ trách CNTT.

- **Use case.** Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ. Với điều kiện người vừa bị khóa còn một phiên mở, khi tải lại hồ sơ, kết quả mong đợi là bị từ chối, dữ liệu lịch sử còn nguyên.
- **Khuyến nghị.** Kiểm trạng thái tại yêu cầu nghiệp vụ kế tiếp, kể cả phiên đã mở.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-01 · đặc tả](001-shared-lock-account/spec.md) · [Ca thử](001-shared-lock-account/quickstart.md) · [Phương án khác](001-shared-lock-account/research.md)

## RV-02

**Làm sao tránh hiển thị cấu hình cũ sau khi lưu?** · Chờ review · Quản trị tenant và kiến trúc sư.

- **Use case.** Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung. Với điều kiện a và B đã đọc khóa dùng chung trước khi A ghi đè, khi đọc lại tại hai trường, kết quả mong đợi là A dùng bản riêng, B vẫn dùng bản chung.
- **Khuyến nghị.** Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-02 · đặc tả](002-shared-config-override/spec.md) · [Ca thử](002-shared-config-override/quickstart.md) · [Phương án khác](002-shared-config-override/research.md)

## RV-03

**Áp dụng quy chế mới cho hồ sơ nào?** · Chờ review · Chủ quy trình và kiến trúc sư.

- **Use case.** Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng. Với điều kiện hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt, khi người xử lý hoàn tất bước, kết quả mong đợi là bước kế tiếp lấy từ v1.
- **Khuyến nghị.** Chọn phiên bản đang hiệu lực khi tạo hồ sơ, giữ phiên bản của hồ sơ đã tồn tại.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-03 · đặc tả](003-shared-workflow-version/spec.md) · [Ca thử](003-shared-workflow-version/quickstart.md) · [Phương án khác](003-shared-workflow-version/research.md)

## RV-04

**Nếu chuyên viên đổi khoa sau khi chuyển bước, ai xem được lịch sử?** · Chờ review · Chủ dữ liệu và QA phân quyền.

- **Use case.** Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào. Với điều kiện chuyên viên vừa mất quyền đề tài nhưng còn liên kết cũ, khi mở nhật ký, kết quả mong đợi là không lộ nội dung hoặc tên hồ sơ.
- **Khuyến nghị.** Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-04 · đặc tả](004-shared-audit-trail/spec.md) · [Ca thử](004-shared-audit-trail/quickstart.md) · [Phương án khác](004-shared-audit-trail/research.md)

## RV-05

**Nếu danh mục hết hiệu lực giữa lúc soạn và mở kỳ thì sao?** · Chờ review · Phòng KHCN và BA.

- **Use case.** Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn. Với điều kiện một lĩnh vực bắt buộc vừa ngừng hiệu lực trong bản nháp, khi chuyên viên mở kỳ, kết quả mong đợi là kỳ vẫn nháp và hiển thị mục cần thay.
- **Khuyến nghị.** Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-05 · đặc tả](005-web-open-call/spec.md) · [Ca thử](005-web-open-call/quickstart.md) · [Phương án khác](005-web-open-call/research.md)

## RV-06

**Giảng viên cần điền tới đâu để lưu lần đầu?** · Chờ review · Chủ nhiệm và BA.

- **Use case.** Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét. Với điều kiện chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp, khi lưu rồi mở lại nháp, kết quả mong đợi là thấy phần đã nhập và có thể tiếp tục sửa.
- **Khuyến nghị.** Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-06 · đặc tả](006-web-draft-proposal/spec.md) · [Ca thử](006-web-draft-proposal/quickstart.md) · [Phương án khác](006-web-draft-proposal/research.md)

## RV-07

**Xử lý hồ sơ đến đúng thời điểm kết thúc kỳ thế nào?** · Chờ review · Chuyên viên quản lý kỳ và PO.

- **Use case.** Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ. Với điều kiện nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở, khi chủ nhiệm gửi hai lần, kết quả mong đợi là chỉ có một mã và một lần chuyển Đã nộp.
- **Khuyến nghị.** Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-07 · đặc tả](007-web-submit-proposal/spec.md) · [Ca thử](007-web-submit-proposal/quickstart.md) · [Phương án khác](007-web-submit-proposal/research.md)

## RV-08

**Có thể trả hồ sơ mà chỉ ghi khoảng trắng ở lý do?** · Chờ review · Chuyên viên tiếp nhận và PO.

- **Use case.** Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại. Với điều kiện hồ sơ còn hạn và lý do chỉ chứa khoảng trắng, khi chuyên viên gửi trả, kết quả mong đợi là giữ Đã nộp, yêu cầu nhập lý do.
- **Khuyến nghị.** Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-08 · đặc tả](008-web-return-proposal/spec.md) · [Ca thử](008-web-return-proposal/quickstart.md) · [Phương án khác](008-web-return-proposal/research.md)

## RV-09

**Hai chuyên viên cùng mở đợt cho một đề tài thì sao?** · Chờ review · Thư ký hội đồng và BA.

- **Use case.** Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công. Với điều kiện hai chuyên viên cùng chọn một hồ sơ đủ điều kiện, khi xác nhận mở đợt đồng thời, kết quả mong đợi là chỉ một đợt thu phiếu, một lần chuyển trạng thái.
- **Khuyến nghị.** Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-09 · đặc tả](009-web-open-review/spec.md) · [Ca thử](009-web-open-review/quickstart.md) · [Phương án khác](009-web-open-review/research.md)

## RV-10

**Nếu phát hiện xung đột sau khi người chấm mở nháp thì sao?** · Chờ review · Chủ tịch hội đồng và QA.

- **Use case.** Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số. Với điều kiện người đã mở nháp vừa được bổ sung vào nhóm đề tài, khi gửi phiếu đã điền, kết quả mong đợi là phiếu không được tính và người đó mất quyền chấm.
- **Khuyến nghị.** Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-10 · đặc tả](010-web-submit-score/spec.md) · [Ca thử](010-web-submit-score/quickstart.md) · [Phương án khác](010-web-submit-score/research.md)

## RV-11

**Khi cơ sở yêu cầu cả đạo đức lẫn khoa học, lúc nào được phê duyệt đề tài?** · Chờ review · PO, thư ký hội đồng khoa học và đạo đức.

- **Use case.** Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt. Với điều kiện đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ, khi chuyên viên chốt khoa học, kết quả mong đợi là lưu kết quả hội đồng, đề tài chưa APPROVED.
- **Khuyến nghị.** Lưu kết luận khoa học riêng, giữ chuyển APPROVED cho tới khi đủ kết quả đạo đức nếu quy chế yêu cầu.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-11 · đặc tả](011-shared-review-decision/spec.md) · [Ca thử](011-shared-review-decision/quickstart.md) · [Phương án khác](011-shared-review-decision/research.md)

## RV-12

**Nếu mất quyền sau khi đã thấy thẻ trên điện thoại thì sao?** · Chờ review · Chủ nhiệm, UX và chủ dữ liệu.

- **Use case.** Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc. Với điều kiện điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền, khi chạm thẻ cũ, kết quả mong đợi là không lộ hồ sơ và có đường về trang chủ.
- **Khuyến nghị.** Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-12 · đặc tả](012-mobile-open-work-item/spec.md) · [Ca thử](012-mobile-open-work-item/quickstart.md) · [Phương án khác](012-mobile-open-work-item/research.md)

## RV-13

**Một hồ sơ trả về nháp rồi nộp lại được đếm thế nào?** · Chờ review · Trưởng phòng KHCN và PO/BA.

- **Use case.** Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng. Với điều kiện có 3 hồ sơ đã cấp mã và một bản nháp chưa từng nộp, khi đếm cả kỳ rồi xuất danh sách, kết quả mong đợi là tổng 3, bản chưa từng nộp không có dòng.
- **Khuyến nghị.** Đếm theo định danh hồ sơ đã cấp mã trong kỳ, nhóm theo trạng thái chuẩn tại lúc trích xuất. Dòng và tổng dùng cùng bản chụp.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-13 · đặc tả](013-web-call-report/spec.md) · [Ca thử](013-web-call-report/quickstart.md) · [Phương án khác](013-web-call-report/research.md)

## RV-14

**Chuyên viên có thể giao khi mới có số quyết định nhưng chưa có bản đính kèm?** · Chờ review · Trưởng phòng KHCN và chuyên viên hợp đồng.

- **Use case.** Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt. Với điều kiện thiếu tệp căn cứ dù đã nhập số quyết định, khi xác nhận giao, kết quả mong đợi là nêu mục tệp thiếu, giữ APPROVED.
- **Khuyến nghị.** Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-14 · đặc tả](014-web-assign-project/spec.md) · [Ca thử](014-web-assign-project/quickstart.md) · [Phương án khác](014-web-assign-project/research.md)

## RV-15

**Hai đề tài có được dùng cùng mã kỳ không?** · Chờ review · Chuyên viên tiến độ và BA.

- **Use case.** Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ. Với điều kiện hai đề tài đang thực hiện cùng chưa có kỳ 1, khi tạo kỳ 1 cho từng đề tài, kết quả mong đợi là mỗi đề tài có một báo cáo chờ riêng.
- **Khuyến nghị.** Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-15 · đặc tả](015-web-report-period/spec.md) · [Ca thử](015-web-report-period/quickstart.md) · [Phương án khác](015-web-report-period/research.md)

## RV-16

**Chạy lại sau lỗi gửi email có tạo thông báo nghiệp vụ thứ hai?** · Chờ review · Chuyên viên tiến độ và phụ trách vận hành.

- **Use case.** Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại. Với điều kiện thông báo trong ứng dụng đã có nhưng kênh email lỗi, khi tác vụ chạy lại cùng mốc, kết quả mong đợi là vẫn một thông báo và theo dõi được lần gửi lại.
- **Khuyến nghị.** Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-16 · đặc tả](016-shared-deadline-reminder/spec.md) · [Ca thử](016-shared-deadline-reminder/quickstart.md) · [Phương án khác](016-shared-deadline-reminder/research.md)

## RV-17

**Có chặn báo cáo quá hạn nếu đề tài vẫn đang thực hiện?** · Chờ review · Chủ nhiệm và chuyên viên tiến độ.

- **Use case.** Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ. Với điều kiện báo cáo đến đúng hạn trong khi đề tài đang thực hiện, khi chủ nhiệm nộp đủ tệp, kết quả mong đợi là ghi nhận đúng hạn và chuyển chờ duyệt.
- **Khuyến nghị.** Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-17 · đặc tả](017-web-submit-progress/spec.md) · [Ca thử](017-web-submit-progress/quickstart.md) · [Phương án khác](017-web-submit-progress/research.md)

## RV-18

**Khi tỷ lệ cho kết quả cao hơn trần, lấy số nào?** · Chờ review · Kế toán và chuyên viên kinh phí.

- **Use case.** Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng. Với điều kiện cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng, khi xác nhận, kết quả mong đợi là phí 10 triệu và phần thực hiện 290 triệu.
- **Khuyến nghị.** Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-18 · đặc tả](018-shared-budget-allocation/spec.md) · [Ca thử](018-shared-budget-allocation/quickstart.md) · [Phương án khác](018-shared-budget-allocation/research.md)

## RV-19

**Khoản chi vượt mức thực hiện xử lý thế nào?** · Chờ review · Kế toán và chủ nhiệm.

- **Use case.** Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện. Với điều kiện còn 2 triệu, khoản chi đúng 2 triệu đồng, khi chủ nhiệm lưu, kết quả mong đợi là số dư bằng 0 và không cảnh báo vượt.
- **Khuyến nghị.** Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-19 · đặc tả](019-web-record-expense/spec.md) · [Ca thử](019-web-record-expense/quickstart.md) · [Phương án khác](019-web-record-expense/research.md)

## RV-20

**Một tệp có trong thư viện nhưng người dùng vừa mất quyền có thể làm minh chứng không?** · Chờ review · Chủ nhiệm và chuyên viên sản phẩm.

- **Use case.** Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết. Với điều kiện tệp đính kèm đã bị thu quyền trước khi gửi, khi nộp sản phẩm, kết quả mong đợi là báo minh chứng chưa hợp lệ, giữ nháp.
- **Khuyến nghị.** Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-20 · đặc tả](020-web-submit-output/spec.md) · [Ca thử](020-web-submit-output/quickstart.md) · [Phương án khác](020-web-submit-output/research.md)

## RV-21

**Duyệt cùng sản phẩm hai lần có làm tăng số cam kết đã đạt không?** · Chờ review · Chuyên viên sản phẩm và phòng KHCN.

- **Use case.** Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại. Với điều kiện cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại, khi gửi lại lệnh duyệt, kết quả mong đợi là chỉ một đầu ra được tính, mục cam kết vẫn thiếu một.
- **Khuyến nghị.** Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-21 · đặc tả](021-shared-approve-output/spec.md) · [Ca thử](021-shared-approve-output/quickstart.md) · [Phương án khác](021-shared-approve-output/research.md)

## RV-22

**Cùng đủ số lượng tổng nhưng thiếu một loại sản phẩm thì có được nghiệm thu?** · Chờ review · Chuyên viên nghiệm thu và chủ nhiệm.

- **Use case.** Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu. Với điều kiện cam kết một bài và một sáng chế, đã duyệt hai bài, khi đăng ký nghiệm thu, kết quả mong đợi là nêu thiếu sáng chế và giữ IN_PROGRESS.
- **Khuyến nghị.** Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-22 · đặc tả](022-web-request-acceptance/spec.md) · [Ca thử](022-web-request-acceptance/quickstart.md) · [Phương án khác](022-web-request-acceptance/research.md)

## RV-23

**Một phiếu xét duyệt đầu vào có được tính để đủ số phiếu nghiệm thu?** · Chờ review · Thư ký hội đồng nghiệm thu và PO.

- **Use case.** Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán. Với điều kiện đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào, khi chốt kết luận, kết quả mong đợi là vẫn thiếu một phiếu, chưa chuyển PASSED.
- **Khuyến nghị.** Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-23 · đặc tả](023-shared-acceptance-result/spec.md) · [Ca thử](023-shared-acceptance-result/quickstart.md) · [Phương án khác](023-shared-acceptance-result/research.md)

## RV-24

**Khi pilot chưa nối kế toán, căn cứ nào đủ để khóa sổ?** · Chờ review · PO, trưởng phòng KHCN và kế toán trưởng.

- **Use case.** Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành. Với điều kiện đề tài PASSED đã bật đối soát và còn một dòng MISMATCHED, khi chuyên viên đóng sổ, kết quả mong đợi là giữ PASSED, chỉ rõ dòng cần xử lý trước khi đóng.
- **Khuyến nghị.** Khuyến nghị rà thủ công theo F05 BR-07 cho pilot. Khi có dữ liệu đối soát và còn MISMATCHED, F06 AC-10 chặn. PO cùng tài chính phải thống nhất hai spec trước khi giao task chuyển trạng thái.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-24 · đặc tả](024-shared-close-project/spec.md) · [Ca thử](024-shared-close-project/quickstart.md) · [Phương án khác](024-shared-close-project/research.md)

## RV-25

**Nếu mẫu của tenant thay sau lần xuất thì dùng mẫu nào?** · Chờ review · Phòng tổ chức và chuyên viên KHCN.

- **Use case.** Nhà nghiên cứu lấy lý lịch theo mẫu đơn vị, tái dùng đề tài và sản phẩm đã đủ điều kiện tổng hợp. Với điều kiện một sản phẩm gắn qua hai vai trò và một sản phẩm đang chờ duyệt, khi xuất lý lịch, kết quả mong đợi là chỉ có một dòng cho sản phẩm đã duyệt.
- **Khuyến nghị.** Mỗi lần xuất mới dùng mẫu có hiệu lực và ghi nhận phiên bản đã sử dụng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-25 · đặc tả](025-web-export-profile/spec.md) · [Ca thử](025-web-export-profile/quickstart.md) · [Phương án khác](025-web-export-profile/research.md)

## RV-26

**Căn cứ phê duyệt phải có ở lúc lưu nháp hay lúc duyệt?** · Chờ review · Phòng KHCN phụ trách nhiệm vụ cấp trên.

- **Use case.** Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục. Với điều kiện đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION, khi chuyên viên duyệt, kết quả mong đợi là nêu đúng loại quyết định phải bổ sung.
- **Khuyến nghị.** Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-26 · đặc tả](026-web-register-upper-project/spec.md) · [Ca thử](026-web-register-upper-project/quickstart.md) · [Phương án khác](026-web-register-upper-project/research.md)

## RV-27

**Xác nhận hướng dẫn của một hồ sơ có dùng cho hồ sơ khác cùng sinh viên không?** · Chờ review · Đại diện khoa, giảng viên hướng dẫn và BA.

- **Use case.** Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm. Với điều kiện giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B, khi nộp B, kết quả mong đợi là yêu cầu xác nhận riêng cho B.
- **Khuyến nghị.** Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-27 · đặc tả](027-web-confirm-mentor/spec.md) · [Ca thử](027-web-confirm-mentor/quickstart.md) · [Phương án khác](027-web-confirm-mentor/research.md)

## RV-28

**Cần đối tác ở lần lưu nháp hay ở lúc gửi duyệt?** · Chờ review · Đại diện viện chủ trì và chuyên viên KHCN.

- **Use case.** Người kê khai ghi đơn vị chủ trì, đối tác ngoài và tổng kinh phí VND để phòng khoa học xét dự án ứng dụng. Với điều kiện đã có viện chủ trì, đối tác và 50 triệu VND, khi lưu dự án, kết quả mong đợi là đầu mục giữ 50 triệu, sổ chi đề tài F05 giữ nguyên.
- **Khuyến nghị.** Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-28 · đặc tả](028-web-register-applied-project/spec.md) · [Ca thử](028-web-register-applied-project/quickstart.md) · [Phương án khác](028-web-register-applied-project/research.md)

## RV-29

**Dùng quy tắc chứng cứ của trường nào khi cùng loại hội nghị?** · Chờ review · Phòng KHCN và đại diện giảng viên.

- **Use case.** Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận. Với điều kiện hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị, khi giảng viên trường A gửi, kết quả mong đợi là chỉ kiểm bộ minh chứng của A.
- **Khuyến nghị.** Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-29 · đặc tả](029-web-submit-activity/spec.md) · [Ca thử](029-web-submit-activity/quickstart.md) · [Phương án khác](029-web-submit-activity/research.md)

## RV-30

**Xử lý sự kiện cũ được gửi lại sau khi đổi định mức thế nào?** · Chờ review · Phòng đào tạo, phòng KHCN và chủ quy chế.

- **Use case.** Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường. Với điều kiện sự kiện tháng trước được gửi lại sau ngày công thức mới có hiệu lực, khi đối chiếu sổ giờ, kết quả mong đợi là giữ số giờ theo công thức cũ, không có dòng trùng.
- **Khuyến nghị.** Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-30 · đặc tả](030-shared-teaching-hours/spec.md) · [Ca thử](030-shared-teaching-hours/quickstart.md) · [Phương án khác](030-shared-teaching-hours/research.md)

## RV-31

**Nếu không tìm thấy căn cứ đáng tin hoặc quyền đọc vừa bị thu hồi thì sao?** · Chờ review · PO, chủ dữ liệu trường và QA AI.

- **Use case.** Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu. Với điều kiện dịch vụ trợ lý gián đoạn lúc rà một thuyết minh, khi chủ nhiệm trở lại biểu mẫu, kết quả mong đợi là vẫn rà thủ công và lưu được bản nháp của mình.
- **Khuyến nghị.** Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot kiểm 50 hồ sơ, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-31 · đặc tả](031-shared-ai-proposal-evidence/spec.md) · [Ca thử](031-shared-ai-proposal-evidence/quickstart.md) · [Phương án khác](031-shared-ai-proposal-evidence/research.md)

## RV-32

**DOI hợp lệ nhưng chỉ có metadata thì được điền phần nào?** · Chờ review · Nhà nghiên cứu, thư viện và chủ dữ liệu.

- **Use case.** Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không. Với điều kiện tài liệu có DOI nhưng quyền dùng toàn văn đã hết, khi lập lại thẻ đọc, kết quả mong đợi là chỉ còn dữ liệu thư mục được phép, phần nội dung chờ bổ sung nguồn.
- **Khuyến nghị.** Chỉ điền thông tin thư mục, đánh dấu phần phương pháp và kết quả thiếu nguồn; người dùng kiểm trước khi dùng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-32 · đặc tả](032-web-ai-reading-card/spec.md) · [Ca thử](032-web-ai-reading-card/quickstart.md) · [Phương án khác](032-web-ai-reading-card/research.md)

# Quyết định cấp sản phẩm

## RV-33

**Chọn phân khúc và kỳ chạy thử** · Chờ review · PO và trưởng phòng KHCN trường thí điểm.

- **Use case.** Một trường có kỳ cấp cơ sở sắp mở. Khi chọn phạm vi thử, chuyên viên lấy danh sách kỳ trước, thời gian xử lý và mẫu tổng hợp để làm mốc.
- **Khuyến nghị.** Ưu tiên trường có người chịu trách nhiệm và bộ số liệu so được. Nếu đã có cổng nộp, tập trung chỗ thiếu như báo cáo, luồng bổ sung hoặc tích hợp.
- **Chứng cứ để ký.** Chốt đơn vị, tên kỳ, nguồn số liệu và người ký đầu ra A.

## RV-34

**Điều kiện đầu tư Mobile** · Chờ review · PO, phụ trách CNTT và UX của đơn vị.

- **Use case.** Chủ nhiệm nhận nhắc và mở hồ sơ ở 360/390 px. Khi hai đơn vị cùng gặp tác vụ web chưa đáp ứng, nhóm đo tỷ lệ hoàn tất và ghi nhận chính sách thiết bị.
- **Khuyến nghị.** Dùng web responsive trong pilot. Chỉ lập luận chứng push/offline/native sau khi xác nhận nhu cầu lặp lại và cách thu hồi dữ liệu thiết bị.
- **Chứng cứ để ký.** Hai biên bản nhu cầu và thử tác vụ có kết quả, hoặc quyết định tiếp tục web.

## RV-35

**Nguồn AI và quyền sử dụng** · Chờ review · Chủ dữ liệu, thư viện/pháp chế, PO và QA AI.

- **Use case.** Nhà nghiên cứu yêu cầu trợ lý đọc nguồn. Khi nguồn là toàn văn có quyền hạn chế, hồ sơ hành chính của bệnh viện hoặc tài liệu bị thu quyền, chủ dữ liệu quyết định phần nào được xử lý.
- **Khuyến nghị.** Dùng nguồn công khai hoặc được phép rõ ràng. Chặn truy xuất ngoài phạm vi trước khi gửi cho mô hình. Giữ dấu phiên bản, nguồn và quyết định người dùng. Tắt trợ lý vẫn làm được việc.
- **Chứng cứ để ký.** Danh mục nguồn được phép, bảng phân quyền, kiểm tra lộ chéo và dẫn chứng sai, cơ chế dừng pilot.

## RV-36

**Kích hoạt E4 và công thức của trường** · Chờ review · Phòng KHCN, phòng đào tạo, PO tenant.

- **Use case.** Trường ghi nhận hoạt động rồi đổi định mức giữa hai kỳ. Khi gửi lại sự kiện cũ, phòng đào tạo kiểm tra phân bổ theo thời điểm gốc.
- **Khuyến nghị.** Bật riêng từng module. Nhập công thức, thời gian hiệu lực, bảng phân bổ và trường hợp thu hồi do trường xác nhận.
- **Chứng cứ để ký.** Bộ đầu vào–kết quả đã ký cho ít nhất một hoạt động của từng module muốn mở.

## RV-37

**Định giá và nghiệm thu pilot** · Chờ review · Phụ trách kinh doanh, PO và đại diện bên mua.

- **Use case.** Trường đề nghị báo giá sau khảo sát. Khi phạm vi bao gồm kết nối hoặc di trú, hai bên chọn số hồ sơ, chi phí một lần và chỉ tiêu nghiệm thu.
- **Khuyến nghị.** Dùng giả định giá của báo cáo thị trường để lập dự toán nội bộ, xác nhận ngân sách và phạm vi trước khi phát hành báo giá.
- **Chứng cứ để ký.** Phạm vi đã xác nhận, chi phí trực tiếp và đầu mối mua sắm.
