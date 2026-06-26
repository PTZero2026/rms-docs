---
title: "Trang chủ (Dashboard cá nhân) — Test plan"
spec: "./spec.md"
owner: "QA/Test"
status: Draft
updated: 2026-06-26
---

# Trang chủ (Dashboard cá nhân) — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo lại
> BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt:** FE (trang chủ HOME-01/02) + BO (cấu hình HOME-11) + API tổng hợp (kiểm phạm vi dữ liệu ở backend).
- **Môi trường:** ≥ 2 tenant — một bật E4, một tắt E4 — để kiểm BR-04 (ẩn widget) và VP-HOME.
- **Dữ liệu mẫu:** người dùng đủ các vai trò (chủ nhiệm, thư ký, thành viên, chuyên viên QL KHCN, thành viên
  hội đồng, quản trị); đề tài ở nhiều trạng thái chuẩn hoá; báo cáo tiến độ sắp/quá hạn; phiếu chấm chờ; hồ
  sơ thiếu trường; thông báo IN_APP.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | U có tài khoản hợp lệ | Đăng nhập | Được đưa tới trang chủ; thấy lời chào, vai trò, trường/viện của U | Happy |
| TC-02 | AC-02 | Có chủ nhiệm CN và chuyên viên CV | Lần lượt đăng nhập, mở trang chủ | Widget/việc cần làm khác nhau đúng vai trò (CN: báo cáo của tôi; CV: hồ sơ chờ tiếp nhận) | Happy |
| TC-03 | AC-03 | CV chỉ phụ trách đơn vị X; có đề tài thuộc Y | Mở trang chủ với CV | Số liệu/việc chỉ tính trên phạm vi X; không thấy dữ liệu Y | Happy |
| TC-04 | AC-03 | Như TC-03 | Gọi trực tiếp API tổng hợp với tham số vượt phạm vi (đơn vị Y) | Backend **từ chối**/lọc bỏ, không trả dữ liệu Y dù UI có widget | Biên/Lỗi (quyền) |
| TC-05 | AC-04 | CN có 1 đề xuất bị trả lại bổ sung + 1 báo cáo quá hạn | Mở trang chủ | Khối "việc cần làm" liệt kê đúng 2 đề mục; mỗi đề mục có link tới feature nguồn | Happy |
| TC-06 | AC-04 | Hai tenant đặt **tên bước** workflow khác nhau nhưng cùng `statusSemantic` | Mở trang chủ ở từng tenant với cùng tình huống | Cùng đề mục "việc cần làm" xuất hiện ở cả hai (gom theo statusSemantic, không theo tên bước) | Biên |
| TC-07 | AC-05 | U thấy đề mục việc cần làm | Bấm vào đề mục | Điều hướng tới đúng màn hình feature nguồn; trang chủ không sửa dữ liệu | Happy |
| TC-08 | AC-06 | U có thẻ "đề tài đang thực hiện = N" | Bấm "xem chi tiết/phân tích" trên thẻ | Điều hướng sang báo cáo **B02**; trang chủ không có lọc/drill-down tại chỗ | Happy |
| TC-09 | AC-07 | U có ≥ 7 thông báo IN_APP | Mở trang chủ | Khối thông báo hiển thị đúng **5** bản ghi gần nhất của U; "Xem tất cả" → B04 | Happy |
| TC-10 | AC-07 | U2 có thông báo riêng | Đăng nhập U, mở trang chủ | Không thấy thông báo của U2 (chỉ recipient = U) | Biên (quyền) |
| TC-11 | AC-08 | Tenant T **tắt** E4 | Người dùng T mở trang chủ | Không có widget E4 (giờ giảng P03, đề tài sinh viên F10…) | Happy |
| TC-12 | AC-08 | Tenant T2 **bật** E4, vai trò phù hợp | Người dùng T2 mở trang chủ | Hiển thị widget E4 tương ứng | Happy |
| TC-13 | AC-09 | Quản trị tenant đã cấu hình bố cục cho vai trò "chuyên viên" | Chuyên viên của tenant mở trang chủ | Tập widget & thứ tự đúng cấu hình tenant; khác tenant khác | Happy |
| TC-14 | AC-09 | Có quyền `HOME.CONFIG` | Mở HOME-11, đổi tập widget/thứ tự cho 1 vai trò, lưu | Lưu thành công, ghi `AuditLog`; người dùng vai trò đó thấy bố cục mới | Happy |
| TC-15 | AC-10 | Người dùng mới M chưa có đề tài/việc | Mở trang chủ | Hiển thị trạng thái rỗng + lối tắt khởi đầu theo vai trò; không màn hình trống | Biên |
| TC-16 | AC-11 | U có quyền xem audit nghiệp vụ | Mở trang chủ nhiều lần, kiểm `AuditLog` | Không có bản ghi audit nghiệp vụ cho hành động xem trang chủ | Biên |
| TC-17 | AC-12 | Số liệu nhanh lấy từ cache | Mở trang chủ | Thẻ số liệu hiển thị **mốc cập nhật**; việc cần làm phản ánh trạng thái đủ tươi | Biên |
| TC-18 | AC-01/AC-02 | Một widget nguồn lỗi tải | Mở trang chủ | Lỗi cục bộ trong thẻ đó; các widget khác vẫn hiển thị bình thường | Lỗi |

## 3. Trường hợp biên & negative

- **Sai quyền:** gọi API tổng hợp vượt phạm vi dữ liệu → backend từ chối (TC-04, TC-10).
- **Dữ liệu rỗng:** người dùng mới, không việc, không thông báo → trạng thái rỗng (TC-15).
- **Tenant tắt feature:** widget của feature tắt phải biến mất hoàn toàn, không chỉ disabled (TC-11).
- **Đổi tên bước workflow per-tenant:** việc cần làm vẫn đúng nhờ `statusSemantic` (TC-06).
- **Hạn/định dạng:** mốc hạn hiển thị `dd/MM/yyyy`, giờ Asia/Ho_Chi_Minh; chỉ báo trễ hạn đúng theo ngày hệ thống.
- **Widget lỗi cục bộ:** không kéo sập cả trang (TC-18).
- **Số liệu cache cũ:** mốc cập nhật phải hiển thị để người dùng biết độ tươi (TC-17).

## 4. Checklist hồi quy

- Đăng nhập → điều hướng landing tới trang chủ (không vỡ luồng SSO/RBAC của B03).
- Thay đổi cấu hình widget (HOME-11) không ảnh hưởng quyền/dữ liệu của feature nguồn.
- Bật/tắt feature per-tenant (VP-FEAT) phản ánh đúng trên trang chủ.
- Khối thông báo đồng bộ với trung tâm thông báo B04 (cùng nguồn `Notification`).
- Số liệu nhanh nhất quán về định nghĩa đếm với báo cáo tương ứng ở B02 (cùng cách hiểu phạm vi).
</content>
