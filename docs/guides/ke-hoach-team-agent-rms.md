---
title: "Tổ chức và chạy thử đội agent phát triển RMS"
owner: "Tech lead và PO"
status: Draft
updated: 2026-11-21
---

# Tổ chức và chạy thử đội agent phát triển RMS

**Đề xuất dùng chín vai trò theo từng thẻ việc.** Một Tech lead phía con người điều phối đợt đầu. Mỗi thẻ có một người hoặc agent thực hiện, một người nhận bàn giao và một phép thử độc lập. PO của dự án giữ quyền chốt giá trị và nghiệp vụ với nhà trường. Cách này cho phép thử ngay bằng công cụ đội đang dùng và đo xem việc tách vai trò có đáng với thời gian review.

## Tính khả thi ở thời điểm bắt đầu

| Công việc | Mức sẵn sàng | Căn cứ và điều kiện |
|---|---|---|
| Nghiên cứu, phân tích và chuẩn bị nghiệm thu | Có thể thử hôm nay | Đã có 32 lát INVEST, quyết định nghiệp vụ, spec feature và quickstart. PO agent tổng hợp căn cứ. Những điểm cần trường xác nhận vẫn có người chịu trách nhiệm. [Danh mục lát](../../specs/README.md) |
| Design và FE | Có thể giao thay đổi nhỏ | Có React/Vite tại `apps/web`, component và theme tại `packages/ui`. Trang web hiện tại dẫn đến tài liệu. N05 mô tả gallery và phép thử với hai theme. [Ứng dụng hiện tại](../../apps/web/src/App.tsx) · [Thẻ N05](ke-hoach-implement-rms.md) |
| BE và tích hợp | Khả thi sau phần nền | `apps/backend` và `packages/api-contracts` là hai workspace cần xây. SA-01–06 đang ở trạng thái đề xuất. N01 mở đầu bằng contract health, client sinh và lần gọi thật từ web. [ADR-0015](../architecture/decisions/0015-monorepo-rms.md) · [Hồ sơ SA](../architecture/rms-v0-sa-review.md) |
| Kiểm tải, bảo mật, phát hành | Cần bản tích hợp và môi trường thử được cấp | Bộ Playwright hiện có nhắm tới tenant pilot bên ngoài. Đợt A cần bằng chứng từ cùng một build, hai tenant, quyền thực, số liệu, khôi phục và UAT. [Harness pilot](../../e2e/README.md) · [Kế hoạch kiểm thử](kiem-thu-rms.md) |

## Người làm, sản phẩm bàn giao và người nhận

| Vai trò | Việc giao cho agent | Ai nhận và kiểm bằng gì |
|---|---|---|
| PO | Nghiên cứu persona, quy trình của trường, phản hồi và roadmap. Nêu vấn đề, căn cứ, kết quả mong đợi và thứ tự ưu tiên cho một thẻ INVEST. | PO người thật hoặc chủ nghiệp vụ xác nhận nhu cầu, chọn lát và quyết định các RV thuộc thẩm quyền. BA nhận brief đã có nguồn. |
| BA | Ánh xạ Epic → feature → US. Với lát mới, chạy Spec Kit theo thứ tự specify → clarify → plan → tasks. Với lát sẵn có, đọc lại tác vụ, ghi phần chênh và đề nghị cập nhật. | PO/BA duyệt thay đổi BR/AC. SA và QA phải lần từ mỗi AC đến thiết kế, màn hình và ít nhất một test case. |
| SA | Chọn ranh giới module, xác nhận phụ thuộc, hợp đồng và tác động đến dữ liệu, tenant, P01/P02. Ghi quyết định và phương án phục hồi. | Tech lead cùng chủ hệ thống liên quan rà quyết định. BE/FE nhận cùng một contract, QA nhận các trường hợp biên. |
| Dev BE | Viết unit test đỏ cho luật miền, hiện thực, thêm integration test cho transaction, quyền và audit khi có liên quan. Review code BE ở thẻ do người khác viết. | Reviewer BE hoặc SA kiểm diff và chạy lại test. FE nhận type sinh từ `packages/api-contracts`. QA nhận fixture cùng lệnh chạy. |
| Dev FE | Dùng component chung và client sinh, viết unit test cho tương tác, xử lý trạng thái tải, rỗng, lỗi và thiếu quyền. Review chéo thay đổi FE. | Reviewer FE kiểm code. Design đối soát màn hình thực sau khi bàn giao. QA kiểm luồng người dùng. Kế hoạch hiểu “Unit test TE” là unit test **FE**. |
| Design | Sở hữu design system, token, mẫu tương tác và UX trong `ui.md`. Trước code, giao hành vi mong đợi. Sau code, kiểm lại màn hình, bàn phím, focus, tương phản và hai kích thước 390/1280 px. | FE nhận mẫu và trạng thái. QA nhận tiêu chí quan sát được. Design ghi đạt hoặc mở lỗi kèm ảnh, kích thước và thao tác. |
| QA/QC | Viết testcase trước code, chuẩn bị seed, chạy nghiệm thu, log bug về đúng chủ module. Retest trên bản sửa và chạy hồi quy lân cận. | PO nhận bảng AC → TC → thực tế → chứng cứ. QA đóng lỗi khi chạy lại được trên đúng bản sửa. |
| Tech | Phụ trách hiệu năng và bảo mật. Review thiết kế quyền, cách ly tenant, phụ thuộc và dữ liệu trong log. Đo tải theo dữ liệu, cấu hình và ngưỡng SA đã duyệt. | SA nhận ma trận quyền, báo cáo p95/tỷ lệ lỗi, điểm nghẽn và lỗi cần xử lý. N12/N13 nêu phạm vi theo từng đợt. |
| DevOps | Chuẩn hóa build, CI, môi trường thử, quan sát, backup, restore, rollback và hướng dẫn deploy. Chuẩn bị bản phát hành có thể truy vết. | QA nhận địa chỉ môi trường thử và mã build. Người phụ trách vận hành duyệt môi trường, cửa sổ triển khai và rollback. Chỉ push hoặc deploy khi có yêu cầu rõ. |

