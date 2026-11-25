---
title: "Nhật ký triển khai và nghiệm thu RMS"
status: In progress
updated: 2026-11-25
---

# Nhật ký triển khai RMS

Phạm vi gồm N01–N14, 35 lát INVEST, các AC còn lại của 20 feature, đánh giá bảo mật và hướng dẫn theo vai trò. Các ca dưới đây dùng dữ liệu giả lập local. [Kế hoạch và thứ tự phụ thuộc](../guides/ke-hoach-implement-rms.md) · [Danh mục lát](../../specs/README.md)

| Phiếu | Đầu ra | Bằng chứng kiểm tại local |
|---|---|---|
| N01 | NestJS, hợp đồng OpenAPI, client cho web, workflow CI. Mở **Phiên mô phỏng** để kiểm tra trạng thái API. | Cài theo lockfile từ bản sao sạch chỉ chứa mã nguồn và manifest, build cả hai app đạt. Thay enum của bản sao contract khiến lệnh check trả mã 1. 67 ca nghiệp vụ cũ và 1 ca HTTP qua Nest đạt. Chrome gọi API thật qua proxy, thấy trạng thái kết nối, báo lỗi và thử lại thành công. [Ca HTTP](../../apps/backend/test/health.test.mjs) · [Ca trình duyệt](../../e2e/integration/health.spec.ts) |
| N02 | Hai role PostgreSQL, schema, tenant, đơn vị, đề tài, khóa ngoại ghép, policy cả đọc/ghi và callback transaction. | PostgreSQL 16.14 tạm trên Unix socket. 100 vòng A/B đọc đúng tiêu đề của từng tenant trên cùng PID. Không context đọc rỗng, ghi bị từ chối (42501). Ghi chéo bị từ chối (42501), gán đơn vị trường khác bị chặn (23503). Hủy giao dịch khôi phục tên cũ và giải phóng context. [Migration](../../apps/backend/prisma/migrations/0001_tenant/migration.sql) · [Ca PostgreSQL](../../apps/backend/test/db/isolation.test.mjs) |
| N03 | Seed hai realm, SPI OTP 0.94, Keycloak 26.8.0, SMTP Mailpit, PKCE S256, audience rms-api. | Hai lần sinh seed giống từng byte. Chrome đăng nhập qua A và B bằng cùng email. Mã của A bị từ chối tại B và trong phiên A tiếp theo. Mã hết hạn bị từ chối (TTL kiểm thử 30 giây, mặc định 300 giây). [Ca OTP](../../e2e/keycloak/otp.spec.ts) · [Runbook realm, bootstrap và xoay secret](../../infra/keycloak/README.md) |
| N04 | Đường dẫn /app/{slug} đăng nhập qua IdP, API xác minh chữ ký và đọc quyền từ PostgreSQL, API công khai chỉ cấp thông tin realm đã đăng ký. | Chrome qua email mới → OTP → PKCE → /auth/me, nhận user và đúng một quyền. Cùng token đưa sang realm B nhận 401. Khóa trong DB và gọi lại API nhận 403. Hai cuộc gọi đồng thời chỉ tạo một account và một audit. Bootstrap idempotent, chỉ credential migrate gọi được. [Ca trình duyệt và DB](../../e2e/integration/account.spec.ts) · [Ca JWT](../../apps/backend/test/token.test.mjs) |
| N05 | Hai bộ token sáng/tối, validator dùng chung, gallery với form đề xuất, bảng và dialog. | Chrome kiểm màu, font và portal ở 390/1280 px. Tab và Shift+Tab giữ focus trong dialog. Escape trả focus đúng nút. Validator chỉ đúng trường lỗi tương phản. [Ca UI](../../e2e/integration/gallery.spec.ts) · [Bốn ảnh màn hình](screenshots/theme/) |
| N06 | Catalog giữ draft và các revision bất biến theo tenant. API định nghĩa đọc, soạn, áp dụng và khôi phục. | Hai request cùng expected revision cho một thành công và một 409. Phiên bản 2 tồn tại trong lịch sử sau khi khôi phục, trường B vẫn default. [Ca PostgreSQL](../../apps/backend/test/db/theme.test.mjs) |
| N07 | Admin đăng nhập thật mở **Giao diện đơn vị**, sửa màu/font/bo góc, kiểm tương phản, xem thử biểu mẫu và dialog, lưu nháp rồi áp dụng hoặc khôi phục. | Chrome kiểm hai phiên A/B, nháp và publish. [Ca tích hợp](../../e2e/integration/theme-admin.spec.ts) · [A trước](screenshots/theme/admin-a-before.png) · [A sau áp dụng](screenshots/theme/admin-a-published.png) · [A sau khôi phục](screenshots/theme/admin-a-restored.png) · [B trước](screenshots/theme/reader-b-before.png) · [B sau](screenshots/theme/reader-b-after.png) |
| N08 | P01 khóa instance, tra cạnh của template đã ghim, kiểm role/scope/lý do, ghi bước, semantic, history, audit và outbox trong một transaction. | Từ chối lý do trống. Rollback sau khi chạy lệnh giữ nguyên cả bốn kết quả. Hai lệnh cùng revision chỉ một thành công và có một history/audit/event. Runtime không thể xóa audit. [Ca tích hợp](../../apps/backend/test/db/workflow.test.mjs) |
| N09 | Worker riêng, lease có hạn, tin in-app và email, backoff, hàng đợi lỗi và replay qua role Ops. | Worker khởi động lại sau commit. Chạy CLI năm lần cho một sự kiện tạo một tin và một email ở Mailpit. Lỗi SMTP chưa rõ kết quả dừng chờ đối soát. Ops xác nhận chưa gửi, replay giữ Message-ID, không tạo bản thứ hai. [Ca lỗi và replay](../../apps/backend/test/db/notification.test.mjs) · [Ca SMTP thật](../../apps/worker/test/mailpit.mjs) · [Runbook](../../apps/worker/README.md) |
| N10 | API upload intent theo tenant, người tải, đề tài và revision. Kho S3 có key staging và key đã xác nhận tách riêng. | SeaweedFS 4.55 thật, ký POST/GET bằng AWS SDK. Kiểm quyền khi gắn và khi tải, SHA-256, loại nội dung, quá dung lượng, retry và cleanup. [Ca S3 + PostgreSQL](../../apps/backend/test/db/attachments.test.mjs) · [Cấu hình kho và dọn staging](../../infra/object-store/README.md) |
| N11 · phần local | DB riêng và runtime RLS cho B01, Redis TTL 300 s, adapter RMS và API blob trực tiếp, manifest pilot. | Upload HTTP 6 MiB giữ SHA-256, 20 MiB + 1 byte nhận 413. Chưa có môi trường Neon/Vercel/TLS được cấp để xác minh quota, kết nối pooled/direct và chi phí thật. [Manifest và phiếu Ops](../../infra/pilot/README.md) |
| US-02 · T001–T008 | Đọc và ghi đè cấu hình trong phạm vi trường, schema key, audit nguyên tử, UI có xem trước và tải. | Chrome qua OTP. A và B cùng cache giá trị chung, A ghi rồi đọc ngay bản riêng, B vẫn đọc bản chung. Cùng token bị hạ quyền/khóa nhận 403. [Biên bản bốn ca](../../e2e/catalog/config-override/review.md) · [Hướng dẫn](../guides/nguoi-dung/cau-hinh-theo-truong.md) |
| US-04 · T001–T008 | Tra sự kiện của đề tài theo khoảng ngày, số đếm cùng phạm vi, quyền nguồn tại mỗi request. | U chuyển khoa rồi mở link cũ không thấy tên hồ sơ. V còn quyền thấy đúng U và khoa cũ tại thời điểm thao tác. Tenant B không nhận nội dung. [Biên bản](../../e2e/audit/audit-trail/review.md) · [Hướng dẫn chuyên viên](../guides/nguoi-dung/chuyen-vien-tra-lich-su.md) |
| US-01 · T001–T008 | Quản trị khóa/mở khóa, đồng bộ quyền theo request và tra hồ sơ của người bị khóa. | Hai lượt độc lập cho GET và PATCH đầu tiên sau khóa cùng trả 403, revision và audit hồ sơ giữ nguyên. User gọi API tạo trước tài khoản nhận 403 ở AC-09. [Biên bản](../../e2e/iam/lock-account/review.md) · [Hướng dẫn](../guides/nguoi-dung/quan-tri-khoa-tai-khoan.md) |
| US-03 · T001–T008 | Chủ quy trình soạn bước, cạnh, quyền và điều kiện. Hồ sơ hiển thị phiên bản đã ghim. | Cùng thao tác tại bước duyệt dẫn X sang bước của v1, Y sang bước của v2 đến hết quy trình. Graph lỗi không đổi bản active. [Biên bản](../../e2e/workflow/workflow-version/review.md) · [Hướng dẫn](../guides/nguoi-dung/chu-quy-trinh.md) |
| US-05 · T001–T008 | Quản trị kỳ, thẩm định lại danh mục tại lúc mở, tra kỳ theo ngày Việt Nam. | Giữ nháp khi bộ tiêu chí hết hiệu lực. Chuyên viên thay đúng bộ và mở lại, chủ nhiệm thấy cùng mã tại 390 px. [Biên bản](../../e2e/call/open-call/review.md) · [Hướng dẫn](../guides/nguoi-dung/chuyen-vien-mo-ky.md) |
| US-06–08 · 24 task | Nháp theo chủ nhiệm và biểu mẫu kỳ, nộp cấp mã tuần tự, trả có lý do rồi nộp lại qua P01. | Chrome giữ tên nháp sau tải lại, khóa form khi nộp, nhận lý do sau trả và giữ mã khi nộp lại. Hai nháp khác nhau nộp song song có số riêng. [Biên bản](../../e2e/call/open-call/proposal-review.md) · [Hướng dẫn](../guides/nguoi-dung/chu-nhiem-de-xuat.md) |

