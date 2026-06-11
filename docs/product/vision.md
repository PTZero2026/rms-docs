---
title: "Tầm nhìn sản phẩm — RMS"
status: Approved
updated: 2026-06-11
---

# Tầm nhìn sản phẩm

## Một câu tóm tắt

> **RMS** (Research Management System) là nền tảng số hóa **toàn bộ vòng đời đề tài
> nghiên cứu khoa học** — từ nhận đề xuất, đề xuất, xét duyệt, thực hiện, đến nghiệm thu và
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
Kỳ nhận đề xuất → Đề xuất → Xét duyệt (hội đồng) → Thực hiện (tiến độ + kinh phí)
            → Nghiệm thu → Công bố sản phẩm khoa học
```

Mỗi bước có người chịu trách nhiệm, dữ liệu được lưu tập trung, thao tác được ghi nhật ký.

## Đối tượng sử dụng

Hệ thống phục vụ hai nhóm trên cùng một backend (xem `../architecture/overview.md`):

- **Portal người dùng (FE)** — nhà khoa học: chủ nhiệm và thành viên đề tài.
- **BackOffice (BO)** — chuyên viên quản lý KHCN, thành viên hội đồng, quản trị hệ thống.

Chi tiết từng nhóm: xem `personas.md`.

## Phạm vi

- **Trong phạm vi:** quản lý kỳ nhận đề xuất, đề xuất & thuyết minh, xét duyệt hội đồng,
  theo dõi tiến độ, quản lý kinh phí, nghiệm thu, kê khai sản phẩm khoa học và lý lịch
  khoa học; danh mục/cấu hình dùng chung, quản lý người dùng & phân quyền, thông báo,
  báo cáo & thống kê. (12 feature — xem `roadmap.md` và `README.md`.)
- **Ngoài phạm vi (giai đoạn đầu):** hệ thống kế toán/tài chính lõi (chỉ **đối soát** qua API),
  hệ thống định danh tập trung (dùng lại **SSO** qua OIDC/SAML), cổng email/SMS (tích hợp,
  không tự xây). Xem `../architecture/integrations.md`.

## Định hướng mở rộng — quản lý công trình học thuật (sau giai đoạn đầu)

> Giai đoạn đầu tập trung **đề tài nghiên cứu khoa học**. Định hướng dài hạn: mở rộng RMS thành nền tảng
> quản lý **vòng đời mọi công trình học thuật** cho trường đại học, trên cùng một lõi dùng chung.

Các loại công trình này tuy khác nhau về quy mô nhưng cùng một "xương sống": *đăng ký đề tài → phân công
người hướng dẫn → thực hiện → bảo vệ/đánh giá qua hội đồng → công bố & lưu chiểu*. Chúng tái dùng được phần
lớn nền tảng đã có — đa tổ chức theo từng trường, mô hình hội đồng đánh giá, phân quyền theo vai trò, audit,
thông báo. RMS hướng tới quản lý thêm:

- **Luận án tiến sĩ** — nghiên cứu sinh; nhiều cấp bảo vệ (cấp cơ sở, cấp trường/nhà nước), phản biện độc lập, nộp lưu chiểu.
- **Luận văn thạc sĩ** — học viên cao học; người hướng dẫn; kiểm tra trùng lặp; một cấp bảo vệ.
- **Tiểu luận / khóa luận / đồ án tốt nghiệp** — sinh viên đại học; quy trình nhẹ, chấm điểm thay cho hội đồng đầy đủ.
- **Báo cáo NCKH sinh viên** — đề tài nghiên cứu cấp sinh viên/trường, gần với đề tài NCKH hiện có.

Đây là **định hướng tầm nhìn**, chưa thuộc phạm vi cam kết của giai đoạn đầu. Thiết kế chi tiết (mô hình dữ
liệu, vòng đời riêng cho từng loại, nhóm feature đào tạo) sẽ tách thành ADR và tài liệu feature khi triển khai;
giai đoạn đầu chỉ cần giữ kiến trúc **không khoá đường** mở rộng sang nhiều loại công trình về sau.

## Success metrics

> Mục tiêu đo lường bám sát các **vấn đề** ở trên. Các con số dưới đây là **mục tiêu đề xuất**,
> ghi theo hai mốc *giai đoạn đầu → khi vận hành ổn định*; sẽ được **hiệu chỉnh sau khi đo baseline**
> trên quy trình hiện tại.

**Hiệu quả xử lý quy trình**
- Thời gian trung bình xử lý một hồ sơ đề xuất (từ nộp đến có kết quả xét duyệt) **giảm ≥ 30% → ≥ 50%** so với baseline.
- Thời gian tổng hợp một báo cáo thống kê định kỳ **giảm từ 3–5 ngày xuống còn trong ngày (≤ vài giờ)**.

**Theo dõi & minh bạch**
- Tỷ lệ đề tài nộp báo cáo tiến độ **đúng hạn ≥ 80% → ≥ 90%**.
- Tỷ lệ hồ sơ xét duyệt / nghiệm thu được xử lý **hoàn toàn trên hệ thống** (không qua giấy hay email rời) **≥ 70% → ≥ 95%**.
- **100%** hành động quan trọng (duyệt, nghiệm thu, chi kinh phí) có nhật ký truy vết đầy đủ.

**Toàn vẹn & kết nối dữ liệu**
- **100%** sản phẩm khoa học gắn được với đề tài nguồn.
- **100%** khoản chi kinh phí đối soát được với hệ thống tài chính qua API.

**Mức độ sử dụng**
- Tỷ lệ người dùng (nhà khoa học, chuyên viên) **hoạt động hằng tháng** trên tổng số tài khoản được cấp **≥ 60% → ≥ 80%**.

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

## Changelog

| Ngày | Trạng thái | Thay đổi |
|------|------------|----------|
| 2026-06-11 | Approved | Viết lại mục *Success metrics* — cơ cấu lại theo 4 nhóm, thêm mục tiêu đề xuất theo hai mốc (giai đoạn đầu → ổn định); duyệt & chuyển Draft → Approved. |
| 2026-06-01 | Draft | Bản thảo đầu tiên. |
