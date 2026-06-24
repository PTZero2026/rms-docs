---
title: "Danh sách tính năng & checklist rà soát tài liệu"
status: Draft
updated: 2026-06-11
---

# Danh sách tính năng RMS

> File này là mục lục và checklist rà soát toàn bộ tài liệu trong `docs/features/`.
> Nguồn sự thật nghiệp vụ của từng feature vẫn là `spec.md` trong thư mục tương ứng.

> Đánh giá độ chín hiện tại (bản chụp mốc): [REVIEW.md](REVIEW.md). Mỗi feature thuộc một **Epic** (E0–E3,
> xem §2) — định nghĩa Epic chi tiết ở thư mục `docs/epics/`.

## 1. Cách sử dụng

### Cấu trúc & chủ sở hữu mỗi feature

Mỗi feature gồm các file sau, **mỗi file một chủ** để rạch ròi trách nhiệm:

| File | Nội dung | Chủ sở hữu | Ngôn ngữ |
|------|----------|------------|----------|
| `spec.md` | *Cái gì & tại sao*: luật nghiệp vụ, tiêu chí nghiệm thu | **PO/BA** (duyệt) | Nghiệp vụ |
| `design.md` | *Làm thế nào*: mô hình dữ liệu, ràng buộc kỹ thuật, API | **DEV (BE)** | Kỹ thuật |
| `ui.md` | Màn hình, phân quyền hiển thị | BA/Designer | Hỗn hợp |
| `test-plan.md` | Test case bám AC | QA/Test | Hỗn hợp |

Cây cầu giữa nghiệp vụ và kỹ thuật là **mã `BR-xx`/`AC-xx`** trong `spec.md`: `design.md` mở đầu bằng
**bảng truy vết** trỏ ngược từng mã về cách hiện thực. PO không cần đọc chi tiết kỹ thuật — chỉ soát bảng
truy vết để chắc mọi luật/AC đều có người làm.

> **Mẫu tham khảo:** [B03](B03-quan-ly-nguoi-dung/) và [F01](F01-de-xuat-de-tai/) đã tách `spec.md` ↔
> `design.md` theo quy ước này. Template ở [`../templates/`](../templates/).

### Thứ tự rà

Rà theo thứ tự `spec.md` → `ui.md` → `test-plan.md` (và `design.md` cho phần kỹ thuật), sau đó kiểm tra
tài liệu kiến trúc và sản phẩm liên quan. Chỉ đánh dấu hoàn thành khi:

- Phạm vi, luồng nghiệp vụ, business rules, dữ liệu và acceptance criteria đã thống nhất.
- Màn hình, quyền và thao tác trong `ui.md` truy ngược được về business rule/AC.
- Mỗi AC quan trọng có test case tương ứng; có trường hợp sai quyền, dữ liệu biên và hồi quy.
- Thuật ngữ, trạng thái, thực thể và phụ thuộc không mâu thuẫn với tài liệu dùng chung.
- Các câu hỏi mở đã được giải đáp hoặc ghi rõ owner và quyết định cần chốt.

Quy ước tiến độ:

- `[ ]` Chưa rà.
- `[x]` Đã rà và không còn điểm mở chặn phê duyệt.
- Nếu đang rà hoặc còn điểm mở, giữ `[ ]` và ghi chú ngay dưới feature.

## 2. Tổng quan feature

