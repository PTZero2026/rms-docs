# Hai realm thử của RMS

Gói SPI 0.94 khai báo Keycloak 26.8.0 trong POM. Dockerfile ghim JAR bằng SHA-256. Realm dùng Email OTP cho browser flow, cho phép tạo danh tính khi email mới xác minh mã. RMS cấp user khi nhận access token hợp lệ đầu tiên. [Mã nguồn SPI](https://github.com/p2-inc/keycloak-magic-link) · [POM đã ghim](https://repo.maven.apache.org/maven2/io/phasetwo/keycloak/keycloak-magic-link/0.94/keycloak-magic-link-0.94.pom)

Chạy từ gốc repo. Địa chỉ callback của ứng dụng phải khớp chính xác, gồm cả hostname và cổng.

```sh
node infra/keycloak/seed-realms.mjs infra/keycloak/realms
docker compose -f infra/keycloak/compose.yaml up --build
```

Mở web ở 127.0.0.1:5173, đường dẫn `/app/school-1` hoặc `/app/school-2`. Đọc OTP trong Mailpit tại 127.0.0.1:8026. Keycloak dùng cổng 8180. Nếu chạy bộ Playwright tích hợp, tạo seed với `RMS_WEB_ORIGIN=http://127.0.0.1:4191`. Seed mặc định cho phiên đăng nhập 300 giây, khóa tạm sau 5 lần sai. Để kiểm hết hạn nhanh, đặt `RMS_LOGIN_SECONDS=30` cho cả lệnh tạo seed và lệnh chạy test. Import lúc khởi động bỏ qua realm đã có. Khi thử một cấu hình mới, dùng DB thử mới hoặc cập nhật realm đã chọn qua công cụ quản trị.

## Thêm tenant và quản lý credential

1. Ops sinh cấu hình qua `localRealm(slug, options)`. Với pilot, dùng origin HTTPS đã duyệt, SMTP có TLS và credential do kho secret cấp, host TLS của IdP và chính sách giới hạn tần suất. Callback, logout và web origin chỉ chứa origin của web cho tenant đó.
2. Import realm mới, lấy trường issuer từ OIDC discovery. Provision cùng issuer và slug vào registry PostgreSQL bằng role migrate. Kiểm đăng nhập lần đầu và email đã xác minh ở đúng realm. Cho chủ thể bootstrap xác nhận subject từ danh tính đã kiểm.
3. Dùng kết nối DBA có quyền SET ROLE rms_migrate. Bắt đầu transaction, SET LOCAL ROLE rms_migrate, gọi `rms.bootstrap_admin(tenant_slug, verified_subject)` với tham số bind, rồi COMMIT. Khi đã có admin khác, hàm từ chối. Khi chạy lại cùng admin, hàm trả ID cũ.
4. Client SPA dùng PKCE S256 và là public client. Để xoay mật khẩu SMTP pilot, tạo credential mới ở nhà cung cấp, cập nhật cấu hình realm từ kho secret, nhận một OTP thử rồi mới thu hồi credential cũ. Với khóa ký, kích hoạt khóa mới trong realm, giữ khóa cũ ở trạng thái passive đến khi token cũ hết hạn và JWKS đã cập nhật. Kiểm token mới có kid mới trước khi gỡ khóa cũ.
