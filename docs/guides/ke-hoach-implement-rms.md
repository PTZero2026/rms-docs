---
title: "Kế hoạch phát triển và giao việc RMS"
owner: "Tech lead"
status: Review
updated: 2026-11-24
---

# Kế hoạch phát triển và giao việc RMS

**Mốc bàn giao v0 là một kỳ nghiên cứu hoàn chỉnh từ mở kỳ đến kết luận và đối chiếu số đếm ở hai tenant.** Tech lead giao thẻ kỹ thuật N01–N14 dưới đây cùng T001–T008 của US-01–32 và T001–T007 của US-33–35. Đường dẫn code là đích dự kiến trong monorepo hiện tại. Quyết định kiến trúc và cấu hình có tác động chi phí nằm trong [hồ sơ SA](../architecture/rms-v0-sa-review.md). Nghiệp vụ của mỗi thẻ lấy từ [35 lát INVEST](../../specs/README.md) và [20 spec feature](../features/README.md).

## Phân bổ đợt

Ước lượng theo tuần lịch cho 1 Tech lead/BE, 1 FE, 1 BE và 1 QA, có Ops và PO theo buổi. Tuần 1 bắt đầu từ N01 local trong monorepo. Hạ tầng thử bên ngoài cần ở bước tích hợp N11. Đây là khung lập nguồn lực, Tech lead cập nhật lại sau hai lát đầu bằng thời gian thực tế.

| Mốc dự kiến | Giao theo thứ tự | Bằng chứng bàn giao |
|---|---|---|
| Tuần 1–2 | SA-01–06, N01–N04, N05, N08, sau đó N06–N07. IAM, UI và DB làm song song sau khi chốt contract | Hai tài khoản từ hai realm đăng nhập, API truy cập đúng tenant qua pool, đổi/khôi phục theme A và B giữ nguyên |
| Tuần 3–4 | N09–N11 và tích hợp phần nền N08. US-04 trước khi tích hợp US-01, US-02, US-03. Sau đó US-05 → 06 → 07 → 08 | Mở kỳ, nộp lại cùng mã, trả lý do. So audit, outbox, file. B có cùng ID thử nghiệm hoặc biết đường dẫn vẫn chỉ thấy dữ liệu B |
| Tuần 5–6 | US-09 → 10 → 11. US-12, 13 tích hợp khi có dữ liệu từ 07–11. N12–N14 và UAT A | PO đếm ba mã gồm một hồ sơ nộp lại, so tệp với bản chụp. QA xuất bảng quyền, p95 và kết quả restore |
| Tuần 7–10 | Đợt B. US-14 → 15 → 16/17. US-18 → 19 và US-20 → 21 chạy song song sau khi đã giao đề tài. 17 + 21 → 22 → 23, sau đó 19 + 23 → 24. US-25 dùng dữ liệu kết quả từ 21/23 | Một hồ sơ đi từ giao đến nghiệm thu/khóa sổ. Replay nhắc hạn và xác nhận duy nhất theo kênh. Tài chính đối chiếu kết quả khóa sổ với RV-24 đã chốt |
| Tuần 11–14, tùy dữ liệu của trường | Đợt C. Chốt nguồn danh mục, minh chứng và hợp đồng sự kiện trước US-26–29. US-30 tích hợp từng nguồn đã có mẫu và công thức. US-31 sau 06, US-32 sau 20, độc lập với P03 | Hai tenant có bộ cờ khác nhau. Trường ký bộ giờ tính mẫu. Kiểm nguồn, quyền và tiếp tục thủ công khi AI gián đoạn |

**Đường găng v0** đi qua login + cách ly → P02/P01 → mở kỳ → nộp → chấm → kết luận → báo cáo → UAT. Theme, file và môi trường thử có thể phát triển trên fixture sau khi contract ổn định, nhưng phải nhập vào đường chạy thật trước UAT. B04 cung cấp adapter thông báo/outbox tối thiểu cho đợt A ở N09, tính năng nhắc hạn US-16 được bổ sung trong B. [Phụ thuộc nghiệp vụ](../epics/README.md)