[Đối chiếu từng feature và các AC còn mở](doi-chieu-nghiem-thu-feature.md).

Đếm trong 35 tệp tasks.md có 274/277 task được đánh dấu hoàn thành. US-13/T008 chờ chữ ký trưởng phòng. US-31/T007 và T008 chờ 50 hồ sơ gán nhãn độc lập có quyền sử dụng. Các AC ngoài lát INVEST và các điều kiện pilot ở bảng đối chiếu từng feature có phạm vi riêng. Reviewer có thể tìm điểm xử lý, ca chạy và biên bản thực tế của từng thẻ. [Bảng truy vết 35 thẻ](truy-vet-task-invest.md)

Đối chiếu tài liệu ngày 25/11 truy vết được 200 BR, 202 AC và 311 TC của 20 feature. Bộ kiểm đã xác nhận đường dẫn trong 478 tệp Markdown của repo và đối chiếu 35 thư mục Spec Kit. Các con số BR/AC/TC ở đây phản ánh độ phủ tài liệu. Số phép kiểm thực sự chạy ở local nằm trong bảng hồi quy bên dưới. [Ma trận nghiệm thu từng feature](doi-chieu-nghiem-thu-feature.md)

## Kết quả hồi quy ngày 24 và 25/11

| Phép kiểm | Kết quả trên máy local |
|---|---|
| Hợp đồng, lint, typecheck và build | Bản sinh OpenAPI khớp nguồn. Tất cả workspace có script tương ứng trả mã 0. |
| Test đơn vị, bộ chấm QA và HTTP | 68 ca web/nghiệp vụ, 5 ca bộ chấm SC-003, 4 ca backend và 4 ca dịch vụ cấu hình. Cả 81 ca đạt. |
| DB, tệp và giao thư | 54/54 ca PostgreSQL và B01 đạt với kho tệp thử. HOME-11 có ca hai quản trị sửa cùng phiên bản và ca phân trang lịch sử qua migration 002. B06 đã đối chiếu năm thông báo mới nhất với bảy tin của đúng người nhận. Worker CLI đã giao mỗi sự kiện thử đúng một lần cho từng kênh. Mailpit nhận đúng người, tiêu đề và nội dung cho cả mẫu ban đầu lẫn mẫu riêng của trường. Gateway SMS loopback nhận đúng một yêu cầu từ CLI với số tổng hợp, nội dung và mã lượt gửi. |
| Trình duyệt qua đăng nhập thực | 35/35 kịch bản Chrome đạt trong 3,7 phút. B02 đã kiểm hai tab khi bị thu quyền, tải lại đúng nhóm và CSV tương ứng với mã bản chụp. F02 có ca tự đóng kỳ và nộp cùng bản nháp sau gia hạn. F01 đã kiểm hủy ở hai phiên, mở lại lý do và mã đề tài, cùng quyền chỉ đọc của quản trị trong thuyết minh đã nộp. B04 có ca quản trị xem trước, lưu và gỡ mẫu theo kênh, cùng ca người dùng tắt SMS độc lập với email bắt buộc. B06 kiểm lỗi ở từng nguồn, thử lại, hạ quyền và khóa tài khoản giữa phiên. Quản trị lưu bố cục qua B01 và HOME-11. Đã đối chiếu hai lần sửa, xung đột phiên bản, lịch sử của trường và thứ tự thẻ khi chủ nhiệm hoặc chuyên viên mở lại. B06 mở phiếu F06 theo phân công và báo cáo B02 theo khoa. B01 và phiếu hội đồng có ca thu quyền khi biểu mẫu đang mở. Các ca khác kiểm tra loại sản phẩm theo trường, sản phẩm độc lập liên khoa, giờ tác giả, sinh viên nộp lại kết quả và chuyên viên xử lý hỗ trợ F12. Ca tạo trước qua service account có lượt Chromium riêng cùng diễn tập IdP. |
| Bản mẫu v0 | 23/23 kịch bản đạt trong 47,7 giây. Có màn hình điện thoại, chuyển vai, dữ liệu thử và thao tác hai tab. |
| Tải và phục hồi sau dồn tải | Một kịch bản 19,8 phút và một kịch bản 7,5 phút đều đạt. Chi tiết phép đo, phạm vi và số liệu từng lượt ở cuối báo cáo. |
| Bàn giao người dùng | 21 hướng dẫn Markdown cùng 1 mục lục theo vai trò. Thư mục đối chứng có 94 ảnh PNG. |

Trong lượt thử hai worker trên macOS, Playwright hoàn tất assertion nhưng có một worker không thoát trong 300 giây. Lượt tích hợp cuối chạy tuần tự vì các ca dùng chung cấu hình của hai trường. Bộ v0 trên macOS cũng chạy một worker. Một lượt v0 khác ghi lỗi tải lại trang ở ca lưu nháp và hết thời gian dừng worker. Khi chạy lại sau khi build kết thúc, 23 ca v0 đạt trong 43,2 giây và tiến trình trả mã 0.

Một lượt với migration 0046 chạy riêng bộ Chrome tích hợp, đạt 27/27 trong 2,6 phút và trả mã 0. Ở lượt trước chạy đồng thời với v0, cả 27 ca đã hoàn tất nhưng Playwright hết 240 giây khi thu dọn và trả mã 1. Bộ v0 của bản cuối đạt 23/23. Diễn tập khôi phục xác nhận hai DB, hai đối tượng S3, đúng phạm vi và 0 bản ghi kiểm soát bị mất.

[Hướng dẫn theo vai](../guides/nguoi-dung/README.md) · [Ảnh đối chứng](screenshots/) · [Các AC còn mở](doi-chieu-nghiem-thu-feature.md) · [Danh sách riêng để tiếp tục review](muc-can-review-nguoi-va-ai.md)

## Bằng chứng vận hành và bảo mật

Lượt phục hồi DB/kho đã kiểm 67 bảng RMS, 2 bảng B01 và 2 đối tượng 1 MiB/6 MiB. Đích phục hồi khớp số dòng, dấu vân tay và phạm vi trường. Số dòng, kích thước và thời gian của lượt mới nhất được ghi trong tệp kết quả. Diễn tập riêng cho IdP giữ hai subject qua hai realm và bốn lượt OTP trước/sau khôi phục trong 60,106 giây. Hai lượt phục hồi chạy trên hạ tầng cục bộ. [DB/kho](../../e2e/release/restore-result.json) · [IdP](../../e2e/release/idp-result.json)

Quét 484 phụ thuộc production ghi 0 advisory sau cập nhật Nodemailer và ghim minimatch trên đúng nhánh phụ thuộc. Danh sách sửa có 5 mục P1 và 4 mục P2 còn mở. Trong số P1, quyền ghi trực tiếp vào cột trạng thái đề tài và chính sách kiểm nội dung tệp cần quyết định trước khi nhập dữ liệu trường. [Báo cáo S1–S7](danh-gia-bao-mat-rms.md) · [Yêu cầu sửa và điều kiện đóng](viec-can-sua-bao-mat.md)

## Quyết định thực hiện

- Tiếp tục từ bộ đặc tả đang sửa trong checkout bằng nhánh cục bộ `feat/rms-integrated-implementation`. Khởi tạo worktree từ HEAD sẽ thiếu các quyết định SA và BA/PO chưa commit.
- Dùng openapi-typescript với TypeScript 5.9 riêng trong gói sinh client theo peer dependency của công cụ. Backend và web dùng TypeScript 6 của repo. Kiểm drift bằng lệnh `pnpm --filter @rms/api-contracts check`.
- Ca SQL âm giữ client đã mượn và trả vào pool sau assertion. `pg.Pool.query` tự loại kết nối khi có lỗi SQL. Giữ client giúp kiểm chứng rollback và tái sử dụng đúng cùng PID suốt ca kiểm.
- Máy thử có Docker CLI nhưng daemon dừng. Đã chạy Keycloak gốc bằng JDK 21 Corretto và Mailpit trên loopback. Kiểm thử sử dụng đúng JAR ghi trong Dockerfile. Tắt required action VERIFY_PROFILE trong realm để RMS xử lý hồ sơ lần đầu theo B03. Cần chạy lại Compose trên Docker khi đóng gói phát hành.