| Mã | Epic | Tính năng | Module backend | Mặt dùng | Giai đoạn | Hiện trạng tài liệu |
|---|:--:|---|---|---|---|---|
| F01 | E1 | [Đề xuất đề tài](F01-de-xuat-de-tai/) | `proposal` | FE, BO, công khai một phần | Now | Đã có nội dung; **đã tách spec↔design (mẫu)** |
| F02 | E1 | [Kỳ nhận đề xuất](F02-dot-keu-goi/) | `call` | FE, BO | Now | Đã có nội dung |
| F03 | E1 | [Xét duyệt hội đồng](F03-xet-duyet-hoi-dong/) | `review` | FE, BO | Now | Đã có nội dung; cần bổ sung đạo đức & cuộc họp |
| F04 | E2 | [Quản lý tiến độ](F04-quan-ly-tien-do/) | `progress` | FE, BO | Next | Đã có nội dung |
| F05 | E2 | [Quản lý kinh phí](F05-quan-ly-kinh-phi/) | `budget` | FE, BO | Next | Đã có nội dung + prototype |
| F06 | E2 | [Nghiệm thu](F06-nghiem-thu/) | `acceptance` | FE, BO | Next | Spec/UI có nội dung; test plan còn khung |
| F07 | E3 | [Sản phẩm khoa học](F07-san-pham-khoa-hoc/) | `product` | FE, BO, công khai một phần | Later | Còn khung mẫu |
| F08 | E3 | [Lý lịch khoa học](F08-ly-lich-khoa-hoc/) | `profile` | FE, BO | Later | Còn khung mẫu |
| B01 | E0 | [Danh mục & cấu hình](B01-danh-muc-cau-hinh/) | `catalog` | BO | Now | Đã có nội dung |
| B02 | E3 | [Báo cáo & thống kê](B02-bao-cao-thong-ke/) | `report` | BO | Later | Còn khung mẫu |
| B03 | E0 | [Quản lý người dùng](B03-quan-ly-nguoi-dung/) | `iam` | BO | Now | Đã có nội dung; **đã tách spec↔design (mẫu)** |
| B04 | E0 | [Thông báo](B04-thong-bao/) | `notification` | FE, BO | Xuyên suốt | Đã có nội dung |
| P01 | E0 | [Workflow engine](P01-workflow-engine/) | workflow (kernel) | BE/nền tảng | Now | Spec nền (tech) từ ADR-0007 |
| P02 | E0 | [Audit](P02-audit/) | `audit` | BE/xuyên suốt | Xuyên suốt | Spec nền (tech) từ ADR-0010 + §4.4 |
| P03 | E4 | [Quy đổi giờ giảng](P03-quy-doi-gio-giang/) | `teaching-hour` | BE/xuyên suốt | Later (optional) | **Năng lực optional** — spec khởi tạo, chờ chốt công thức |
| F09 | E4 | [Đề tài cấp trên](F09-de-tai-cap-tren/) | `upper-project` | FE, BO | Later (optional) | Quản lý đầu mục, spec khởi tạo |
| F10 | E4 | [Đề tài sinh viên](F10-de-tai-sinh-vien/) | `student-project` | FE, BO | Later (optional) | Phạm vi vòng đời chờ chốt |
| F11 | E4 | [Dự án phục vụ sản xuất](F11-du-an-phuc-vu-san-xuat/) | `applied-project` | FE, BO | Later (optional) | Spec khởi tạo |
| F12 | E4 | [Hoạt động khoa học & minh chứng](F12-hoat-dong-khoa-hoc/) | `activity` | FE, BO | Later (optional) | Gộp hội nghị/cộng đồng/SHTT |

> **Epic:** E0 Nền tảng · E1 Tiếp nhận & Xét duyệt · E2 Thực hiện & Nghiệm thu · E3 Đầu ra, Lý lịch & Báo cáo ·
> **E4 Hoạt động khoa học mở rộng & Quy đổi giờ giảng** — *năng lực optional bật/tắt per-tenant* ([ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md));
> lần đầu kích hoạt cho ĐH Thủy Lợi (*Draft*). Định nghĩa Epic ở thư mục `docs/epics/`.

## 3. Danh sách capability cần rà

### F01 — Đề xuất đề tài

- Tạo và lưu nháp đề xuất trong kỳ đang mở.
- Điền thuyết minh theo biểu mẫu của kỳ.
- Quản lý thành viên, dự toán kinh phí và tài liệu đính kèm.
- Nộp hồ sơ, sinh mã đề tài và ghi nhận thời điểm nộp.
- Chuyên viên tiếp nhận, kiểm tra, trả lại bổ sung và chốt danh sách xét duyệt.

### F02 — Kỳ nhận đề xuất

- Tạo/sửa kỳ, thời gian nhận, lĩnh vực, biểu mẫu và bộ tiêu chí.
- Mở, đóng, gia hạn và hủy kỳ theo điều kiện.
- Tự động đóng kỳ khi hết hạn.
- Công bố kỳ đang mở cho nhà khoa học.
- Theo dõi số lượng đề xuất theo kỳ.

