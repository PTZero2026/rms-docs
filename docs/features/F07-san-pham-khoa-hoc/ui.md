---
title: "Sản phẩm khoa học — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Review
version: 0.2
updated: 2026-07-04
---

# Sản phẩm khoa học — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Luật nghiệp vụ xem
> [`./spec.md`](./spec.md).

## 1. Vai trò sử dụng

| Vai trò | Mức dùng |
|---------|----------|
| **Nhà nghiên cứu / tác giả** | Kê khai sản phẩm của mình, theo dõi trạng thái duyệt, xem lý do từ chối. |
| **Chủ nhiệm đề tài** | Kê khai sản phẩm gắn với đề tài mình; xem mức hoàn thành sản phẩm cam kết. |
| **Chuyên viên QL KHCN** | Xem sản phẩm theo phạm vi, kiểm tra minh chứng, duyệt/từ chối, nhập hộ khi cần. |
| **Quản trị hệ thống** | Xem toàn tenant; hỗ trợ cấu hình danh mục ở B01, không thay quy trình duyệt. |

## 2. Phân quyền (Permission matrix)

Module quyền của F07 là `PRODUCT`.

| Hành động | Quyền | Tác giả/Chủ nhiệm | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:-----------------:|:-------------------:|:-----------------:|
| Xem sản phẩm của mình/đề tài mình | `PRODUCT.VIEW_OWN` | ✓ | ✓ | ✓ |
| Kê khai sản phẩm của mình | `PRODUCT.CREATE_OWN` | ✓ | ✓ | ✓ |
| Sửa sản phẩm chưa duyệt của mình | `PRODUCT.UPDATE_OWN` | ✓ | ✓ | ✓ |
| Xem sản phẩm theo phạm vi | `PRODUCT.VIEW` | – | ✓ | ✓ |
| Nhập hộ/sửa theo phạm vi | `PRODUCT.CREATE` / `PRODUCT.UPDATE` | – | ✓ | ✓ |
| Duyệt/từ chối | `PRODUCT.APPROVE` | – | ✓ | ✓ |
| Mở lại/đính chính bản đã duyệt | `PRODUCT.REOPEN` | – | ✓ | ✓ |
| Xem nhật ký | `AUDIT_LOG.VIEW` | – | ✓ | ✓ |

> Backend là lớp thực thi quyền duy nhất. UI chỉ ẩn/hiện hành động; API ngoài phạm vi trả 403.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Sản phẩm của tôi | Nhà nghiên cứu/chủ nhiệm kê khai, sửa bản chưa duyệt, xem trạng thái và lý do từ chối. |
| FE-02 | Sản phẩm của đề tài | Chủ nhiệm xem sản phẩm gắn với một đề tài và mức đáp ứng cam kết. |
| BO-01 | Duyệt sản phẩm | Chuyên viên xử lý hàng chờ `PENDING_APPROVAL`, duyệt/từ chối. |
| BO-02 | Tra cứu sản phẩm | Chuyên viên/Admin tra cứu theo phạm vi, lọc theo loại/năm/đề tài/tác giả/trạng thái. |

## 4. Mô tả màn hình & thao tác

### FE-01 — Sản phẩm của tôi

- **Danh sách:** tên sản phẩm, loại, năm, đề tài nguồn (nếu có), trạng thái (`DRAFT`/`PENDING_APPROVAL`/
  `APPROVED`/`REJECTED`), ngày gửi duyệt, người duyệt/từ chối.
- **Bộ lọc:** trạng thái, loại sản phẩm, năm công bố, đề tài nguồn.
- **Tạo/sửa sản phẩm:** form gồm loại sản phẩm, tên, năm công bố, thông tin công bố/mô tả, tác giả, đề tài
  nguồn (tùy chọn), minh chứng.
- **Tác giả:** bảng nhiều dòng; tác giả nội bộ chọn từ người dùng RMS, tác giả ngoài nhập tên/đơn vị; có
  thứ tự tác giả.
- **Đề tài nguồn:** chỉ cho chọn đề tài người dùng là chủ nhiệm/thành viên; sản phẩm ngoài đề tài để trống.
- **Minh chứng:** upload tối thiểu một file trước khi gửi duyệt; hiển thị loại minh chứng nếu tenant dùng
  `EVIDENCE_TYPE`.
- **Cảnh báo trùng:** nếu hệ thống phát hiện tên/năm/tác giả gần trùng, hiển thị cảnh báo và yêu cầu xác
  nhận trước khi tiếp tục.
- **Trạng thái:** `REJECTED` hiển thị lý do từ chối và hành động sửa/gửi lại nếu còn quyền; `APPROVED` khóa
  trường chính, chỉ hiện yêu cầu đính chính/mở lại.

