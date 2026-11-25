---
title: "Sổ quyết định triển khai"
status: Review
updated: 2026-11-24
---

# Sổ quyết định triển khai

RV-31 đã tạm chốt để thử trên hồ sơ thực tế. RV-32 đã chốt phạm vi thông tin được điền trên thẻ đọc. Hai tác vụ AI cùng áp dụng quy tắc nguồn đã chốt ở RV-35. Mỗi mã dưới đây là một quyết định có thể duyệt riêng. Mã RV-01–32 đi cùng AC-03 và TC-03 của thẻ tương ứng. [Báo cáo và danh mục](README.md)

**Cách xử lý.** Người chịu trách nhiệm ghi kết quả `Chấp thuận`, `Sửa` hoặc `Hoãn`, ngày, tên/vai trò, căn cứ và nội dung thay thế. AI có thể rà kết quả với spec → plan → tasks → quickstart, nêu tệp và mã còn lệch. Người duyệt nghiệp vụ ký trước khi cập nhật BR/AC nguồn hoặc đưa cam kết vào pilot. Ngày 24/11/2026, BA/PO theo ủy nhiệm chốt các hành vi còn mở cho DEV/QA. Các đầu mối của trường nêu dưới mỗi mã đối chiếu khi UAT. RV-31 giữ bộ đo thử đã tạm chốt, chủ dữ liệu xác nhận nguồn và kết quả trước pilot.

## RV-01

**Có chờ hết phiên khi nhân sự rời trường?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm quản trị IAM và phụ trách CNTT.

- **Use case.** Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ. Với điều kiện người vừa bị khóa còn một phiên mở, khi tải lại hồ sơ, kết quả mong đợi là bị từ chối, dữ liệu lịch sử còn nguyên.
- **Quyết định.** Ngay khi tài khoản bị khóa, backend từ chối yêu cầu nghiệp vụ kế tiếp, kể cả tải lại hoặc lưu hồ sơ từ phiên đã mở. Người có quyền vẫn tra cứu được lịch sử trước khi khóa.
- **Chứng cứ cần thu.** Thử riêng tải lại và bấm Lưu ngay sau khi khóa. Dùng tài khoản có quyền để đối chiếu nội dung đã lưu và lịch sử trước khi khóa. [US-01 · đặc tả](001-shared-lock-account/spec.md) · [Ca thử](001-shared-lock-account/quickstart.md) · [Phương án khác](001-shared-lock-account/research.md)

## RV-02

**Làm sao tránh hiển thị cấu hình cũ sau khi lưu?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm quản trị tenant và kiến trúc sư.

- **Use case.** Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung. Với điều kiện A và B đã đọc khóa dùng chung trước khi A ghi đè, khi đọc lại tại hai trường, kết quả mong đợi là A dùng bản riêng, B vẫn dùng bản chung.
- **Quyết định.** Ngay từ lần đọc đầu tiên sau khi trường A lưu thành công giá trị riêng, A nhận giá trị mới dù trước đó đã đọc bản chung. Trường B còn dùng mặc định vẫn nhận giá trị chung.
- **Chứng cứ cần thu.** Ghi giá trị chung hai trường đã đọc, rồi đối chiếu lần đọc đầu tiên ở mỗi trường ngay sau khi A lưu, trong khi bộ nhớ đệm cũ còn hạn. [US-02 · đặc tả](002-shared-config-override/spec.md) · [Ca thử](002-shared-config-override/quickstart.md) · [Phương án khác](002-shared-config-override/research.md)

## RV-03

**Áp dụng quy chế mới cho hồ sơ nào?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm chủ quy trình và kiến trúc sư.

- **Use case.** Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng. Với điều kiện hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt, khi người xử lý hoàn tất bước, kết quả mong đợi là bước kế tiếp lấy từ v1.
- **Quyết định.** Mỗi hồ sơ dùng phiên bản quy trình có hiệu lực lúc tạo cho đến khi hoàn tất. Khi v2 có hiệu lực, hồ sơ đang chờ duyệt theo v1 tiếp tục chuyển bước theo v1. Hồ sơ tạo từ thời điểm đó dùng v2.
- **Chứng cứ cần thu.** Dùng hai phiên bản có bước kế tiếp khác nhau. Đối chiếu bước thực tế và phiên bản của hồ sơ tạo trước và sau khi kích hoạt v2. [US-03 · đặc tả](003-shared-workflow-version/spec.md) · [Ca thử](003-shared-workflow-version/quickstart.md) · [Phương án khác](003-shared-workflow-version/research.md)