### F03 — Xét duyệt hội đồng

- Quản lý hội đồng khoa học và phân công thành viên.
- Quản lý hội đồng đạo đức, thẩm định song song với xét duyệt khoa học.
- Mở và theo dõi đợt đánh giá cho đề tài.
- Thành viên hội đồng chấm điểm, nhận xét và gửi phiếu.
- Tổng hợp điểm, kiểm tra đủ phiếu và kết luận chấp nhận/từ chối.
- Lập lịch họp, quản lý thành phần, biên bản và quyết nghị phê duyệt đề cương.
- Công bố tiến trình/kết quả theo phạm vi được phép và gửi thông báo.

### F04 — Quản lý tiến độ

- Giao đề tài chính thức bằng quyết định/hợp đồng.
- Lập lịch báo cáo tiến độ theo kỳ.
- Chủ nhiệm nộp, nộp lại và đính kèm báo cáo.
- Chuyên viên duyệt hoặc yêu cầu chỉnh sửa.
- Nhắc hạn, đánh dấu trễ hạn và theo dõi tổng quan tiến độ.
- Tạm dừng, tiếp tục đề tài và chuyển sang chờ nghiệm thu.

### F05 — Quản lý kinh phí

- Lập khoán/dự toán kinh phí theo khoản mục và cơ chế quyết toán.
- Quản lý kế hoạch và các đợt cấp kinh phí.
- Ghi nhận giao dịch cấp/chi, chứng từ và giải trình.
- Theo dõi dự toán so với thực chi.
- Đối soát qua API tài chính hoặc file CSV/Excel dự phòng.
- Xử lý chênh lệch, quyết toán và đóng đề tài sau nghiệm thu.

### F06 — Nghiệm thu

- Chủ nhiệm đăng ký nghiệm thu và nộp hồ sơ cuối.
- Lập hội đồng nghiệm thu, phân công thành viên và mở đợt đánh giá.
- Lập lịch họp nghiệm thu, quản lý thành phần, biên bản và quyết nghị.
- Thành viên hội đồng chấm điểm và gửi phiếu.
- Tổng hợp điểm và kết luận đạt/không đạt.
- Cho phép làm lại có thời hạn khi không đạt.
- Phối hợp F05 để quyết toán và hoàn thành đề tài.

### F07 — Sản phẩm khoa học

> Danh sách sơ bộ từ roadmap/glossary; cần hoàn thiện trong spec.

- Kê khai sản phẩm khoa học theo loại sản phẩm.
- Gắn sản phẩm với đề tài nguồn và tác giả/thành viên.
- Nộp minh chứng và thông tin công bố.
- Chuyên viên kiểm tra, duyệt hoặc từ chối sản phẩm.
- Quản lý trạng thái công khai và hiển thị sản phẩm đã công bố ở cổng public.

### F08 — Lý lịch khoa học

> Danh sách sơ bộ từ roadmap/glossary; cần hoàn thiện trong spec.

- Quản lý thông tin hồ sơ khoa học của người dùng.
- Quản lý học vị, chức danh, đơn vị, lĩnh vực và chuyên môn.
- Tổng hợp đề tài tham gia và vai trò trong đề tài.
- Tổng hợp sản phẩm khoa học và thành tích nghiên cứu.
- Kiểm soát quyền xem/chỉnh sửa và phạm vi thông tin được công khai.

### B01 — Danh mục & cấu hình

- Quản lý cây đơn vị và cây lĩnh vực/chuyên ngành.
- Quản lý loại sản phẩm và các danh mục lookup dùng chung.
- Quản lý tham số hệ thống.
- Quản lý bộ tiêu chí xét duyệt/nghiệm thu.
- Quản lý mẫu biểu thuyết minh.
- Vô hiệu hóa/xóa mềm, kiểm tra tham chiếu và ghi audit.

### B02 — Báo cáo & thống kê

> Danh sách sơ bộ từ roadmap/migration coverage; cần hoàn thiện trong spec.

