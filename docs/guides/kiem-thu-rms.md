---
title: "Kế hoạch kiểm thử RMS theo feature, bảo mật và tải"
owner: "QA lead / SA"
status: Review
updated: 2026-11-21
---

# Kiểm chứng RMS từ feature đến kỳ pilot

**Điều kiện nhận v0** là đợt A chạy trọn trên cùng bản build với hai tenant, đúng quyền đến từng bản ghi và đúng số liệu cuối kỳ. Đây là kế hoạch đo tại repo code. Các con số hiệu năng bên dưới là mục tiêu đề nghị SA duyệt. QA lưu kết quả thật, phiên bản schema/seed và phần còn sai trong biên bản từng đợt. [Phiếu N12–N14](ke-hoach-implement-rms.md)

## Bộ dữ liệu và các lớp kiểm tra

Dùng mã tenant A/B, cùng địa chỉ email ở hai realm, cùng mã đề tài hiển thị ở hai tenant, hai khoa A1/A2 và một kỳ đang mở. Seed admin, chủ nhiệm, thành viên, chuyên viên một khoa, hội đồng có người xung đột, người chỉ xem và người bị khóa. Một đề tài cần đạo đức, một đề tài bị trả rồi nộp lại, một nháp chưa có mã. Có file cùng tên ở hai trường và theme có màu đối nghịch. Đồng hồ test cố định quanh hạn nộp, lưu UTC và so ngày dd/MM/yyyy theo Asia/Ho_Chi_Minh.

| Tần suất | Ai chạy | Phép thử và vật chứng |
|---|---|---|
| Mỗi thay đổi | AI thực hiện + CI | Unit cho guard, làm tròn VND, trạng thái, schema token. Validate OpenAPI và generate client sạch. Kiểm diff migration và dependency lock |
| Mỗi PR chạm dữ liệu hoặc IAM | BE + QA | PostgreSQL thật, runtime role + pooled connection, Keycloak/SPI thật với inbox test. Kiểm constraint, transaction, cache Redis và lệnh cạnh tranh. Lưu assertion từ API và trạng thái DB |
| Trước nhận từng lát | QA | TC-01–04 trong quickstart của lát, test-plan feature và luồng trình duyệt theo quyền. Chụp UI ở điểm quyết định, đánh dấu ca chưa trong đợt. Mỗi TC-03 có kết quả review RV |
| Cuối đợt | QA lead, Ops, PO | Chạy liên module trên bộ deploy thử, kiểm S1–S7, tải định lượng, restore và UAT. Biên bản gồm commit, migration, vùng, tier, seed, thời điểm, điều kiện đo và lỗi mở |

## Phạm vi của từng feature

Mở test plan ở cột đầu để lấy điều kiện, thao tác và kết quả từng AC. Mã US chọn phần phải chạy ngay trong đợt. Với AC còn lại của cùng feature, QA đưa vào bộ hồi quy trước khi công bố toàn bộ feature. [Ca liên module](../features/integration-test-plan.md) · [Quickstart cho từng US](../../specs/README.md)