## Thẻ kỹ thuật giao cho AI

Mỗi dòng là một phiếu độc lập. Người nhận thực thi phần việc sau cột phụ thuộc, bổ sung test âm trước khi viết logic và nộp kết quả cho vai trò review. Tên gói trong cột đầu ra là phạm vi sửa. Dùng cùng một cấu trúc ghi bằng chứng cho tất cả thẻ, xem mục cuối.

| ID · người nhận → reviewer | Cần | Việc làm và đầu ra tại repo code | Nghiệm thu quan sát được |
|---|---|---|---|
| N01 · Platform → Tech lead | SA-01 đã chốt, local/CI | Giữ web, UI, E2E, Node và pnpm hiện có. Bổ sung hai workspace `apps/backend` và `packages/api-contracts` vào cấu hình hiện hành. Tạo contract health, sinh client, CI chạy lint, typecheck, test, build | Từ checkout sạch, cài theo lockfile và build cả hai app. UI gọi health từ client sinh tự động. Chỉnh contract mà bỏ regenerate làm CI fail |
| N02 · DBA → SA | N01, SA-03 | Trong `apps/backend/prisma/migrations` tạo Tenant, bảng owned mẫu, unique/FK cùng tenant, policy đọc/ghi, role runtime và role migrate. Trong `src/db/tenant-transaction.ts` cấp client cho toàn callback | Runtime luân phiên A/B trên pool size 1, đọc đúng A/B qua 100 vòng. Thiếu context đọc rỗng, ghi bị từ chối. Cross-tenant FK bị chặn. Rollback không giữ context |
| N03 · IAM/Ops → Security | N01 | Trong `infra/keycloak` ghim image + SPI tương thích, realm seed A/B, audience, SMTP inbox thử, redirect URI và chính sách hạn OTP/retry. Viết runbook tạo realm mới và xoay secret | OTP sử dụng một lần ở A, hết hạn, nhập lại và xác minh tại B đều bị từ chối. Token A có issuer/audience dự kiến. Hai lần seed cho cùng tenant cho cùng cấu hình |
| N04 · IAM/BE → SA | N02, N03, SA-02 | `apps/backend/src/modules/iam` và `apps/web/src/auth`. Tra registry, xác minh token, upsert lần đầu, resolve RBAC/scope theo B03, logout và xóa cache. Đồng bộ admin đầu tiên qua bootstrap | Login đồng thời cùng danh tính chỉ tạo một tài khoản. Token A + slug B, sai aud, token hết hạn đều bị từ chối. Khóa người dùng thì request kế tiếp với token cũ bị từ chối. Có log quyết định đã ẩn thông tin nhạy cảm |
| N05 · FE/Design → Design lead | N01, SA-04 | `packages/ui` tạo primitives shadcn và schema token light/dark, default, ánh xạ portal. Gallery gồm form đề xuất, dialog lỗi và bảng. Một lệnh dựng gallery với hai bộ token | Cùng component đổi màu/nền/font theo A/B tại 390 và 1280 px. Tab/Shift+Tab và Escape trả focus đúng. Cặp màu thử không đạt bị validator báo đúng trường |
| N06 · BE → DBA/Design | N02, N04, N05, N08, SA-04 | `packages/api-contracts/catalog/theme.yaml`, `apps/backend/src/modules/catalog/theme`. Định nghĩa đọc active, lưu draft, preview có quyền, áp dụng theo expected revision, rollback có audit | A áp dụng v2 từ v1 có đúng một audit, B tiếp tục default. Hai lần áp dụng cùng revision có 1 thành công và 1 xung đột. Khôi phục v1 giữ lịch sử v2. Admin B không đọc draft A |
| N07 · FE → PO/QA | N05, N06 | `apps/web/src/features/catalog/theme`. Soạn nháp, preview form và dialog, hiển thị lỗi contrast, publish/rollback, refetch active revision sau lưu. Xóa cache khi đổi phiên | Đổi theme không redeploy. Khi bỏ nháp người dùng đang hoạt động vẫn thấy bản cũ. Khi token không tương thích web dùng default đúng tenant. Chụp A/B trước và sau rollback |
| N08 · Platform/BE → SA | N02, N04 | `apps/backend/src/modules/audit` và `workflow`. Dựng port ghi audit trong transaction, fixture graph v1, primitive khóa phiên bản và append history. US-03/04 thêm hành vi người dùng và query | Cố ý fail sau cập nhật trạng thái thì status, history, audit đều rollback. Thành công một lần có một cặp history/audit. Hai lệnh cùng version cho một lần chuyển |
| N09 · BE/Ops → QA | N08, SA-06 | `apps/worker` + `modules/notification`. Ghi outbox trong giao dịch, worker theo tenant claim lease có hạn, phát in-app và SMTP sandbox, retry, danh sách lỗi và replay | Dừng worker sau commit rồi chạy lại, thông báo in-app có đúng một bản. Thử lỗi SMTP, thấy số lần thử và việc cần đối soát. Theo vết được từ lệnh đến event qua correlation ID |
| N10 · BE → Security | N04, N08 | `modules/attachments` + adapter S3. Tạo upload intent có tenant/resource/version, giới hạn MIME/kích thước, quarantine rồi xác nhận checksum và quyền lúc attach. URL ký có hạn, xóa staging mồ côi | Tải minh chứng thành công, file vượt giới hạn/sai nội dung bị loại. Đổi tài khoản trước finalize không gắn được file. Sau khi thu quyền, API từ chối cấp URL mới. Lần retry không tạo liên kết trùng |
| N11 · Ops/BE → Tech lead | N01–04, SA-01, SA-05. N09/N10 cho kiểm tích hợp | `infra/pilot` và adapter B01 `apps/sys-config-service`, namespace contract vẫn là `catalog`. Chuẩn bị manifest môi trường Vercel, Neon pooled/direct, B01 trên TLS riêng với Redis, object store, worker và backup. Kiểm tra thời gian chờ, body limit, secret và callback của từng môi trường | Trên môi trường thử được phép, SPA → API → DB qua pool, OTP hai realm, cấu hình 6 MB tới B01 và blob quá 20 MB bị từ chối. Preview không có credential của pilot. Lưu quota và chi phí phụ trợ |
| N12 · Security/QA → SA | N04, N07–11, các US của đợt | `e2e/security` kiểm ma trận quyền theo actor × tenant × resource, scope ngay trước ghi/tải, cache, quyền file, log, policy DB, phụ thuộc phần mềm | Đủ S1–S7 trong kế hoạch QA. Mọi ca từ chối có bằng chứng response và trạng thái DB. Không lộ nội dung, kể cả số đếm. Lỗi cách ly hoặc đổi trạng thái sai chặn phát hành |
| N13 · Performance/DBA → Tech lead | N11, US-07/12/13 cho A | `e2e/perf` tạo dataset, k6, trace query, tải front-end và báo cáo cold/warm. Chạy baseline rồi đo lại với cùng seed sau khi tối ưu | Có số lần chạy, p50/p95/p99, RPS, lỗi, thời gian đợi pool, EXPLAIN trước/sau. Đạt các ngưỡng ở kế hoạch QA hoặc có quyết định đổi quy mô pilot |
| N14 · QA/Ops → PO và SA | N12, N13, các US của đợt | `e2e/release` thực hiện diễn tập khôi phục, rollback ứng dụng, UAT và đo quota thực. Ghi hồ sơ nghiệm thu theo đợt với dữ liệu đã ẩn | Phục hồi vào DB/kho thử riêng, đăng nhập lại ở hai realm, kiểm checksum và số mã, RPO/RTO. PO xác nhận phép đếm và các nhánh RV đã chốt. Đủ bằng chứng mới ghi kết luận thử |