- Dashboard tổng quan theo quyền và phạm vi dữ liệu.
- Báo cáo đề xuất, xét duyệt, tiến độ, kinh phí, nghiệm thu và sản phẩm.
- Bộ lọc theo thời gian, đơn vị, lĩnh vực, trạng thái và kỳ nhận đề xuất.
- Drill-down từ số liệu tổng hợp về danh sách chi tiết.
- Xuất báo cáo Excel và kiểm soát dữ liệu nhạy cảm.

### B03 — Quản lý người dùng

- Tạo tài khoản nội bộ và auto-provision khi đăng nhập email-OTP lần đầu.
- Quản lý trạng thái tài khoản: kích hoạt, khóa, mở khóa, vô hiệu.
- Quản lý vai trò và quyền nguyên tử `MODULE.ACTION`.
- Gán/gỡ vai trò cho người dùng; nâng/hạ quyền nghiệp vụ.
- Kiểm tra quyền tại backend và áp dụng data scoping.
- Quản lý chính sách OTP và audit hành động người dùng/phân quyền.

### B04 — Thông báo

- Tiếp nhận sự kiện nghiệp vụ và phân giải người nhận.
- Gửi thông báo in-app, email và SMS theo cấu hình.
- Quản lý hàng đợi, retry, lỗi và gửi lại.
- Trung tâm thông báo, trạng thái đã đọc và điều hướng đến nghiệp vụ nguồn.
- Quản lý tùy chọn nhận thông báo của người dùng.
- Quản lý mẫu, ma trận sự kiện-kênh và nhật ký gửi.

### P01 — Workflow engine *(Platform)*

> Spec nền do Kiến trúc/DEV sở hữu; nguồn [ADR-0007](../architecture/decisions/0007-workflow-engine-dong-per-tenant.md).

- Vòng đời `ResearchProject` cấu hình động per-tenant theo mô hình 3 tầng.
- `statusSemantic` chuẩn hoá để báo cáo & business rule chạy xuyên tổ chức.
- Versioning instance; validate graph khi kích hoạt; ghi lịch sử chuyển bước.
- Dependency cứng của F01–F06.

### P02 — Audit *(Platform)*

> Spec nền do Kiến trúc/DEV sở hữu; nguồn [AGENTS.md §4.4](../../AGENTS.md) + [ADR-0010](../architecture/decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md).

- Ghi `AuditLog` append-only cho mọi hành động đổi trạng thái nghiệp vụ.
- Mô hình actor mở rộng (`HUMAN`/`SYSTEM`/`AI_AGENT`) + `onBehalfOf`.
- Ghi cùng transaction với thay đổi; xem nhật ký theo quyền & tenant.
- Dependency cứng của mọi feature đổi trạng thái.

## 4. Checklist rà soát theo feature

| Mã | Epic | spec | design | ui | test-plan | BR/AC | Sẵn sàng SDD | Đã rà |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| F01 | E1 | ✅ | ✅ | ✅ | ✅ | 11/11 | 🟢 | [ ] |
| F02 | E1 | ✅ | – | ✅ | ✅ | 8/8 | 🟡 | [ ] |
| F03 | E1 | ✅ | – | ✅ | ✅ | 11/10 | 🟡 | [ ] |
| F04 | E2 | ✅ | – | ✅ | ✅ | 15/15 | 🟡 | [ ] |
| F05 | E2 | ✅ | – | ✅ | ✅ | 14/16 | 🟡 | [ ] |
| F06 | E2 | ✅ | – | ✅ | 🔴 | 12/12 | 🟠 | [ ] |
| F07 | E3 | 🔴 | – | 🟡 | 🔴 | 1/2 | 🔴 | [ ] |
| F08 | E3 | 🔴 | – | 🟡 | 🔴 | 1/2 | 🔴 | [ ] |
| B01 | E0 | ✅ | – | ✅ | ✅ | 13/14 | 🟡 | [ ] |
| B02 | E3 | 🔴 | – | 🔴 | 🔴 | 1/2 | 🔴 | [ ] |
| B03 | E0 | ✅ | ✅ | ✅ | ✅ | 11/12 | 🟢 | [ ] |
| B04 | E0 | ✅ | – | ✅ | ✅ | 10/10 | 🟡 | [ ] |
| P01 | E0 | ✅ | – | – | 🔴 | 9/8 | 🟡 | [ ] |
| P02 | E0 | ✅ | – | – | 🔴 | 7/5 | 🟡 | [ ] |
| P03 | E4 | 🟡 | – | 🔴 | 🔴 | 6/5 | 🔴 | [ ] |
| F09 | E4 | 🟡 | – | 🔴 | 🔴 | 3/3 | 🔴 | [ ] |
| F10 | E4 | 🟡 | – | 🔴 | 🔴 | 3/3 | 🔴 | [ ] |
| F11 | E4 | 🟡 | – | 🔴 | 🔴 | 3/3 | 🔴 | [ ] |
| F12 | E4 | 🟡 | – | 🔴 | 🔴 | 4/4 | 🔴 | [ ] |