## RV-04

**Nếu chuyên viên đổi khoa sau khi chuyển bước, ai xem được lịch sử?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm chủ dữ liệu và QA phân quyền.

- **Use case.** Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào. Với điều kiện chuyên viên vừa mất quyền đề tài nhưng còn liên kết cũ, khi mở nhật ký, kết quả mong đợi là không lộ nội dung hoặc tên hồ sơ.
- **Quyết định.** Mỗi lần mở lịch sử, hệ thống kiểm quyền hiện tại trên đề tài. Nếu người đọc đã mất quyền, liên kết cũ không trả tên đề tài hay nội dung nhật ký. Người còn quyền thấy đúng người thực hiện và khoa của họ tại thời điểm thao tác.
- **Chứng cứ cần thu.** Mở cùng liên kết sau khi chuyên viên chuyển khoa bằng hai tài khoản, một đã mất quyền và một còn quyền. Đối chiếu người và khoa với thời điểm chuyển bước. [US-04 · đặc tả](004-shared-audit-trail/spec.md) · [Ca thử](004-shared-audit-trail/quickstart.md) · [Phương án khác](004-shared-audit-trail/research.md)

## RV-05

**Nếu danh mục hết hiệu lực giữa lúc soạn và mở kỳ thì sao?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm Phòng KHCN và BA.

- **Use case.** Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn. Với điều kiện một lĩnh vực bắt buộc vừa ngừng hiệu lực trong bản nháp, khi chuyên viên mở kỳ, kết quả mong đợi là kỳ vẫn nháp và hiển thị mục cần thay.
- **Quyết định.** Khi chuyên viên bấm Mở kỳ, hệ thống kiểm lại hiệu lực của danh mục và bộ tiêu chí. Nếu có mục hết hiệu lực, kỳ vẫn ở trạng thái Nháp và hệ thống chỉ rõ mục cần thay. Sau khi thay mục và đáp ứng đủ điều kiện, chuyên viên có thể mở chính kỳ đó.
- **Chứng cứ cần thu.** Thử riêng lĩnh vực và bộ tiêu chí hết hiệu lực sau khi lưu nháp. Kiểm tên mục được báo và trạng thái của cùng kỳ trước và sau khi thay mục. [US-05 · đặc tả](005-web-open-call/spec.md) · [Ca thử](005-web-open-call/quickstart.md) · [Phương án khác](005-web-open-call/research.md)

## RV-06

**Giảng viên cần điền tới đâu để lưu lần đầu?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chủ nhiệm và BA.

- **Use case.** Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét. Với điều kiện chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp, khi lưu rồi mở lại nháp, kết quả mong đợi là thấy phần đã nhập và có thể tiếp tục sửa.
- **Quyết định.** Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-06 · đặc tả](006-web-draft-proposal/spec.md) · [Ca thử](006-web-draft-proposal/quickstart.md) · [Phương án khác](006-web-draft-proposal/research.md)

## RV-07

**Xử lý hồ sơ đến đúng thời điểm kết thúc kỳ thế nào?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên quản lý kỳ và PO.

- **Use case.** Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ. Với điều kiện nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở, khi chủ nhiệm gửi hai lần, kết quả mong đợi là chỉ có một mã và một lần chuyển Đã nộp.
- **Quyết định.** Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-07 · đặc tả](007-web-submit-proposal/spec.md) · [Ca thử](007-web-submit-proposal/quickstart.md) · [Phương án khác](007-web-submit-proposal/research.md)

## RV-08

**Có thể trả hồ sơ mà chỉ ghi khoảng trắng ở lý do?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên tiếp nhận và PO.

- **Use case.** Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại. Với điều kiện hồ sơ còn hạn và lý do chỉ chứa khoảng trắng, khi chuyên viên gửi trả, kết quả mong đợi là giữ Đã nộp, yêu cầu nhập lý do.
- **Quyết định.** Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-08 · đặc tả](008-web-return-proposal/spec.md) · [Ca thử](008-web-return-proposal/quickstart.md) · [Phương án khác](008-web-return-proposal/research.md)

## RV-09

**Hai chuyên viên cùng mở đợt cho một đề tài thì sao?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Thư ký hội đồng và BA.

