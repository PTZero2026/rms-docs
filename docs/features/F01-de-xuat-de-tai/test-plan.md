---
title: "Đề xuất đề tài — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Đề xuất đề tài — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong `./spec.md`. Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt test:** FE (Portal chủ nhiệm/thành viên), BO (chuyên viên QL KHCN), API (domain service
  `proposal` — máy trạng thái & validate).
- **Môi trường:** môi trường test có SSO giả lập; CSDL có dữ liệu mẫu.
- **Dữ liệu mẫu:**
  - Kỳ `KG-2026-01` trạng thái `OPEN`, `startDate` ≤ hôm nay ≤ `endDate`, có `researchFieldIds` và
    `proposalTemplateId`.
  - Kỳ `KG-2025-12` trạng thái `CLOSED` / hết hạn (`endDate` < hôm nay).
  - Người dùng: CN1 (chủ nhiệm), TV1/TV2 (thành viên), CV1 (chuyên viên), KHACH (không quyền).
  - Đề xuất mẫu ở các trạng thái `DRAFT`, `SUBMITTED`.

## 2. Test cases

| ID    | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|-------|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | CN1 đăng nhập; kỳ `KG-2026-01` `OPEN` | Tạo đề xuất mới trong kỳ → lưu nháp | `ResearchProject` tạo ở `DRAFT`; `principalInvestigatorId`=CN1; có 1 `ProjectMember` `PRINCIPAL_INVESTIGATOR`; chưa có `projectCode` | Happy |
| TC-02 | AC-02 | Đề xuất `DRAFT` đủ trường bắt buộc; kỳ `OPEN` còn hạn | Nhấn Nộp ở FE-06 | Chuyển `SUBMITTED`; sinh `projectCode` unique; set `submittedAt`; hồ sơ khóa sửa; có bản ghi `RESEARCH_PROJECT.SUBMIT` trong `AuditLog` | Happy |
| TC-03 | AC-03 | Đề xuất `DRAFT` thuộc kỳ `KG-2025-12` đã hết hạn/`CLOSED` | Nhấn Nộp | Bị chặn; giữ `DRAFT`; thông báo "Đã hết hạn nộp của kỳ" | Biên/Lỗi |
| TC-04 | AC-04 | Đề xuất `DRAFT` thiếu ≥1 trường bắt buộc (vd bỏ trống `name` hoặc 1 trường bắt buộc của biểu mẫu) | Nhấn Nộp | Bị chặn; giữ `DRAFT`; liệt kê trường thiếu | Biên/Lỗi |
| TC-05 | AC-05 | Đề xuất ở `SUBMITTED` | CN1 cố sửa thuyết minh/thành viên/đính kèm | Form chỉ đọc; API sửa trả lỗi; thông báo phải được trả lại mới sửa được | Negative |
| TC-06 | AC-06 | KHACH đăng nhập; tồn tại đề xuất của CN1 | KHACH gọi API/đường dẫn mở-sửa-nộp đề xuất của CN1 | Bị từ chối 403; danh sách không hiển thị đề xuất ngoài phạm vi | Negative |
| TC-07 | AC-07 | CV1; đề xuất `SUBMITTED` trong kỳ còn hạn | BO-04: nhập `reason` → trả lại | Chuyển `DRAFT`; hồ sơ mở khóa; `reason` hiển thị cho CN1 ở FE-07; bản ghi `RESEARCH_PROJECT.RETURN_FOR_REVISION` | Happy |
| TC-08 | AC-08 | CV1; đề xuất `SUBMITTED` thuộc kỳ đã hết hạn | BO-04: cố trả lại bổ sung | Hành động bị chặn/vô hiệu; thông báo kỳ đã hết hạn | Biên/Lỗi |
| TC-09 | AC-09 | Đề xuất `DRAFT` đã có thành viên TV1 | FE-03: thêm lại đúng TV1 | Bị từ chối; thông báo "Thành viên đã có trong đề tài"; không tạo `ProjectMember` trùng | Negative |
| TC-10 | AC-10 | CV1; ≥2 đề xuất `SUBMITTED` hợp lệ trong kỳ | BO-05: chọn & Chốt danh sách | Danh sách đánh dấu sẵn sàng xét duyệt; bàn giao F03; F01 **không** tự đổi sang `UNDER_REVIEW` | Happy |
| TC-11 | AC-11 | Đề xuất từng `SUBMITTED` rồi bị trả về `DRAFT` (đã có `projectCode`) | CN1 sửa → nộp lại | `projectCode` **không** đổi; `submittedAt` cập nhật theo lần nộp mới; trạng thái `SUBMITTED` | Biên |
| TC-12 | AC-02 | Hai phiên nộp gần như đồng thời 2 đề xuất khác nhau trong cùng kỳ | Nộp song song | Hai `projectCode` khác nhau, không trùng (BR-07) | Biên |
| TC-13 | AC-04 | Đề xuất `DRAFT`, `requestedBudget` âm hoặc `durationMonths`=0 | Nhập & nộp | Validate chặn (BR-09); báo lỗi inline; không nộp được | Biên/Lỗi |
| TC-14 | AC-02 | Đề xuất `DRAFT`, chọn `researchFieldId` không thuộc `researchFieldIds` của kỳ | Nộp | Bị chặn (BR-03); thông báo lĩnh vực không hợp lệ với kỳ | Biên/Lỗi |
| TC-15 | AC-01 | Đề xuất `DRAFT` có file đính kèm | FE-05: tải lên rồi xóa file; lưu nháp | `Attachment` tạo/xóa đúng (`targetType='ResearchProject'`); giữ `DRAFT` | Happy |
| TC-16 | AC-06 | CV1 thuộc đơn vị/kỳ khác phạm vi | BO-01: lọc xem đề xuất ngoài phạm vi | Không thấy đề xuất ngoài phạm vi của CV1 | Negative |

