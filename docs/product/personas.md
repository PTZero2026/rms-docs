---
title: "Personas — RMS"
status: Draft
updated: 2026-06-01
---

# Personas

5 nhóm người dùng chính, chia theo hai mặt hệ thống: **FE** (Portal nhà khoa học) và
**BO** (BackOffice quản trị). Bảng tổng quan trước, mô tả chi tiết bên dưới.

## Tổng quan

| Persona | Vai trò | Nhu cầu chính | Mặt dùng | Feature chính |
|---------|---------|---------------|----------|---------------|
| Chủ nhiệm đề tài | Nhà khoa học | Nộp đề xuất, báo cáo tiến độ, kê khai sản phẩm | FE | F01, F04, F05, F07, F08 |
| Thành viên đề tài | Nhà khoa học | Tham gia, xem thông tin đề tài | FE | F01, F04, F07 |
| Chuyên viên QL KHCN | Quản trị | Tiếp nhận, kiểm tra, theo dõi toàn bộ vòng đời | BO | F01–F06, B02 |
| Thành viên hội đồng | Đánh giá | Chấm điểm, nghiệm thu | BO | F03, F06 |
| Quản trị hệ thống | Admin | Cấu hình danh mục, phân quyền | BO | B01, B03 |

---

## Chủ nhiệm đề tài

- **Vai trò:** Nhà khoa học, người chịu trách nhiệm chính của một đề tài.
- **Mục tiêu:** Đăng ký đề xuất trong đợt kêu gọi và đưa đề tài đi hết vòng đời tới nghiệm thu/công bố.
- **Tác vụ:** Nộp thuyết minh (F01); theo dõi kết quả xét duyệt (F03); nộp báo cáo tiến độ (F04);
  theo dõi/giải trình kinh phí (F05); chuẩn bị nghiệm thu (F06); kê khai sản phẩm khoa học (F07);
  cập nhật lý lịch khoa học (F08).
- **Pain point:** Hồ sơ rải rác qua email/giấy tờ; không rõ trạng thái hồ sơ; dễ trễ hạn báo cáo.
- **Mặt dùng:** FE.

## Thành viên đề tài

- **Vai trò:** Nhà khoa học tham gia đề tài cùng chủ nhiệm.
- **Mục tiêu:** Nắm thông tin đề tài mình tham gia và đóng góp phần việc của mình.
- **Tác vụ:** Xem thông tin đề tài, thuyết minh, tiến độ; tham gia kê khai sản phẩm liên quan.
- **Pain point:** Khó biết trạng thái và phần việc của đề tài khi thông tin do chủ nhiệm giữ.
- **Mặt dùng:** FE.

## Chuyên viên QL KHCN

- **Vai trò:** Cán bộ quản lý khoa học & công nghệ, vận hành quy trình.
- **Mục tiêu:** Đảm bảo mọi đề tài đi đúng quy trình, đúng hạn, dữ liệu đầy đủ.
- **Tác vụ:** Cấu hình & mở đợt kêu gọi (F02); tiếp nhận/kiểm tra đề xuất (F01); tổ chức xét duyệt
  hội đồng (F03); giám sát tiến độ (F04) & kinh phí (F05); điều phối nghiệm thu (F06);
  tổng hợp báo cáo & thống kê (B02).
- **Pain point:** Theo dõi thủ công nhiều đề tài; tổng hợp báo cáo tốn công, dễ sai sót.
- **Mặt dùng:** BO.

## Thành viên hội đồng

- **Vai trò:** Chuyên gia được mời đánh giá.
- **Mục tiêu:** Chấm điểm khách quan, minh bạch, đúng tiêu chí.
- **Tác vụ:** Đọc thuyết minh/hồ sơ; điền phiếu chấm khi xét duyệt (F03) và khi nghiệm thu (F06).
- **Pain point:** Nhận hồ sơ qua nhiều kênh; khó tra cứu lịch sử và đối chiếu tiêu chí.
- **Mặt dùng:** BO.

## Quản trị hệ thống

- **Vai trò:** Admin hệ thống.
- **Mục tiêu:** Giữ hệ thống cấu hình đúng, phân quyền chặt, dữ liệu danh mục nhất quán.
- **Tác vụ:** Quản lý danh mục & cấu hình dùng chung (B01); quản lý người dùng, vai trò, phân quyền (B03).
- **Pain point:** Phân quyền sai gây lộ/lệch dữ liệu; danh mục không thống nhất giữa các feature.
- **Mặt dùng:** BO.

---

> Quyền cụ thể của từng persona trong mỗi feature được định nghĩa ở **Permission matrix** trong
> `features/<feature>/backoffice.md`. Trang này chỉ mô tả người dùng ở mức sản phẩm.
