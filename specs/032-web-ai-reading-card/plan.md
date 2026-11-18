---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Lập thẻ đọc cho một tài liệu có DOI

18/11/2026 · US-32 · F07 / `product` · [Spec](spec.md)

## Summary

Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không. Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. Chỉ điền thông tin thư mục, đánh dấu phần phương pháp và kết quả thiếu nguồn; người dùng kiểm trước khi dùng.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có. Đối chiếu trên bộ thử một DOI đã xác minh, một bản toàn văn được phép dùng và một trường hợp chỉ có metadata. Chỉ bật trợ lý cho tenant và nguồn đã được phép. Điều kiện tích hợp: F07, B03, P02.

### Xử lý tại module F07

Chỉ sinh trường nội dung từ toàn văn hợp lệ. Khi chỉ có metadata, điền thư mục và để trống nội dung thiếu căn cứ; không đưa thẻ nháp vào bảng sản phẩm được duyệt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Trợ lý chỉ tạo bản nháp hoặc gợi ý. | Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-32 là giả định có người phụ trách | [RV-32](../review-decisions.md#rv-32). Cổng phát hành gồm đối chiếu nguồn, quyền và dùng thử thủ công. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/product/ai-reading-card` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/product/ai-reading-card`. Hợp đồng tại `packages/api-contracts/product/ai-reading-card.yaml`. Kiểm tích hợp tại `e2e/product/ai-reading-card`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có → Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chỉ có metadata trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Chỉ điền thông tin thư mục, đánh dấu phần phương pháp và kết quả thiếu nguồn; người dùng kiểm trước khi dùng. | TC-03 |