**Trình tự N01–N11.** Sau N01 mở N02/N03/N05 song song. N04 mở N08 và phần hạ tầng N11. Khi N08 xong, chạy N06/N09/N10 song song, sau đó N07. Bản tích hợp N11 cần worker và kho file từ N09/N10. N12–N14 lặp lại với dữ liệu đã mở rộng tại từng đợt.

### Ba lát mobile bổ sung cho luồng A/B

| Lát | Phụ thuộc cung cấp dữ liệu thật | Bàn giao |
|---|---|---|
| US-33 · B06 | US-12 và nguồn kỳ báo cáo F04/US-15 khi kiểm hạn báo cáo | Danh sách và số đếm cùng scope. Chạm thẻ mở đúng hồ sơ. |
| US-34 · B04 | N04/N09, tin in-app theo người nhận | Mở lại cùng tin giữ đúng số chưa đọc và bộ lọc. |
| US-35 · F02 | US-05, điều kiện kỳ dùng chung US-07 | Cùng cửa sổ tiếp nhận tại danh sách, chi tiết và khi nộp. |

Cả ba có thể giao contract sau N01 và dùng fixture có sẵn. Mỗi lát đã hoàn thành T001 ở v0. Giao T002 → (T003 ∥ T004) → T005 → T006 → T007 theo file tasks của chính lát. QA kiểm ở 360/390 CSS px trên bản nối API.