- F02/BR-02 ở spec yêu cầu mã kỳ duy nhất toàn hệ thống. Thiết kế cũ mô tả unique theo tenant. Dùng unique mã không phân biệt hoa thường ở DB, lỗi trùng chỉ báo mã đã sử dụng. PO/BA rà tác động tới quy ước đặt mã khi nhiều trường dùng chung hệ thống.

### US-09–11 · Chốt hồ sơ và xét duyệt hội đồng

F01/AC-10 có thao tác chốt hồ sơ sau khi đóng kỳ. F03 dùng bộ tiêu chí từ kỳ đã ghim, kiểm quan hệ thành viên lúc ghi và lúc đếm phiếu. PostgreSQL tính trọng số bằng numeric. Người có quyền chốt khoa học đọc ngưỡng thực từ B01. Khi cấu hình số thiếu hoặc sai, hệ thống giữ nguyên đợt và cho chuyên viên biết cần kiểm lại B01. Chuyên viên nhập căn cứ quyết định đạo đức của hội đồng theo RV-11. Luồng biên bản riêng F03/AC-12 được kiểm bổ sung ở migration 0034. Quyền ký trực tiếp và ngoại lệ mở lại BR-10 cần đối chiếu riêng.

Ở mốc hoàn thành US-11 ngày 24/11 có 15/15 ca PostgreSQL và 12/12 ca Chrome tích hợp. Đã đo số sự kiện với năm kết hợp khoa học/đạo đức, quyền của người xung đột, cặp mở đồng thời và thiết lập score B01. [Đối chiếu quyết định](../../e2e/review/review-decision/review.md) · [Hướng dẫn theo vai](../guides/nguoi-dung/xet-duyet-hoi-dong.md)

### US-12 và US-35 · Tra việc, tra kỳ trên điện thoại

B06 lấy việc trả bổ sung của đúng chủ nhiệm từ trạng thái chuẩn P01 và lý do ở F01. Kiểm lại ở nguồn trước khi mở thuyết minh. F02 đã có ca đối chiếu quyền xem kỳ nháp và hai phía của cửa sổ nhận. Khi các bài SQL bổ sung tạo thêm sự kiện B04, harness SMTP từng dừng sau năm job dù sự kiện thử còn chờ. Đã sửa harness để dừng theo trạng thái của đúng event trong backlog thực. Lượt chạy lại đạt 17/17 ca PostgreSQL và 12/12 ca Chrome. [Ca B06](../../e2e/home/open-work-item/review.md) · [Hướng dẫn điện thoại](../guides/nguoi-dung/viec-can-bo-sung.md)

### US-13 · Đối chứng báo cáo kỳ

Ảnh chụp bất biến tại B02 dùng mã đã cấp và trạng thái chuẩn, tính một lần cho mỗi nguồn. Trưởng phòng thử được cấp phạm vi hai khoa theo bảng grant báo cáo do vai trò provision quản lý. Chuyên viên cùng trường vẫn bị giới hạn một khoa. Chọn CSV UTF-8 cho mẫu đối chứng cục bộ; PO và trưởng phòng quyết định tên cột và ký mẫu pilot. Khi thu hẹp quyền, drill-down/xuất yêu cầu tạo lại bản. Lượt 17 ca PostgreSQL, 13 ca Chrome đạt; tệp thật giữ nguyên A2 ở Nháp dù sau đó đã nộp lại. [RV-13](../../e2e/report/call-report/review.md) · [Hướng dẫn trưởng phòng](../guides/nguoi-dung/truong-phong-bao-cao-ky.md)

### US-14, US-15 và US-17 · Giao thực hiện và báo cáo kỳ

F04 nhận quyết định đã duyệt từ F03. File căn cứ phải được xác nhận trong đúng đề tài. F01 cho nhập cam kết số lượng theo loại, F04 chốt cam kết trong quyết định. Hồ sơ cũ cho chuyên viên xác nhận cam kết theo quyết định giao. Cách tính chênh lệch thời lượng hiện bám quy ước bản v0: thời gian tính cả ngày cuối, chia độ dài tháng trung bình 30,4375 và làm tròn; phòng KHCN cần xác nhận các trường hợp tháng lẻ. Đã kiểm quyền, kỳ trùng, từng phiên bản nội dung, thời điểm cuối ngày và một giây sau, tạm dừng, tiếp tục, trả sửa, duyệt và mở lại có lý do. [Đối chiếu F04](../../e2e/progress/assign-project/review.md) · [Hướng dẫn](../guides/nguoi-dung/giao-de-tai-va-bao-cao-tien-do.md)

Đợt rà bảo mật đầu tiên ghi nhận ba cảnh báo mức cao ở worker SMTP. Sau nâng cấp Nodemailer, kiểm giao qua Mailpit đạt và bộ tích hợp đợt A trên hai worker Chrome đạt 13/13 trong 29,2 giây. Một lượt trước có worker Chrome chậm thoát sau khi trả kết quả: QA dùng cluster mới để xác minh lại. [Báo cáo an toàn](danh-gia-bao-mat-rms.md) · [Yêu cầu sửa](viec-can-sua-bao-mat.md)

### US-16 và US-34 · Nhắc kỳ và đọc tin cá nhân

Đã chạy 20/20 ca DB với kho tệp thử và Chromium đăng nhập hai trường qua OTP. Qua mốc N tại nửa đêm Việt Nam, cùng kỳ và người nhận chỉ sinh một event dù chạy đồng thời. SMTP bị từ chối tạm thời vẫn giữ một tin trong ứng dụng. Nhắc quá hạn cho chủ nhiệm và chuyên viên giao đề tài còn đúng khoa. Khi thay chuyên viên cần xác nhận lại nguồn phân công. [Kết quả theo ca](../../e2e/notification/deadline-reminder/review.md) · [Hướng dẫn người nhận](../guides/nguoi-dung/hop-thong-bao.md)

### US-33 · Việc quá hạn trên điện thoại

Trang chủ lấy việc từ F01, F03 và F04, với khóa kỳ riêng cho từng báo cáo. Sau khi quản trị đổi HOME.RESEARCHER, backend kiểm lại layout trước khi đếm hoặc mở việc. Kết quả tại local đạt 21/21 ca DB và 15/15 ca trình duyệt, gồm cả hai phiên rộng 360/390 px. [Ca tích hợp](../../e2e/home/triage-deadlines/acceptance.spec.ts) · [Hướng dẫn](../guides/nguoi-dung/viec-can-bo-sung.md)

### US-18, US-19 và US-24 · Sổ kinh phí

F05 giữ bản chụp tỷ lệ và trần B01 khi cấp. Sổ ghi tiền theo số nguyên, khóa đề tài khi cập nhật để giữ số dư nhất quán, kiểm phiên bản khi sửa chi. Phiếu chi có thể mang nhiều tệp cùng đề tài. Khi nghiệm thu đạt, quy trình chỉ đóng qua P01 sau khi xử lý đủ điều kiện theo chế độ của trường. Chọn khóa B01 budget.reconciliationEnabled, mặc định rà thủ công khi trường chưa cấu hình; lỗi dịch vụ B01 chặn quyết toán. Bộ chạy độc lập có 22/22 ca DB và một kịch bản Chromium với bốn phiên. [Đối chứng số tiền](../../e2e/budget/budget-allocation/review.md) · [Hướng dẫn chuyên viên và chủ nhiệm](../guides/nguoi-dung/so-kinh-phi.md)

### US-20–23 · Sản phẩm và nghiệm thu

F07 kiểm quyền dùng minh chứng khi gửi, F06 kiểm kỳ cuối và số đạt theo từng loại cam kết. Hội đồng nghiệm thu có phân công và mẫu tiêu chí riêng; khóa đợt loại phiếu xét duyệt đầu vào khỏi phép tính. Đã chạy trên trình duyệt từ F03 tới F05 khóa sổ bằng cùng đề tài, gồm 1 phiếu xét duyệt và 1 phiếu nghiệm thu. [F07](../../e2e/product/submit-output/review.md) · [F06](../../e2e/acceptance/request-acceptance/review.md) · [Hướng dẫn các vai](../guides/nguoi-dung/README.md)

## Các mục cần người và AI review kỹ

[Công việc chi tiết, vai trò và điều kiện ký](muc-can-review-nguoi-va-ai.md).


