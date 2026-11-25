---
title: "Hoạt động khoa học & minh chứng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "BA / Design"
status: Review
updated: 2026-11-25
---

# Hoạt động khoa học & minh chứng — Giao diện

> Một form cấu hình theo **loại hoạt động**
> (hội nghị/cộng đồng/SHTT). Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Giảng viên:** kê khai hoạt động + minh chứng. **Chuyên viên QLKH:** phê duyệt & cấp kinh phí.

| Hành động | Quyền | Chuyên viên | Giảng viên |
|---|---|:--:|:--:|
| Kê khai/sửa | `ACTIVITY.EDIT` | ✓ | ✓ (của mình) |
| Phê duyệt & cấp kinh phí | `ACTIVITY.APPROVE` | ✓ | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Kê khai hoạt động (theo loại) | Form đổi theo loại; đính kèm minh chứng |
| MH-02 | Hàng đợi phê duyệt | QLKH duyệt/từ chối/bổ sung, ghi nhận kinh phí hỗ trợ |

## 3. Mô tả màn hình & thao tác
Form **động theo loại hoạt động**: hội nghị (tờ trình cử đi, thông tin phát biểu), phục vụ cộng đồng
(minh chứng tham gia), SHTT (văn bằng/đơn đăng ký). Trạng thái phê duyệt + khoản kinh phí hỗ trợ.

## 6. Liên kết AC
MH-01 dùng AC-01, AC-02 để đổi form theo loại và chỉ rõ minh chứng thiếu khi gửi. MH-02 dùng AC-03, AC-04 để trả lại hoặc duyệt và xem kết quả ghi nhận.

Trên MH-02, chuyên viên nhập **Kinh phí hỗ trợ được duyệt (VND)** khi hoạt động được hỗ trợ. Khi duyệt xong, giảng viên và chuyên viên thấy số tiền đã duyệt trên hồ sơ. **Trả lại đầu mục** cho phép giảng viên bổ sung trên hồ sơ cũ. **Từ chối hoạt động** kết thúc kê khai và hiển thị lý do. [Hướng dẫn thao tác](../../guides/nguoi-dung/nhiem-vu-va-hoat-dong.md)
