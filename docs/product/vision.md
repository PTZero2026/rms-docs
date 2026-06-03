---
title: "Tầm nhìn sản phẩm — RMS"
status: Draft
updated: 2026-06-01
---

# Tầm nhìn sản phẩm

## Một câu tóm tắt

> **RMS** (Research Management System) là nền tảng số hóa **toàn bộ vòng đời đề tài
> nghiên cứu khoa học** — từ kêu gọi, đề xuất, xét duyệt, thực hiện, đến nghiệm thu và
> công bố — trên một nguồn dữ liệu duy nhất, dùng chung cho nhà khoa học và bộ phận quản trị.

## Vấn đề

Quản lý đề tài nghiên cứu hiện **rời rạc** (giấy tờ, file rời, email). Hệ quả:

- Khó **theo dõi tiến độ** đề tài và phát hiện chậm trễ kịp thời.
- Khó **kiểm soát kinh phí** và đối soát với hệ thống tài chính.
- **Sản phẩm khoa học** (bài báo, sáng chế…) không gắn được với đề tài nguồn, khó tổng hợp.
- Quy trình **xét duyệt / nghiệm thu** qua hội đồng thủ công, thiếu minh bạch và khó truy vết.
- Dữ liệu phân tán → **báo cáo, thống kê** tốn công, độ tin cậy thấp.

## Mục tiêu

Số hóa toàn bộ vòng đời đề tài thành một luồng liên tục, có trạng thái rõ ràng:

```
Đợt kêu gọi → Đề xuất → Xét duyệt (hội đồng) → Thực hiện (tiến độ + kinh phí)
            → Nghiệm thu → Công bố sản phẩm khoa học
```

Mỗi bước có người chịu trách nhiệm, dữ liệu được lưu tập trung, thao tác được ghi nhật ký.

## Đối tượng sử dụng

Hệ thống phục vụ hai nhóm trên cùng một backend (xem `../architecture/overview.md`):

- **Portal người dùng (FE)** — nhà khoa học: chủ nhiệm và thành viên đề tài.
- **BackOffice (BO)** — chuyên viên quản lý KHCN, thành viên hội đồng, quản trị hệ thống.

Chi tiết từng nhóm: xem `personas.md`.

## Phạm vi

- **Trong phạm vi:** quản lý đợt kêu gọi, đề xuất & thuyết minh, xét duyệt hội đồng,
  theo dõi tiến độ, quản lý kinh phí, nghiệm thu, kê khai sản phẩm khoa học và lý lịch
  khoa học; danh mục/cấu hình dùng chung, quản lý người dùng & phân quyền, thông báo,
  báo cáo & thống kê. (12 feature — xem `roadmap.md` và `README.md`.)
- **Ngoài phạm vi (giai đoạn đầu):** hệ thống kế toán/tài chính lõi (chỉ **đối soát** qua API),
  hệ thống định danh tập trung (dùng lại **SSO** qua OIDC/SAML), cổng email/SMS (tích hợp,
  không tự xây). Xem `../architecture/integrations.md`.

## Success metrics

- Thời gian xử lý hồ sơ đề xuất **giảm X%**.
- Tỷ lệ đề tài nộp báo cáo tiến độ **đúng hạn tăng lên Y%**.
- **100%** sản phẩm khoa học gắn được với đề tài nguồn.
- *(Bổ sung khi có baseline)* Tỷ lệ hồ sơ xét duyệt/nghiệm thu xử lý hoàn toàn trên hệ thống;
  thời gian tổng hợp báo cáo thống kê.

## Nguyên tắc định hướng

1. **Một nguồn sự thật.** Mỗi đề tài, mỗi sản phẩm chỉ tồn tại một bản ghi, gắn kết theo vòng đời.
2. **Vòng đời có trạng thái.** Mọi chuyển trạng thái đều rõ ai làm, khi nào, để truy vết.
3. **Hai mặt, một lõi.** FE và BO chia sẻ cùng backend/CSDL, tránh lệch dữ liệu.
4. **Phân quyền theo vai trò.** Quyền truy cập bám sát persona và quy trình.
5. **Minh bạch & audit.** Các hành động quan trọng (duyệt, nghiệm thu, chi kinh phí) được ghi log.

## Phụ thuộc & tích hợp

| Hệ thống | Mục đích | Liên quan |
|----------|----------|-----------|
| SSO nội bộ | Đăng nhập (OIDC/SAML) | Toàn hệ thống, B03 |
| Email/SMS | Gửi thông báo | F-B04 |
| Hệ thống tài chính | Đối soát kinh phí | F05 |

Chi tiết: `../architecture/integrations.md`.
