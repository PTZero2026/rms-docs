---
title: "Kế hoạch khởi động đội agent RMS"
status: Draft
updated: 2026-11-21
owner: "Tech lead và PO"
---

# Kế hoạch khởi động đội agent RMS

**Cuối buổi đầu, PO cần biết đội có bàn giao được một thẻ từ BA đến QA hay chưa.** Phép thử là giao thẻ báo cáo kỳ cho một phiên QA độc lập, kiểm tra xem QA có tìm được lỗi đếm trùng, trả đúng người sửa và xác nhận được bản sửa từ cùng bộ dữ liệu hay không.

Tech lead điều phối bằng các phiên agent hiện có và một biên bản Markdown cho mỗi lần chạy. Chín vai trò dùng chung phiếu bàn giao bên dưới. Thử trước trên **B02/US-13** trong 90 phút, sau đó đo lại trên một lát thứ hai trước khi mở rộng. Vai trò và quyền quyết định đã được mô tả trong [đề xuất tổ chức đội](../../guides/ke-hoach-team-agent-rms.md).

## 1. Chuẩn bị đội và đầu vào · phút 0–15

- [ ] **Tech lead** ghi người điều phối, PO người thật, reviewer độc lập, model sử dụng, trần chi và giờ bắt đầu. Khi chạy, tạo biên bản tại `docs/guides/pilot-agent/US-13-lan-01.md`. Tech lead là người ghi biên bản chung. Mỗi vai trò trả kết quả cho Tech lead bằng phiếu bên dưới.
- [ ] **PO** giao câu hỏi của Trưởng phòng KHCN và phạm vi kỳ K. Ghi RV-13 làm căn cứ. Các đề nghị đổi quy tắc đi về PO/BA. [Quyết định RV-13](../../../specs/review-decisions.md#rv-13)
- [ ] **DevOps** ghi mã commit bằng `git rev-parse HEAD`, kiểm tra thay đổi local bằng `git status --short` và lưu phiên bản thực tế của những tài liệu dùng trong buổi. Tất cả phiên dùng cùng đầu vào. Dữ liệu thử có hai tenant T1/T2, trong T1 có hai khoa A/B. [Bộ dữ liệu và bốn ca thử](../../../specs/013-web-call-report/quickstart.md)
- [ ] **Tech lead** mở hai phiên độc lập cho BA và QA/QC. Mỗi phiên đọc đúng nguồn, trả lời bằng bảng hoặc danh sách kiểm được. Dùng `subagent-driven-development` khi môi trường hỗ trợ giao phiên con. Khi điều phối bằng `executing-plans`, mở phiên reviewer riêng để giữ được phép thử bàn giao.

**Phiếu giao việc dùng chung**

| Khi giao | Khi nhận lại |
|---|---|
| Mã thẻ và vai trò, câu hỏi cần trả lời, nguồn và phiên bản, phạm vi được sửa, thời hạn, người nhận tiếp | Kết quả theo từng AC/TC, cách kiểm lại, căn cứ, phần chưa kiểm được, người chịu trách nhiệm bước kế tiếp |

## 2. Giao hai phiếu độc lập · phút 15–35

**Phiếu BA — gửi nguyên văn vào phiên thứ nhất**

> Bạn nhận thẻ B02/US-13. Đọc spec B02, RV-13, spec và tasks US-13. Lập bảng gồm quy tắc B02, AC của feature, task US-13, test case, kết quả người dùng quan sát được và người nhận việc. Nêu bằng chứng nào cần API thật. Gửi phiếu cho Tech lead trong 20 phút.

**Phiếu QA/QC — gửi nguyên văn vào phiên thứ hai**

> Bạn nhận cùng thẻ B02/US-13. Dùng test-plan B02 và quickstart US-13 để lập đáp án độc lập. Ghi các mã được thấy theo hai phạm vi quyền, trạng thái A2 trước và sau nộp lại, kết quả tải khi thu hẹp quyền, kết quả của người thuộc T2. Với mỗi ca, ghi cách phân biệt một kết quả sai và một kết quả đúng. Giao đáp án trước khi xem bảng của BA.

- [ ] **BA** giao bảng có đủ B02/AC-01, AC-02, AC-03. Chỉ ra chủ sở hữu phần đếm, phần hiển thị và phần nhận kết quả. [Spec nguồn B02](../../features/B02-bao-cao-thong-ke/spec.md) · [T001–T008 của US-13](../../../specs/013-web-call-report/tasks.md)
- [ ] **QA/QC** giao đáp án theo TC-01–04. Ghi riêng TC-04 của US-13 gắn với SC-002 về cách ly tenant. Tech lead lưu hai câu trả lời trước khi trao đổi chéo. [Test plan B02](../../features/B02-bao-cao-thong-ke/test-plan.md) · [Quickstart US-13](../../../specs/013-web-call-report/quickstart.md)

## 3. Kiểm tra bàn giao kỹ thuật và UI · phút 35–55

| Chủ thẻ → người nhận | Việc thực hiện | Bằng chứng cần nhận |
|---|---|---|
| SA → Dev BE, Dev FE | Khoanh ranh giới B02 → module `report`. Dùng contract hành vi làm đầu vào. Gói contract triển khai dự kiến là `packages/api-contracts/report/call-report.yaml`. | Hai phía thống nhất kỳ, phạm vi, thời điểm trích xuất, tổng, nhóm trạng thái và danh sách đối chứng. [Hợp đồng hành vi](../../../specs/013-web-call-report/contracts/interaction.md) |
| Dev BE → QA/QC | Bám T005/T007, mô tả thứ tự lọc kỳ và quyền, đếm theo mã, giữ bản chụp và kiểm lại quyền tải. | Một ví dụ bản chụp cũ/mới và danh sách assertion sẽ chạy ở API/DB khi có backend. |
| Design → Dev FE → Design | Dùng B02-01/02/03 để phác bảng và hành vi lọc, xem chi tiết, xuất. FE chú thích trạng thái kỳ rỗng và khi quyền tải bị thu hẹp. Design rà lại bản bàn giao, đối chiếu nhãn, focus và khả năng đọc trên màn hình hẹp. | Một bản phác có tổng, phạm vi và thời điểm. Design ghi nhận xét theo màn hình/AC. Khi có UI chạy được, lặp lại review trên màn hình thật. [Đặc tả UI B02](../../features/B02-bao-cao-thong-ke/ui.md) |
| Tech → SA | Xác định bằng chứng quyền theo tenant/đơn vị, nơi lấy p95 của báo cáo và dữ liệu cần cho phép đo. | Danh sách kiểm gắn N12/N13. Trạng thái các phép đo API, tải và quyền thực là “chờ môi trường tích hợp”. [Kế hoạch kiểm thử RMS](../../guides/kiem-thu-rms.md) |

## 4. Cho lỗi đi hết vòng sửa và retest · phút 55–75

- [ ] **Tech lead** đưa cho QA bản kết quả diễn tập v1 ghi toàn kỳ T1 có **4** hồ sơ do A1 được tính hai lần. Ghi rõ đây là lỗi cài vào bài tập.
- [ ] **QA/QC** mở lỗi `US13-DRILL-01` với seed, TC-01, kết quả v1, danh sách mã kỳ vọng và người sửa là Dev BE. **Dev BE** trả v2 kèm quy tắc đếm đã sửa. **Dev FE** đối chiếu tổng hiển thị với số dòng chi tiết.
- [ ] **QA/QC** retest v2 bằng đúng seed theo bảng dưới đây. **SA** rà ranh giới quyền và hợp đồng sau lượt kiểm nghiệp vụ. Tech lead ghi phiên bản, kết quả từng ca và phần phải chạy lại khi có API.

| Ca | Đối chiếu bắt buộc |
|---|---|
| TC-01 · toàn kỳ T1 | Tổng 3 gồm A1, A2, B1. A1 xuất hiện một lần. A2 còn mã nên được đếm ở nhóm Nháp. A3 chưa cấp mã nên nằm ngoài danh sách. |
| TC-02 · chuyên viên khoa A | Tổng 2 gồm A1, A2. Bộ lọc, tổng, chi tiết và tệp cùng phạm vi. Thu quyền trước khi tải thì dừng cấp tệp cũ và yêu cầu tạo lại theo quyền mới. |
| TC-03 · nộp lại A2 | Khi quyền giữ nguyên, bản chụp cũ và tệp cũ giữ A2 ở Nháp, cùng thời điểm. Bản mới ghi Đã nộp. Hai bản đều có tổng 3. |
| TC-04 · khác tenant | Người T2 có cùng vai trò mở tham chiếu T1. Kết quả chứa 0 hồ sơ riêng của T1 và dữ liệu T1 giữ nguyên. |

## 5. Quyết định sau buổi thử · phút 75–90

- [ ] **Reviewer** dùng phiếu và nguồn để tái lập kết quả. **PO** nhận buổi thử khi đủ 3/3 AC có ca đối chiếu, TC-04 có kết luận, lỗi mô phỏng có v1/v2 và bằng chứng retest, người nhận tự giải thích được số 3 và số 2. Mọi mục chưa xác minh được ghi tên người xử lý tiếp.
- [ ] **Tech lead** ghi thời gian toàn buổi, phút người phải can thiệp, số câu hỏi làm rõ, số vòng trả việc và chi phí model thực tế. Với thuê bao thiếu số tiền theo phiên, ghi mức sử dụng đo được và cơ sở ước tính. Giữ riêng chi phí ước tính và số đã thanh toán.
- [ ] **PO và Tech lead** ghi quyết định trong biên bản. Nếu sai số, thiếu ca quyền hoặc reviewer phải nhờ tác giả giải thích, sửa đúng phiếu gây nhầm rồi chạy lại. Nếu đạt, chuyển gói đầu vào sang phiên một agent để đối chứng độc lập.

## 6. Lịch sau pilot

| Mốc đề xuất | Việc giao | Điều kiện đi tiếp |
|---|---|---|
| Ngày làm việc kế tiếp | Tech lead giao cùng dữ liệu US-13 cho một agent, cùng model và giới hạn. Reviewer dùng cùng thang điểm. Chọn lát thứ hai là F02/US-05, mở kỳ nhận đề xuất, để lặp phép so giữa một agent và đội phân vai trên nghiệp vụ có thay đổi trạng thái. [US-05](../../../specs/005-web-open-call/spec.md) | Có số liệu của từng phương án trên cùng đầu bài. PO/Tech lead mở rộng khi chất lượng giữ được, công người giảm và chi phí trong trần đã ghi. |
| Thẻ code đầu tiên | Sau quyết định SA-01 của SA, Ops và chủ ngân sách, giao N01 cho DevOps/BE. FE gọi health bằng client sinh. QA dựng lại từ checkout sạch và thử thay đổi contract thiếu bước sinh lại. | CI chạy lint, typecheck, test, build. FE gọi được API thật. CI phát hiện client lệch contract. [SA-01](../../architecture/rms-v0-sa-review.md) · [Thẻ N01](../../guides/ke-hoach-implement-rms.md) |
| Đợt A | Mở các thẻ N02/N03/N05 theo phụ thuộc. Khi có luồng mở kỳ, nộp và xét duyệt, QA chạy lại US-13 trên bản tích hợp hai tenant. DevOps thu kết quả restore, Tech thu số đo thực, Trưởng phòng KHCN xác nhận danh sách đối chứng. | Nghiệm thu sản phẩm theo kế hoạch đợt A. Push và triển khai thực hiện theo yêu cầu rõ của chủ dự án. [Lịch bàn giao v0](../../guides/ke-hoach-implement-rms.md) |