## Phiếu giao từng task nghiệp vụ

Tech lead giao bằng khóa ghép, ví dụ **US-07/T005**. Cùng T005 ở lát khác là việc khác. Mỗi [thẻ US-01–32](../../specs/README.md) có file đích, dữ liệu, thay đổi cụ thể và phép đối chiếu. Dùng bảng sau để xác định đầu ra có thể nhận **từng task**, trước khi nghiệm thu cả lát.

| Task trong mỗi lát | Người thực hiện | Bằng chứng riêng để nhận việc |
|---|---|---|
| T001 · fixture | QA | Seed hai tenant, actor đọc/ghi và dữ liệu biên của quickstart. Chạy lại từ DB sạch cho cùng mã và tổng |
| T002 · contract | BE | Commit contract đúng path trong thẻ. Generate client, validate request/response và mẫu lỗi. FE dùng được type sinh |
| T003 · ca chấp nhận | QA | Ca chính, ca bị chặn và khác tenant có assertion kết quả/kết quả phụ. Lưu một lần chạy đỏ đúng nguyên nhân trên fixture |
| T004 · model/hạ tầng dữ liệu | BE | Ràng buộc chỉ định trong data-model của lát có integration test PostgreSQL, gồm input hợp lệ và input vi phạm |
| T005 · nghiệp vụ | BE | FR-001/002 đạt TC-01/02. Đổi trạng thái dùng service của miền và audit đồng giao dịch. Thử lệnh lặp hoặc hai phiên với cùng dữ liệu |
| T006 · điểm tương tác | FE hoặc BE theo file trong thẻ | User có quyền thấy kết quả như mô tả, người ngoài quyền bị chặn cả ở server. Mobile kiểm độ rộng của quickstart. B06 chỉ điều hướng |
| T007 · quyết định biên | BE/QA | Kiểm kết luận RV của lát bằng TC-03, lưu kết quả chạy. Với US-31, đo thêm SC-003 trước pilot |
| T008 · hồi quy/bàn giao | QA | Chạy đủ TC-01–04, ca tích hợp module thật và phép đối chiếu riêng ở cuối quickstart. Ghi vào review.md của lát |

Ví dụ giao **US-07/T005** cho BE sau T003/T004. Đọc [phiếu nộp đề xuất](../../specs/007-web-submit-proposal/tasks.md) và [bốn ca nghiệm thu](../../specs/007-web-submit-proposal/quickstart.md). Người nhận trả mã theo dõi, bước mới và audit cho chủ nhiệm. QA nộp lại theo cùng thao tác, so mã và số lần chuyển, rồi thử sau hạn. Reviewer so cả kết quả với bản ghi nguồn.