## 3. Trường hợp biên & negative

- **Dữ liệu rỗng:** danh sách đề xuất trống (FE-01/BO-01); không có kỳ `OPEN` khi tạo mới; đề xuất
  chưa có thành viên/tài liệu.
- **Quá hạn:** nộp sau `endDate` (TC-03); trả lại bổ sung khi hết hạn (TC-08); đề xuất `DRAFT` còn
  treo khi kỳ `CLOSED`.
- **Trùng:** thành viên trùng (TC-09); `projectCode` trùng khi nộp đồng thời (TC-12).
- **Sai quyền:** không phải chủ nhiệm mở/sửa (TC-06); sửa sau khi nộp (TC-05); chuyên viên ngoài
  phạm vi (TC-16); người không có `RESEARCH_PROJECT.RETURN_FOR_REVISION`/`RESEARCH_PROJECT.FINALIZE` gọi API tương ứng → 403.
- **Giá trị không hợp lệ:** kinh phí âm, thời gian ≤ 0 (TC-13); lĩnh vực sai kỳ (TC-14); thiếu
  trường bắt buộc biểu mẫu (TC-04).
- **File:** upload vượt dung lượng/định dạng không hỗ trợ → báo lỗi, không tạo `Attachment`.
- **Mất kết nối:** lỗi mạng khi lưu nháp/nộp → không mất dữ liệu đã nhập; cho thử lại.

## 4. Checklist hồi quy

- **F02 (Kỳ nhận đề xuất):** đổi kỳ sang `CLOSED`/`CANCELLED` phải chặn nộp mới và trả lại (BR-01, BR-06).
- **F03 (Xét duyệt):** đề xuất đã chốt được F03 nhận đúng; sau khi `SUBMITTED` → `UNDER_REVIEW` thì
  F01 không cho trả lại/sửa.
- **B01 (Biểu mẫu/lĩnh vực):** thay biểu mẫu thuyết minh không vỡ `proposalDocument` jsonb đã nhập;
  thêm/ẩn lĩnh vực ảnh hưởng BR-03.
- **B03 (Phân quyền):** thay đổi quyền `RESEARCH_PROJECT.*` phản ánh đúng ở Permission matrix (BO).
- **Máy trạng thái `ResearchProject`:** không phát sinh chuyển trạng thái ngoài sơ đồ data-model §3; mọi
  chuyển ghi `AuditLog`.
- **Audit:** nộp/trả lại/chốt/hủy đều sinh bản ghi nhật ký đúng nội dung.
