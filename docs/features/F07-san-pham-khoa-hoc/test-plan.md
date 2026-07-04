---
title: "Sản phẩm khoa học — Test plan"
spec: "./spec.md"
owner: "TEST"
status: Review
version: 0.2
updated: 2026-07-04
---

# Sản phẩm khoa học — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt:** FE (Sản phẩm của tôi, Sản phẩm của đề tài), BO (Duyệt/tra cứu sản phẩm), API (RBAC, scope,
  transition trạng thái, đối chiếu sản phẩm cam kết).
- **Môi trường:** tenant pilot có danh mục `ProductType` gồm bài báo, sáng chế/giải pháp, đào tạo; có cấu
  hình `EVIDENCE_TYPE`; dữ liệu đề tài `IN_PROGRESS` và `COMPLETED`.
- **Dữ liệu mẫu:** chủ nhiệm CN, thành viên TV, chuyên viên CV trong phạm vi, người ngoài K; đề tài P có cam
  kết 2 bài báo; sản phẩm đã duyệt/chờ duyệt/từ chối; sản phẩm ngoài đề tài.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | CN có đề tài P `IN_PROGRESS`; `ProductType` bài báo active | CN tạo sản phẩm, nhập đủ tên/năm/thông tin/tác giả, gắn P, đính minh chứng, gửi duyệt | Sản phẩm `PENDING_APPROVAL`; CV nhận thông báo; audit `SUBMIT_PRODUCT` | Happy |
| TC-02 | AC-02 | Nhà nghiên cứu U có sản phẩm ngoài đề tài | U kê khai sản phẩm, để trống đề tài nguồn, đủ minh chứng, gửi duyệt; CV duyệt | Sản phẩm `APPROVED`; F08 lấy được vào lý lịch của U | Happy |
| TC-03 | AC-03 | Sản phẩm `PENDING_APPROVAL` đủ minh chứng | CV duyệt sản phẩm | Trạng thái `APPROVED`; có `approvedBy/approvedAt`; field chính bị khóa; audit `APPROVE_PRODUCT` | Happy |
| TC-04 | AC-04 | Sản phẩm `PENDING_APPROVAL` | CV từ chối, nhập lý do | Trạng thái `REJECTED`; người kê khai thấy lý do; không xuất hiện trong F08/đối chiếu nghiệm thu | Happy |
| TC-05 | AC-04 | Sản phẩm `PENDING_APPROVAL` | CV từ chối nhưng bỏ trống lý do | Bị chặn, trạng thái không đổi | Lỗi |
| TC-06 | AC-05 | Sản phẩm chưa có minh chứng | Người kê khai gửi duyệt | Bị chặn, báo cần đính kèm minh chứng; không tạo hàng chờ duyệt | Lỗi |
| TC-07 | AC-06 | Năm hiện tại 2026 | Nhập `publicationYear=2030`, gửi duyệt | Bị chặn "Năm công bố không hợp lệ" | Lỗi |
| TC-08 | AC-06 | P có `ProjectAssignment.startDate` năm 2024 | Nhập sản phẩm gắn P với `publicationYear=2023` | Bị chặn vì năm công bố trước năm bắt đầu đề tài | Biên |
| TC-09 | AC-07 | K không là thành viên P, không có quyền scope | K cố tạo sản phẩm gắn P qua API | Backend trả 403; không lưu `researchProjectId=P` | Bảo mật |
| TC-10 | AC-08 | CN là chủ nhiệm P | CN gọi API duyệt sản phẩm | Backend trả 403; trạng thái không đổi | Bảo mật |
| TC-11 | AC-09 | Đã có sản phẩm A cùng tên chuẩn hóa, năm, tác giả | Tạo sản phẩm mới tương tự | UI/API trả cảnh báo trùng; cần xác nhận override trước khi lưu/gửi | Biên |
| TC-12 | AC-09 | Đã có sản phẩm cùng P + loại + tên + năm | Tạo lại bản hard-duplicate | Bị chặn trùng cứng, không lưu | Lỗi |
| TC-13 | AC-10 | Sản phẩm `APPROVED` | Người kê khai sửa tên/năm/tác giả/minh chứng | Bị từ chối; hướng dẫn yêu cầu đính chính/mở lại | Lỗi |
| TC-14 | AC-11 | P cam kết 2 bài báo; có 2 bài báo `APPROVED` gắn P | F04/F06 gọi kiểm sản phẩm cam kết | Trả `satisfied=true`; không có dòng thiếu | Happy |
| TC-15 | AC-12 | P cam kết 2 bài báo; có 1 `APPROVED`, 1 `REJECTED` | F04/F06 gọi kiểm sản phẩm cam kết | Trả `satisfied=false`, thiếu 1 bài báo; nghiệm thu bị chặn | Biên |
| TC-16 | AC-13 | CV ngoài phạm vi của P | CV mở danh sách/chi tiết sản phẩm P | Backend từ chối hoặc danh sách rỗng; không lộ dữ liệu | Bảo mật |
| TC-17 | AC-13 | TV là thành viên P | TV xem sản phẩm gắn P | Xem được sản phẩm trong P nhưng không có hành động duyệt | Happy |

## 3. Trường hợp biên & negative

- **Danh mục không hiệu lực:** chọn `ProductType` inactive/deleted khi gửi duyệt → chặn, yêu cầu chọn loại còn hiệu lực.
- **Tác giả rỗng hoặc thứ tự trùng:** gửi duyệt không có tác giả → chặn; thứ tự tác giả trùng → cảnh báo/validate.
- **Sản phẩm ngoài đề tài:** không áp rule năm bắt đầu đề tài; vẫn áp `publicationYear <= năm hiện tại`.
- **Đề tài đã `COMPLETED`:** không cho gửi duyệt sản phẩm mới gắn đề tài; sản phẩm đã duyệt trước đó vẫn xem được.
- **Minh chứng bị gỡ trước khi duyệt:** nếu sau khi gỡ không còn minh chứng, không cho gửi/duyệt.
- **Mở lại/đính chính:** chỉ người có `PRODUCT.REOPEN` được thực hiện, bắt buộc lý do và audit.
- **Tenant khác:** không truy vấn được `ProductType`/`ResearchOutput` khác tenant.

## 4. Checklist hồi quy

- [F04](../F04-quan-ly-tien-do/): kiểm `IN_PROGRESS → PENDING_ACCEPTANCE` vẫn chặn khi F07 trả thiếu sản phẩm.
- [F06](../F06-nghiem-thu/): điều kiện vào nghiệm thu chỉ tính `ResearchOutput.APPROVED`.
- [F08](../F08-ly-lich-khoa-hoc/): lý lịch chỉ hiển thị sản phẩm đã duyệt; sản phẩm `REJECTED`/`PENDING_APPROVAL` không xuất hiện.
- [B01](../B01-danh-muc-cau-hinh/): đổi nhãn/ẩn `ProductType` không phá sản phẩm lịch sử; sản phẩm mới không chọn được loại inactive.
- [B03](../B03-quan-ly-nguoi-dung/): RBAC `PRODUCT.*` và data scoping áp ở backend.
- Audit: mọi tạo/gửi duyệt/duyệt/từ chối/mở lại/đính/gỡ minh chứng ghi append-only.
