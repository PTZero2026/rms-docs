---
title: "Danh mục tính năng RMS theo INVEST — Đầu vào Spec Kit"
status: Draft
updated: 2026-11-18
---

# Danh mục tính năng RMS theo INVEST

Bản làm việc của PO/BA để chọn một lát cắt có thể giao và kiểm thử. Mã US thuộc danh mục nghiên cứu này. Mã F/B/P và AC bên cạnh dẫn về đặc tả nghiệp vụ hiện hành. Các tiêu chí mang nhãn **đề xuất** phải qua PO/BA trước khi nhập vào đặc tả chính thức. [Báo cáo thị trường](README.md) · [Bản đồ epic và feature](../../epics/README.md)

**Cách đọc INVEST.** Mỗi thẻ có một kết quả sử dụng được (Valuable), một đầu vào giả lập để thử độc lập (Independent), một lựa chọn còn thương lượng (Negotiable), cỡ tương đối (Estimable), giới hạn một thao tác hoặc đầu ra (Small) và hai ví dụ quan sát được (Testable). Ký hiệu S và M lần lượt chỉ một thao tác trên dữ liệu có sẵn và một thao tác có nhiều vai trò, trạng thái hoặc nguồn dữ liệu. Đây là ước lượng tương đối cho một lát cắt sau khi nền tảng đã có. Với thẻ M, nhóm có thể tách tình huống ngoại lệ thành thẻ riêng nếu vượt một vòng làm việc. [Agile Alliance – INVEST](https://agilealliance.org/glossary/invest/)

**Ràng buộc xuyên suốt.** Backend kiểm vai trò, tổ chức và phạm vi bản ghi ở cả màn hình lẫn đường dẫn trực tiếp. Mọi thay đổi trạng thái ResearchProject qua P01, cùng nhật ký append-only P02. Đặc tả kỹ thuật trỏ về `packages/api-contracts` ở repo code. VND nguyên, ngày hiển thị dd/MM/yyyy, giờ Asia/Ho_Chi_Minh, lưu UTC. B06 chỉ đọc. Dùng dữ liệu dựng sẵn để phát triển từng thẻ, sau đó chạy lại toàn luồng tích hợp với các module thật. [Quy ước RMS](../../../AGENTS.md)

**Thứ tự giao đề xuất.** Đợt A đủ cho đối tác kiểm lại một kỳ tiếp nhận và xét duyệt. Đợt B mở rộng sang thực hiện, kinh phí, nghiệm thu và đầu ra. Đợt C là tùy chọn theo tổ chức và thử nghiệm AI. Đầu vào của thẻ là điều kiện dữ liệu, không bắt buộc các đội phải xây xong mọi màn hình trước nó. Mỗi ví dụ G/W/T tương ứng một ca thử có thể đưa vào test-plan. G = đã có, W = khi thực hiện, T = kết quả mong đợi.

## Đợt A · Tiếp nhận, hội đồng và báo cáo đầu tiên

### US-01 · Khóa tài khoản của người rời đơn vị

Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ.

[B03](../../features/B03-quan-ly-nguoi-dung/spec.md) · AC-09, AC-12 · Cỡ S. Dữ liệu thử gồm một tài khoản hoạt động, hai vai trò. Nhóm có thể điều chỉnh lời nhắc xác nhận khóa.

- **US-01.1** — **G** admin khóa đúng người. **W** gửi lệnh. **T** tài khoản chuyển sang bị khóa và ghi audit.
- **US-01.2** — **G** người chỉ có quyền xem. **W** gửi cùng yêu cầu. **T** backend từ chối, tài khoản giữ nguyên.

### US-02 · Ghi đè một cấu hình của trường

Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung.

[B01](../../features/B01-danh-muc-cau-hinh/spec.md) · AC-02, AC-05, AC-07 · Cỡ S. Dữ liệu thử gồm hai tenant dùng cùng một khóa cấu hình. Nhóm có thể điều chỉnh cách hiện nguồn giá trị mặc định.

- **US-02.1** — **G** tenant A có quyền. **W** lưu giá trị riêng. **T** đọc tại A nhận giá trị mới.
- **US-02.2** — **G** tenant B chỉ có giá trị chung. **W** đọc cùng khóa. **T** nhận đúng giá trị chung.

### US-03 · Giữ quy trình của hồ sơ đang chạy

Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng.

[P01](../../features/P01-workflow-engine/spec.md) · AC-03, AC-05 · Cỡ M. Dữ liệu thử gồm một hồ sơ ghim phiên bản 1 và một mẫu phiên bản 2. Nhóm có thể điều chỉnh tên hiển thị của bước.

- **US-03.1** — **G** mẫu v2 hợp lệ. **W** kích hoạt và tạo hồ sơ. **T** hồ sơ mới theo v2, hồ sơ cũ vẫn theo v1.
- **US-03.2** — **G** mẫu có bước thiếu trạng thái chuẩn. **W** kích hoạt. **T** từ chối và nêu bước cần sửa.

### US-04 · Tra căn cứ chuyển bước

Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào.

[P02](../../features/P02-audit/spec.md) · AC-01, AC-02, AC-05 · Cỡ S. Dữ liệu thử gồm một chuyển bước thành công và hai người khác phạm vi. Nhóm có thể điều chỉnh thứ tự hiển thị các sự kiện.

- **US-04.1** — **G** đề tài thuộc phạm vi. **W** mở sự kiện. **T** thấy đúng người, thời gian, đối tượng và hành động.
- **US-04.2** — **G** người ngoài phạm vi. **W** mở trực tiếp lịch sử. **T** không nhận nội dung của đề tài.

### US-05 · Mở một kỳ nhận đề xuất

Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn.

[F02](../../features/F02-dot-keu-goi/spec.md) · AC-01, AC-02, AC-05 · Cỡ M. Dữ liệu thử gồm một kỳ nháp, danh mục còn hiệu lực. Nhóm có thể điều chỉnh cách trình bày hướng dẫn của kỳ.

- **US-05.1** — **G** kỳ đủ cấu hình. **W** mở. **T** kỳ nhận đề xuất hiển thị dưới trạng thái OPEN.
- **US-05.2** — **G** ngày kết thúc trước ngày bắt đầu. **W** lưu kỳ. **T** báo lỗi và không tạo kỳ sai.

### US-06 · Lưu nháp thuyết minh

Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét.

[F01](../../features/F01-de-xuat-de-tai/spec.md) · AC-01, AC-06 · Cỡ S. Dữ liệu thử gồm kỳ mở, hai nhà nghiên cứu độc lập. Nhóm có thể điều chỉnh thứ tự các nhóm trường trên biểu mẫu.

- **US-06.1** — **G** chủ nhiệm trong kỳ mở. **W** lưu lần đầu. **T** có bản Nháp của chủ nhiệm, chưa cấp mã đề tài.
- **US-06.2** — **G** nhà nghiên cứu khác ngoài phạm vi. **W** mở nháp bằng đường dẫn. **T** bị từ chối.

### US-07 · Nộp đề xuất và nhận mã theo dõi

Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ.

[F01](../../features/F01-de-xuat-de-tai/spec.md) · AC-02, AC-03, AC-04 · Cỡ M. Dữ liệu thử gồm hai hồ sơ nháp, đồng hồ cố định trong hạn và sau hạn. Nhóm có thể điều chỉnh cách trình bày xác nhận nộp.

- **US-07.1** — **G** nháp đủ trường, còn hạn. **W** nộp. **T** chuyển Đã nộp, cấp mã, ghi giờ, khóa sửa.
- **US-07.2** — **G** nháp đủ trường, đã quá hạn. **W** nộp. **T** giữ Nháp và báo hết hạn.

### US-08 · Trả hồ sơ cần bổ sung

Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại.

[F01](../../features/F01-de-xuat-de-tai/spec.md) · AC-07, AC-08, AC-11 · Cỡ S. Dữ liệu thử gồm hồ sơ đã nộp có mã, hai kỳ còn hạn và đã đóng. Nhóm có thể điều chỉnh vị trí hiển thị lý do.

- **US-08.1** — **G** còn hạn. **W** trả kèm lý do rồi chủ nhiệm nộp lại. **T** chủ nhiệm thấy lý do, mã đề tài được giữ.
- **US-08.2** — **G** đã hết hạn. **W** chuyên viên trả. **T** chặn thao tác và giữ trạng thái.

### US-09 · Mở đợt chấm cho một đề tài

Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công.

[F03](../../features/F03-xet-duyet-hoi-dong/spec.md) · AC-01, AC-09 · Cỡ M. Dữ liệu thử gồm kỳ đã đóng, hồ sơ đã nộp, hội đồng xét duyệt có thành viên. Nhóm có thể điều chỉnh cách sắp thứ tự thành viên.

- **US-09.1** — **G** đủ điều kiện. **W** chuyên viên mở đợt. **T** đề tài chuyển UNDER_REVIEW và đợt thu phiếu bắt đầu.
- **US-09.2** — **G** thành viên chỉ có quyền chấm. **W** yêu cầu mở đợt. **T** từ chối, không tạo đợt.

### US-10 · Gửi phiếu chấm cá nhân

Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số.

[F03](../../features/F03-xet-duyet-hoi-dong/spec.md) · AC-02, AC-06, AC-07 · Cỡ M. Dữ liệu thử gồm một thành viên được phân công và một thành viên có xung đột lợi ích. Nhóm có thể điều chỉnh cách báo tiêu chí thiếu điểm.

- **US-10.1** — **G** phiếu đủ điểm hợp lệ. **W** gửi. **T** tính tổng theo trọng số, khóa phiếu đã nộp.
- **US-10.2** — **G** người chấm là thành viên đề tài. **W** mở hoặc tạo phiếu cho đề tài. **T** không thấy việc chấm và không tạo được phiếu.

### US-11 · Chốt kết quả xét duyệt

Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt.

[F03](../../features/F03-xet-duyet-hoi-dong/spec.md) · AC-03, AC-04, AC-05 · Cỡ M. Dữ liệu thử gồm ba bộ phiếu dựng sẵn ở trên, dưới và bằng ngưỡng. Nhóm có thể điều chỉnh cách trình bày bảng tổng điểm.

- **US-11.1** — **G** đủ phiếu, điểm bằng ngưỡng đạt. **W** kết luận. **T** đề tài APPROVED và ghi audit.
- **US-11.2** — **G** chưa đủ phiếu. **W** kết luận. **T** hiển thị số phiếu thiếu, đợt giữ nguyên.

### US-12 · Mở việc cần xử lý trên điện thoại

Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc.

[B06](../../features/B06-trang-chu/spec.md) · AC-03, AC-04, AC-05 · Cỡ S. Dữ liệu thử gồm một hồ sơ cần bổ sung, tài khoản đúng và sai phạm vi. Nhóm có thể điều chỉnh thứ tự các thẻ ở màn hình hẹp.

- **US-12.1** — **G** người có việc, màn hình 360 px. **W** chạm thẻ. **T** mở đúng hồ sơ nguồn, trạng thái giữ nguyên.
- **US-12.2** — **G** người ngoài phạm vi. **W** tải trang chủ. **T** tiêu đề và số liệu hồ sơ kia đều không xuất hiện.

### US-13 · Đếm hồ sơ theo trạng thái của một kỳ

Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng.

[B02](../../features/B02-bao-cao-thong-ke/spec.md) · đề xuất mới cho khung B02 · Cỡ M. Dữ liệu thử gồm một kỳ gồm 3 mã hợp lệ, 2 đơn vị, một mã đã nộp lại. Nhóm có thể điều chỉnh sắp xếp cột và định dạng xuất.

- **US-13.1** — **G** 3 mã trong quyền, 1 mã đã nộp lại. **W** tổng hợp theo trạng thái hiện tại. **T** tổng bằng 3, từng nhóm khớp danh sách chốt.
- **US-13.2** — **G** chỉ có quyền một đơn vị. **W** xuất báo cáo. **T** cả dòng chi tiết và tổng loại hồ sơ ngoài quyền.

## Đợt B · Thực hiện, nghiệm thu và đầu ra

### US-14 · Giao thực hiện đề tài đã duyệt

Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt.

[F04](../../features/F04-quan-ly-tien-do/spec.md) · AC-01, AC-14 · Cỡ M. Dữ liệu thử gồm đề tài APPROVED và mẫu hồ sơ giao. Nhóm có thể điều chỉnh cách hiện bảng tóm tắt quyết định.

- **US-14.1** — **G** đủ căn cứ. **W** xác nhận giao. **T** hồ sơ giao có hiệu lực, đề tài IN_PROGRESS.
- **US-14.2** — **G** thiếu căn cứ bắt buộc. **W** xác nhận. **T** chỉ ra mục thiếu, đề tài còn APPROVED.

### US-15 · Đặt hạn báo cáo theo kỳ

Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ.

[F04](../../features/F04-quan-ly-tien-do/spec.md) · AC-02, AC-13 · Cỡ S. Dữ liệu thử gồm một đề tài đang thực hiện và một mã kỳ. Nhóm có thể điều chỉnh tên gợi nhớ của kỳ.

- **US-15.1** — **G** chưa có kỳ. **W** tạo kỳ và hạn. **T** xuất hiện đúng một báo cáo chờ nộp.
- **US-15.2** — **G** đã có cùng kỳ trên đề tài. **W** tạo lại. **T** từ chối bản trùng.

### US-16 · Nhắc hạn đúng một lần theo mốc

Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại.

[B04](../../features/B04-thong-bao/spec.md) · AC-07 · Cỡ S. Dữ liệu thử gồm một kỳ báo cáo đến mốc nhắc, đồng hồ giả lập. Nhóm có thể điều chỉnh nội dung tiêu đề nhắc.

- **US-16.1** — **G** kỳ đến mốc N. **W** chạy nhắc. **T** có thông báo cho đúng chủ nhiệm.
- **US-16.2** — **G** cùng đề tài, kỳ và mốc. **W** chạy lại. **T** không tạo thêm thông báo.

### US-17 · Nộp báo cáo tiến độ

Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ.

[F04](../../features/F04-quan-ly-tien-do/spec.md) · AC-03, AC-08, AC-09 · Cỡ S. Dữ liệu thử gồm kỳ chờ nộp của đề tài đang làm và đề tài tạm dừng. Nhóm có thể điều chỉnh vị trí hiển thị nhãn nộp muộn.

- **US-17.1** — **G** đang thực hiện, kỳ quá hạn. **W** nộp. **T** ghi nhận thời điểm, thể hiện trễ, chuyển chờ duyệt.
- **US-17.2** — **G** đề tài tạm dừng. **W** nộp cùng loại báo cáo. **T** chặn và giữ trạng thái kỳ.

### US-18 · Xác nhận kinh phí được cấp

Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng.

[F05](../../features/F05-quan-ly-kinh-phi/spec.md) · AC-01, AC-07 · Cỡ M. Dữ liệu thử gồm quyết định giao hiệu lực, hạn mức và tỷ lệ hợp lệ. Nhóm có thể điều chỉnh cách trình bày phép tính phí.

- **US-18.1** — **G** cấp 100 triệu, tỷ lệ 5%, trần 10 triệu. **W** xác nhận. **T** phí 5 triệu, kinh phí thực hiện 95 triệu đồng.
- **US-18.2** — **G** chủ nhiệm. **W** xác nhận cấp. **T** bị chặn ở máy chủ.

### US-19 · Ghi khoản chi kèm chứng từ

Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện.

[F05](../../features/F05-quan-ly-kinh-phi/spec.md) · AC-02, AC-04, AC-06 · Cỡ S. Dữ liệu thử gồm đề tài đang thực hiện, còn 2 triệu đồng. Nhóm có thể điều chỉnh cách hiện cảnh báo vượt kinh phí.

- **US-19.1** — **G** chủ nhiệm chi 3 triệu. **W** lưu khoản chi. **T** vẫn lưu và cảnh báo vượt 1 triệu đồng.
- **US-19.2** — **G** số tiền bằng 0. **W** lưu. **T** báo lỗi, số dư giữ nguyên.

### US-20 · Nộp sản phẩm khoa học kèm minh chứng

Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết.

[F07](../../features/F07-san-pham-khoa-hoc/spec.md) · AC-01, AC-05, AC-07 · Cỡ S. Dữ liệu thử gồm một đề tài đang làm, minh chứng và hai tài khoản. Nhóm có thể điều chỉnh bố cục thông tin bài báo.

- **US-20.1** — **G** sản phẩm đủ minh chứng. **W** gửi. **T** vào hàng chờ duyệt, giữ liên kết đề tài.
- **US-20.2** — **G** thiếu minh chứng bắt buộc. **W** gửi. **T** báo thiếu, bản kê khai chưa chuyển chờ duyệt.

### US-21 · Duyệt sản phẩm để tính vào cam kết

Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại.

[F07](../../features/F07-san-pham-khoa-hoc/spec.md) · AC-03, AC-08, AC-11 · Cỡ S. Dữ liệu thử gồm một sản phẩm đang chờ và cam kết cùng loại. Nhóm có thể điều chỉnh cách hiển thị đã đạt trên tổng cam kết.

- **US-21.1** — **G** sản phẩm đủ chứng cứ. **W** chuyên viên duyệt. **T** APPROVED và được tính vào cam kết của đề tài.
- **US-21.2** — **G** chủ nhiệm chỉ có quyền kê khai. **W** tự duyệt. **T** bị từ chối, tổng đạt giữ nguyên.

### US-22 · Đăng ký nghiệm thu khi đủ điều kiện

Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu.

[F06](../../features/F06-nghiem-thu/spec.md) · AC-01, AC-07 · Cỡ M. Dữ liệu thử gồm đề tài đang thực hiện, dữ liệu kỳ cuối và sản phẩm đã duyệt. Nhóm có thể điều chỉnh vị trí bảng kiểm điều kiện.

- **US-22.1** — **G** kỳ cuối đạt, đủ sản phẩm. **W** nộp hồ sơ cuối. **T** chuyển PENDING_ACCEPTANCE, chuyên viên nhận thông báo.
- **US-22.2** — **G** thiếu một sản phẩm cam kết. **W** đăng ký. **T** nêu mục thiếu và giữ IN_PROGRESS.

### US-23 · Ghi kết luận nghiệm thu đạt

Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán.

[F06](../../features/F06-nghiem-thu/spec.md) · AC-04, AC-06 · Cỡ M. Dữ liệu thử gồm đợt nghiệm thu có phiếu đã gửi và ngưỡng đã cấu hình. Nhóm có thể điều chỉnh bố cục biên nhận kết luận.

- **US-23.1** — **G** đủ phiếu và đạt ngưỡng. **W** kết luận. **T** đề tài PASSED, chờ quyết toán F05.
- **US-23.2** — **G** thiếu một phiếu bắt buộc. **W** kết luận. **T** chặn và báo số phiếu thiếu.

### US-24 · Quyết toán và đóng hồ sơ

Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành.

[F05](../../features/F05-quan-ly-kinh-phi/spec.md) · AC-05, AC-07 · Cỡ M. Dữ liệu thử gồm đề tài PASSED, kịch bản F05 cơ bản, điều kiện F06 AC-10 cần PO xác định trước khi giao. Nhóm có thể điều chỉnh vị trí thể hiện trạng thái khóa.

- **US-24.1** — **G** đủ điều kiện đóng đã thống nhất. **W** chuyên viên quyết toán. **T** chuyển COMPLETED, khóa kinh phí và ghi audit.
- **US-24.2** — **G** chủ nhiệm. **W** tự đóng. **T** từ chối, đề tài giữ nguyên.

### US-25 · Xuất lý lịch nghiên cứu của cá nhân

Nhà nghiên cứu lấy lý lịch theo mẫu đơn vị, tái dùng đề tài và sản phẩm đã đủ điều kiện tổng hợp.

[F08](../../features/F08-ly-lich-khoa-hoc/spec.md) · AC-09, AC-12, AC-13 · Cỡ M. Dữ liệu thử gồm một mẫu đã duyệt, một người có nhiều vai trò trên cùng đầu ra. Nhóm có thể điều chỉnh bố cục mẫu xuất.

- **US-25.1** — **G** có một đầu ra đủ điều kiện qua hai quan hệ. **W** trích xuất. **T** mẫu đúng và chỉ một dòng cho đầu ra.
- **US-25.2** — **G** người dùng ngoài phạm vi. **W** yêu cầu lý lịch người khác. **T** từ chối.

## Đợt C · Mở rộng theo ngành và thử nghiệm AI

### US-26 · Theo dõi đầu mục nhiệm vụ cấp trên

Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục.

[F09](../../features/F09-de-tai-cap-tren/spec.md) · AC-01, AC-02 · Cỡ S. Dữ liệu thử gồm tenant bật F09, một loại nhiệm vụ và quy tắc minh chứng. Nhóm có thể điều chỉnh nhãn cấp nhiệm vụ.

- **US-26.1** — **G** đủ dữ liệu. **W** lưu. **T** tra lại đầu mục đúng cấp và đơn vị.
- **US-26.2** — **G** thiếu tệp bắt buộc ở bước duyệt. **W** gửi duyệt. **T** chặn và chỉ rõ chứng cứ thiếu.

### US-27 · Xác nhận người hướng dẫn đề tài sinh viên

Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm.

[F10](../../features/F10-de-tai-sinh-vien/spec.md) · AC-04 · Cỡ S. Dữ liệu thử gồm đợt bật F10, nhóm hợp lệ và một giảng viên. Nhóm có thể điều chỉnh nội dung lời mời.

- **US-27.1** — **G** nhóm đủ điều kiện còn lại, giảng viên đã xác nhận. **W** nộp. **T** qua điều kiện người hướng dẫn.
- **US-27.2** — **G** chưa ai xác nhận. **W** nộp. **T** chỉ rõ thiếu xác nhận và giữ bản đăng ký.

### US-28 · Kê khai dự án phục vụ sản xuất

Người kê khai ghi đơn vị chủ trì, đối tác ngoài và tổng kinh phí VND để phòng khoa học xét dự án ứng dụng.

[F11](../../features/F11-du-an-phuc-vu-san-xuat/spec.md) · AC-01, AC-02, AC-03 · Cỡ S. Dữ liệu thử gồm tenant bật F11, danh mục đơn vị và một đối tác. Nhóm có thể điều chỉnh cách chọn đối tác trong mẫu.

- **US-28.1** — **G** đủ trường và đối tác. **W** lưu kê khai. **T** tra lại đúng đơn vị và tổng kinh phí.
- **US-28.2** — **G** thiếu đối tác ngoài. **W** gửi duyệt. **T** chặn và yêu cầu bổ sung.

### US-29 · Kê khai một hoạt động khoa học

Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận.

[F12](../../features/F12-hoat-dong-khoa-hoc/spec.md) · AC-01, AC-02 · Cỡ S. Dữ liệu thử gồm tenant bật F12, một loại hoạt động và một quy tắc minh chứng. Nhóm có thể điều chỉnh nhãn loại hội nghị.

- **US-29.1** — **G** đủ dữ liệu và minh chứng yêu cầu. **W** gửi duyệt. **T** hoạt động vào danh sách chờ xét.
- **US-29.2** — **G** thiếu minh chứng bắt buộc của loại hoạt động. **W** gửi. **T** nêu loại tệp cần bổ sung.

### US-30 · Ghi giờ giảng từ một sự kiện hợp lệ

Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường.

[P03](../../features/P03-quy-doi-gio-giang/spec.md) · AC-01, AC-05 · Cỡ M. Dữ liệu thử gồm tenant bật P03, một sự kiện đã duyệt, một công thức do trường xác nhận. Nhóm có thể điều chỉnh cách trình bày chi tiết phép tính.

- **US-30.1** — **G** sự kiện hợp lệ. **W** tính giờ. **T** ra đúng giờ đối chứng theo công thức của kỳ.
- **US-30.2** — **G** cùng sự kiện. **W** xử lý lần hai. **T** không phát sinh dòng giờ trùng.

### US-31 · Đối chiếu mục bắt buộc trong một thuyết minh

Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu.

[F01](../../features/F01-de-xuat-de-tai/spec.md) · đề xuất AI, chưa có AC nguồn · Cỡ M. Dữ liệu thử gồm một mẫu yêu cầu, hai đoạn đã gán nhãn, một hồ sơ ở tenant khác. Nhóm có thể điều chỉnh cách sắp các mục cần rà.

- **US-31.1** — **G** đoạn nguồn hợp lệ. **W** yêu cầu rà. **T** thấy trích đoạn, vị trí và bản mẫu, chủ nhiệm có thể bác gợi ý.
- **US-31.2** — **G** tài liệu ngoài quyền hoặc thiếu căn cứ. **W** yêu cầu rà. **T** từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên.

### US-32 · Lập thẻ đọc cho một tài liệu có DOI

Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không.

[F07](../../features/F07-san-pham-khoa-hoc/spec.md) · đề xuất hỗ trợ nghiên cứu, chưa có AC nguồn · Cỡ M. Dữ liệu thử gồm một DOI đã xác minh, một bản toàn văn được phép dùng và một trường hợp chỉ có metadata. Nhóm có thể điều chỉnh trường ghi chú của thẻ đọc.

- **US-32.1** — **G** bài có đoạn phương pháp. **W** lập thẻ. **T** trường phương pháp có dẫn trang hoặc đoạn để người đọc kiểm lại.
- **US-32.2** — **G** chỉ có metadata. **W** lập thẻ. **T** chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài.

## Đưa một thẻ vào Spec Kit

Chọn một US, ví dụ US-07. Dùng đoạn dưới làm yêu cầu cho `/speckit-specify`. Với thẻ có AC, đối chiếu đặc tả hiện hành. Với thẻ mới như US-13, ghi rõ nguồn là đề xuất và mời PO/BA xác nhận quy tắc đếm. Mỗi AC được chấp nhận phải có ít nhất một ca kiểm thử, ánh xạ đến màn hình đối với nghiệp vụ có UI và truy vết đến cách hiện thực khi vào pha thiết kế. Bản làm việc ở `specs/NNN-slug/`, quy tắc nghiệp vụ đã chốt ở `docs/features/`. [Quy trình repo](../../../AGENTS.md)

```text
/speckit-specify Đặc tả lát cắt US-07 “Nộp đề xuất và nhận mã theo dõi” của E1/F01 (proposal). Đối chiếu docs/features/F01-de-xuat-de-tai/spec.md AC-02, AC-03 và AC-04. Chủ nhiệm có một bản nháp trong kỳ đang mở. Khi nộp đủ trường trong hạn, cấp một mã, ghi thời điểm, khóa sửa và chuyển Đã nộp qua workflow. Quá hạn hoặc thiếu trường thì giữ Nháp và nêu lý do. Nộp lại sau trả bổ sung phải bảo toàn mã theo AC-11. Kiểm quyền ở backend, audit và múi giờ theo AGENTS.md. Viết BR và AC Given/When/Then, liên kết từng AC với ca thử và màn hình. Chỉ rõ điểm cần hỏi PO về biên thời gian. Giới hạn ở thao tác nộp một hồ sơ.
```

**Bộ kiểm thử xuyên module đầu tiên.** Tạo một kỳ với hai đề tài ở hai khoa, một chủ nhiệm kiêm thành viên hội đồng và một người ngoài tenant. Chạy đường nộp → trả bổ sung → nộp lại → chấm → kết luận → thống kê. Đối chiếu đúng hai mã, một danh sách phiếu hợp lệ, số đề tài chốt ở từng khoa và một nhật ký cho mỗi chuyển bước thành công. Dùng cùng bộ dữ liệu ở màn hình máy tính và điện thoại. Với E4, xác nhận công thức từng tổ chức trước khi ký đầu ra. Với AI, thử chất lượng và cách ly quyền theo [phép thử đề xuất](README.md).
