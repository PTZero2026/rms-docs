---
title: "Danh mục & cấu hình (sys-config-service) — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.3
updated: 2026-07-04
---

# Danh mục & cấu hình (sys-config-service) — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu,
> báo lại BA/PO. Phạm vi kiểm thử **chỉ là `sys-config-service`** (kho cấu hình khóa–giá trị dạng
> blob) — **không** kiểm thử danh mục nghiệp vụ có FK (Unit / ResearchField / ProductType /
> Catalog / CriteriaSet…): những thứ đó thuộc `nckh-backend`, kiểm thử ở feature khác (spec §2, §8).

## 1. Phạm vi kiểm thử

- **Mặt kiểm thử:** chủ yếu **API backend** của `sys-config-service` (5 endpoint: `GET list`,
  `GET :key`, `POST`, `PUT :key`, `DELETE :key`) — kiểm quyền, fallback tenant, cache, đoán MIME.
  Màn hình quản trị (xem [`ui.md`](./ui.md)) chỉ là lớp mỏng gọi các API này; test UI = smoke.
- **Môi trường staging:**
  - **PostgreSQL** database riêng `sys_config_db` (bảng duy nhất `sys_configuration`).
  - **Redis** cụm chung, namespace `sys-config:admin:<tenantId hoặc __shared__>:<key>` (BR-04, spec §7).
  - **Keycloak** realm chung với `nckh-backend` (ADR-0008), phát token RS256 cho 4 vai trò mẫu:
    `super_admin`, `admin`/`tenant_admin` (của tenant X), `admin`/`tenant_admin` (của tenant Y),
    và một `user` thường (không quyền ghi).
- **Tenant mẫu:** hai tenant **X** và **Y** để kiểm fallback và cách ly.
- **Dữ liệu mẫu:**
  - Bản shared (`tenantId = NULL`): `key = "CONFIG.FE"` (JSON), `key = "ROLES"` (JSON).
  - Bản tenant X (`tenantId = X`): `key = "ROLES"` (đã ghi đè shared).
  - File nhị phân: một PNG 3 KB, một file > 20 MB để test giới hạn.
- **Phủ AC:** AC-01 … AC-13 đều có ≥1 test case (xem cột "Liên kết AC").

## 2. Test cases

| ID    | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|-------|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đăng nhập `super_admin`; key `"NEW.SHARED"` chưa tồn tại | POST `/sys-configurations` key `"NEW.SHARED"`, content JSON, **không** kèm tenantId | Lưu thành công với `tenantId = NULL`; tenant X **và** Y đọc `GET :key` đều nhận nội dung này | Happy |
| TC-02 | AC-02 | Đã có bản shared `"CONFIG.FE"` | Đăng nhập `tenant_admin` X, POST cùng key `"CONFIG.FE"`, content khác | Lưu với `tenantId = X` (không đè bản shared). X đọc → bản của X; Y đọc → vẫn bản shared | Happy |
| TC-03 | AC-03 | Đã có bản `(tenantId = X, key = "ROLES")` | `tenant_admin` X POST lại đúng key `"ROLES"` | Bị từ chối **409 Conflict** ("duplicate"); không tạo row mới | Biên/Lỗi |
| TC-04 | AC-04 | Key `"NOT.EXIST"` không có ở tenant X lẫn shared | `tenant_admin` X GET `/sys-configurations/NOT.EXIST` | Trả về **404 Not Found** | Lỗi |
| TC-05 | AC-05 | Key `"CONFIG.FE"` chỉ có bản shared; cache đã bị xóa | User tenant X GET `:key` lần 1, rồi lần 2 trong vòng 5 phút | Lần 1: nội dung bản shared + header `X-Cache: MISS`; lần 2: cùng nội dung + `X-Cache: HIT` | Happy |
| TC-06 | AC-06 | Cache đang HIT cho `"CONFIG.FE"` của tenant X | `tenant_admin` X PUT (hoặc DELETE) key `"CONFIG.FE"`; sau đó GET lại | Cache **đúng key đó** (`…:X:config.fe`) bị xóa; GET kế tiếp trả `X-Cache: MISS`; các key khác vẫn HIT | Biên |
| TC-07 | AC-07 | Đăng nhập vai trò `user` (không admin/tenant_admin) | POST / PUT / DELETE một key bất kỳ | Bị từ chối **403 Forbidden**; dữ liệu không đổi | Quyền |
| TC-08 | AC-08 | `tenant_admin` X đăng nhập | POST key chứa dấu cách (`"my key"`) và key chứa `/` (`"a/b"`) | Bị từ chối **400** với thông báo ký tự không hợp lệ (BR-05); không tạo row | Biên/Lỗi |
| TC-09 | AC-09 | `tenant_admin` X; PNG 3 KB | POST multipart file PNG, **không** khai `mime_type` | Tự đoán `mimeType = "image/png"`, `encoding` theo chardet; GET `:key` trả `Content-Type: image/png` (không kèm charset) | Happy |
| TC-10 | AC-10 | `tenant_admin` X | POST content kèm query `?detect=true` | Trả về metadata đã parse (`mime`, `encoding`, `content_size`); **không** insert row (GET `:key` sau đó vẫn 404) | Happy (dry-run) |
| TC-11 | AC-11 | File > 20 MB | POST file vượt `MAX_CONTENT_BYTES` (20 MB) | Bị từ chối **413** (hoặc 400 tùy multer); không lưu | Biên/Lỗi |
| TC-12 | AC-12 | Có bản shared `"ROLES"` **và** bản `(X, "ROLES")` | `tenant_admin` X DELETE `"ROLES"`; sau đó X GET `"ROLES"` | Row của X bị **xóa cứng** khỏi DB; bản shared còn nguyên; GET của X sau đó trả **bản shared** (fallback) | Happy |
| TC-13 | AC-13 | Có bản `(X, k1)`, `(Y, k2)`, và shared `(NULL, k3)` | `tenant_admin` X GET `/sys-configurations` (list) | Danh sách chỉ gồm `tenantId = X` **và** `tenantId = NULL`; **không** thấy `(Y, k2)` | Quyền |