**Hai trách nhiệm cần giao tên người ngay đầu buổi.** Tech lead giữ thứ tự phụ thuộc, ngân sách, quyền merge và lịch review. Đại diện nghiệp vụ của trường nhận UAT. Ví dụ, Trưởng phòng KHCN ký danh sách đối chứng B02. Khi đụng IAM, database hoặc dữ liệu thật, mời đúng chủ IAM, DBA hoặc chủ dữ liệu vào quyết định tương ứng. Các vị trí này có thể kiêm nhiệm. [Phân công RV](../../specs/review-decisions.md)

## Cách vận hành một thẻ

1. **PO và BA chuẩn bị đầu vào.** Ghi mã Nxx hoặc US-xx/Txxx, nguồn BR/AC/RV, phụ thuộc, phạm vi sửa, dữ liệu mẫu, điều kiện đạt và reviewer. Tài liệu làm việc nằm ở `specs/`. Luật nghiệp vụ được duyệt nằm ở `docs/features/`. Nếu hai nguồn lệch, ghi chính xác điểm lệch để PO/BA quyết định. [Quy ước repo](../../AGENTS.md)
2. **Tech lead giao việc.** Khởi đầu một lát đang làm, tối đa hai người thực hiện song song khi đầu ra độc lập, ví dụ QA soạn ca trong lúc SA rà contract. Giao một chủ cho mỗi file dùng chung. Mỗi phiên agent chỉ nhận nguồn và quyền cần cho thẻ. Ghi phiên bản nguồn, kể cả thay đổi local chưa commit. Tách worktree cho các thay đổi code song song sau khi đã chọn được cùng bản đầu vào.
3. **Người thực hiện bàn giao bằng chứng.** Ghi file/diff, lệnh và kết quả, dữ liệu đầu vào, phần cần xác minh và người nhận tiếp theo. Chuyển phiên theo phiếu này để reviewer có thể tự chạy lại. Với thay đổi trạng thái, BE kiểm dịch vụ miền và audit append-only. Với báo cáo, BE áp quyền tenant/đơn vị trước khi đếm.
4. **Review hai lượt.** Lượt một, BA/QA đối chiếu hành vi với spec, Design xem UI thực nếu có. Lượt hai, reviewer khác tác giả rà kỹ thuật, Tech tham gia khi có thay đổi dữ liệu, quyền hoặc tải. Một lỗi có mã thẻ/TC, build, seed, bước tái hiện, mong đợi, thực tế, mức ảnh hưởng và người sửa. QA dùng lại fixture trên build mới, ghi kết quả trước khi đóng. Sau hai vòng sửa cùng lỗi, Tech lead phân tích nguyên nhân với người thực hiện.
5. **Nhận thẻ và nhận phát hành là hai quyết định.** Tech lead nhận sản phẩm kỹ thuật có test. PO/chủ nghiệp vụ ký kết quả UAT theo đợt. DevOps triển khai khi được giao quyền cụ thể và có bản quay lui. Agent chỉ dùng dữ liệu giả hoặc nguồn đã được phép. Token, OTP, nội dung hồ sơ thật và credential vận hành nằm ngoài gói bàn giao.

## Mã nguồn mở và chi phí tích hợp

