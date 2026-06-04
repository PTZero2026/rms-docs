---
title: "Tích hợp hệ thống — RMS"
status: Draft
updated: 2026-06-01
---

# Tích hợp ngoài

> RMS không tự xây những hạ tầng đã có sẵn trong tổ chức (định danh, gửi tin, tài chính) mà **tích hợp**.
> Mỗi tích hợp có một owner phía RMS và một đầu mối phía hệ thống đối tác.

## 1. Tổng quan

| Hệ thống | Mục đích | Giao thức | Chiều | Feature liên quan | Mức phụ thuộc |
|---|---|---|---|---|---|
| SSO nội bộ | Đăng nhập một lần | OIDC (ưu tiên) / SAML 2.0 | RMS ← SSO | Toàn hệ thống, B03 | Bắt buộc |
| Email/SMS gateway | Gửi thông báo | SMTP / REST API | RMS → GW | B04 (xuyên suốt) | Bắt buộc cho thông báo |
| Hệ thống tài chính | Đối soát kinh phí | REST API (hoặc file định kỳ) | Hai chiều | F05 | Quan trọng, có fallback thủ công |
| Object storage | Lưu file đính kèm | S3 API | Hai chiều | Mọi feature có upload | Bắt buộc |

## 2. SSO (OIDC/SAML)

- **Luồng:** Authorization Code + PKCE (OIDC). RMS là Relying Party; SSO là Identity Provider.
- **Ánh xạ định danh:** claim `email` (hoặc `preferred_username`) → `User.email`. Lần đăng nhập đầu,
  nếu chưa có tài khoản và chính sách cho phép, tạo `User` với `accountSource = SSO` (just-in-time provisioning).
- **Vai trò:** RMS quản lý vai trò nội bộ (B03), **không** lấy quyền từ SSO — SSO chỉ chứng thực danh tính.
- **Đăng xuất:** hỗ trợ single logout nếu IdP cung cấp; nếu không, hủy session nội bộ.
- **Dự phòng:** tài khoản `INTERNAL` (đăng nhập mật khẩu RMS) cho người không có trên SSO hoặc khi SSO sự cố;
  giới hạn tối thiểu, có audit riêng.

## 3. Email/SMS gateway

- **Email:** SMTP nội bộ hoặc API; RMS đẩy job vào hàng đợi, worker gửi và cập nhật `Notification.status`.
- **SMS:** API nhà cung cấp; chỉ dùng cho sự kiện ưu tiên cao (nhắc hạn sát ngày, kết quả nghiệm thu).
- **Mẫu thông báo:** quản lý ở B04 (template theo `eventType`), tránh hardcode nội dung trong code.
- **Retry & dead-letter:** gửi lỗi được thử lại theo cấu hình; quá số lần chuyển trạng thái `ERROR` để theo dõi.
- Chi tiết sự kiện ↔ kênh: xem `features/B04-thong-bao/spec.md`.

## 4. Hệ thống tài chính (đối soát kinh phí — F05)

- **Mục tiêu:** RMS là nơi **theo dõi** kinh phí đề tài; hệ thống tài chính là **sổ cái** thật.
  RMS đối soát `BudgetTransaction` với giao dịch bên tài chính, **không** thay thế kế toán.
- **Cơ chế:** ưu tiên REST API truy vấn giao dịch theo mã đề tài/mã giao dịch; fallback nhập file
  định kỳ (CSV/Excel) nếu chưa có API.
- **Khóa đối chiếu:** `BudgetTransaction.financeTransactionCode` ↔ mã chứng từ bên tài chính.
- **Kết quả đối soát:** mỗi giao dịch nhận `reconciliationStatus` = `MATCHED` / `MISMATCHED` / `UNRECONCILED`;
  chênh lệch được liệt kê cho chuyên viên xử lý thủ công. Xem [ADR-0004](decisions/0004-doi-soat-kinh-phi-qua-api.md).

## 5. Object storage

- File (thuyết minh, minh chứng sản phẩm, báo cáo) lưu ở object storage; CSDL chỉ giữ metadata
  (`Attachment`). Truy cập qua pre-signed URL có thời hạn, kiểm quyền ở backend trước khi cấp URL.

## 6. Nguyên tắc tích hợp chung

- Mọi tích hợp đi qua một **lớp adapter** trong backend; domain không phụ thuộc trực tiếp SDK đối tác.
- Cấu hình endpoint/khóa bí mật để ở secret manager, không commit vào repo.
- Mỗi tích hợp có chế độ **degrade**: SSO lỗi → tài khoản nội bộ; tài chính lỗi → đối soát thủ công;
  email lỗi → thông báo in-app vẫn hoạt động.
