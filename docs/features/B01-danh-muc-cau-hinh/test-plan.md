---
title: "Danh mục & cấu hình — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.2
updated: 2026-06-29
---

# Danh mục & cấu hình — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu,
> báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt:** chỉ **BackOffice (BO)** + **API** backend (kiểm tra quyền và ràng buộc ở backend). Không có FE.
- **Môi trường:** môi trường staging có CSDL PostgreSQL, RBAC (B03) đã cấu hình 2 vai trò mẫu:
  *Quản trị hệ thống* và *Chuyên viên QL KHCN*.
- **Dữ liệu mẫu:**
  - `ResearchField`: "LV-01" (đang gắn ≥1 `ResearchProject`), "LV-02" (không tham chiếu), một cặp cha–con A→B.
  - `Unit`: cây A → B → C để test chống vòng.
  - `SystemSetting`: `PROPOSAL_REVIEW.PASSING_SCORE` (DECIMAL), `PROGRESS.REMINDER_DAYS_BEFORE_DUE` (INT).
  - `CriteriaSet` loại `PROPOSAL_REVIEW` với các tiêu chí tổng trọng số 90% và 100%.
  - `Catalog`: `POSITION`, `USER_ROLE_LABEL`, `ADMINISTRATIVE_DIVISION`, `ACADEMIC_YEAR`, `FISCAL_YEAR`.
- **Phủ AC:** AC-01 … AC-14 đều có ≥1 test case (xem cột "Liên kết AC").

## 2. Test cases

| ID    | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|-------|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đăng nhập vai trò Quản trị hệ thống; mã "LV-99" chưa tồn tại | Mở BO-02, tạo ResearchField code="LV-99", name hợp lệ, lưu | Bản ghi lưu thành công, `recordStatus=ACTIVE`, có 1 bản ghi `AuditLog` | Happy |
| TC-02 | AC-02 | Đã có ResearchField code="LV-01" | Tạo ResearchField khác với code="LV-01", lưu | Bị từ chối, báo lỗi "mã đã tồn tại"; không tạo bản ghi mới | Biên/Lỗi |
| TC-03 | AC-03 | Unit A là cha của B (A→B) | Sửa A, chọn `parentUnitId` = B; lưu | Bị từ chối, báo "không thể tạo vòng trong cây đơn vị" | Biên/Lỗi |
| TC-04 | AC-03 | Unit A tồn tại | Sửa A, chọn `parentUnitId` = chính A; lưu | Bị từ chối, báo lỗi tạo vòng (tự làm cha của mình) | Biên/Lỗi |
| TC-05 | AC-04 | ResearchField "LV-01" đang được ≥1 ResearchProject tham chiếu | Mở BO-02, yêu cầu xóa "LV-01" | Không xóa cứng; thông báo đang được sử dụng + gợi ý vô hiệu hóa; bản ghi giữ nguyên | Biên/Lỗi |
| TC-06 | AC-05 | ResearchField "LV-02" không có bản ghi tham chiếu | Xóa "LV-02" | `recordStatus=DELETED`; biến mất khỏi danh sách chọn mới; audit được ghi | Happy |
| TC-07 | AC-05 / AC-01 | Đã thực hiện TC-01 và TC-06 | Mở BO-07, lọc theo targetType=ResearchField | Thấy bản ghi audit tạo (TC-01) và xóa mềm (TC-06) với oldValue/newValue | Happy |
| TC-08 | AC-06 | Vai trò Quản trị; tham số PROPOSAL_REVIEW.PASSING_SCORE dataType=DECIMAL | Mở BO-04, sửa value = "abc", lưu | Bị từ chối, báo lỗi sai kiểu dữ liệu; giá trị cũ giữ nguyên | Biên/Lỗi |
| TC-09 | AC-06 | Như TC-08 | Sửa value = "7.5" (hợp lệ), lưu | Lưu thành công; audit ghi oldValue→newValue | Happy |
| TC-10 | AC-07 | Vai trò có quyền CriteriaSet; bộ tiêu chí PROPOSAL_REVIEW có tổng trọng số 90% | Mở BO-05, lưu bộ tiêu chí | Hiển thị cảnh báo "tổng trọng số chưa đạt 100%" nhưng vẫn lưu thành công | Biên/Lỗi |
| TC-11 | AC-07 | Bộ tiêu chí có tổng trọng số đúng 100% | Lưu bộ tiêu chí | Lưu thành công, không cảnh báo trọng số | Happy |
| TC-12 | AC-08 | Đăng nhập vai trò Chuyên viên QL KHCN | Cố tạo/sửa Unit qua BO-01 / API | Bị từ chối, lỗi thiếu quyền (403); không thay đổi dữ liệu | Negative/Quyền |
| TC-13 | AC-08 | Đăng nhập vai trò Chuyên viên QL KHCN | Tạo/sửa một CriteriaSet qua BO-05 | Được phép; lưu thành công theo phân quyền nghiệp vụ | Happy |
| TC-14 | AC-09 | Vai trò có quyền CriteriaSet | Thêm EvaluationCriterion với maxScore=0, lưu | Bị từ chối, báo "maxScore phải lớn hơn 0" | Biên/Lỗi |
| TC-15 | AC-09 | Như TC-14 | Thêm EvaluationCriterion với weight=120, lưu | Bị từ chối, báo weight phải trong [0,100] | Biên/Lỗi |
| TC-16 | AC-10 | `POSITION` đã có `CatalogItem.code = "TP"` | Tạo thêm item `code = "TP"` trong `POSITION`; sau đó tạo `code = "TP"` trong `USER_ROLE_LABEL` | Trong cùng danh mục bị từ chối; khác danh mục được phép | Biên |
| TC-17 | AC-11 | `ADMINISTRATIVE_DIVISION` có cây Tỉnh → Huyện | Sửa Tỉnh chọn Huyện hoặc chính nó làm `parentItemId` | Bị từ chối vì tạo vòng cây | Biên/Lỗi |
| TC-18 | AC-12 | Vai trò Quản trị hệ thống | Tạo `Catalog` mới `ACADEMIC_RANK`, nhập các `CatalogItem` | Danh mục mới xuất hiện ở nav trái, dùng được ngay, không cần deploy; audit được ghi | Happy |
| TC-19 | AC-13 | `ADMINISTRATIVE_DIVISION.extraSchema` yêu cầu `extra.level` hợp lệ | Lưu item thiếu `level` hoặc `level = "CITY"` | Bị từ chối vì sai schema | Negative |
| TC-20 | AC-14 | `POSITION` item đang được hồ sơ người dùng tham chiếu | Yêu cầu xóa item đó | Không xóa cứng; gợi ý vô hiệu hóa; item `INACTIVE` không hiện ở danh sách chọn mới | Biên/Lỗi |

