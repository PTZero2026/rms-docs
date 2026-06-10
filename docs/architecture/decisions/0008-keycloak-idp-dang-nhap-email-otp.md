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
- **Auto-provision khi đăng nhập lần đầu (giai đoạn đầu):** email mới + verify OTP thành công lần đầu → RMS
  **tự tạo tài khoản** và gán **role thấp nhất `USER`**. Admin **B03 nâng quyền sau** (USER → role cao hơn);
  không cần tạo tài khoản trước.
- **Phạm vi giai đoạn đầu (cố ý loại bỏ):**
  - ❌ Form tự đăng ký (self-registration) riêng — không có; danh tính khởi tạo ngầm qua chính luồng email-OTP.
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
- Onboard người dùng không cần admin tạo trước: tự đăng nhập là có ngay tài khoản `USER` chờ nâng quyền.

**Phải làm tiếp / lưu ý:**
- **Sửa khi lift:** bỏ đoạn decode role từ JWT của code cũ; backend chỉ map `sub`→user RMS rồi check quyền RMS
  (phân quyền thực thi ở backend — [AGENTS.md §4.1](../../../AGENTS.md)).
- DB RMS giữ **bản sao profile** khoá theo `keycloak_id` (= `sub`); upsert khi đăng nhập lần đầu (auto-provision),
  đồng bộ tiếp từ Keycloak qua webhook/event.
- **Auto-provision:** khi map `sub`→user mà chưa tồn tại → tạo user RMS với role `USER`. Quyền `USER` thấp nhất:
  - Chỉ **xem thông tin đề tài đã publish**, và **không phải full đề tài** mà chỉ các trường do **admin quy định
    được công khai** (ví dụ Abstract / tóm tắt …).
  - Chưa có quyền thao tác nghiệp vụ nào khác cho tới khi B03 nâng quyền.
  - (Chi tiết danh sách trường công khai + quyền đầy đủ đưa vào spec B03 / B01 cấu hình.)
- **User enumeration:** auto-provision đồng nghĩa **mọi email gửi được OTP đều đăng nhập được** → mất cơ chế "không
  thực gửi cho email lạ" của bản trước. Chấp nhận ở giai đoạn đầu; bù bằng **throttling theo email/IP** và việc
  USER chưa có quyền gì đáng kể cho tới khi B03 nâng. Cân nhắc allowlist domain nếu cần siết sau.
- **Vận hành đa realm:** mỗi realm cần cấu hình **SMTP riêng** + cài plugin Email-OTP; cần quy trình quản lý
  template mail OTP nhất quán giữa các realm.
- **Quản trị:** B03 cần màn hình/endpoint **nâng/hạ quyền** user (thay cho luồng tạo tài khoản); vẫn giữ Admin REST
  API để tạo/khoá user thủ công khi cần.
- OTP: chốt thời hạn hiệu lực + số lần thử + throttling (chống brute-force) — đưa vào spec B03.
