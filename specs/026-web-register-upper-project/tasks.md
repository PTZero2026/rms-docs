---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-24
---

# Tasks · Theo dõi đầu mục nhiệm vụ cấp trên

US-26 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu tenant bật F09, một loại nhiệm vụ và quy tắc minh chứng, thêm tài khoản ngoài tenant trong `e2e/upper-project/register-upper-project/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác theo dõi đầu mục nhiệm vụ cấp trên với đầu vào “Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ” và đầu ra “Đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung” trong `packages/api-contracts/upper-project/register-upper-project.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Theo dõi đầu mục nhiệm vụ cấp trên

Mục tiêu độc lập: Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-26.1 / US-26.2 và TC-04 trong `e2e/upper-project/register-upper-project/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `UpperProject.managingBodyItemId` khi đọc/ghi qua `apps/backend/src/modules/upper-project/register-upper-project/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/upper-project/register-upper-project/service.ts`. Lưu đầu mục độc lập với kỳ đề tài nội bộ. Ở bước duyệt, đọc quy tắc minh chứng theo cấp trong tenant và yêu cầu đúng loại tệp. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/upper-project/register-upper-project/view.tsx`. Hiển thị đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung; hiển thị riêng tình huống thiếu tệp bắt buộc ở bước duyệt và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-26 cho FR-003 trong `apps/backend/src/modules/upper-project/register-upper-project/service.ts` và kiểm TC-03 ở `e2e/upper-project/register-upper-project/boundary.spec.ts`. Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F09, B01. Lưu bằng chứng theo mẫu `e2e/upper-project/register-upper-project/review.md`. Đối chiếu thêm AC-01, AC-02 trong [F09](../../docs/features/F09-de-tai-cap-tren/spec.md) ở phần áp dụng cho lát này. Dùng cấp Bộ cần DECISION và một loại không yêu cầu tệp đó. So kết quả duyệt theo quy tắc của từng loại.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-26](../review-decisions.md#rv-26) để đối chiếu nhánh biên khi nghiệm thu.