> **E4 (mới — ĐH Thủy Lợi):** spec đã có **bối cảnh/phạm vi/luồng + BR/AC khởi tạo**, nhưng còn nhiều
> **điểm chặn cần chốt với Trường** (công thức giờ giảng, phạm vi vòng đời đề tài SV, link đề tài↔bài báo,
> phạm vi kinh phí) nên Sẵn sàng SDD = 🔴. ui/test-plan mới ở mức khung. Xem [E4](../epics/E4-hoat-dong-mo-rong.md).

> **Cột độ chín** (`spec/design/ui/test-plan`): ✅ đầy đủ · 🟡 một phần · 🔴 khung mẫu · `–` chưa tách.
> **BR/AC**: số mã `BR-xx`/`AC-xx` duy nhất trong `spec.md`. **Sẵn sàng SDD**: 🟢 sẵn sàng · 🟡 gần sẵn sàng
> (thiếu `design.md`) · 🟠 gần đủ nhưng test-plan còn khung · 🔴 chưa sẵn sàng (spec khung mẫu).
> **Đã rà**: đánh `[x]` khi đã rà soát & hết điểm mở chặn duyệt (gồm đối chiếu kiến trúc & tài liệu dùng chung).
> Trạng thái độ chín lấy từ [REVIEW.md](REVIEW.md) (2026-06-12); cập nhật khi tài liệu thay đổi.

Tài liệu dùng chung cần đối chiếu:

- [Roadmap](../product/roadmap.md), [Vision](../product/vision.md), [Personas](../product/personas.md)
  và [Glossary](../product/glossary.md).
- [Architecture overview](../architecture/overview.md), [Data model](../architecture/data-model.md),
  [Integrations](../architecture/integrations.md) và [Migration coverage](../architecture/migration-coverage.md).
- Các ADR liên quan đến hội đồng, tài chính, RBAC, workflow, Keycloak và một web app.

## 5. Hạng mục xuyên suốt/chưa có mã feature riêng

Các mục dưới đây phải được rà trong nhiều feature, không tự tạo module nghiệp vụ mới nếu chưa có quyết định:

- **Audit** ([P02](P02-audit/)): mọi hành động đổi trạng thái nghiệp vụ phải ghi `AuditLog` append-only.
- **Workflow đề tài** ([P01](P01-workflow-engine/)): mọi chuyển trạng thái `ResearchProject` đi qua domain service dùng chung.
- **Multi-tenant & RBAC:** backend kiểm tra tenant, quyền và phạm vi dữ liệu cho mọi API.
- **Tệp đính kèm:** quyền tải/xem file phải bám quyền của thực thể nghiệp vụ nguồn.
- **Thời gian & tiền:** lưu UTC, hiển thị Asia/Ho_Chi_Minh; ngày `dd/MM/yyyy`; tiền VND.
- **Cổng công khai:** đang nằm trong roadmap Later, chưa có mã feature riêng; chỉ công khai dữ liệu được phép.
- **Cuộc họp hội đồng:** mô hình dùng chung do F03 định nghĩa, F06 tái sử dụng.

## 6. Thứ tự rà soát đề xuất