| Người review | Việc cần đối soát | Bằng chứng còn cần |
|---|---|---|
| Ops / DBA | Tách credential runtime và migrate trên pool ở môi trường pilot. Đối chiếu phiên bản PostgreSQL và cơ chế chuyển giao role. | Kết quả N11 qua pool đích, diễn tập N14 trên hạ tầng pilot và checksum đối chiếu. |
| Security / IAM | Đường cấp tenant ID cho callback DB phải xuất phát từ danh tính và registry đã xác thực. | N04/N12 đã có phép kiểm hai realm local. Cần bằng chứng SSO, grant DB, thu hồi và xoay khóa ở pilot. |
| PO / QA | Màn hình v0 dùng dữ liệu mô phỏng. Ở đường đăng nhập theo trường, các ca bên dưới chạy qua API nghiệp vụ. | PO rà ảnh theo vai và tiêu chí từng feature, rồi ký mẫu đối chứng của trường. |

## Lệnh kiểm tra bản tích hợp

Dùng Node theo .nvmrc, chạy ở gốc repo. PostgreSQL test dùng cluster private do script tạo. Realm và Mailpit cần chạy trước theo runbook N03. Với luồng SMTP của worker, expose cổng SMTP Mailpit 1026 trên loopback (CLI native hoặc cổng Compose local). Khi chạy Playwright tích hợp, seed redirect URI về http://127.0.0.1:4191. PORT và DATABASE_URL của API do harness đặt.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm test:db
RMS_BROWSER_CHANNEL=chrome bash apps/backend/test/db/run.sh --oidc
RMS_BROWSER_CHANNEL=chrome RMS_WEB_ORIGIN=http://127.0.0.1:4191 RMS_LOGIN_SECONDS=30 npm --prefix e2e exec -- playwright test --config e2e/playwright.keycloak.config.ts
```

Ca hết hạn chỉ dùng giá trị 30 khi realm đã seed TTL 30. Để chạy ca S3 trong cùng vòng, bật endpoint và credential của kho thử trước khi gọi test:db hoặc run.sh. Mỗi lượt kiểm S3 tạo và xóa bucket riêng.

### US-25 · Lý lịch khoa học

Bộ tích hợp có 25/25 ca PostgreSQL, gồm lần tải lại theo quyền hiện hành. Một kịch bản Chromium dùng bốn tài khoản kiểm được hai lượt xuất. Mẫu lưu mã, phiên bản và tiêu đề. Tệp tải tạm hết hạn sau 15 phút. F08 đã đối soát sổ giờ tại US-30. [Hai PDF và hai sự kiện](../../e2e/profile/export-profile/review.md) · [Hướng dẫn](../guides/nguoi-dung/ly-lich-khoa-hoc.md)

### US-28 · Dự án ứng dụng

F11 lưu tiền VND riêng tại đầu mục và kiểm đối tác tại bước gửi duyệt. Kiểm thật qua B01, PostgreSQL và hai realm. [Đối chứng](../../e2e/applied-project/register-applied-project/review.md) · [Hướng dẫn](../guides/nguoi-dung/du-an-ung-dung.md)

### US-27 · Đề tài sinh viên

Xác nhận gắn với đúng đăng ký, người được mời và nhóm thuộc đơn vị. Đợt và nhóm được kiểm lại khi nộp. [Đối chứng](../../e2e/student-project/confirm-mentor/review.md) · [Hướng dẫn hai vai](../guides/nguoi-dung/dang-ky-sinh-vien.md)

### US-26 và US-29 · Minh chứng mở rộng

B01 kiểm loại hồ sơ và minh chứng riêng của trường. F09 kiểm quyết định ở bước duyệt, F12 kiểm bộ tệp riêng ở bước gửi. 28/28 ca PostgreSQL và một kịch bản Chromium năm tài khoản, hai trường, với PDF qua S3. [Bằng chứng](../../e2e/extension/evidence/review.md) · [Hướng dẫn](../guides/nguoi-dung/nhiem-vu-va-hoat-dong.md)

### US-30 · Sổ giờ giảng

F12 chuyển sự kiện duyệt cho P03 trong transaction. Worker chọn lịch B01, tính từ ngày nguồn, lưu mã kỳ và phiên bản. Kiểm hồi quy liên kết F08 qua PKCE, lần gửi lặp và điều chỉnh có lý do. [Đối chứng](../../e2e/teaching-hour/teaching-hours/review.md) · [Hướng dẫn](../guides/nguoi-dung/so-gio-giang.md)

### US-31 và US-32 · Trợ lý có dẫn chứng

Hai ca Chromium qua HTTP với bộ chọn đoạn thử và 30/30 ca DB. Căn cứ chỉ xuất hiện sau kiểm quyền đọc và quyền xử lý, mô hình chỉ trả mã đoạn. Ghi phiên bản nguồn, mẫu, mô hình và quyết định của người đọc. Đã lưu nháp F01 trong ca mô hình trả 503. Còn bộ 50 hồ sơ độc lập cho SC-003 và phê duyệt mô hình thật. [Bằng chứng F01](../../e2e/proposal/ai-proposal-evidence/review.md) · [Bằng chứng F07](../../e2e/product/ai-reading-card/review.md)

QA đã có công cụ chấm SC-003 ngoại tuyến từ phản hồi API và nhãn đã chốt. Trên dữ liệu tổng hợp, công cụ tính đúng 45/50 mục thiếu và 5/50 cảnh báo sai ở đúng hai ngưỡng. Đã kiểm hai mẫu số bằng 0, các lỗi ghép phiên bản, trường thiếu/trùng, kết quả chưa rà và số vi phạm khác 0. Trước khi sửa, việc hoán đổi cả gợi ý và biên bản rà của hai hồ sơ cùng phiên bản vẫn cho kết quả đạt. API nay trả UUID trường, UUID nguồn và loại nguồn. Bộ chấm khớp các thông tin này với bộ nhãn đã chốt. Ca hoán đổi trả mã 2, không sinh điểm. Hai đề xuất tổng hợp cùng chủ nhiệm, phiên bản và mẫu trong PostgreSQL trả đúng hai UUID khác nhau. Trên bản build cuối, hai ca Chrome F01 và F07 đạt khi đối chiếu mã trường, mã nguồn và loại nguồn trên phản hồi API. Bộ kiểm chạy cùng `pnpm test`. Chất lượng mô hình trên dữ liệu trường vẫn chờ quyết định sử dụng hồ sơ, bộ nhãn độc lập và kết quả rà nguồn. [Quy trình và phép kiểm](../../e2e/proposal/ai-proposal-evidence/review.md#chấm-sc-003-trên-hồ-sơ-được-duyệt)

### B03 và F08 · Quyền tác giả và hồ sơ công tác

B03/TC-05 đã chạy với ba vai trò trên đề xuất thật trong trường thử. Sau lần trả và nộp lại, quản trị ngừng hoạt động tài khoản chủ nhiệm. Phiên chủ nhiệm nhận 403 ở yêu cầu kế tiếp. Chuyên viên cùng khoa đọc lại hồ sơ cùng chuỗi audit và đối chiếu được từng trường với bản trước khi ngừng hoạt động. [Biên bản B03](../../e2e/iam/lock-account/review.md) · [Hướng dẫn quản trị](../guides/nguoi-dung/quan-tri-khoa-tai-khoan.md#ngừng-hoạt-động-tài-khoản-chủ-nhiệm)

Khi kiểm ảnh B03, QA thấy bộ định dạng ngày rút gọn hiển thị năm bằng hai chữ số. Bản sửa hiển thị ngày/tháng đủ hai chữ số và năm đủ bốn chữ số khi đọc sự kiện IAM, bản chụp B02, mốc tiếp nhận/nộp và lịch sử thay đổi. Kiểm ở biên ngày cho thấy `2026-01-01T17:08:09Z` hiển thị thành `00:08:09 02/01/2026` tại Việt Nam. [Ca biên UTC+7](../../apps/web/src/demo/vietnam-date.test.mjs)

Người dùng nộp học hàm/học vị, chuyên môn và minh chứng. Quản trị có thể trả lời với lý do từ chối hoặc duyệt trong cùng giao dịch đổi vai trò. Gửi lại cùng quyết định giữ lần duyệt đầu. Chromium kiểm phiên cũ nhận đúng ba quyền author sau duyệt. F08 cho nhà nghiên cứu cập nhật quá trình công tác và học hàm theo danh mục riêng, cho chuyên viên sửa hộ trong phạm vi, giữ dấu vết người sửa. Khi một trường thông tin bị ẩn hoặc một đề tài rời phạm vi, API chặn tải PDF đã xuất. [Ca B03](../../e2e/iam/author-request/acceptance.spec.ts) · [Ca F08](../../e2e/profile/export-profile/review.md)

### N12–N14 · Đối soát ở môi trường cục bộ

Đã đối chiếu S1–S7 trên mã và fixture, sửa quyền tải lại PDF và header mặc định cả trên phản hồi lỗi. Hai cơ sở dữ liệu, kho tệp và hai realm đều đã diễn tập khôi phục vào đích mới. Benchmark PostgreSQL so trường B với 1.000 hồ sơ trong khi trường A tăng lên 10.000. Giá trị p95 của lượt đọc B là 5,967 ms ở giai đoạn bất đối xứng. Chromium mở được cùng nháp khi đổi web tĩnh từ bản 3949a2b sang ứng viên và khi quay lại bản cũ. Hai lượt dùng bản cũ trả cùng checksum. Chỉ số trên tier pilot, chữ ký số liệu của phòng và hồi lui API/worker cùng migration còn mở. [Kiểm bảo mật](../../e2e/security/review.md) · [Số đo PostgreSQL](../../e2e/perf/capacity-result.json) · [Khôi phục](../../e2e/release/README.md)

### Tải và thời gian đáp ứng đo ngày 24/11

Chromium trên macOS arm64 qua loopback, Keycloak và hai DB đang hoạt động. Năm ngữ cảnh trình duyệt mới mất 355–430 ms từ callback tới tiêu đề tài khoản. Qua 30 lượt đăng nhập lại, p95 là 385 ms. Từ lúc nhấp danh sách đến khi dùng được dòng đầu, p95 là 97 ms. Thời gian quan sát email ở Mailpit trong năm lượt là 117–148 ms. Các mốc thức dậy DB, truyền qua mạng trường và giao email bên ngoài còn cần số đo pilot.

Bộ k6 qua hai trường chạy baseline, ramp, năm đoạn warm 20 VU và ba đoạn burst 50 VU trong 19,8 phút. Tổng 17.343 yêu cầu HTTP, 0 lỗi. Bảng ghi p95 cao nhất trong các đoạn cùng chế độ. Số liệu gồm thời gian API local. [Số đo từng đoạn và RPS](../../e2e/perf/results-full.json) · [Số đo trình duyệt](../../e2e/perf/login-result.json)

| Tác vụ | Warm 20 VU | Burst 50 VU |
|---|---:|---:|
| Danh sách | 10,89 ms | 10,65 ms |
| Lưu nháp | 15,71 ms | 13,28 ms |
| Nộp hồ sơ | 14,38 ms | 14,47 ms |
| Đọc việc trang chủ | 32,49 ms | 29,03 ms |
| Bản chụp báo cáo kỳ | 12,73 ms | 9,17 ms |

Giữ dữ liệu phát sinh xuyên suốt 10 đoạn đo. Khi so riêng hai tenant có quy mô lệch 10 lần, index thử đưa p95 đọc của tenant nhỏ từ 5,967 lên 7,227 ms và p95 xuất của tenant lớn từ 27,301 lên 29,283 ms. Giữ bộ index hiện hành theo kết quả phép đo. [Kịch bản và giới hạn](../../e2e/perf/README.md) · [Chi tiết truy vấn và pool](../../e2e/perf/capacity-result.json)

### B04, B06, F03 và F11

B04 lưu lựa chọn email theo nhóm sự kiện và quy tắc riêng của trường. Các thư đã xếp hàng giữ tiêu đề tại thời điểm tạo. B06 cho chuyên viên vào hồ sơ chờ tiếp nhận và báo cáo chờ duyệt của khoa. Kết thúc tiếp nhận làm cả hàng chờ và bộ đếm giảm. Người dùng mở lại liên kết sau chuyển khoa nhận 404. [Tùy chọn nhận tin](../guides/nguoi-dung/hop-thong-bao.md) · [Kiểm bộ đếm](../../apps/backend/test/db/home.test.mjs)

F03 và F06 lưu biên bản theo cuộc họp thuộc đúng vòng. Chỉ thư ký còn phân công và đủ điều kiện ghi được phiên bản mới. Cùng hội đồng có thể đọc lại bản cũ, cùng lượt hoàn tất tệp chỉ tăng một phiên bản. Khi người đọc trở thành thành viên đề tài, kiểm quyền nguồn chặn truy cập. F11 dùng quy tắc minh chứng theo loại dự án ở bước duyệt kê khai. Quản trị thử trả hồ sơ thiếu hợp đồng, duyệt sau khi chủ nhiệm nộp bổ sung và thu hồi có lý do. [Kiểm quyền biên bản](../../apps/backend/test/db/meetings.test.mjs) · [Thư ký và thành viên mở hai bản trên Chromium](../../e2e/review/meeting-minutes/acceptance.spec.ts) · [Bằng chứng F11](../../e2e/applied-project/register-applied-project/review.md)

Trong diễn tập IAM, quản trị cấp trước một tài khoản từ giao diện qua API và service account giới hạn trong realm. Gửi cùng lệnh lần hai giữ nguyên ID và một audit. Người dùng đăng nhập email OTP lần đầu, đúng tài khoản author và ba quyền đã cấp. [Bằng chứng IAM](../../e2e/release/provision-result.json)

### N13 · Nộp trùng và hồi phục sau tải

Ở ba lượt độc lập dùng cùng dấu vân tay seed, hai yêu cầu nộp đồng thời trên một nháp trả cùng mã, ghi một bước chuyển. Danh tính ở trường khác mở ID ấy nhận 404. Qua cả ba lượt, mọi hồ sơ N13 ở trạng thái đã nộp có mã và số mã trùng bằng 0. Sau mỗi đoạn 50 VU trong 120 giây, đoạn 20 VU kế tiếp đạt ngưỡng warm trong lần lượt 22,625 / 22,588 / 23,012 giây tính đến khi kết thúc phép đo. [Từng lượt và p95](../../e2e/perf/deadline-result.json)

### F03/F06 · Mở lại kết luận và chuyển đính chính

Mẫu P01 mặc định có bốn cạnh cho chuyên viên quay từ kết luận về bước hội đồng tương ứng. Hồ sơ cũ giữ phiên bản đã ghim. Nếu chưa công bố do chờ đạo đức, chuyên viên có thể mở lại phần khoa học ngay tại bước xét duyệt. Giao dịch lưu kết luận, danh sách phiếu, điểm, ngưỡng, trạng thái đạo đức, lý do và người thao tác trước khi mở lại. Phiếu đã nộp tiếp tục khóa. Khi hồ sơ đã đi tiếp, sổ đã khóa hoặc mẫu thiếu cạnh, chuyên viên chuyển yêu cầu cho chủ quy trình bằng B04. [Kiểm F03, mẫu cũ và hộp thư](../../apps/backend/test/db/review.test.mjs) · [Kiểm F06 và lịch sử chỉ thêm](../../apps/backend/test/db/acceptance.test.mjs)

Hai lệnh mở lại đồng thời chỉ tạo một bản lịch sử. Một lệnh chốt gửi từ màn hình trước khi mở lại nhận 409. Chủ quy trình nhận được tên đề tài, loại vòng, kết luận trước và lý do. Ca PostgreSQL kiểm người khác mở thông báo nhận 404. Cần PO xác nhận người có quyền ký văn bản đính chính sau khi khóa sổ. [Danh sách cần duyệt](muc-can-review-nguoi-va-ai.md)

### F09/P03 · Giờ của từng người trên nhiệm vụ cấp trên

F09 ghi email tài khoản và tỷ lệ của từng thành viên vào bản nháp. Chủ nhiệm nhận tỷ lệ còn lại. Khi duyệt, P03 nhận một dòng theo người, vai trò, tỷ lệ, ngày và phiên bản nguồn. Trong fixture 50/30/20, định mức chủ nhiệm 20 giờ và định mức thành viên 10 giờ cho ba kết quả 10,00 / 3,00 / 2,00 giờ. Gửi lại cùng sự kiện giữ ba dòng cũ. Thu hồi đưa số giờ ròng của cả ba về 0 và bảo toàn lịch sử. Hồ sơ cũ chưa khai thành viên giữ 100% cho chủ nhiệm. [Kiểm PostgreSQL](../../apps/backend/test/db/teaching.test.mjs) · [Hướng dẫn kê khai](../guides/nguoi-dung/nhiem-vu-va-hoat-dong.md)

### F02 · Lý do hủy và mở lại kỳ tiếp nhận

Chuyên viên phải ghi lý do khi hủy kỳ hoặc gia hạn để mở lại kỳ đã đóng. Bản ghi audit giữ hạn trước, hạn mới, trạng thái và lý do. Ca PostgreSQL kiểm thao tác thiếu lý do, ngày gia hạn mới, bộ tiêu chí đã ghim, từ chối gia hạn kỳ đã hủy và nội dung hai bản ghi audit. [Ca nghiệp vụ F02](../../apps/backend/test/db/call.test.mjs)

### F11/P03 · xác nhận kết quả và quy đổi theo bậc hợp đồng

Chủ nhiệm khai vai trò và tỷ lệ trước khi gửi. Trường chọn ghi giờ khi duyệt kê khai hoặc khi xác nhận kết quả. Giao dịch giữ lại lựa chọn này cho suốt lần duyệt. Tệp kết quả gắn đúng lần duyệt. Dữ liệu cũ giữ loại dự án và thành viên khi client gửi lại các trường ban đầu.

Trong phép kiểm PostgreSQL, hợp đồng 350 triệu đồng được 60 giờ, chia 42 giờ cho chủ nhiệm và 18 giờ cho thư ký. Trên Chrome, hợp đồng 50 triệu đồng cho kết quả 14/6. Sau thu hồi, lý lịch thư ký còn 0 giờ cho nguồn này. Toàn bộ số tiền, tỷ lệ và định mức trên là dữ liệu kiểm thử. Trường còn phải duyệt bảng áp dụng theo RV-36. [Bằng chứng kỹ thuật](../../e2e/applied-project/register-applied-project/review.md) · [Hướng dẫn người dùng](../guides/nguoi-dung/du-an-ung-dung.md)

### B04 · nhật ký gửi và gửi lại theo phạm vi

Chuyên viên mở nhật ký từ hộp thông báo, lọc thư bị trả về và gửi lại một hoặc nhiều thư của đề tài trong khoa. Quản trị có phạm vi trường. Quyền ánh xạ vào `notifications.send` trong 17 quyền B03. Mỗi lượt gửi lại giữ nguyên Message-ID, đặt lại số lần thử và có audit riêng. Kịch bản DB kiểm gửi thành công sau khi đưa lại hàng đợi, lệnh trùng, lệnh lẫn phạm vi và thư chưa có kết quả giao chắc chắn. [Kiểm PostgreSQL](../../apps/backend/test/db/notification.test.mjs) · [Hướng dẫn chuyên viên](../guides/nguoi-dung/hop-thong-bao.md)

B01 cung cấp `notification.maxRetry` và `notification.retryBaseSeconds` qua credential nội bộ của worker B04. Với bộ thử 2 lần/7 giây, lần đầu bị SMTP từ chối tạm thời đưa thư về hàng đợi, lần thứ hai chuyển sang lỗi. Khi B01 gián đoạn, worker chưa gọi SMTP và hoàn lại số lần thử. Quyết định tương thích cho trường chưa cấu hình là 5 lần, 10 giây chờ đầu. [Runbook worker](../../apps/worker/README.md)

### F10 · khoa quyết định sau khi sinh viên nộp

Khoa được trả hồ sơ có lý do hoặc duyệt triển khai khi GVHD và thành viên còn hợp lệ. Quy tắc của đợt được lưu lúc nộp. Đề tài có thể chuyển thẳng sang thực hiện hoặc chờ khoa ghi nhận bắt đầu. Bản sửa sau khi bị khoa trả cần GVHD xác nhận lại. Ca DB kiểm hai người duyệt đồng thời, một quyết định trong audit, và từ chối màn hình dùng phiên bản trước khi trả. [Kiểm DB](../../apps/backend/test/db/student.test.mjs) · [Hướng dẫn](../guides/nguoi-dung/dang-ky-sinh-vien.md)

Lượt F10 độc lập phát hiện phiên quản trị đã mở trước khi bật E4 không thấy mục đề tài sinh viên cho tới khi tải lại trang. Sau khi tự bật cấu hình và tải lại phiên quản trị như hướng dẫn vận hành, kịch bản độc lập đạt trong 9,7 giây. Khoa thấy đúng nhóm và GVHD trước khi duyệt. [Kịch bản](../../e2e/student-project/confirm-mentor/acceptance.spec.ts)

### Nghiệm thu rút gọn đề tài sinh viên và sổ giờ hướng dẫn · 25/11/2026

F10 lưu danh mục tệp, yêu cầu xác nhận và mã định mức tại lúc nộp đăng ký chính thức. Quyền tải tệp, ký xác nhận, kết luận và đóng đều được kiểm tra theo người, khoa, tenant và phiên bản. Khi khoa cho làm lại, bộ tệp và xác nhận mới gắn với lượt mới có hạn. P03 lấy ngày kết luận đạt để chọn công thức và kỳ. Hai lần đóng đồng thời hoặc phát lại yêu cầu chỉ tạo một dòng của GVHD. Đợt tương thích và cách xử lý khi P03 đang tắt được ghi trong thiết kế để PO/khoa duyệt. [Thiết kế](../features/F10-de-tai-sinh-vien/design.md) · [Ca PostgreSQL](../../apps/backend/test/db/student-results.test.mjs)

Trên Chrome, sinh viên tải hai PDF, GVHD xác nhận, khoa cho làm lại rồi đóng hồ sơ ở lượt hai. Giảng viên thấy 8,00 giờ cho đúng đề tài trong lý lịch. Đây là hệ số của bộ thử. PostgreSQL đã kiểm cả nhánh nghiệm thu trực tiếp, quá hạn, P03 tắt, ghi audit và từ chối truy cập tệp của người ngoài nhóm. [Hướng dẫn kèm ba ảnh](../guides/nguoi-dung/dang-ky-sinh-vien.md#nộp-kết-quả-và-nghiệm-thu) · [Kịch bản Chrome](../../e2e/student-project/confirm-mentor/acceptance.spec.ts)

### Danh mục loại sản phẩm của trường · 25/11/2026

F07 hiển thị mã và nhãn B01 theo tenant. Khi tác giả giữ màn hình mở và trường ngừng dùng mã, backend từ chối gửi, giữ bản nháp và giao diện tải lại danh mục. Ca Chrome đã kê khai **Bản đồ nghiên cứu**, tải một PDF thật, kiểm bị chặn sau khi ngừng dùng mã và gửi thành công khi mã được bật lại. F01 và F04 có ca hồi quy cho cam kết loại mới, mã đã ngừng dùng và định lượng đã chốt khi giao thực hiện. [Ca Chrome](../../e2e/catalog/product-types/acceptance.spec.ts) · [Hướng dẫn tác giả](../guides/nguoi-dung/san-pham-va-nghiem-thu.md#chọn-loại-sản-phẩm-của-trường)

**Kết quả kiểm ngày 25/11/2026.** Typecheck, kiểm hợp đồng sinh tự động, build và lint đạt. Unit 73/73, PostgreSQL và dịch vụ cấu hình 43/43, Chrome tích hợp 26/26, Chrome v0 23/23. Sau thay đổi cuối về thông báo loại ngừng dùng và hạn làm lại mẫu, đã chạy lại hai kịch bản F07/F10, đạt 2/2. Diễn tập phục hồi đối chiếu cả hai DB cùng hai đối tượng S3, số ghi kiểm soát bị mất bằng 0. [Kết quả khôi phục](../../e2e/release/restore-result.json) · [Trạng thái từng feature](doi-chieu-nghiem-thu-feature.md)

### Sản phẩm ngoài đề tài, lý lịch và giờ công bố · 25/11/2026

Nhà nghiên cứu kê khai sản phẩm độc lập và gửi bộ minh chứng riêng. Màn hình cho chọn người cùng khoa hoặc thêm đồng tác giả khác khoa bằng email khớp đúng một tài khoản nội bộ. Chuyên viên duyệt theo khoa của tác giả đứng tên. Tệp của nguồn khác bị từ chối. Sau duyệt, F08 hiển thị sản phẩm cho hai tác giả. Mở lại bản kê khai có lý do đưa nó ra khỏi danh sách công bố đã duyệt. [Kịch bản tài khoản thật trong trường thử](../../e2e/product/independent/acceptance.spec.ts) · [Hướng dẫn và ảnh](../guides/nguoi-dung/san-pham-va-nghiem-thu.md#kê-khai-sản-phẩm-ngoài-đề-tài-rms)

P03 nhận được sự kiện duyệt sản phẩm gắn đề tài và sản phẩm độc lập. Trong ca PostgreSQL hai tác giả, định mức theo vai trò là 20 và 10 giờ, tỷ lệ là 70% và 30%. Hai dòng ghi nhận tương ứng 14,00 và 3,00 giờ. Phát lại giữ nguyên hai dòng. Sau khi mở lại sản phẩm, sổ của cả hai trở về 0,00. Với một tác giả nguồn gắn đề tài, một yêu cầu bằng 100% được tạo khi P03 bật; mở lại trước lúc worker xử lý sẽ dừng yêu cầu cũ. Chính sách quy đổi thực tế cần bảng giá trị được trường duyệt. [Hai tác giả](../../apps/backend/test/db/independent-products.test.mjs) · [Sản phẩm gắn đề tài](../../apps/backend/test/db/products.test.mjs)

SEC-11 đã sửa đường duyệt ở F07 và cách chọn sản phẩm F08 khi chuyên viên nhập hộ. Phép kiểm tại DB dùng một chuyên viên khác để duyệt và xác nhận người nhập hộ không được tính là tác giả. Sau khi mở lại sản phẩm đã chia 70/30, duyệt lại theo tỷ lệ 100% ghi 20,00 giờ cho tác giả còn đứng tên và giữ số ròng của đồng tác giả cũ bằng 0. [Phép kiểm nhập hộ](../../apps/backend/test/db/products.test.mjs) · [Đối chứng sổ](../../apps/backend/test/db/independent-products.test.mjs)

### Kinh phí hỗ trợ hoạt động khoa học · F12

Chuyên viên ghi tổng VND trong quyết định duyệt. Trình duyệt xác nhận 2.500.000 ₫ trên hoạt động, 6,00 giờ trong F08, rồi kiểm thu hồi và từ chối. Audit giữ số tiền trước/sau. Quyết định cấp tiền và các yêu cầu quy đổi bật theo trường được ghi trong cùng giao dịch. Kế toán trường cần xác nhận cách xử lý khoản đã chi khi quyết định nguồn bị thu hồi. [Đối chứng theo vai](../../e2e/extension/evidence/review.md) · [Hướng dẫn chuyên viên](../guides/nguoi-dung/nhiem-vu-va-hoat-dong.md#duyệt-kinh-phí-hỗ-trợ-hoạt-động-f12)

### Điều chỉnh nhóm sinh viên sau phê duyệt · F10

Khoa đổi người hướng dẫn và nội dung có lý do, GVHD mới xác nhận bản điều chỉnh rồi mới nộp kết quả. Trên Chrome, giáo viên cũ tải lại và mất quyền theo dõi đề tài theo vai trò GVHD. Người mới nhận 8,00 giờ theo công thức thử sau nghiệm thu. PostgreSQL còn kiểm thêm và rút một sinh viên, phản hồi từ chối và bản sửa lỗi thời. Ca năm tài khoản đạt sau khi sửa lỗi hiển thị trùng nút trên cùng hồ sơ. [Biên bản](../../e2e/student-project/confirm-mentor/review.md) · [Hướng dẫn](../guides/nguoi-dung/dang-ky-sinh-vien.md#điều-chỉnh-sau-phê-duyệt)

### Tiến độ và hạn nộp của đợt sinh viên

Trưởng nhóm và GVHD có thể cập nhật tiến độ khi nhóm đang thực hiện. Khoa đọc được nội dung gần nhất, người ghi và thời điểm. Hai lần cập nhật giữ đủ lịch sử trong audit. Đợt có thể yêu cầu tiến độ trước khi nộp kết quả cuối. Ngày nộp cuối theo giờ Việt Nam được kiểm ở máy chủ, cùng số phiên bản và bộ minh chứng. Khi ghi tiến độ trên trình duyệt, tóm tắt kết quả đang soạn được giữ lại. [Ca quyền và hạn](../../apps/backend/test/db/student-results.test.mjs) · [Hướng dẫn sử dụng](../guides/nguoi-dung/dang-ky-sinh-vien.md#nộp-kết-quả-và-nghiệm-thu)

Quản trị đã mở đợt từ giao diện B01. Khi tối đa nhóm bằng 0, bước xem trước chỉ đúng lỗi. Sau khi sửa số lượng, quản trị lưu danh sách và sinh viên đăng ký bằng cấu hình vừa lưu. B01 và F10 dùng cùng bộ kiểm ngày, đơn vị, nhóm và minh chứng. Ca Chrome xác nhận người quản trị có thể sửa ngay nội dung sau lần xem trước bị từ chối. [Thao tác và ví dụ cấu hình](../guides/nguoi-dung/cau-hinh-theo-truong.md#mở-đợt-đề-tài-sinh-viên)

### B01 · Đọc tệp đúng bảng mã và tìm theo ngày

Đã bổ sung xem ảnh, giải mã văn bản bằng charset từ phản hồi HTTP và tải nguyên bytes, gồm XML tiếng Việt UTF-16LE. Khi nhập văn bản trực tiếp có khai bảng mã, B01 kiểm kết quả mã hóa trước khi lưu. Tệp tải lên và Base64 giữ nguyên nội dung nhị phân. Thư viện `iconv-lite` phiên bản 0.7.3 đã có trong lockfile, nay B01 khai báo trực tiếp vì sử dụng trong đường ghi. Với bản ghi lịch sử, quản trị cần xác định đúng charset theo tệp gốc. [Ca định dạng](../../e2e/catalog/config-override/formats.spec.ts) · [Hướng dẫn và ảnh](../guides/nguoi-dung/cau-hinh-theo-truong.md#đọc-tệp-và-tìm-cấu-hình-theo-ngày)

Đối với khoảng ngày, cận cuối bao gồm mọi bản ghi đến trước nửa đêm kế tiếp ở Việt Nam. Ca PostgreSQL dùng cả hai phía của ranh giới microgiây, hai trường và timestamp có offset. Đã kiểm qua hai tiến trình B01 thật dùng cùng Redis, gồm tạo, đổi, xóa bản riêng, đổi bản chung và giữ HIT ở khóa khác. Trường còn phải xác minh TLS, pool, tải đồng thời và bộ tệp chính thức trên tier pilot. [Biên bản B01](../../e2e/catalog/config-override/review.md)

### B06 · Phiếu hội đồng và báo cáo theo khoa

Chuyên viên vào hồ sơ điều phối F06 từ trang chủ. Thành viên hội đồng mở phiếu đã lưu nháp và gửi kết quả ở đúng vòng. Quyết định hiển thị là giữ việc cho đến khi người đó gửi phiếu, hoặc cho đến khi vòng đóng hay họ mất tư cách chấm. Khi bị từ chối do xung đột quyền, màn hình gỡ phiếu cũ và giữ điểm đã lưu hợp lệ. [Phép kiểm theo vai trò](../../e2e/acceptance/request-acceptance/acceptance.ts) · [Kiểm quyền ở DB](../../apps/backend/test/db/acceptance.test.mjs)

Ở B02, báo cáo mở từ số liệu nhanh dùng khoa hiện hành của chuyên viên. Trưởng phòng có thể mở rộng sang các khoa được giao sau khi vào báo cáo. Trong cùng kỳ, hai lần đối chiếu theo một và hai khoa lần lượt cho hai và ba mã. B06 cũng đã đối chiếu năm thông báo mới nhất trong bảy tin, giữ nguyên số chưa đọc. [Báo cáo và ảnh](../guides/nguoi-dung/truong-phong-bao-cao-ky.md#mở-báo-cáo-từ-số-liệu-nhanh) · [Ca B04/B06](../../apps/backend/test/db/inbox.test.mjs)

### B06 · Phục hồi một thẻ trên trang chủ

Trên trang quản trị ở 390 px, lỗi cấu hình lý lịch trước đây che cả việc cần làm, báo cáo và thông báo. Web hiện lấy bố cục theo trường và vai trò rồi tải từng nguồn. Bấm **Thử lại** ở một thẻ chỉ tạo một yêu cầu tới nguồn đó, giữ bộ lọc đang chọn. Quyết định triển khai là tiếp tục phục vụ hợp đồng tổng quan cho client cũ, dùng các đường đọc riêng cho giao diện. Bố cục ban đầu vẫn cần IAM và cấu hình trường. Ops cần đo chi phí các lần kiểm quyền đồng thời khi chạy trên pool của pilot. [Biên bản TC-18](../../e2e/home/open-work-item/review.md#tc-18--một-nguồn-tạm-gián-đoạn) · [Hướng dẫn và ảnh](../guides/nguoi-dung/viec-can-bo-sung.md#khi-một-mục-báo-lỗi)

Trong phép kiểm khóa tài khoản khi đang lọc việc, API trả đúng 403 nhưng giao diện cũ vẫn giữ thông báo và lối tắt. Đã gỡ phần tài khoản sau lần từ chối đó. Chrome xác nhận tài khoản được mở khóa có thể đăng nhập lại, còn người vừa hạ xuống vai trò cơ bản mất cả số liệu quản trị và lối tắt báo cáo sau khi làm mới thông tin. [Đối chứng quyền B06](../../e2e/home/open-work-item/review.md#sec-08--tài-khoản-đổi-quyền-khi-trang-chủ-đang-mở)

Một lượt hồi quy phát hiện ca IAM bấm **Tải lại thông tin** sau khi thẻ đang tải đã nhận 403 và gỡ nút. Đã tách hai thời điểm kiểm. Ca IAM đợi trang chủ nạp xong trước khi khóa tài khoản để đo lần làm mới thủ công. Ca B06 khóa giữa phiên rồi đổi bộ lọc để đo phản hồi ngay tại thẻ. [Ca IAM](../../e2e/integration/account.spec.ts) · [Ca B06](../../e2e/home/triage-deadlines/isolated-widgets.spec.ts)

Quản trị lưu bố cục cho chủ nhiệm bằng biểu mẫu B01. Đã đối chiếu người ghi, trường và nội dung của phiên bản trong audit rồi đọc lại bằng phiên của chủ nhiệm. Truy vấn kiểm so sánh byte của bản ghi với nội dung UTF-8 mong đợi để chạy được trong cùng danh mục có PDF và ảnh. HOME-11 hiện dùng cùng khóa B01. Hai quản trị của trường đã lưu liên tiếp sau khi giải quyết xung đột phiên bản. Chuyên viên mở lại nhận đúng thứ tự thẻ. Migration 002 bổ sung giá trị trước/sau cho thay đổi mới, giữ bản ghi cũ với giá trị chưa biết. [Đối chiếu hai quản trị và chuyên viên](../../e2e/home/open-work-item/review.md#home-11--hai-quản-trị-đổi-bố-cục-chuyên-viên) · [Biên bản TC-14](../../e2e/home/open-work-item/review.md#tc-14--quản-trị-lưu-bố-cục-cho-chủ-nhiệm) · [Hướng dẫn](../guides/nguoi-dung/cau-hinh-theo-truong.md#đổi-bố-cục-trang-chủ-theo-vai-trò)

### B04/TC-22 · Khôi phục hộp thông báo khi đang lọc

Trước khi sửa, hộp thư báo lỗi và thiếu thao tác đọc lại khi API danh sách tạm gián đoạn. Bản sửa giữ bộ lọc và vị trí phân trang khi người dùng chọn **Thử lại**. Trên màn hình 360 px, chủ nhiệm mở được tùy chọn trong lúc danh sách báo lỗi. Sau một yêu cầu đọc lại, hai tin chưa đọc xuất hiện, giữ đúng URL. Mở tin nhắc hạn mới làm số chưa đọc giảm xuống một. [Biên bản](../../e2e/notification/deadline-reminder/review.md#b04tc-22--khôi-phục-danh-sách-chưa-đọc) · [Hướng dẫn](../guides/nguoi-dung/hop-thong-bao.md#khi-hộp-thông-báo-tạm-thời-không-tải-được)

### B04/BO-01 · Mẫu trong ứng dụng và email

Trước thay đổi, quản trị sửa được hai tiêu đề nhưng worker SMTP dùng một nội dung chung. BO-01 hiện cho soạn, xem trước, lưu và gỡ từng mẫu theo trường, sự kiện và kênh. Migration 0047 ghi nội dung đã render khi xếp hàng. Thay đổi mẫu và ma trận dùng chung phiên bản, lưu giá trị trước/sau. Kết quả nghiệm thu đạt và không đạt dùng chung mẫu ACCEPTANCE_RESULT với biến kết quả tương ứng. Runtime kiểm quyền trên hồ sơ khi mở lại và trước lúc giao email có dữ liệu đề tài. Giữ cách đọc cho lượt giao trước migration. [Thiết kế](../features/B04-thong-bao/design.md) · [Biên bản TC-17](../../e2e/notification/deadline-reminder/review.md#b04tc-17--mẫu-theo-kênh) · [Hướng dẫn theo vai](../guides/nguoi-dung/hop-thong-bao.md#soạn-mẫu-trong-ứng-dụng-và-email)

Trong một lượt diễn tập, ca B04 đếm thêm bốn lượt thiếu mẫu do F07 tạo đồng thời trong cùng trường thử. Đã cấp trường thử riêng cho ca B04 rồi chạy lại toàn bộ phép kiểm PostgreSQL và phục hồi hai DB cùng kho tệp. [Ca hồi quy](../../apps/backend/test/db/notice-templates.test.mjs) · [Kết quả khôi phục](../../e2e/release/restore-result.json)

Đã chạy lại hai luồng Chrome B04 sau khi bổ sung bằng chứng ở phía người nhận. Chuyên viên mở đúng tin kỳ 4 tạo trước lúc quản trị gỡ mẫu. [Ảnh hộp thư](screenshots/notifications/tin-theo-mau.png)

### B04 · Tin nhắn SMS ưu tiên cao

Đã bổ sung SMS từ ma trận của trường và tùy chọn cá nhân đến mẫu tin, hàng đợi, worker và nhật ký gửi lại. Hai người cùng nhận thông báo giao đề tài, chỉ người có số hợp lệ nhận lượt SMS. Với sự kiện thường, luật ưu tiên ở cơ sở dữ liệu vẫn ngăn xếp SMS khi có cấu hình cũ sai. Worker kiểm lại số và tùy chọn trước khi gọi relay. Lượt chưa rõ kết quả có mã để Ops đối soát. [Thiết kế](../features/B04-thong-bao/design.md#sms-ưu-tiên-cao) · [Biên bản](../../e2e/notification/deadline-reminder/review.md#b04tc-05-tc-06-và-tc-18--sms-theo-mức-ưu-tiên)

Đã chọn gateway loopback và số tổng hợp để kiểm đường gửi cục bộ. Trường và Ops duyệt nhà cung cấp, quy ước mã phản hồi, phí SMS và cách xác nhận giao đến thiết bị trước pilot. Hồ sơ khôi phục sau migration 0048 đối chiếu 67 bảng RMS, 2 bảng B01 và hai tệp S3, số bản ghi kiểm soát bị mất bằng 0. [Kết quả phục hồi](../../e2e/release/restore-result.json) · [Hướng dẫn người dùng](../guides/nguoi-dung/hop-thong-bao.md#nhận-sms-cho-sự-kiện-ưu-tiên-cao)

### F02 · Đóng kỳ tự động và nộp lại sau gia hạn

Đã nối worker với lịch đóng các kỳ OPEN quá hạn theo ngày Việt Nam. Mỗi kỳ đóng có một phiên bản mới và một dòng audit hệ thống cùng giao dịch. Khóa dòng bảo vệ gia hạn đang xử lý. Hai worker cùng chạy chỉ đóng một lần, và 201 kỳ tồn được xử lý đủ qua hai lượt. Chuyên viên đã tra lại kỳ sau khi lệnh từ tab cũ nhận 409. Chủ nhiệm bị từ chối nộp trong thời gian kỳ đóng, sau đó nộp được chính bản nháp khi chuyên viên gia hạn có lý do. [Biên bản F02/TC-06](../../e2e/call/open-call/review.md#f02ac-04-và-tc-06--đóng-kỳ-quá-hạn) · [Hướng dẫn có ảnh](../guides/nguoi-dung/chuyen-vien-mo-ky.md#kiểm-tra-kỳ-tự-động-đóng)

F01 cũng trả mốc bắt đầu ngừng nhận bản nháp ở trường `submitUntil` trong hợp đồng API. Tab đang mở tự khóa nút khi đến mốc. Khi chuyên viên đóng kỳ sớm hơn dữ liệu đang hiển thị, máy chủ từ chối lệnh, giao diện đọc lại hồ sơ để cập nhật nút. Chủ nhiệm mở lại sau khi gia hạn, nộp từ giao diện và thấy mã đề tài trên cùng hồ sơ. [Thuyết minh khi hết hạn](../guides/nguoi-dung/chu-nhiem-de-xuat.md#khi-kỳ-đã-hết-hạn)

### F01 · Hủy trước xét duyệt và thẩm quyền trả hồ sơ

Chủ nhiệm hoặc chuyên viên cùng khoa có thể hủy có lý do khi quy trình của hồ sơ cho phép. Đã kiểm trường hợp kỳ tiếp nhận đã đóng, chuyên viên đã chốt danh sách, nhưng hội đồng chưa mở vòng. Sau khi hủy, đề xuất rời danh sách chờ xét duyệt của F03. B02 vẫn đếm mã đã cấp đúng một lần và hiển thị trạng thái đã hủy. Bản nháp hủy trước khi được cấp mã không đi vào số mã của kỳ. [Kiểm F01–F03–B02](../../apps/backend/test/db/proposals.test.mjs)

Hai phiên Chrome cùng mở một đề xuất. Chủ nhiệm xác nhận hủy trước. Phiên chuyên viên gửi sau nhận 409, đọc lại đúng lý do và mã đề tài. Khi rà ma trận quyền, đã phát hiện và sửa việc cấp quyền trả hồ sơ cho tài khoản quản trị. Cổng lệnh kiểm nghiệp vụ theo vai kể cả với hồ sơ ghim mẫu cũ. [Ảnh và hướng dẫn](../guides/nguoi-dung/chu-nhiem-de-xuat.md#hủy-đề-xuất-trước-khi-xét-duyệt) · [Phiếu bảo mật SEC-12](viec-can-sua-bao-mat.md)

### B02 · Đối chiếu bản chụp trước khi ký

Khi hồ sơ A2 nộp lại sau mốc trích xuất, trưởng phòng xem được hồ sơ hiện hành rồi quay lại đúng nhóm Nháp trong bản chụp trước. Màn hình, tên tệp và dòng mã bản chụp trong CSV cùng xác định lần lập báo cáo. Tệp có số lượng theo trạng thái và ID từng đề tài. Kỳ trống có tổng 0, phạm vi, thời điểm và tiêu đề bảng chi tiết. [Biên bản và CSV mẫu](../../e2e/report/call-report/review.md) · [Hướng dẫn trưởng phòng](../guides/nguoi-dung/truong-phong-bao-cao-ky.md)

Đã dùng mã trạng thái chuẩn trong CSV để QA so từng nhóm với kết quả máy chủ. Trưởng phòng và PO/BA còn duyệt cách đặt tên cột trên mẫu của trường. Điều kiện đóng US-13/T008 là đối chiếu cùng mốc với sổ tiếp nhận độc lập và lưu xác nhận của trưởng phòng. [Phiếu pilot](../../e2e/report/call-report/review.md#phiếu-đối-chiếu-us-13t008-tại-trường)