- **Use case.** Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công. Với điều kiện hai chuyên viên cùng chọn một hồ sơ đủ điều kiện, khi xác nhận mở đợt đồng thời, kết quả mong đợi là chỉ một đợt thu phiếu, một lần chuyển trạng thái.
- **Quyết định.** Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-09 · đặc tả](009-web-open-review/spec.md) · [Ca thử](009-web-open-review/quickstart.md) · [Phương án khác](009-web-open-review/research.md)

## RV-10

**Nếu phát hiện xung đột sau khi người chấm mở nháp thì sao?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chủ tịch hội đồng và QA.

- **Use case.** Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số. Với điều kiện người đã mở nháp vừa được bổ sung vào nhóm đề tài, khi gửi phiếu đã điền, kết quả mong đợi là phiếu không được tính và người đó mất quyền chấm.
- **Quyết định.** Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-10 · đặc tả](010-web-submit-score/spec.md) · [Ca thử](010-web-submit-score/quickstart.md) · [Phương án khác](010-web-submit-score/research.md)

## RV-11

**Khi cơ sở yêu cầu cả đạo đức lẫn khoa học, lúc nào được phê duyệt đề tài?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ của mục này gồm PO và thư ký hai hội đồng.

- **Use case.** Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt. Với điều kiện đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ, khi chuyên viên chốt khoa học, kết quả mong đợi là lưu kết quả hội đồng, đề tài chưa APPROVED.
- **Quyết định.** Lưu kết luận khoa học riêng. Khi khoa học đạt, đề tài chuyển `APPROVED` nếu quy chế không yêu cầu thẩm định đạo đức hoặc hội đồng đạo đức đã thông qua. Nếu còn chờ hoặc cần bổ sung, giữ `UNDER_REVIEW` và hiển thị việc còn chờ cho chủ nhiệm. Nếu hội đồng đạo đức từ chối cuối cùng, chuyển `REJECTED` và thông báo kết luận. Chỉ gửi thông báo phê duyệt một lần khi chuyển `APPROVED`.
- **Căn cứ.** [Quyết định thẩm định song song](../docs/architecture/migration-coverage.md) và xác nhận ngày 21/11/2026. Các ca dưới đây dùng để kiểm chứng khi triển khai. [US-11 · đặc tả](011-shared-review-decision/spec.md) · [Ca thử](011-shared-review-decision/quickstart.md) · [Phương án khác](011-shared-review-decision/research.md)

## RV-12

**Nếu mất quyền sau khi đã thấy thẻ trên điện thoại thì sao?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chủ nhiệm, UX và chủ dữ liệu.

- **Use case.** Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc. Với điều kiện điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền, khi chạm thẻ cũ, kết quả mong đợi là không lộ hồ sơ và có đường về trang chủ.
- **Quyết định.** Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-12 · đặc tả](012-mobile-open-work-item/spec.md) · [Ca thử](012-mobile-open-work-item/quickstart.md) · [Phương án khác](012-mobile-open-work-item/research.md)

## RV-13

**Một hồ sơ trả về nháp rồi nộp lại được đếm thế nào?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm trưởng phòng KHCN và PO/BA.

- **Use case.** Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng. Với điều kiện có 3 hồ sơ đã cấp mã và một bản nháp chưa từng nộp, khi đếm cả kỳ rồi xuất danh sách, kết quả mong đợi là tổng 3, bản chưa từng nộp không có dòng.
- **Quyết định.** Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp.
- **Căn cứ.** [B02 BR-01/02 và AC-01/03](../docs/features/B02-bao-cao-thong-ke/spec.md). Khi chạy pilot, trưởng phòng KHCN đối chiếu và ký danh sách thực tế. [US-13 · đặc tả](013-web-call-report/spec.md) · [Ca thử](013-web-call-report/quickstart.md) · [Phương án khác](013-web-call-report/research.md)

## RV-14

**Chuyên viên có thể giao khi mới có số quyết định nhưng chưa có bản đính kèm?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Trưởng phòng KHCN và chuyên viên hợp đồng.

- **Use case.** Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt. Với điều kiện thiếu tệp căn cứ dù đã nhập số quyết định, khi xác nhận giao, kết quả mong đợi là nêu mục tệp thiếu, giữ APPROVED.
- **Quyết định.** Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-14 · đặc tả](014-web-assign-project/spec.md) · [Ca thử](014-web-assign-project/quickstart.md) · [Phương án khác](014-web-assign-project/research.md)

## RV-15

**Hai đề tài có được dùng cùng mã kỳ không?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên tiến độ và BA.