## 3. Trường hợp biên & negative

- **Dữ liệu rỗng/bắt buộc:** tạo danh mục thiếu `code` hoặc `name` → từ chối (validate bắt buộc).
- **Trùng mã khác loại:** mã trùng nhưng khác loại danh mục → cho phép (BR-01 giới hạn theo cùng loại;
  `SystemSetting.key` thì duy nhất toàn cục — kiểm tra riêng).
- **Xóa nút cây còn nút con:** xóa Unit cha còn nút con/đang tham chiếu → chặn theo RESTRICT (BR-02).
- **Sai quyền truy cập audit:** vai trò không có quyền cố sửa/xóa bản ghi `AuditLog` → từ chối
  (audit bất biến).
- **Giá trị biên kiểu số:** PROPOSAL_REVIEW.PASSING_SCORE nhận giá trị âm hoặc ngoài khoảng cho phép → từ chối (BR-06).
- **Mục INACTIVE vs DELETED:** mục INACTIVE vẫn hiển thị trên bản ghi cũ đã gắn nhưng không hiện ở danh
  sách chọn mới; mục DELETED ẩn hoàn toàn khỏi chọn mới (BR-04).
- **Mẫu biểu thuyết minh (BO-06):** đánh dấu **blocked** cho tới khi thực thể `BieuMauThuyetMinh` được
  bổ sung vào data-model (spec §5/§7).

## 4. Checklist hồi quy

Khi B01 thay đổi, kiểm tra lại các feature tiêu thụ danh mục:

- [ ] F01/F02: chọn `ResearchField`, mẫu biểu thuyết minh, bộ tiêu chí xét duyệt vẫn đúng (mục INACTIVE/DELETED
      không xuất hiện ở chọn mới; bản ghi cũ vẫn giữ tham chiếu).
- [ ] F03/F06: bộ tiêu chí (`maxScore`, `weight`) tải đúng; điểm tổng hợp tính đúng theo trọng số.
- [ ] F07: danh mục `ProductType` và `category` hiển thị đúng khi kê khai sản phẩm.
- [ ] F04/B04: tham số `PROGRESS.REMINDER_DAYS_BEFORE_DUE` thay đổi được job nhắc hạn áp dụng đúng.
- [ ] P03/F08/B02: danh mục `ACADEMIC_YEAR`/`FISCAL_YEAR` có `extra.startDate`/`extra.endDate` hợp lệ để quy đổi
      và tổng hợp giờ giảng đúng kỳ.
- [ ] Mọi feature: cây `Unit` hiển thị/chọn đúng sau khi đổi cấu trúc cây.
- [ ] Audit: mọi thay đổi danh mục/cấu hình đều sinh bản ghi `AuditLog` (không sót, không trùng).
- [ ] RBAC (B03): thay đổi vai trò/quyền không phá vỡ phân quyền B01 trong Permission matrix.