| Kế hoạch feature | US | Phép đối chiếu ở mức hệ thống |
|---|---|---|
| [B03 · IAM](../features/B03-quan-ly-nguoi-dung/test-plan.md) | 01 | Khóa tài khoản đang giữ token. Request kế tiếp trả 403, hồ sơ và tác giả cũ vẫn tra được bởi người có quyền |
| [B01 · Cấu hình](../features/B01-danh-muc-cau-hinh/test-plan.md) | 02 | Xóa override A khi key đã được cache. A quay về shared, B giữ override riêng. Đổi bản shared cũng phải làm mới các kết quả fallback |
| [P01 · Workflow](../features/P01-workflow-engine/test-plan.md) | 03 | Hồ sơ cũ ở graph v1, hồ sơ mới vào v2. Thử guard lỗi và hai yêu cầu chuyển cùng version |
| [P02 · Audit](../features/P02-audit/test-plan.md) | 04 | Một lệnh commit và một lệnh rollback. So số dòng, actor, tenant và quyền sửa nhật ký |
| [F02 · Kỳ nhận đề xuất](../features/F02-dot-keu-goi/test-plan.md) | 05 | Mở kỳ và dịch đồng hồ qua giờ đóng. Thử nộp ở biên, đóng/gia hạn và đối chiếu theo giờ máy chủ |
| [F01 · Đề xuất](../features/F01-de-xuat-de-tai/test-plan.md) | 06–08, 31 | Gửi hai lần, nhận một mã. Trả, sửa, nộp lại giữ mã. US-31 kiểm quyền nguồn và phương án thủ công |
| [F03 · Xét duyệt](../features/F03-xet-duyet-hoi-dong/test-plan.md) | 09–11 | Chủ nhiệm có tên trong hội đồng bị chặn tự chấm. Thiếu phiếu hoặc thiếu kết luận đạo đức bắt buộc giữ hồ sơ chưa duyệt |
| [B06 · Trang chủ](../features/B06-trang-chu/test-plan.md) | 12 | Trên màn hình 390 px, mở việc đúng feature sở hữu. Thu hồi quyền giữa hai màn hình thì chi tiết bị chặn. Đọc widget giữ nguyên trạng thái |
| [B02 · Báo cáo kỳ](../features/B02-bao-cao-thong-ke/test-plan.md) | 13 | Ba mã, một lần nộp lại, một nháp chưa cấp mã cho tổng ba. Sau thu hồi quyền một khoa, bản xuất cũ bị chặn |
| [F04 · Tiến độ](../features/F04-quan-ly-tien-do/test-plan.md) | 14, 15, 17 | Thử giao thiếu căn cứ rồi giao đủ. Kiểm báo cáo trễ và yêu cầu sửa có lý do. Kỳ cuối chưa đạt chặn nghiệm thu |
| [B04 · Thông báo](../features/B04-thong-bao/test-plan.md) | 16 | Chạy hai worker cùng mốc nhắc. Một thông báo in-app cho đúng người. Trì hoãn SMTP và kiểm retry riêng |
| [F05 · Kinh phí](../features/F05-quan-ly-kinh-phi/test-plan.md) | 18, 19, 24 | So phí quản lý, số được chi và chứng từ. Ở PASSED thử pilot rà thủ công. Khi bật đối soát, thử MATCHED toàn bộ, còn UNRECONCILED và còn MISMATCHED theo RV-24 |
| [F07 · Sản phẩm](../features/F07-san-pham-khoa-hoc/test-plan.md) | 20, 21, 32 | Nộp thiếu rồi đủ minh chứng. Chỉ sản phẩm đã duyệt được tính vào cam kết. Với DOI, phân biệt metadata và toàn văn có quyền |
| [F06 · Nghiệm thu](../features/F06-nghiem-thu/test-plan.md) | 22, 23 | Thiếu một loại sản phẩm chặn đăng ký. Kiểm ngưỡng điểm, giới hạn làm lại, thiếu phiếu và khóa sau khi kết luận |
| [F08 · Lý lịch](../features/F08-ly-lich-khoa-hoc/test-plan.md) | 25 | Xuất CV có nhiều kỳ/nguồn. Đối chiếu thành tích theo quyền, template của trường và audit lần xuất |
| [F09 · Đề tài cấp trên](../features/F09-de-tai-cap-tren/test-plan.md) | 26 | Thiếu chứng cứ theo cấp chặn duyệt. Thu hồi đầu mục đã duyệt thì giờ giảng được điều chỉnh có vết |
| [F10 · Đề tài sinh viên](../features/F10-de-tai-sinh-vien/test-plan.md) | 27 | Thử nộp trước và sau khi GVHD xác nhận. Khi từ chối, kiểm lý do và lịch sử |
| [F11 · Dự án phục vụ sản xuất](../features/F11-du-an-phuc-vu-san-xuat/test-plan.md) | 28 | Thiếu đơn vị chủ trì bị chặn. Sau khi đủ dữ liệu, đối chiếu minh chứng, kết quả duyệt và nguồn chuyển giờ |
| [F12 · Hoạt động](../features/F12-hoat-dong-khoa-hoc/test-plan.md) | 29 | Bật một loại hoạt động tại B. A dùng danh mục riêng. Kiểm chứng cứ thiếu lúc gửi và việc được tiếp tục bổ sung |
| [P03 · Giờ giảng](../features/P03-quy-doi-gio-giang/test-plan.md) | 30 | Replay sự kiện sau ngày đổi công thức. Áp công thức tại ngày nguồn, giữ duy nhất một lần ghi, tổng phân bổ khớp F08 |