- **Use case.** Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ. Với điều kiện hai đề tài đang thực hiện cùng chưa có kỳ 1, khi tạo kỳ 1 cho từng đề tài, kết quả mong đợi là mỗi đề tài có một báo cáo chờ riêng.
- **Quyết định.** Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-15 · đặc tả](015-web-report-period/spec.md) · [Ca thử](015-web-report-period/quickstart.md) · [Phương án khác](015-web-report-period/research.md)

## RV-16

**Chạy lại sau lỗi gửi email có tạo thông báo nghiệp vụ thứ hai?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên tiến độ và phụ trách vận hành.

- **Use case.** Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại. Với điều kiện thông báo trong ứng dụng đã có nhưng kênh email lỗi, khi tác vụ chạy lại cùng mốc, kết quả mong đợi là vẫn một thông báo và theo dõi được lần gửi lại.
- **Quyết định.** Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-16 · đặc tả](016-shared-deadline-reminder/spec.md) · [Ca thử](016-shared-deadline-reminder/quickstart.md) · [Phương án khác](016-shared-deadline-reminder/research.md)

## RV-17

**Có chặn báo cáo quá hạn nếu đề tài vẫn đang thực hiện?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chủ nhiệm và chuyên viên tiến độ.

- **Use case.** Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ. Với điều kiện báo cáo đến đúng hạn trong khi đề tài đang thực hiện, khi chủ nhiệm nộp đủ tệp, kết quả mong đợi là ghi nhận đúng hạn và chuyển chờ duyệt.
- **Quyết định.** Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-17 · đặc tả](017-web-submit-progress/spec.md) · [Ca thử](017-web-submit-progress/quickstart.md) · [Phương án khác](017-web-submit-progress/research.md)

## RV-18

**Khi tỷ lệ cho kết quả cao hơn trần, lấy số nào?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Kế toán và chuyên viên kinh phí.

- **Use case.** Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng. Với điều kiện cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng, khi xác nhận, kết quả mong đợi là phí 10 triệu và phần thực hiện 290 triệu.
- **Quyết định.** Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-18 · đặc tả](018-shared-budget-allocation/spec.md) · [Ca thử](018-shared-budget-allocation/quickstart.md) · [Phương án khác](018-shared-budget-allocation/research.md)

## RV-19

**Khoản chi vượt mức thực hiện xử lý thế nào?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Kế toán và chủ nhiệm.

- **Use case.** Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện. Với điều kiện còn 2 triệu, khoản chi đúng 2 triệu đồng, khi chủ nhiệm lưu, kết quả mong đợi là số dư bằng 0 và không cảnh báo vượt.
- **Quyết định.** Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-19 · đặc tả](019-web-record-expense/spec.md) · [Ca thử](019-web-record-expense/quickstart.md) · [Phương án khác](019-web-record-expense/research.md)

## RV-20

**Một tệp có trong thư viện nhưng người dùng vừa mất quyền có thể làm minh chứng không?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chủ nhiệm và chuyên viên sản phẩm.

- **Use case.** Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết. Với điều kiện tệp đính kèm đã bị thu quyền trước khi gửi, khi nộp sản phẩm, kết quả mong đợi là báo minh chứng chưa hợp lệ, giữ nháp.
- **Quyết định.** Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-20 · đặc tả](020-web-submit-output/spec.md) · [Ca thử](020-web-submit-output/quickstart.md) · [Phương án khác](020-web-submit-output/research.md)

## RV-21

**Duyệt cùng sản phẩm hai lần có làm tăng số cam kết đã đạt không?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên sản phẩm và phòng KHCN.

- **Use case.** Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại. Với điều kiện cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại, khi gửi lại lệnh duyệt, kết quả mong đợi là chỉ một đầu ra được tính, mục cam kết vẫn thiếu một.
- **Quyết định.** Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-21 · đặc tả](021-shared-approve-output/spec.md) · [Ca thử](021-shared-approve-output/quickstart.md) · [Phương án khác](021-shared-approve-output/research.md)

## RV-22

**Cùng đủ số lượng tổng nhưng thiếu một loại sản phẩm thì có được nghiệm thu?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Chuyên viên nghiệm thu và chủ nhiệm.

- **Use case.** Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu. Với điều kiện cam kết một bài và một sáng chế, đã duyệt hai bài, khi đăng ký nghiệm thu, kết quả mong đợi là nêu thiếu sáng chế và giữ IN_PROGRESS.
- **Quyết định.** Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-22 · đặc tả](022-web-request-acceptance/spec.md) · [Ca thử](022-web-request-acceptance/quickstart.md) · [Phương án khác](022-web-request-acceptance/research.md)

