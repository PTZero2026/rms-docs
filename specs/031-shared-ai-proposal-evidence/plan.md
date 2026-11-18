---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Đối chiếu mục bắt buộc trong một thuyết minh

18/11/2026 · US-31 · F01 / `proposal` · [Spec](spec.md)

## Summary

Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu. Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot kiểm 50 hồ sơ, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu. Đối chiếu trên bộ thử một mẫu yêu cầu, hai đoạn đã gán nhãn, một hồ sơ ở tenant khác. Chỉ bật trợ lý cho tenant và nguồn đã được phép. Điều kiện tích hợp: F01, B03, P02.

### Xử lý tại module F01

Lọc tenant, quyền và quyền xử lý trước khi lấy văn bản. Lưu phiên bản nguồn, mô hình, mẫu lệnh và quyết định bác/dùng. Trả thiếu căn cứ khi không dẫn được đoạn phù hợp.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Trợ lý chỉ tạo bản nháp hoặc gợi ý. | Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-31 là giả định có người phụ trách | [RV-31](../review-decisions.md#rv-31). Cổng phát hành gồm đối chiếu nguồn, quyền và dùng thử thủ công. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/proposal/ai-proposal-evidence` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/proposal/ai-proposal-evidence`. Hợp đồng tại `packages/api-contracts/proposal/ai-proposal-evidence.yaml`. Kiểm tích hợp tại `e2e/proposal/ai-proposal-evidence`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu → Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh tài liệu ngoài quyền hoặc thiếu căn cứ trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot kiểm 50 hồ sơ, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa. | TC-03 |