## 3. Trường hợp biên & negative

- **Content bắt buộc khi tạo (BR-06):** POST không kèm content (multipart rỗng / JSON thiếu `content`)
  → **400**. Ngược lại, **PUT** để trống content → giữ nguyên nội dung cũ (không xóa content).
- **Ưu tiên giá trị khai báo (BR-08):** POST khai rõ `mime_type = "application/json"` cho một file
  ảnh → hệ thống **tôn trọng giá trị khai**, không tự đoán đè.
- **Fallback MIME (BR-08):** content không nhận diện được magic bytes và không "text-like" →
  `mimeType = application/octet-stream`; encoding không đoán được → `utf-8`.
- **Charset khi trả text (BR-09):** GET một key JSON/text → header `Content-Type` **kèm**
  `charset = <encoding lưu>`; GET một key ảnh/PDF → **không** kèm charset.
- **Xóa cứng không có khôi phục (BR-10):** DELETE một key → row biến mất thật; không có endpoint
  "khôi phục". Cờ `active = false` chỉ **ẩn khỏi UI chọn**, GET `:key` vẫn trả về bình thường.
- **Cách ly tenant (BR-11):** không tồn tại cách hợp lệ để `tenant_admin` X đọc bản riêng của
  tenant Y (kể cả GET thẳng `:key` — chỉ trả bản của X hoặc shared, không bao giờ bản của Y).
- **Super_admin không fallback (BR-03):** `super_admin` (tenant = NULL) GET một key **chỉ** có bản
  riêng của tenant X → **404** (super_admin chỉ nhìn bản shared).
- **Auth (BR-12):** token hết hạn / sai issuer (`iss`) / thiếu Bearer → **401** ở mọi endpoint.
- **Cache khi Redis lỗi (BR-04):** Redis down → request vẫn phục vụ được bằng cách đọc thẳng DB
  (không chặn), header `X-Cache: MISS`.
- **List — lọc & phân trang (spec §3.5):** GET list với `keyword` / `refer` / `group` / `public` /
  `active` / khoảng thời gian tạo–sửa trả đúng tập lọc; phân trang `skip`+`limit`; **không** kèm bytes
  content trong list (chỉ metadata).

## 4. Checklist hồi quy

Khi `sys-config-service` thay đổi, kiểm tra lại các **consumer** đọc cấu hình (spec §7):

- [ ] `nckh-backend`: các key nghiệp vụ chung (`ROLES`, `ACADEMIC_TITLES`, `SPECIALTIES`…) vẫn đọc
      được qua fallback shared; dropdown/seed default không vỡ.
- [ ] FE (isofh-admin, portal): config JSON runtime (theme, feature flag, endpoint map…) parse đúng
      định dạng theo `refer` (rủi ro spec §7.1 — convention content-format).
- [ ] `mail-service` / `templates-service`: template lưu base64 tải & decode đúng.
- [ ] Cache: PUT/DELETE một key chỉ invalidate **đúng** key đó (không xóa toàn cache), multi-pod
      không stale (rủi ro spec §7.2).
- [ ] Fallback: tenant chưa cấu hình riêng vẫn nhận bản shared; tenant đã ghi đè nhận đúng bản mình.
- [ ] Auth: đổi realm/issuer Keycloak không phá verify RS256; `tenant_id` claim vẫn map đúng tenant.