## Bảo mật và độ tin cậy

QA chạy bằng fixture tổng hợp có chủ thể và quyền đã biết. Với mọi ca từ chối, so cả response, số dòng và sự kiện nghiệp vụ trước/sau. Lưu log kỹ thuật đã lọc bí mật.

| ID | Điều kiện và thao tác | Tiêu chí đạt |
|---|---|---|
| S1 · Danh tính | Đăng nhập cùng email A/B, đổi realm, token hết hạn/sai audience, logout, khóa tài khoản, dùng lại OTP hoặc OTP quá hạn | Phiên mới chỉ vào đúng tenant, OTP dùng một lần, khóa có hiệu lực ở request kế tiếp. Realm có giới hạn thử và rate-limit. Log không có token/OTP |
| S2 · Phân quyền | Người chỉ xem, chủ nhiệm khác, hội đồng có xung đột và admin tenant B lần lượt gọi cùng API. Kiểm list, detail, count, export và URL file trên tài nguyên A | Không trả nội dung/số đếm ngoài scope. API ghi từ chối và bản ghi nguồn không đổi. Admin tenant chỉ quản trị trong tenant |
| S3 · Dữ liệu | Qua pool size 1, luân phiên hai tenant, rollback giữa lệnh, đọc không context, ghi sai tenant, liên kết cha/con khác tenant. Dùng role runtime trong test | Tất cả nhánh cách ly đạt ở DB. Dữ liệu shared chỉ đọc theo policy B01. Ghi shared cần quyền riêng. Migration credential tách khỏi web và worker |
| S4 · Giao diện/theme | A/B mở dialog, logout/login cùng trình duyệt. Admin A thử sửa draft B, thử token sai schema, logo ngoài kho, cặp màu không đủ tương phản | Scope portal và cache đúng tenant. Ghi sai bị chặn trước publish, active revision còn nguyên. Preview, undo, focus và thông báo lỗi dùng được bằng bàn phím |
| S5 · File và báo cáo | File cùng tên ở hai tenant, sai content type, quá dung lượng, URL hết hạn, upload bị bỏ dở. Thu hồi quyền giữa lúc tạo bản chụp B02 và tải | Không ghi liên kết sai, không cấp URL mới sau thu quyền, file cách ly chờ kiểm. Download B02 xác thực lại. Job dọn chỉ xóa staging đã hết hạn |
| S6 · Toàn vẹn | Hai phiên gửi cùng lệnh. Dừng worker sau commit và cho chạy lại. Buộc ghi audit lỗi. Thử sửa log bằng runtime role | Một thay đổi nghiệp vụ thành công ứng với một history/audit thích hợp. Rollback sạch. Event có thể nhận lại, consumer không ghi trùng. Log nghiệp vụ bất biến |
| S7 · Vận hành | So quyền secret của local/preview/pilot, exact redirect/CORS, TLS, CSP, dependency scan và secret scan. Restore DB + object store + cấu hình IdP vào môi trường thử | Preview không đọc pilot. Không có bí mật trong bundle/log. Lỗ hổng nghiêm trọng trên đường chạy có người xử lý trước mở pilot. Đăng nhập được sau restore, checksum và số hồ sơ khớp backup |

## Đo tải, chẩn đoán và tối ưu

