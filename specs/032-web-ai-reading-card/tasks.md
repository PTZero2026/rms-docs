---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-24
---

# Tasks · Lập thẻ đọc cho một tài liệu có DOI

US-32 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu một DOI đã xác minh, một bản toàn văn được phép dùng và một trường hợp chỉ có metadata, thêm tài khoản ngoài tenant trong `e2e/product/ai-reading-card/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác lập thẻ đọc cho một tài liệu có doi với đầu vào “DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có” và đầu ra “Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ” trong `packages/api-contracts/product/ai-reading-card.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Lập thẻ đọc cho một tài liệu có DOI

Mục tiêu độc lập: Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-32.1 / US-32.2 và TC-04 trong `e2e/product/ai-reading-card/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `AiSuggestion.sources` khi đọc/ghi qua `apps/backend/src/modules/product/ai-reading-card/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/product/ai-reading-card/service.ts`. Chỉ sinh trường nội dung từ toàn văn hợp lệ. Khi chỉ có thông tin thư mục, điền các trường được phép. Hiển thị “chưa đủ căn cứ” ở phương pháp và kết quả. Thẻ giữ trạng thái nháp. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/product/ai-reading-card/view.tsx`. Hiển thị thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ; hiển thị riêng tình huống chỉ có metadata và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-32 cho FR-003 trong `apps/backend/src/modules/product/ai-reading-card/service.ts` và kiểm TC-03 ở `e2e/product/ai-reading-card/boundary.spec.ts`. Khi chỉ có quyền dùng thông tin thư mục, trợ lý chỉ điền tên bài, tác giả, năm và DOI theo dữ liệu được phép. Cả phương pháp và kết quả ghi “chưa đủ căn cứ”. Nhà nghiên cứu kiểm thẻ nháp trước khi quyết định dùng hoặc bỏ.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F07, B03, P02. Lưu bằng chứng theo mẫu `e2e/product/ai-reading-card/review.md`. Đối chiếu F07/AC-14 trên fixture được phép và lưu bằng chứng cho PO/BA. Người đọc mở lại từng vị trí dẫn trên tài liệu được phép, bác một trường sai và kiểm hồ sơ sản phẩm không đổi. Khi quyền toàn văn hết, kiểm cả lần mở thẻ cũ.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Chỉ mở pilot AI sau khi chủ dữ liệu duyệt bằng chứng nguồn và quyền.