1. **Nền tảng (E0):** B03 → B01 → P01 → P02 → B04.
2. **Đầu vòng đời (E1):** F02 → F01 → F03.
3. **Thực hiện đề tài (E2):** F04 → F05 → F06.
4. **Đầu ra & phân tích (E3):** F07 → F08 → B02.
5. **Mở rộng (E4 — sau khi chốt phạm vi với Trường):** P03 → F12 → F09 → F11 → F10.
6. **Rà xuyên suốt:** workflow, audit, RBAC, data model, tích hợp và cổng công khai.

## 7. Khoảng trống đã nhận diện

- B02, F07 và F08 hiện còn khung mẫu ở cả `spec.md`, `ui.md`, `test-plan.md`.
- F06 đã có spec/UI nhưng `test-plan.md` còn khung mẫu.
- F03 cần cập nhật đầy đủ phê duyệt đạo đức song song và mô hình cuộc họp/biên bản theo roadmap.
- F06 cần đồng bộ phần cuộc họp nghiệm thu dùng chung từ F03.
- Cổng công khai chưa có mã feature riêng; cần quyết định tách feature nếu phạm vi tiếp tục mở rộng.
- F03 có AC (10) ít hơn BR (11) — soát lại BR nào chưa có AC phủ. (B01 BR=13/AC=14 là bình thường, không phải lỗi.)

### Khoảng trống mới từ khảo sát ĐH Thủy Lợi (Epic E4 — chờ chốt với Trường)

- **Quy đổi giờ giảng (P03)** — trục xuyên suốt của Trường, **trước đây không có** trong mọi feature/ADR;
  spec khởi tạo nhưng **công thức quy đổi cần Trường cung cấp** (chặn).
- **F09–F12** (đề tài cấp trên, đề tài SV, dự án phục vụ sản xuất, hoạt động khoa học & minh chứng) —
  spec khởi tạo, chờ chốt phạm vi (đặc biệt vòng đời đề tài SV; phạm vi kinh phí hoạt động).
- **Công bố/bài báo & SHTT:** build-out [F07](F07-san-pham-khoa-hoc/) cho 2 luồng (độc lập/thuộc đề tài)
  + phê duyệt & cấp kinh phí + **link tự động đề tài↔bài báo**; build-out [F08](F08-ly-lich-khoa-hoc/)
  (tự tổng hợp + trích template + ký xác nhận).
- **Kỹ thuật/kiến trúc cần quyết định:** **SSO Microsoft Entra ID** (cần ADR mới, khác ADR-0008 Keycloak
  email-OTP); **đồng bộ GV/SV** theo cơ chế xác nhận (bổ sung `integrations.md`); **số hóa dữ liệu cũ 5 năm**
  (khác việc migrate code repo cũ ở `migration-coverage.md`).

## Changelog

| Ngày | Trạng thái | Thay đổi |
|---|---|---|
| 2026-06-11 | Draft | Tạo danh sách 12 feature, capability chính, checklist rà soát và khoảng trống tài liệu ban đầu. |
| 2026-06-11 | Draft | Thêm quy ước tách `spec.md` (nghiệp vụ, PO/BA) ↔ `design.md` (kỹ thuật, DEV); làm mẫu trên F01 và B03; thêm cột `design.md` vào checklist; thêm template `design.md`. |
| 2026-06-12 | Draft | Thêm lớp **Epic** (E0–E3): cột Epic ở §2, nhãn Epic ở §6, field `epic:` trong frontmatter 12 spec. Nâng §4 thành checklist sẵn-sàng-SDD (độ chín spec/design/ui/test + BR/AC + mức sẵn sàng); số liệu từ [REVIEW.md](REVIEW.md). |
| 2026-06-12 | Draft | Nâng năng lực nền **Workflow engine** & **Audit** thành spec riêng [P01](P01-workflow-engine/)/[P02](P02-audit/) (Platform, tech-led) bám ADR-0007/0010; thêm vào E0 & bản đồ Epic; đăng ký P-series ở [AGENTS.md §3](../../AGENTS.md). |
| 2026-06-24 | Draft | Thêm **Epic E4** (khảo sát ĐH Thủy Lợi): 5 feature mới **P03/F09/F10/F11/F12** (skeleton spec+ui+test-plan), đăng ký ở §2/§4/§6/§7; ghi nhận khoảng trống giờ giảng, SSO Microsoft, đồng bộ GV-SV, số hóa 5 năm. |