## RV-23

**Một phiếu xét duyệt đầu vào có được tính để đủ số phiếu nghiệm thu?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Thư ký hội đồng nghiệm thu và PO.

- **Use case.** Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán. Với điều kiện đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào, khi chốt kết luận, kết quả mong đợi là vẫn thiếu một phiếu, chưa chuyển PASSED.
- **Quyết định.** Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-23 · đặc tả](023-shared-acceptance-result/spec.md) · [Ca thử](023-shared-acceptance-result/quickstart.md) · [Phương án khác](023-shared-acceptance-result/research.md)

## RV-24

**Khi nào chuyên viên được khóa sổ đề tài đã nghiệm thu đạt?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm PO, trưởng phòng KHCN và kế toán trưởng.

- **Use case.** Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành. Với điều kiện đề tài PASSED đã bật đối soát và còn một dòng MISMATCHED, khi chuyên viên đóng sổ, kết quả mong đợi là giữ PASSED, chỉ rõ dòng cần xử lý trước khi đóng.
- **Quyết định.** Pilot chưa bật đối soát cho phép chuyên viên xác nhận quyết toán sau khi rà thủ công. Khi đã bật, chỉ được đóng khi mọi khoản của đề tài đều `MATCHED`. Còn `UNRECONCILED` hoặc `MISMATCHED` thì giữ `PASSED` và liệt kê từng khoản cần xử lý. Khi chuyên viên xác nhận và đủ điều kiện, chuyển `COMPLETED` và khóa sổ kinh phí.
- **Căn cứ.** [F05 BR-07](../docs/features/F05-quan-ly-kinh-phi/spec.md) và [F06 BR-09/AC-10](../docs/features/F06-nghiem-thu/spec.md). QA đối chiếu kết quả thực hiện theo từng chế độ. [US-24 · đặc tả](024-shared-close-project/spec.md) · [Ca thử](024-shared-close-project/quickstart.md) · [Phương án khác](024-shared-close-project/research.md)

## RV-25

**Nếu mẫu của tenant thay sau lần xuất thì dùng mẫu nào?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm Phòng tổ chức và chuyên viên KHCN.

- **Use case.** Nhà nghiên cứu xuất lý lịch khi trường đang dùng v1. Sau khi trường kích hoạt v2, người đó xuất lại cùng lý lịch để in theo mẫu mới. Phòng tổ chức tra được phiên bản tương ứng với từng lần xuất.
- **Quyết định.** Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng.
- **Căn cứ.** [F08 BR-08/AC-13](../docs/features/F08-ly-lich-khoa-hoc/spec.md). TC-03 đối chiếu hai tệp với hai bản ghi xuất. [US-25 · đặc tả](025-web-export-profile/spec.md) · [Ca thử](025-web-export-profile/quickstart.md) · [Phương án khác](025-web-export-profile/research.md)

## RV-26

**Căn cứ phê duyệt phải có ở lúc lưu nháp hay lúc duyệt?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Phòng KHCN phụ trách nhiệm vụ cấp trên.

- **Use case.** Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục. Với điều kiện đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION, khi chuyên viên duyệt, kết quả mong đợi là nêu đúng loại quyết định phải bổ sung.
- **Quyết định.** Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-26 · đặc tả](026-web-register-upper-project/spec.md) · [Ca thử](026-web-register-upper-project/quickstart.md) · [Phương án khác](026-web-register-upper-project/research.md)

## RV-27

**Xác nhận hướng dẫn của một hồ sơ có dùng cho hồ sơ khác cùng sinh viên không?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Đại diện khoa, giảng viên hướng dẫn và BA.

- **Use case.** Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm. Với điều kiện giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B, khi nộp B, kết quả mong đợi là yêu cầu xác nhận riêng cho B.
- **Quyết định.** Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-27 · đặc tả](027-web-confirm-mentor/spec.md) · [Ca thử](027-web-confirm-mentor/quickstart.md) · [Phương án khác](027-web-confirm-mentor/research.md)

## RV-28

**Cần đối tác ở lần lưu nháp hay ở lúc gửi duyệt?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm đại diện viện chủ trì và chuyên viên KHCN.