## Giao phần nghiệp vụ còn lại của từng feature

Một lát INVEST thường chỉ đi qua một phần feature. Bảng dưới đưa các AC nguồn còn lại vào kế hoạch. Số trong cột AC là hậu tố của mã `AC-xx` trong **spec của feature ở cùng dòng**. Tạo một phiếu theo khóa `feature/AC` khi giao, ví dụ `F01/AC-09` cho module proposal. Đọc điều kiện và kết quả ở spec, chạy tất cả TC mang mã đó trong test plan cùng thư mục. Nếu Nxx hoặc một US đã thực hiện đủ hành vi, đính bằng chứng để nhận luôn AC. QA so theo hành vi vì các mã AC của lát và của feature có hai phạm vi riêng.

| Đợt · spec nguồn | AC cần đối chiếu ngoài các tham chiếu tường minh của lát | Người nhận và đầu ra chính |
|---|---|---|
| A · [B03](../features/B03-quan-ly-nguoi-dung/spec.md) | 01, 02, 03, 04, 07, 08, 11, 13, 14 | IAM thực hiện tài khoản, email, khóa, đổi role và yêu cầu lên author. |
| A · [P02](../features/P02-audit/spec.md) | 03, 04 | Platform giữ nguyên tử và actor thay mặt. |
| A · [P01](../features/P01-workflow-engine/spec.md) | 01, 02, 04, 06, 07, 08 | Platform kiểm graph theo tenant, guard, quyền, lý do và cặp lịch sử. |
| A · [B01](../features/B01-danh-muc-cau-hinh/spec.md) | 01, 03, 04, 06, 08, 09, 10, 11, 12, 13 | BE cấu hình hoàn thiện multipart, dry-run, giới hạn, shared và cache. |
| A · [F02](../features/F02-dot-keu-goi/spec.md) | 03, 04, 06, 07, 08 | BE/FE hoàn thiện đóng, hủy, gia hạn, điều kiện hợp lệ và danh sách kỳ. |
| A · [F01](../features/F01-de-xuat-de-tai/spec.md) | 05, 09, 10 | BE/FE khóa sửa sau nộp, chặn trùng thành viên, chốt danh sách chuyển xét. |
| A · [F03](../features/F03-xet-duyet-hoi-dong/spec.md) | 08, 10, 11, 12 | BE kiểm một người một phiếu, khóa khi kết luận, quyền xem nhận xét và biên bản đúng hội đồng. |
| A/B · [B04](../features/B04-thong-bao/spec.md) | 01, 02, 03, 04, 05, 06, 08, 09, 10 | BE/worker xử lý sự kiện, các kênh, ưu tiên, retry và quyền đọc. Đợt A cần thông báo nộp/duyệt, B mở rộng nhắc hạn. |
| A · [B06](../features/B06-trang-chu/spec.md) | 01, 02, 06, 07, 08, 09, 10, 11, 12 | FE/BE hoàn thiện tổng, widget theo quyền, trạng thái rỗng, cấu hình và độ tươi dữ liệu. |
| A · [B02](../features/B02-bao-cao-thong-ke/spec.md) | 01, 02, 03 | BE/QA đối chiếu cả ba AC bản B02 trình review bằng quickstart US-13 và test-plan B02. |
| B · [F04](../features/F04-quan-ly-tien-do/spec.md) | 04, 05, 06, 07, 10, 11, 12, 15 | BE/FE duyệt hoặc trả báo cáo, tạm dừng/tiếp tục, bàn giao sang F06. |
| B · [F05](../features/F05-quan-ly-kinh-phi/spec.md) | 03, 08, 09, 10, 11, 12 | BE/FE xem số liệu theo scope, kiểm trạng thái chi, phí override và quyền cấu hình. |
| B · [F07](../features/F07-san-pham-khoa-hoc/spec.md) | 02, 04, 06, 09, 10, 12, 13 | BE/FE hoàn thiện điều kiện sửa, minh chứng, phạm vi và công bố theo spec sản phẩm. |
| B · [F06](../features/F06-nghiem-thu/spec.md) | 02, 03, 05, 08, 09, 10, 11, 12 | BE/FE mở vòng chấm, nộp phiếu, làm lại và kiểm điều kiện phối hợp F05. |
| B · [F08](../features/F08-ly-lich-khoa-hoc/spec.md) | 01, 02, 03, 04, 05, 06, 07, 08, 10, 11 | FE/BE hoàn thiện sửa hồ sơ, dữ liệu tổng hợp và phạm vi công khai. |
| C · [F09](../features/F09-de-tai-cap-tren/spec.md) | 03, 04, 05, 06 | BE/FE trả lại, audit, phát/thu hồi giờ theo cấp và vai trò. |
| C · [F10](../features/F10-de-tai-sinh-vien/spec.md) | 01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 12, 13 | BE/FE hoàn thiện đợt sinh viên, danh sách nhóm, tiến độ sau xác nhận và nghiệm thu có GVHD. |
| C · [F11](../features/F11-du-an-phuc-vu-san-xuat/spec.md) | 04, 05, 06, 07 | BE/FE kiểm minh chứng, trả lại, duyệt, thu hồi và sự kiện giờ. |
| C · [F12](../features/F12-hoat-dong-khoa-hoc/spec.md) | 03, 04 | BE/FE kiểm từ chối và phát giờ khi nguồn hợp lệ. |
| C · [P03](../features/P03-quy-doi-gio-giang/spec.md) | 02, 03, 04, 06, 07, 08, 09 | BE/DBA hoàn thiện kỳ ghi nhận, phân bổ, hiệu lực, điều chỉnh và liên kết F08. |

