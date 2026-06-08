---
title: "ADR-0008: Keycloak làm IdP, đăng nhập passwordless email-OTP"
status: Accepted
date: 2026-06-07
deciders: "SA, Tech lead, PO/BA (B03)"
---

# ADR-0008: Keycloak làm IdP, đăng nhập passwordless email-OTP

## Bối cảnh

[ADR-0005](0005-sso-va-rbac.md) chốt **xác thực qua SSO (OIDC ưu tiên), phân quyền RBAC do RMS tự quản**, nhưng
chưa chốt IdP cụ thể. RMS là **đa tổ chức** ([migration-coverage §1](../migration-coverage.md)) và repo cũ
([nckh-backend](https://github.com/ducnv2509/BE_NCKH)) đã chạy trên **Keycloak realm-per-tenant** (deps:
`nest-keycloak-connect`, `jwks-rsa`, `passport-jwt`).

Giai đoạn đầu chỉ cần **một luồng đăng nhập đơn giản**: người dùng nhập email, nhận **OTP qua mail**, không tự
đăng ký, không quên-mật-khẩu.

## Quyết định

- **Dùng Keycloak làm IdP**, mô hình **1 realm / 1 tổ chức** (khớp Q1 đa tổ chức).
- **Đăng nhập passwordless email-OTP**: email → OTP gửi qua mail → verify → phát JWT. Triển khai bằng **custom
  Authentication Flow + Authenticator SPI (plugin Email-OTP)**, dùng **SMTP cấu hình theo từng realm**.
- **Keycloak = authN; RMS = authZ.** Token chỉ mang danh tính (`sub`, `email`); **quyền lấy từ RBAC của RMS**
  ([ADR-0005](0005-sso-va-rbac.md)), không đọc role từ claim Keycloak.
- **Phạm vi giai đoạn đầu (cố ý loại bỏ):**
  - ❌ Tự đăng ký (self-registration) — tài khoản do **admin B03** tạo qua **Admin REST API**.
  - ❌ Quên mật khẩu — không áp dụng vì passwordless (không có mật khẩu).
  - ❌ Social login / liên kết IdP ngoài, MFA bổ sung — để sau.

## Phương án đã cân nhắc

- **A — Keycloak realm-per-tenant + email-OTP (chọn):** tận dụng nguyên hạ tầng repo cũ; cô lập tổ chức mạnh;
  passwordless bỏ được cả lưu mật khẩu lẫn flow quên mật khẩu.
- **B — IdP khác (Auth0/Authentik/tự xây):** phải làm lại tích hợp; mất công sức đã có ở repo cũ. Loại.
- **C — Đăng nhập email + mật khẩu truyền thống:** kéo theo lưu mật khẩu, đăng ký, quên mật khẩu, chính sách
  mật khẩu — thừa cho hệ nội bộ do admin cấp tài khoản. Loại.

## Hệ quả

**Được:**
- Không lưu mật khẩu trong RMS lẫn Keycloak (passwordless) → giảm bề mặt rủi ro; bỏ hẳn flow quên mật khẩu.
- Cô lập tổ chức ở mức realm; onboard tổ chức mới = tạo realm + cấu hình SMTP qua Admin API.

**Phải làm tiếp / lưu ý:**
- **Sửa khi lift:** bỏ đoạn decode role từ JWT của code cũ; backend chỉ map `sub`→user RMS rồi check quyền RMS
  (phân quyền thực thi ở backend — [AGENTS.md §4.1](../../../AGENTS.md)).
- DB RMS giữ **bản sao profile** khoá theo `keycloak_id` (= `sub`); đồng bộ từ Keycloak qua webhook/event hoặc
  upsert khi B03 tạo user.
- **Vận hành đa realm:** mỗi realm cần cấu hình **SMTP riêng** + cài plugin Email-OTP; cần quy trình quản lý
  template mail OTP nhất quán giữa các realm.
- **Chống user enumeration:** email chưa tồn tại vẫn trả "đã gửi mã" (không thực gửi), không tiết lộ email nào có trong hệ thống.
- **Cấp tài khoản:** B03 tạo user qua Admin REST API (không có self-registration); cần màn hình/endpoint quản trị tương ứng.
- OTP: chốt thời hạn hiệu lực + số lần thử + throttling (chống brute-force) — đưa vào spec B03.