- **Use case.** Viện lưu thông tin dự án khi đang xác định đối tác. Người kê khai mở lại bản nháp, bổ sung công ty liên kết và gửi cùng hồ sơ cho phòng KHCN.
- **Quyết định.** Phải có đơn vị chủ trì khi lưu nháp. Hồ sơ đủ các trường bắt buộc khác được lưu và mở lại dù chưa có đối tác ngoài. Khi gửi duyệt, nếu thiếu đối tác thì giữ Nháp và yêu cầu bổ sung. Khi đã có ít nhất một đối tác ngoài và đủ các điều kiện khác, chuyển sang Chờ duyệt.
- **Căn cứ.** [F11 BR-01/02 và AC-01/02](../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md). TC-03 đối chiếu kết quả lưu và hai lần gửi trên cùng mã hồ sơ. [US-28 · đặc tả](028-web-register-applied-project/spec.md) · [Ca thử](028-web-register-applied-project/quickstart.md) · [Phương án khác](028-web-register-applied-project/research.md)

## RV-29

**Dùng quy tắc chứng cứ của trường nào khi cùng loại hội nghị?** · **Chốt triển khai 24/11/2026 (BA/PO)** · Đầu mối UAT: Phòng KHCN và đại diện giảng viên.

- **Use case.** Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận. Với điều kiện hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị, khi giảng viên trường A gửi, kết quả mong đợi là chỉ kiểm bộ minh chứng của A.
- **Quyết định.** Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu.
- **Chứng cứ để ký.** Kiểm TC-03 cùng hai ca gốc và ghi giá trị thực tế. [US-29 · đặc tả](029-web-submit-activity/spec.md) · [Ca thử](029-web-submit-activity/quickstart.md) · [Phương án khác](029-web-submit-activity/research.md)

## RV-30

**Xử lý sự kiện cũ được gửi lại sau khi đổi định mức thế nào?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm Phòng Đào tạo, Phòng KHCN và chủ quy chế.

- **Use case.** Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường. Với điều kiện sự kiện tháng trước được gửi lại sau ngày công thức mới có hiệu lực, khi đối chiếu sổ giờ, kết quả mong đợi là giữ số giờ theo công thức cũ, không có dòng trùng.
- **Quyết định.** Dùng định mức có hiệu lực vào ngày nghiệp vụ của hoạt động nguồn. Khi nhận lại cùng sự kiện đã ghi, giữ nguyên số giờ, kỳ và phân bổ ban đầu. Người có quyền sửa sai bằng bản ghi điều chỉnh có lý do và ghi nhật ký.
- **Căn cứ.** [P03 BR-03/07/08/10](../docs/features/P03-quy-doi-gio-giang/spec.md). QA đối chiếu sổ giờ trước và sau khi nhận lại sự kiện qua ngày đổi định mức, rồi kiểm lịch sử điều chỉnh. [US-30 · đặc tả](030-shared-teaching-hours/spec.md) · [Ca thử](030-shared-teaching-hours/quickstart.md) · [Phương án khác](030-shared-teaching-hours/research.md)

## RV-31

**Nếu không tìm thấy căn cứ đáng tin hoặc quyền đọc vừa bị thu hồi thì sao?** · **Tạm chốt** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm PO, chủ dữ liệu trường và QA AI.

- **Use case.** Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu. Với điều kiện dịch vụ trợ lý gián đoạn lúc rà một thuyết minh, khi chủ nhiệm trở lại biểu mẫu, kết quả mong đợi là vẫn rà thủ công và lưu được bản nháp của mình.
- **Quyết định tạm thời.** Trước pilot, đánh giá trên 50 hồ sơ gán nhãn độc lập. Mục tiêu là phát hiện ≥90% số mục thực sự thiếu, với ≤10% cảnh báo sai trên tổng số cảnh báo, 0 lần lộ dữ liệu ngoài quyền và 0 dẫn chứng bịa. Có thể điều chỉnh bộ mẫu và các ngưỡng định lượng sau khi đối chiếu với hồ sơ thực tế tại Trường Đại học Thủy lợi kỳ 2027. Khi thiếu nguồn, hiện “chưa đủ căn cứ”. Khi quyền bị thu hồi, từ chối truy xuất. Khi dịch vụ gián đoạn, chủ nhiệm vẫn rà thủ công và lưu được bản nháp.
- **Chứng cứ cần thu.** Ghi số đếm, tỷ lệ và các trường hợp sai trên bộ 50 hồ sơ, kèm kết quả kiểm quyền và lưu nháp khi dịch vụ gián đoạn. [US-31 · đặc tả](031-shared-ai-proposal-evidence/spec.md) · [Ca thử](031-shared-ai-proposal-evidence/quickstart.md) · [Phương án khác](031-shared-ai-proposal-evidence/research.md)

