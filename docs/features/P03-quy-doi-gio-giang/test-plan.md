---
title: "Quy đổi giờ giảng — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-11-24
---

# Quy đổi giờ giảng — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|---|
| TC-01 | AC-01 | Có công thức loại X hiệu lực từ 01/01/2026; sự kiện X có `sourceOccurredAt = 15/03/2026` | Gửi yêu cầu quy đổi hợp lệ | Tính đúng số giờ theo công thức hiệu lực tại `sourceOccurredAt` | Happy |
| TC-02 | AC-02 | Tenant dùng mặc định `ACADEMIC_YEAR`; lịch năm học `2026-2027` đã cấu hình | Gửi sự kiện có `sourceOccurredAt` thuộc năm học `2026-2027` | Bản ghi có `recognitionPeriodType=ACADEMIC_YEAR`, `recognitionPeriodCode=2026-2027` | Happy |
| TC-03 | AC-03 | Tenant cấu hình `FISCAL_YEAR`; lịch tài khóa `2026` đã cấu hình | Gửi sự kiện có `sourceOccurredAt` thuộc năm tài khóa `2026` | Bản ghi có `recognitionPeriodType=FISCAL_YEAR`, `recognitionPeriodCode=2026` | Happy |
| TC-04 | AC-04 | Sự kiện có chủ nhiệm và 2 thành viên, có tỉ lệ đóng góp hợp lệ | Gửi yêu cầu quy đổi | Giờ giảng phân bổ đúng theo vai trò/tỉ lệ | Happy |
| TC-05 | AC-05 | Dữ liệu thử: hoạt động ngày 30/09/2027 đã ghi 6 giờ theo v1 cho một giảng viên. Từ 01/10/2027, v2 cho 8 giờ. | Cùng tenant gửi lại đúng `sourceType/sourceId/eventKey` sau ngày đổi định mức | Vẫn một dòng 6 giờ theo v1, cùng kỳ và phân bổ ban đầu. Tổng của giảng viên vẫn là 6 giờ. | Biên/Idempotency |
| TC-06 | AC-06 | Có bản ghi giờ giảng đã tạo | Chuyên viên điều chỉnh số giờ, nhập lý do và lưu | Tạo bản ghi điều chỉnh/audit kèm lý do | Audit |
| TC-07 | AC-07 | Đã có công thức X cho `ACADEMIC_YEAR` hiệu lực 01/01/2026-31/12/2026 | Tạo công thức X cùng phạm vi có hiệu lực 01/07/2026-31/12/2026 | Bị từ chối vì khoảng hiệu lực chồng lấn | Negative |
| TC-08 | AC-08 | Đã có bản ghi giờ giảng tính theo công thức cũ | Lưu công thức mới hiệu lực tương lai | Bản ghi cũ không tự thay đổi | Regression |
| TC-09 | AC-06, AC-08 | Dùng dòng gốc 6 giờ của TC-05 | Người có quyền điều chỉnh tăng 1 giờ, nhập lý do rồi lưu. Gửi lại sự kiện gốc | Dòng gốc vẫn 6 giờ theo v1, một điều chỉnh +1 giờ có nhật ký ghi người sửa và lý do. Tổng sau khi gửi lại vẫn là 7 giờ. | Audit |
| TC-10 | AC-09 | Giảng viên có bản ghi ở nhiều kỳ | Mở F08 hoặc MH-02, lọc theo kỳ | Tổng giờ hiển thị đúng theo `recognitionPeriodType/code` | Integration |
| TC-11 | AC-01 | Seed TLU có `tlu.baseHoursScieQ1 = 100`; nguồn là bằng sáng chế hợp lệ | Gửi yêu cầu quy đổi `activityType = PATENT` | Tính 200 giờ trước phân bổ tác giả, theo hệ số 2.0 từ seed TLU | Happy |
| TC-12 | AC-01 | Seed TLU có công thức Q2 ở trạng thái `NEEDS_PO_VALIDATION` | Cố bật công thức Q2 thành `ACTIVE` khi chưa có phê duyệt PO | Hệ thống/chốt cấu hình chặn hoặc yêu cầu xác nhận PO | Governance |

## 3. Trường hợp biên & negative
- Công thức hết hiệu lực hoặc không có công thức cho `periodType` tenant đang dùng.
- Sự kiện ở trạng thái chưa hợp lệ hoặc thiếu `sourceOccurredAt`.
- Ngày nguồn nằm sát ranh giới năm học/năm tài khóa.
- Phân bổ vai trò tổng tỉ lệ khác 100%.
- Công thức mới chồng lấn hiệu lực với công thức cũ cùng loại hoạt động/vai trò/kỳ.
- Seed TLU thiếu `tlu.baseHoursScieQ1` thì không cho bật công thức quy đổi giờ.

### Đối chứng phân bổ F09 theo vai trò

Kê khai chủ nhiệm và hai thành viên với tỷ lệ lần lượt 50%, 30% và 20%. Cấu hình định mức thử 20 giờ cho chủ nhiệm và 10 giờ cho thành viên cùng cấp. Sau duyệt, chạy công việc quy đổi hai lần rồi đối chiếu sổ của ba người với 10,00 / 3,00 / 2,00 giờ. Thu hồi quyết định và kiểm từng tổng về 0. Lưu bằng client cũ phải giữ danh sách thành viên đã khai. [Ca tích hợp PostgreSQL](../../../apps/backend/test/db/teaching.test.mjs)

### Nguồn F11 và biên tiền hợp đồng

TC-01/04/05/07/10 dùng định mức cấu hình tại chỗ. Kiểm hai khoảng liền kề cùng ngày hiệu lực và phiên bản. Từ chối khoảng chồng lấn. Ghi nhận hợp đồng đúng cận dưới theo bậc mới, đối chiếu cả hai vai trò rồi chạy lại worker. Trên lý lịch thư ký, kiểm số giờ trước/sau khi thu hồi dự án. [Ca F11/P03](../../../apps/backend/test/db/applied-hours.test.mjs) · [Kịch bản F08](../../../e2e/applied-project/register-applied-project/acceptance.spec.ts)
