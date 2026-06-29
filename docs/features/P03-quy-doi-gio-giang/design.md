---
title: "Quy đổi giờ giảng — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "<DEV/Architect>"
status: Draft
updated: 2026-06-29
---

# Quy đổi giờ giảng — Thiết kế kỹ thuật

> Thiết kế đích cho module `teaching-hour` ở repo code tương lai. Spec nghiệp vụ là
> [`spec.md`](./spec.md); file này chỉ mô tả cách hiện thực và truy vết BR/AC.

## 1. Ranh giới module

- **P03 sở hữu:** công thức/định mức quy đổi, chọn công thức hiệu lực, tính giờ, phân bổ, idempotency, bản
  ghi giờ giảng, điều chỉnh/tính lại hồi tố.
- **B01 cung cấp:** danh mục/kỳ lịch nền (`ACADEMIC_YEAR`, `FISCAL_YEAR`, loại hoạt động/cấp loại nếu cần).
- **Feature nguồn (F07/F09/F10/F11/F12):** phát yêu cầu quy đổi với `sourceType`, `sourceId`, `eventKey`,
  `sourceOccurredAt`, loại hoạt động, người tham gia/vai trò/tỉ lệ.
- **F08/B02 đọc:** bản ghi giờ giảng đã chuẩn hóa theo `recognitionPeriodType` và `recognitionPeriodCode`.

## 2. Mô hình dữ liệu đích

| Thực thể | Trường chính | Ghi chú |
|---|---|---|
| `TeachingHourFormula` | `activityType`, `scope`, `role`, `periodType`, `validFrom`, `validTo`, `formulaParams`, `allocationRule`, `status` | Version công thức; không cho chồng lấn hiệu lực cùng phạm vi |
| `TeachingHourRequest` | `sourceType`, `sourceId`, `eventKey`, `sourceOccurredAt`, `payloadHash`, `status` | Khóa idempotent từ nguồn |
| `TeachingHourRecord` | `userId`, `sourceType`, `sourceId`, `eventKey`, `role`, `hours`, `recognitionPeriodType`, `recognitionPeriodCode`, `formulaId`, `status` | Dữ liệu cho F08/B02 |
| `TeachingHourAdjustment` | `recordId`, `deltaHours` hoặc `newHours`, `reason`, `createdBy` | Điều chỉnh append-only, ghi `AuditLog` |

> Các thực thể trên cần bổ sung vào `data-model.md` khi bước sang thiết kế chi tiết/triển khai.

## 3. Luồng xử lý

1. Nhận yêu cầu quy đổi từ feature nguồn.
2. Kiểm idempotent theo (`tenantId`, `sourceType`, `sourceId`, `eventKey`).
3. Xác định `periodType` theo cấu hình tenant (`VP-TH-PERIOD`) và tìm `recognitionPeriodCode` từ lịch B01.
4. Chọn `TeachingHourFormula` theo `activityType`/vai trò/phạm vi/`periodType` và `sourceOccurredAt`.
5. Tính tổng giờ, phân bổ theo vai trò/tỉ lệ, tạo `TeachingHourRecord`.
6. Ghi audit cho tạo mới, điều chỉnh, tính lại hồi tố.

## 4. Truy vết BR/AC

| BR/AC | Cách hiện thực |
|---|---|
| BR-01 / AC-01 | Chỉ module P03 có bảng `TeachingHourFormula`; feature nguồn chỉ gửi request |
| BR-02 / AC-02, AC-03 | `periodType` chọn từ cấu hình tenant, mặc định `ACADEMIC_YEAR` |
| BR-03 / AC-01 | Query công thức bằng `sourceOccurredAt` trong `validFrom`/`validTo` |
| BR-04 / AC-02, AC-03, AC-09 | Suy ra và lưu `recognitionPeriodType/code` trên từng bản ghi |
| BR-05 / AC-04 | `allocationRule` tính theo vai trò/tỉ lệ đóng góp |
| BR-06 / AC-05 | Source feature chỉ gọi P03 khi trạng thái hợp lệ; P03 vẫn validate payload tối thiểu |
| BR-07 / AC-06 | Điều chỉnh tạo `TeachingHourAdjustment` + `AuditLog`, không sửa âm thầm |
| BR-08 / AC-05 | Unique key (`tenantId`, `sourceType`, `sourceId`, `eventKey`) |
| BR-09 / AC-07 | Constraint/validation chống chồng lấn khoảng hiệu lực cùng phạm vi |
| BR-10 / AC-08 | Công thức mới không mutate bản ghi cũ; hồi tố đi qua job/tác vụ điều chỉnh có lý do |

## 5. Điểm mở

- Giá trị công thức cụ thể theo từng loại hoạt động vẫn chờ PO/Trường cung cấp.
- Cần chốt lịch năm học/năm tài khóa mặc định theo tenant trước khi bật P03 production.