## RV-32

**DOI hợp lệ nhưng chỉ có metadata thì được điền phần nào?** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm nhà nghiên cứu, thư viện và chủ dữ liệu.

- **Use case.** Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không. Với điều kiện tài liệu có DOI nhưng quyền dùng toàn văn đã hết, khi lập lại thẻ đọc, kết quả mong đợi là chỉ còn dữ liệu thư mục được phép, phần nội dung chờ bổ sung nguồn.
- **Quyết định.** Khi chỉ có quyền dùng thông tin thư mục, trợ lý chỉ điền tên bài, tác giả, năm và DOI theo dữ liệu được phép. Cả phương pháp và kết quả ghi “chưa đủ căn cứ”. Nhà nghiên cứu kiểm thẻ nháp trước khi quyết định dùng hoặc bỏ.
- **Chứng cứ để ký.** Kiểm TC-02 khi tạo thẻ từ thông tin thư mục và TC-03 khi quyền dùng toàn văn hết hạn, cả khi mở lại thẻ cũ lẫn lập lại thẻ. [US-32 · đặc tả](032-web-ai-reading-card/spec.md) · [Ca thử](032-web-ai-reading-card/quickstart.md) · [Phương án khác](032-web-ai-reading-card/research.md)

# Quyết định cấp sản phẩm

## RV-33

**Chọn phân khúc và kỳ chạy thử** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm PO và Trưởng phòng KHCN của Trường.

