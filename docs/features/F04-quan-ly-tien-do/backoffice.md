---
title: "Quản lý tiến độ — BackOffice (quản trị)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-05
---

# Quản lý tiến độ — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem [spec.md](./spec.md).

## 1. Vai trò sử dụng

- **Chuyên viên QL KHCN**: lập hồ sơ giao đề tài, xác nhận giao đề tài, lập lịch kỳ báo cáo, duyệt/yêu cầu
  chỉnh sửa báo cáo, tạm dừng/tiếp tục, chuyển sang chờ nghiệm thu. Thao tác trong phạm vi đơn vị/kỳ được
  phân (BR-11).
- **Quản trị hệ thống**: xem, không trực tiếp xử lý nghiệp vụ tiến độ.

## 2. Phân quyền (Permission matrix)

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:---:|:---:|
| Xem tiến độ đề tài & báo cáo | `PROGRESS.VIEW` | ✓ | ✓ |
| Lập/sửa hồ sơ giao đề tài nháp | `PROGRESS.ASSIGNMENT_DRAFT` | ✓ | – |
| Xác nhận giao đề tài (`APPROVED → IN_PROGRESS`) | `PROGRESS.ASSIGN_PROJECT` | ✓ | – |
| Lập/sửa lịch kỳ báo cáo | `PROGRESS.SCHEDULE_PERIOD` | ✓ | – |
| Duyệt báo cáo (`→ PASSED`) | `PROGRESS.APPROVE_REPORT` | ✓ | – |
| Yêu cầu chỉnh sửa báo cáo | `PROGRESS.REQUEST_REVISION` | ✓ | – |
| Tạm dừng / tiếp tục đề tài | `PROGRESS.SUSPEND` | ✓ | – |
| Chuyển sang chờ nghiệm thu | `PROGRESS.REQUEST_ACCEPTANCE` | ✓ | – |
| Mở lại báo cáo đã `PASSED` (ngoại lệ) | `PROGRESS.REOPEN_REPORT` | ✓ | – |

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách đề tài đang thực hiện | Lọc theo đơn vị/kỳ/trạng thái/đề tài trễ hạn; vào chi tiết |
| BO-02 | Giao đề tài & lập lịch báo cáo | Lập hồ sơ giao đề tài cho đề tài `APPROVED`, xác nhận giao, tạo các kỳ (`period`, `dueDate`) |
| BO-03 | Chi tiết tiến độ đề tài | Bảng kỳ báo cáo, duyệt/yêu cầu sửa, tạm dừng/tiếp tục, chuyển nghiệm thu |
| BO-04 | Duyệt báo cáo kỳ | Xem nội dung/đính kèm, duyệt đạt hoặc yêu cầu chỉnh sửa kèm nhận xét |

## 4. Mô tả màn hình & thao tác

- **BO-01:** danh sách phân trang server-side; bộ lọc trạng thái đề tài, **đề tài có báo cáo trễ hạn**,
  kỳ nhận đề xuất, đơn vị. Cột cảnh báo số kỳ quá hạn.
- **BO-02:** chọn đề tài `APPROVED` → lập **Hồ sơ giao đề tài** gồm `assignmentType`
  (`CONTRACT`/`DECISION`), `contractNo`/`decisionNo`, `signedAt`, `effectiveDate`, `startDate`, `endDate`,
  `approvedBudget`, `fundingSource`, file quyết định/hợp đồng đính kèm và `note` nếu khác hồ sơ đề xuất
  (BR-13, BR-15). Nút **Xác nhận giao đề tài** chỉ bật khi hồ sơ hợp lệ → `ProjectAssignment=EFFECTIVE`,
  `ResearchProject=IN_PROGRESS` (BR-01). Sau đó thêm các kỳ báo cáo: nhập `period` và `dueDate`; hệ thống
  chặn `period` trùng (BR-07) và chặn lập kỳ khi đề tài không `IN_PROGRESS` (BR-02).
- **BO-03:** banner trạng thái + lý do tạm dừng; bảng kỳ báo cáo với trạng thái & cờ trễ; nút **Tạm dừng**
  / **Tiếp tục** (bắt buộc nhập `reason`, BR-06); nút **Chuyển chờ nghiệm thu** chỉ bật khi kỳ cuối `PASSED` và
  đủ sản phẩm cam kết, nếu thiếu hiển thị rõ điều kiện còn thiếu (BR-10).
- **BO-04:** mở từ một báo cáo `SUBMITTED`; hai hành động: **Duyệt đạt** (`→ PASSED`) hoặc **Yêu cầu chỉnh sửa**
  (`→ REVISION_REQUESTED`, bắt buộc nhập `officerComment`, để trống → chặn, BR-05).

## 5. Audit & nhật ký

Ghi `AuditLog` cho: lập/sửa hồ sơ giao đề tài nháp, xác nhận giao đề tài, điều chỉnh căn cứ giao đề tài,
lập/sửa kỳ báo cáo, duyệt báo cáo, yêu cầu chỉnh sửa, tạm dừng/tiếp tục (kèm `reason`), chuyển chờ nghiệm
thu, mở lại báo cáo `PASSED`. Chuyên viên/quản trị xem được nhật ký theo phạm vi dữ liệu.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|---|---|
| BO-01 | AC-08 (lọc trễ hạn) |
| BO-02 | AC-01 (giao đề tài), AC-02 (lập kỳ), AC-13 (chặn sai trạng thái/trùng kỳ), AC-14 (thiếu căn cứ), AC-15 (điều chỉnh khác hồ sơ đề xuất) |
| BO-03 | AC-06 (tạm dừng/tiếp tục), AC-07 (chuyển nghiệm thu), AC-12 (chặn khi kỳ cuối chưa đạt) |
| BO-04 | AC-04 (duyệt đạt), AC-05 (yêu cầu sửa), AC-10 (chặn yêu cầu sửa thiếu nhận xét), AC-11 (sai quyền) |