Dùng k6 trên môi trường thử được phép, cùng vùng đo và cùng bản seed cho mỗi lần so sánh. Đề xuất 2 tenant × 1.000 hồ sơ, 10 kỳ, chia A1/A2 lệch 80/20, mỗi đề tài có 5 sự kiện history. Seed qua service hoặc fixture có cùng constraint. Tách account riêng cho ghi. File mẫu 1 MB và 6 MB truyền trực tiếp đến kho, đo riêng khỏi latency API. Thu metric DB/pool và trace từ server với cùng timestamp. Dừng lượt tải nếu chi phí/quota vượt giới hạn thử đã duyệt.

| Kịch bản | Mô hình chạy | Mục tiêu đề xuất và chứng cứ |
|---|---|---|
| Đăng nhập sau khi hạ tầng nghỉ | Đo riêng 5 lần thức dậy và 30 lần warm. Tách redirect, thời gian giao mail, API đầu, DB wake và render | Đề nghị p95 từ khi callback tới trang dùng được ≤5 s cold. Báo đủ 5 mẫu vì p95 cold gần giá trị lớn nhất. Ghi thời gian SMTP riêng |
| Giờ nộp bình thường | Ramp 2 phút rồi 20 người dùng đồng thời trong 10 phút. 60% list/detail, 20% B06, 10% lưu nháp/nộp, 10% B02. Mỗi người nghỉ 1–3 s giữa request | Warm p95 list API ≤500 ms, ghi ≤1 s, B02 ≤2 s, lỗi ngoài dự kiến <1%. Danh sách hiển thị dùng được <2 s ở p95. Đo web thật trên profile máy/mạng cố định |
| Dồn tải sát hạn | 50 người trong 2 phút, gồm hai yêu cầu đồng thời trên cùng nháp và nhiều nháp độc lập. Lặp 3 lượt, reset seed | Không mất mã, không trùng chuyển bước hoặc lẫn tenant. Phân biệt lỗi nghiệp vụ dự kiến và 5xx. Hết burst trở lại ngưỡng warm trong 2 phút |
| Tenant lớn ảnh hưởng tenant nhỏ | Tăng dữ liệu A lên 10 lần, chạy export có giới hạn tại A và đọc trang đầu ở B. So baseline trước/sau | B vẫn đạt mục tiêu đọc. Ghi p99, số query/request, pool wait, hàng trả về và EXPLAIN (ANALYZE, BUFFERS) trên bản thử cho 3 query chậm nhất |

Ưu tiên chỉnh theo kết quả đo. Nếu thời gian nằm ở DB, thêm index theo bộ lọc thực (ví dụ tenant, kỳ, trạng thái, ID), giới hạn cột, phân trang cursor ổn định và tránh N+1 của widget. Nếu đợi pool, rút ngắn transaction, kiểm số instance × kích thước pool và bố trí API gần Neon. Nếu UI chậm, tách tải màn quản trị, đo JS chuyển giao, cache tài sản tĩnh có hash và giữ dữ liệu riêng ra khỏi CDN dùng chung. Nếu B02 chậm, thử bản chụp có index và xử lý xuất file qua worker. Chỉ nhận tối ưu khi cùng workload cải thiện mà mọi assertion quyền, số liệu và idempotency vẫn đạt.

## Quyết định phát hành

QA điền kết quả dự kiến/thực tế, độ lệch, log/trace, screenshot và ID lỗi theo tenant/US/TC. Chạy lại đúng ca sau khi sửa cùng bộ hồi quy của module. SA đọc báo cáo tải và bảo mật, PO ký số liệu và nhánh RV của đợt, Ops ký khôi phục và mức chi. Lỗi lộ tenant, sai mã/tổng, thiếu audit cho lần đổi trạng thái hoặc restore hỏng giữ đợt ở trạng thái sửa. Khi phạm vi thay đổi, PO ghi rõ lát bị hoãn và cập nhật kế hoạch trước khi giao thử.