### FE-02 — Sản phẩm của đề tài

- Vào từ chi tiết đề tài F04/F06.
- Hiển thị danh sách sản phẩm gắn với đề tài, phân nhóm theo loại và trạng thái duyệt.
- Khối **Đối chiếu cam kết:** mỗi dòng gồm loại sản phẩm, số lượng cam kết, số lượng đã duyệt, số còn thiếu.
- Chỉ sản phẩm `APPROVED` được tính vào cột đã duyệt; `PENDING_APPROVAL` và `REJECTED` hiển thị riêng để chủ
  nhiệm biết việc cần xử lý.
- Nếu thiếu sản phẩm cam kết, hiển thị rõ loại còn thiếu để chủ nhiệm bổ sung trước khi đăng ký nghiệm thu.

### BO-01 — Duyệt sản phẩm

- Hàng chờ mặc định lọc `PENDING_APPROVAL`, sắp theo ngày gửi duyệt cũ nhất.
- Cột chính: tên, loại, năm, đề tài nguồn, tác giả, người gửi, minh chứng, cảnh báo trùng.
- Chi tiết duyệt hiển thị toàn bộ metadata, file minh chứng và lịch sử audit liên quan.
- **Duyệt:** yêu cầu xác nhận; sau duyệt chuyển `APPROVED`, khóa trường chính.
- **Từ chối:** bắt buộc nhập lý do; lý do hiển thị cho người kê khai.
- Nếu phát hiện trùng, chuyên viên có thể từ chối yêu cầu hợp nhất/đính chính hoặc vẫn duyệt khi đủ căn cứ.

### BO-02 — Tra cứu sản phẩm

- Bộ lọc: loại sản phẩm, trạng thái, năm công bố, đề tài, tác giả, đơn vị, khoảng thời gian duyệt.
- Cho phép mở chi tiết sản phẩm trong phạm vi dữ liệu; ngoài phạm vi không trả dữ liệu.
- Hỗ trợ xem nhanh sản phẩm đã duyệt để phục vụ F08/B02; export báo cáo chi tiết thuộc B02 nếu cần.

## 5. Thông báo & trạng thái

| Sự kiện | Người nhận | Nội dung |
|---------|------------|----------|
| Gửi duyệt sản phẩm | Chuyên viên trong phạm vi | Có sản phẩm mới chờ duyệt. |
| Duyệt sản phẩm | Người kê khai, chủ nhiệm đề tài | Sản phẩm đã được duyệt và được tính vào nghiệm thu/lý lịch. |
| Từ chối sản phẩm | Người kê khai, chủ nhiệm đề tài | Sản phẩm bị từ chối kèm lý do. |
| Thiếu sản phẩm cam kết khi kiểm nghiệm thu | Chủ nhiệm, chuyên viên | Danh sách loại sản phẩm còn thiếu. |

Trạng thái rỗng/đang tải/lỗi hiển thị theo từng danh sách; lỗi quyền hiển thị ngắn gọn, không lộ dữ liệu
ngoài phạm vi.

## 6. Audit & nhật ký

| Hành động | `action` gợi ý | Ai xem được |
|-----------|----------------|-------------|
| Tạo/sửa sản phẩm | `CREATE_PRODUCT` / `UPDATE_PRODUCT` | Chuyên viên, Admin |
| Gửi duyệt | `SUBMIT_PRODUCT` | Chuyên viên, Admin |
| Duyệt/từ chối | `APPROVE_PRODUCT` / `REJECT_PRODUCT` | Chuyên viên, Admin |
| Đính/gỡ minh chứng | `ATTACH_PRODUCT_EVIDENCE` / `DETACH_PRODUCT_EVIDENCE` | Chuyên viên, Admin |
| Mở lại/đính chính | `REOPEN_PRODUCT` | Chuyên viên, Admin |

Nhật ký hiển thị ở chi tiết sản phẩm cho người có `AUDIT_LOG.VIEW`; người kê khai chỉ thấy trạng thái và lý
do từ chối liên quan.

## 7. Liên kết AC

| Màn hình | AC liên quan (spec.md §6) |
|----------|---------------------------|
| FE-01 (Sản phẩm của tôi) | AC-01, AC-02, AC-05, AC-06, AC-09, AC-10 |
| FE-02 (Sản phẩm của đề tài) | AC-01, AC-03, AC-04, AC-11, AC-12 |
| BO-01 (Duyệt sản phẩm) | AC-03, AC-04, AC-08, AC-09 |
| BO-02 (Tra cứu sản phẩm) | AC-07, AC-13 |