| Phương án | Ưu điểm cho RMS | Hạn chế và lúc nên dùng |
|---|---|---|
| Spec Kit + Superpowers + Git, người điều phối giao phiên | Khớp trực tiếp với cấu trúc US/T, skill review và repo hiện có. Đội nhìn thấy thay đổi qua diff, có thể bắt đầu bằng một thẻ. | Tech lead phải chuyển thẻ, ghi trạng thái, theo dõi chi phí và xử lý phiên gián đoạn. **Chọn cho pilot đầu.** [Spec Kit](https://github.com/github/spec-kit) · [Superpowers](https://github.com/obra/superpowers) |
| CrewAI Crews + Flows | Khai báo vai trò, nhiệm vụ và luồng sự kiện rõ. Hợp với thử nghiệm lặp lại như PO → BA → QA kiểm hồ sơ đầu vào. | Đội phải nối runtime Python với workspace TypeScript, cấp công cụ theo quyền và tự kiểm chất lượng đầu ra. Thử trên cùng phiếu nếu bàn giao thủ công tốn thời gian. [CrewAI](https://github.com/crewAIInc/crewAI) |
| LangGraph | Mô hình hóa trạng thái, nhánh trả việc, điểm chờ người duyệt và tiếp tục từ checkpoint. Phù hợp khi một thẻ đi qua nhiều buổi. | Phải thiết kế schema trạng thái, lưu checkpoint, xử lý retry và tránh lặp tác động khi chạy lại. Chỉ đầu tư khi số liệu cho thấy mất phiên hoặc chờ duyệt gây chậm lặp lại. [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) |

Tính chi phí mỗi thẻ đã được nhận gồm lượt gọi mô hình hoặc phần thuê bao phân bổ, phút của người review, CI và vận hành. Việc dùng thư viện nguồn mở vẫn phát sinh các khoản này. Khi so hai phương án, giữ nguyên model, dữ liệu, đầu vào và người chấm nếu có thể.

## Buổi chạy thử ngay · 90 phút

Tech lead dùng [kế hoạch khởi động và hai phiếu giao BA/QA](../superpowers/plans/2026-11-21-khoi-dong-team-agent-rms.md) để mở phiên, giao lỗi mô phỏng và ghi quyết định cuối buổi.

**Mục tiêu của buổi đầu là xem một agent khác có thể nhận thẻ và kiểm đúng kết quả mà không cần tác giả giải thích lại.** Chọn B02/US-13 vì đã có quy tắc đếm được ký và bộ dữ liệu đủ nhỏ để PO đếm tay. Dùng nhãn tenant T1/T2 để phân biệt với tên khoa A/B. [Spec B02](../features/B02-bao-cao-thong-ke/spec.md) · [Tác vụ US-13](../../specs/013-web-call-report/tasks.md) · [Quickstart](../../specs/013-web-call-report/quickstart.md)

| Phút | Người chủ trì | Kết quả phải có cuối khoảng |
|---|---|---|
| 0–15 | PO + Tech lead | Chọn reviewer, đồng hồ và trần chi cho buổi. Giao phiếu dưới đây cho BA. Đưa nguồn và seed riêng cho QA để QA lập đáp án độc lập. |
| 15–35 | BA và QA | BA giao bảng BR/AC/RV → task → TC và chỉ ra workspace còn thiếu. QA ghi kết quả kỳ vọng theo từng vai trò trước khi đọc bài của BA. |
| 35–55 | SA/BE, Design/FE | SA/BE làm rõ chủ sở hữu tập dữ liệu và bản chụp. Design/FE phác một bảng gồm thời điểm trích xuất, tổng và chi tiết khi lọc khoa. Hai bên ghi điểm cần thống nhất ở hợp đồng hành vi. |
| 55–75 | QA + Tech | QA so hai bộ kết quả, thử tình huống thu quyền trước khi tải. Tech chỉ ra bằng chứng phải lấy ở API/DB khi có backend và chọn phép đo tải trong N13. QA gửi một lỗi mô phỏng cho đúng người sửa, ví dụ bảng đếm 4 do tính lần nộp lại. |
| 75–90 | Tech lead + DevOps + PO | Reviewer kiểm lại phiếu đã sửa bằng cùng seed. DevOps xác định cách tái lập build. PO đọc tổng, Tech lead ghi thời gian, chi phí và quyết định tiếp tục hoặc sửa quy trình. |

**Phiếu mở phiên BA có thể dùng nguyên văn**

> Nhận B02 / US-13 cho buổi diễn tập. Đọc `docs/features/B02-bao-cao-thong-ke/{spec,test-plan}.md`, `specs/013-web-call-report/{spec,tasks,quickstart}.md` và RV-13. Trả một bảng gồm mã AC có tiền tố feature hoặc US, nguồn, task, ca thử, kết quả mong đợi, bằng chứng còn thiếu và người nhận. Nêu kết quả ở quyền toàn kỳ, một khoa và sau khi quyền tải thay đổi. Bàn giao cho QA trong 20 phút. Giữ thay đổi nghiệp vụ ở dạng đề nghị để PO/BA duyệt.

**Đáp án QA.** Trong T1, A1 nộp hai lần, A2 đã cấp mã rồi bị trả về Nháp, B1 đã nộp, A3 là nháp chưa cấp mã. Trưởng phòng thấy A1/A2/B1, tổng **3**. Chuyên viên khoa A thấy A1/A2, tổng **2**. Sau khi nộp lại A2, bản chụp cũ giữ A2 ở Nháp và tệp cùng thời điểm. Bản mới có A2 ở Đã nộp, tổng vẫn **3**. Khi quyền thu hẹp, yêu cầu tạo lại bản xuất theo quyền mới. TC-04 kiểm người T2 có cùng vai trò vẫn chỉ thấy dữ liệu được phép của T2. [Đối chứng B02](../features/B02-bao-cao-thong-ke/test-plan.md) · [TC-04 của US-13](../../specs/013-web-call-report/quickstart.md)

**Bằng chứng đã kiểm ngày 21/11/2026.** Trên worktree có thay đổi local, Node 24.21.0, pnpm 10.34.5, `corepack pnpm lint` và `corepack pnpm build` đều trả mã 0. Build chạy typecheck của web và UI. Phép đếm đối chứng bằng SQLite trong bộ nhớ cho T1 toàn kỳ = 3, khoa A = 2 và T2 có 1 bản ghi riêng khi dùng trùng mã A1. Sau khi A2 nộp lại, danh sách đã lưu vẫn giữ trạng thái cũ, danh sách mới đổi trạng thái. Phép này kiểm dữ liệu mẫu. API, quyền tải tệp, tải thực tế, phối hợp nhiều phiên và UAT vẫn cần kết quả chạy riêng.

## Chấm pilot và chuyển sang làm sản phẩm

| Câu hỏi | Cách đo và ngưỡng đề xuất |
|---|---|
| Bàn giao có đủ để tự làm tiếp? | Reviewer dùng phiếu và nguồn để tái lập đáp án. Buổi đầu đạt khi 3/3 AC nguồn có TC, TC-04 khác tenant có người phụ trách, các kết quả 3/2 và hai trạng thái A2 đúng, lỗi mô phỏng đi hết vòng sửa và retest trong 90 phút. |
| Tách vai trò có tiết kiệm công? | Ghi phút từ nhận đến duyệt, phút tác nghiệp và phút review của người, số lần phải hỏi lại, vòng trả việc, chi phí/thẻ được nhận. Chạy đối chứng bằng một agent trên cùng đầu vào trong phiên mới, cùng thang chấm. Qua hai lát có độ khó tương đương, mở rộng khi giờ người giảm, chất lượng giữ nguyên và chi phí trong trần PO/Tech lead đã thống nhất. |
| Có đủ bằng chứng nhận lát phần mềm? | Mọi AC trong phạm vi có test chạy và kết quả thực. Các lỗi sai số nghiệp vụ, cách ly tenant, quyền, audit hoặc restore liên quan đều phải đóng và retest. Lưu build, seed và kết quả. Với US-13, chạy đủ TC-01–04, so tệp và danh sách, kiểm quyền tải lại trên bản tích hợp. [Kế hoạch QA](kiem-thu-rms.md) |
| Khi nào đổi cách tổ chức? | Sai đáp án hoặc thiếu căn cứ thì sửa phiếu/fixture trước lần kế tiếp. Review tồn thì giảm việc đang mở và chỉ định reviewer sớm. Nếu việc chờ hoặc mất ngữ cảnh lặp qua hai lát, thử một bộ điều phối trên chính các thẻ đó rồi so chi phí và chất lượng. |

**Thẻ code đầu tiên là N01 sau khi SA-01 được duyệt.** DevOps/BE hoàn thiện workspace còn thiếu và contract health. FE dùng client sinh để gọi API. QA nhận khi có thể dựng từ checkout sạch, chạy lint, typecheck, test và build, rồi chứng minh thay đổi contract thiếu regenerate làm CI báo lỗi. Từ N01, mở N02/N03/N05 theo phụ thuộc và quyết định SA tương ứng. Kết quả đối chứng của buổi US-13 được giữ để QA dùng lại khi đợt A đã có dữ liệu thật từ luồng mở kỳ, nộp và xét duyệt. [Thứ tự N01–N14 và đợt A](ke-hoach-implement-rms.md)
