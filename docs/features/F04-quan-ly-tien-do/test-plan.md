---
title: "Quản lý tiến độ — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Quản lý tiến độ — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [spec.md](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo BA/PO.

## 1. Phạm vi kiểm thử

- Mặt: FE (Chủ nhiệm/Thành viên), BO (Chuyên viên), API (chuyển trạng thái, RBAC, data scoping), job nhắc hạn.
- Môi trường: staging; dữ liệu mẫu: 1 đề tài `APPROVED`, 1 đề tài `IN_PROGRESS` có 3 kỳ báo cáo, 1 đề tài `SUSPENDED`.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đề tài `APPROVED` | Chuyên viên giao đề tài | Đề tài `IN_PROGRESS`, có thông báo + audit | Happy |
| TC-02 | AC-02 | Đề tài `IN_PROGRESS` | Lập 3 kỳ với `period`/`dueDate` | Tạo 3 `ProgressReport` trạng thái `PENDING_SUBMISSION` | Happy |
| TC-03 | AC-03 | Kỳ `PENDING_SUBMISSION` | Chủ nhiệm nhập nội dung, đính kèm, nộp | Kỳ `SUBMITTED`, có `submittedAt`, chuyên viên được báo | Happy |
| TC-04 | AC-04 | Báo cáo `SUBMITTED` | Chuyên viên duyệt đạt | Báo cáo `PASSED`, chủ nhiệm được báo, audit | Happy |
| TC-05 | AC-05 | Báo cáo `SUBMITTED` | Chuyên viên yêu cầu sửa kèm nhận xét → chủ nhiệm nộp lại | `REVISION_REQUESTED` → `SUBMITTED` | Happy |
| TC-06 | AC-06 | Đề tài `IN_PROGRESS` | Tạm dừng kèm lý do, rồi tiếp tục | `SUSPENDED` → `IN_PROGRESS`, audit có lý do | Happy |
| TC-07 | AC-07 | Kỳ cuối `PASSED`, đủ sản phẩm cam kết | Chuyển chờ nghiệm thu | Đề tài `PENDING_ACCEPTANCE`, bàn giao F06 | Happy |
| TC-08 | AC-08 | Kỳ `PENDING_SUBMISSION` đã quá `dueDate` | Chủ nhiệm nộp | Nhận `SUBMITTED` + đánh dấu **trễ hạn** | Biên |
| TC-09 | AC-09 | Đề tài `SUSPENDED` | Chủ nhiệm cố nộp báo cáo | Chặn: "đề tài đang tạm dừng" | Biên/Lỗi |
| TC-10 | AC-10 | Báo cáo `SUBMITTED` | Yêu cầu chỉnh sửa, bỏ trống nhận xét | Chặn, không đổi trạng thái | Biên/Lỗi |
| TC-11 | AC-11 | Người không phải chủ nhiệm | Gọi API nộp báo cáo | 403, không thực hiện | Negative |
| TC-12 | AC-11 | Người không phải chuyên viên | Gọi API duyệt báo cáo | 403, không thực hiện | Negative |
| TC-13 | AC-12 | Kỳ cuối chưa `PASSED` | Chuyển chờ nghiệm thu | Chặn, nêu điều kiện thiếu, giữ `IN_PROGRESS` | Negative |
| TC-14 | AC-13 | Đề tài `SUSPENDED` | Lập kỳ báo cáo | Chặn (BR-02) | Negative |
| TC-15 | AC-13 | Đề tài `IN_PROGRESS` đã có kỳ 2 | Lập kỳ 2 lần nữa | Chặn trùng `period` (BR-07) | Negative |

## 3. Trường hợp biên & negative

- Nộp đúng thời khắc `dueDate` (ranh giới trễ/không trễ).
- Đính kèm vượt dung lượng / sai định dạng.
- Tiếp tục đề tài chưa từng tạm dừng (không hợp lệ).
- Mở lại báo cáo `PASSED` (BR-12) — quyền & ghi audit.
- Job nhắc hạn không gửi cho kỳ đã `PASSED` và đề tài `SUSPENDED` (BR-08).

## 4. Checklist hồi quy

- Vòng đời `ResearchProject` (F03 → F04 → F06) không bị nhảy trạng thái ngoài sơ đồ.
- Data scoping: chuyên viên chỉ thấy đề tài trong phạm vi; chủ nhiệm chỉ thấy đề tài của mình.
- Thông báo (B04) phát đúng sự kiện; audit ghi đủ.
- Đối chiếu "đủ sản phẩm cam kết" với F07 khi quy tắc BR-10 được chốt.