- **Phạm vi.** Trường Đại học Thủy lợi, kỳ đề tài cấp cơ sở năm 2027, đợt A.
- **Nguồn số liệu.** Dùng danh sách hồ sơ đã chốt của kỳ cấp cơ sở liền trước do Phòng KHCN quản lý làm mốc so sánh. Khi kiểm báo cáo B02, đối chiếu số đếm với danh sách hồ sơ của chính kỳ 2027 theo [RV-13](#rv-13).
- **Người ký kết quả.** Trưởng phòng KHCN của Trường ký kết quả đợt A khi nghiệm thu.

## RV-34

**Điều kiện đầu tư Mobile** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm PO, phụ trách CNTT và UX của đơn vị.

- **Use case.** Chủ nhiệm nhận nhắc và mở hồ sơ ở 360/390 px. Khi hai đơn vị cùng gặp tác vụ web chưa đáp ứng, nhóm đo tỷ lệ hoàn tất và ghi nhận chính sách thiết bị.
- **Quyết định.** Pilot tại Thủy lợi kỳ 2027 dùng web trên điện thoại. Chỉ xem xét ứng dụng riêng, thông báo đẩy hoặc làm việc ngoại tuyến khi ít nhất hai đơn vị cùng xác nhận một nhu cầu mà web chưa đáp ứng và đã có phương án quản lý, thu hồi dữ liệu trên thiết bị.
- **Căn cứ khi xem xét đầu tư.** Đối chiếu biên bản của hai đơn vị về cùng tác vụ, kết quả thử trên web và phương án quản lý, thu hồi dữ liệu trên thiết bị. [Ca thử mở hồ sơ trên điện thoại](012-mobile-open-work-item/quickstart.md)

## RV-35

**Nguồn AI và quyền sử dụng** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm chủ dữ liệu, thư viện/pháp chế, PO và QA AI.

- **Use case.** Nhà nghiên cứu yêu cầu trợ lý đọc nguồn. Khi nguồn là toàn văn có quyền hạn chế, hồ sơ hành chính của bệnh viện hoặc tài liệu bị thu quyền, chủ dữ liệu quyết định phần nào được xử lý.
- **Quyết định.** Chỉ truy xuất phần tài liệu mà người dùng hiện có quyền đọc và trường cho phép dùng cho AI. Kiểm tra cả hai quyền trước khi gửi nội dung cho mô hình và khi mở lại yêu cầu hoặc căn cứ cũ. Nếu chỉ được dùng thông tin thư mục, trợ lý chỉ điền các trường được phép (ví dụ tên bài, tác giả, DOI). Phần phương pháp và kết quả ghi “chưa đủ căn cứ”.
- **Truy vết và thao tác thủ công.** Mỗi gợi ý lưu nguồn, phiên bản nguồn, mô hình và mẫu lệnh. Khi người dùng chọn dùng hoặc bỏ, lưu lựa chọn cho gợi ý đó. Khi tắt AI, người dùng vẫn tiếp tục tác vụ thủ công.
- **Chứng cứ khi thử nghiệm.** Chủ dữ liệu xác nhận danh mục nguồn và phạm vi được dùng cho AI tại trường. QA kiểm cả hai quyền, việc thu hồi, lộ dữ liệu ngoài phạm vi, dẫn chứng sai và khả năng dừng pilot. [Ca rà thuyết minh](031-shared-ai-proposal-evidence/quickstart.md) · [Ca lập thẻ đọc](032-web-ai-reading-card/quickstart.md)

## RV-36

**Kích hoạt E4 và công thức của trường** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối nghiệp vụ gồm Phòng KHCN, Phòng Đào tạo và PO của trường.

- **Quyết định.** Tại Trường Đại học Thủy lợi, xét bật riêng từng phân hệ E4 (F09–F12, P03). Trước khi bật một phân hệ, Trường ký ít nhất một ví dụ đối chứng gồm dữ liệu đầu vào và kết quả mong đợi của chính phân hệ đó.
- **Ví dụ có quy đổi giờ giảng.** Ghi hoạt động đủ điều kiện, định mức và ngày bắt đầu hiệu lực, số giờ phân bổ cho từng người, cùng cách xử lý nếu kết quả hoạt động bị thu hồi. Khi đối chiếu sự kiện gửi lại, áp dụng [RV-30](#rv-30).
- **Chứng cứ khi bàn giao.** Gắn ví dụ có xác nhận của Trường với mã phân hệ tương ứng trong [checklist bàn giao](../docs/guides/handover-thuy-loi.md).

## RV-37

**Định giá và nghiệm thu pilot** · **Chấp thuận** ngày 21/11/2026 theo xác nhận của người dùng trong phiên rà soát. Đầu mối gồm phụ trách kinh doanh, PO và đại diện bên mua.

- **Use case.** Trường đề nghị báo giá sau khảo sát. Khi phạm vi bao gồm kết nối hoặc di trú, hai bên chọn số hồ sơ, chi phí một lần và chỉ tiêu nghiệm thu.
- **Quyết định.** Dùng mức giá tham khảo trong báo cáo thị trường để lập dự toán nội bộ. Trước khi gửi báo giá pilot, hai bên xác nhận ngân sách, số hồ sơ và tiêu chí nghiệm thu. Nếu có kết nối hệ thống hoặc chuyển dữ liệu cũ, báo giá ghi riêng phạm vi và chi phí một lần cho từng hạng mục. [Căn cứ dự toán nội bộ](../docs/sales/thi-truong-viet-nam-2026/README.md)
- **Chứng cứ để ký.** Phạm vi đã xác nhận, chi phí trực tiếp và đầu mối mua sắm.

## RV-38

**Chốt triển khai 24/11/2026 (BA/PO)** · **Việc đến hạn hôm nay và việc thiếu hạn thuộc nhóm nào?** Dùng ngày nghiệp vụ Asia/Ho_Chi_Minh. Hai trường hợp thuộc Tất cả. Nhãn bộ lọc là Quá hạn và Tất cả. [Thẻ INVEST](../docs/product/mobile-invest.md) · [Đặc tả và người duyệt](033-mobile-triage-deadlines/spec.md).

## RV-39

**Chốt triển khai 24/11/2026 (BA/PO)** · **Lúc nào tin rời bộ lọc và khi quay lại thì bộ lọc nào còn hiệu lực?** B04 AC-06 đặt mốc khi mở tin. Lưu lựa chọn Chưa đọc trong URL danh sách để quay lại và tải lại cùng bộ lọc. [Thẻ INVEST](../docs/product/mobile-invest.md) · [Đặc tả và người duyệt](034-mobile-read-inbox/spec.md).

## RV-40

**Chốt triển khai 24/11/2026 (BA/PO)** · **Mặc định thu gọn theo trạng thái OPEN hay theo cả cửa sổ nhận?** Dùng cả ngày bắt đầu và hạn cuối như F01. Cho phép chuyển Tất cả để chuyên viên tìm lại các kỳ trong phạm vi. Mặc định chọn Đang nhận khi vào từ điện thoại. [Thẻ INVEST](../docs/product/mobile-invest.md) · [Đặc tả và người duyệt](035-mobile-find-open-call/spec.md).