Lấy trước các AC là tiền điều kiện của luồng cuối đợt. Cụ thể, giao F01/AC-10 trước US-09, F04/AC-04 và F04/AC-07 cùng US-22, F06/AC-02–03 trước US-23. Với khả năng được tham chiếu ở cả hai module, giao một lệnh cho domain service sở hữu, module còn lại kiểm điều kiện và kết quả. E4 phát triển với cấu hình và ví dụ giả lập ở tenant thử. Khi kích hoạt cho trường, áp dụng RV-36 cho từng phân hệ. PO xếp phần còn lại sau lát ưu tiên của cùng đợt, ước lượng lại theo số AC chưa có bằng chứng.

## Mẫu giao việc cho agent ở repo code

```text
Thẻ = <Nxx hoặc US-xx/Txxx>; người nhận = <vai trò>; reviewer = <vai trò>.
Đọc AGENTS.md, spec feature, plan, hợp đồng, quickstart và file tasks của lát.
Đầu vào = <mã các thẻ đã nhận, seed, quyết định SA/RV và phạm vi file>.
Thực hiện đúng dòng task. Viết test có assertion trước, xác nhận đỏ đúng lý do,
làm thay đổi tối thiểu, chạy lại cả ca liên quan ở tenant A và B.
Nộp = danh sách file, migration/rollback nếu có, phiên bản code và dữ liệu,
lệnh đã chạy, kết quả mong đợi/thực tế và nơi lưu bằng chứng đã che thông tin.
Ghi điểm còn cần PO/SA quyết nếu kết quả phụ thuộc quy chế.
```

N01 thiết lập các script của repo code. Bản bàn giao dùng `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm exec playwright test <file-ca>`; N13 bổ sung `k6 run <scenario.js>`. Reviewer thứ nhất đối chiếu đúng spec và scope. Reviewer kỹ thuật tiếp đó xem quyền, transaction, rollback, truy vấn và tác động migration. B05, đối soát tài chính thật, Entra ID và di trú lịch sử có chủ đề trong roadmap dài hạn. PO định phạm vi và dữ liệu trước khi tách thành lát INVEST. [Roadmap](../product/roadmap.md)
