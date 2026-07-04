---
title: "Danh mục & cấu hình (sys-config-service) — Giao diện"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.3
updated: 2026-07-04
---

# Danh mục & cấu hình (sys-config-service) — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). File này chỉ mô tả
> phần **đặc thù giao diện** của màn hình quản trị cấu hình. Mọi luật nghiệp vụ → [`spec.md`](./spec.md);
> chi tiết endpoint/data-model → `design.md`.
>
> **Lưu ý phạm vi:** đây là UI cho `sys-config-service` — kho **cấu hình khóa–giá trị dạng blob**.
> **Không** phải màn hình quản lý danh mục nghiệp vụ có FK (Unit / ResearchField / ProductType /
> Catalog / CriteriaSet…): những màn hình đó thuộc `nckh-backend`, mô tả ở feature khác (spec §2, §8).

## 1. Vai trò sử dụng

- **Quản trị hệ thống** (`super_admin`): quản lý các bản **dùng chung** (`tenantId = NULL`) — áp dụng
  cho mọi tenant chưa cấu hình riêng.
- **Quản trị đơn vị** (`admin` / `tenant_admin`): quản lý các bản **của tenant mình**
  (`tenantId = <tenant JWT>`) — ghi đè bản shared khi cần cá biệt hóa.
- **Người dùng thường** (`user`): **không** có màn hình quản trị. Họ chỉ **đọc** cấu hình ngầm qua
  các feature khác gọi API (spec §1) — không thao tác trực tiếp ở đây.

Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền. Vai trò chi tiết:
[`../../product/personas.md`](../../product/personas.md). Quy tắc phân quyền nền:
[`../../architecture/overview.md`](../../architecture/overview.md) §4.1 (RBAC, kiểm tra quyền ở backend).

## 2. Phân quyền (Permission matrix)

Cột là vai trò; ✓ = được phép, – = không. Mọi quyền kiểm tra ở backend; UI chỉ ẩn/hiện theo quyền.

| Hành động | Quản trị hệ thống (`super_admin`) | Quản trị đơn vị (`tenant_admin`) |
|-----------|:---:|:---:|
| Xem danh sách cấu hình (list, có lọc + phân trang) | ✓ (bản shared) | ✓ (bản của tenant mình + shared) |
| Xem / tải nội dung một key | ✓ | ✓ |
| Xem trước metadata (dry-run) | ✓ | ✓ |
| Tạo / sửa / xóa **bản dùng chung** (`tenantId = NULL`) | ✓ | – |
| Tạo / sửa / xóa **bản của tenant** | – (không thuộc tenant nào) | ✓ (chỉ tenant mình) |

**Ghi chú phân quyền quan trọng (spec §4):**
- `super_admin` (tenant = NULL) **chỉ thấy bản shared**, không duyệt được bản riêng của tenant nào
  (BR-03/BR-11). Muốn xem cấu hình tenant X phải đăng nhập vai trò của tenant X.
- Không có phân quyền theo từng key (ACL từng key) — quyền chỉ ở cấp service: **đọc** vs **ghi**
  (BR-02). Không có workflow duyệt: ghi là **hiệu lực ngay**.

## 3. Danh sách màn hình

Toàn bộ B01 gói trong một **trang "Cấu hình hệ thống"**: bảng danh sách bên trên, mở một dòng
→ panel chi tiết/sửa; nút **[+ Thêm cấu hình]** mở form tạo. Bố cục:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Cấu hình hệ thống                                        [+ Thêm cấu hình] │
│ Bộ lọc: [Tìm key/mô tả…] [Refer ▾] [Group ▾] [Public ▾] [Active ▾] [Ngày…] │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Key         │ Phạm vi  │ Refer  │ Group │ MIME       │ Active │  ⋯     │ │
│ ├───────────────────────────────────────────────────────────────────────┤ │
│ │ CONFIG.FE   │ Tenant X │ FRONT… │ theme │ application/json │ ✓ │ Sửa ⋮ │ │
│ │ ROLES       │ Chung    │ ROLES  │ –     │ application/json │ ✓ │ Sửa ⋮ │ │
│ │ LOGO.PNG    │ Tenant X │ BRAND  │ –     │ image/png        │ ✓ │ Sửa ⋮ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                   Trang 1/… ‹ ›  [skip/limit]│
└───────────────────────────────────────────────────────────────────────────┘
```

| Mã MH | Tên màn hình | API | Mục đích |
|-------|--------------|-----|----------|
| CFG-00 | Danh sách cấu hình | `GET /sys-configurations` | Bảng metadata (không kèm bytes) + bộ lọc + phân trang; cột **Phạm vi** phân biệt "Chung" (shared) vs "Tenant …". |
| CFG-01 | Tạo cấu hình | `POST /sys-configurations` | Form nhập key + nội dung (upload / dán text-JSON / base64) + metadata; có nút **Xem trước** (dry-run). |
| CFG-02 | Sửa cấu hình | `PUT /sys-configurations/:key` | Sửa metadata và/hoặc thay nội dung; **để trống nội dung = giữ nguyên** (BR-06). |
| CFG-03 | Xem / tải nội dung | `GET /sys-configurations/:key` | Xem trước (JSON/text/ảnh) hoặc tải file; hiển thị header `X-Cache: HIT\|MISS`. |
| — | Xóa cấu hình | `DELETE /sys-configurations/:key` | Hành động inline có xác nhận; **xóa cứng** (BR-10). |

## 4. Mô tả màn hình & thao tác

### CFG-00 Danh sách cấu hình
- **Hiển thị:** bảng phẳng `key`, **Phạm vi** (Chung / Tenant hiện tại), `refer`, `group`, `mimeType`,
  `active`, `created`/`modified`. Danh sách gồm cả bản của tenant hiện tại **và** bản shared (BR-11);
  cột **Phạm vi** giúp phân biệt bản nào sẽ bị mình ghi đè.
- **Bộ lọc (spec §3.5):** ô tìm `keyword` (theo key/mô tả), `refer`, `group`, `public`, `active`,
  khoảng thời gian tạo/sửa. Phân trang `skip`+`limit`.
- **Thao tác dòng:** *Sửa* (→ CFG-02), *Xem/tải* (→ CFG-03), *Xóa* (xác nhận, xóa cứng).
- **Không kèm nội dung:** list chỉ trả metadata; muốn xem bytes phải mở CFG-03.

### CFG-01 Tạo cấu hình
- **Trường nhập:** `key` (bắt buộc, validate ký tự `[a-zA-Z0-9._-]+` ≤ 128 — BR-05), `description`,
  `refer` (mặc định gợi ý chuẩn hóa theo domain — spec §7.6), `group`, cờ `public`, cờ `active`.
- **Nội dung (một trong ba cách — BR-06 bắt buộc có khi tạo):**
  - **Upload file** (multipart) — ảnh/PDF/binary;
  - **Dán text/JSON/XML** (urlencoded);
  - **Dán base64** (JSON body).
- **MIME / encoding:** để trống → hệ thống **tự đoán** (BR-08); hoặc khai tay để ép giá trị.
- **Xem trước (dry-run — spec §3.6):** nút **[Xem trước]** gọi `?detect=true` → hiển thị `mime`,
  `encoding`, `content_size` đã parse mà **không lưu**. Dùng để kiểm định dạng trước khi lưu thật.
- **Phạm vi lưu (tự động theo vai trò — BR-02):** `super_admin` → lưu **Chung** (`tenantId = NULL`);
  `tenant_admin` → lưu **Tenant mình**. Không có ô chọn tenant thủ công.
- **Phản hồi lỗi:** key sai định dạng → 400 (BR-05); content rỗng → 400 (BR-06); content > 20 MB →
  413/400 (BR-07); key đã tồn tại trong phạm vi → **409** "đã tồn tại" (BR-01), gợi ý dùng *Sửa*.

### CFG-02 Sửa cấu hình
- **Sửa được:** `description`, `refer`, `group`, `public`, `active`, MIME/encoding, và nội dung.
- **Giữ nội dung cũ:** để trống ô nội dung khi lưu → **không đổi** content (BR-06); chỉ cập nhật metadata.
- **`active = false`:** ẩn key khỏi danh sách chọn ở các UI tiêu thụ, **không** xóa; GET `:key` vẫn
  trả về (BR-10).
- **Sau khi lưu:** cache của **đúng key đó** bị invalidate ngay (BR-04) — lần đọc kế tiếp là MISS.

### CFG-03 Xem / tải nội dung
- **Hiển thị theo MIME (BR-09):** JSON/text/XML/YAML → xem inline (kèm charset); ảnh → preview; PDF/
  binary → nút tải xuống. Header `Content-Type` đúng như đã lưu.
- **Chỉ báo cache:** hiển thị `X-Cache: HIT` (từ Redis, TTL 5 phút) hoặc `MISS` (đọc DB) để quản trị
  biết đang xem bản cache hay bản tươi.
- **Nguồn dữ liệu (fallback — BR-03):** nếu tenant chưa có bản riêng, màn hình hiển thị **bản shared**
  và ghi rõ "đang dùng bản Chung"; muốn cá biệt hóa → *Tạo cấu hình* cùng key cho tenant.

## 5. Trạng thái, không có audit

- Service **không** ghi audit log chi tiết (không `AuditLog` với `oldValue/newValue`) và **không** có
  versioning nội dung — một PUT ghi đè hoàn toàn bản cũ, không rollback được (spec §2, §7.4–§7.5).
  UI **không** có màn hình "Nhật ký thay đổi". Nếu cần truy vết, xem đề xuất mở ở spec §7.4.
- Metadata thời gian duy nhất trên mỗi bản ghi là `created` / `modified` (hiển thị ở CFG-00/CFG-02).

## 6. Liên kết AC

| Màn hình | AC liên quan (xem [`spec.md`](./spec.md) §6) |
|----------|-----------------------------------------------|
| CFG-00 Danh sách | AC-13 (chỉ thấy tenant mình + shared) |
| CFG-01 Tạo | AC-01 (ghi shared), AC-02 (ghi override), AC-03 (409 trùng), AC-07 (403 sai quyền), AC-08 (400 key sai), AC-09 (đoán MIME), AC-10 (dry-run), AC-11 (413 quá 20 MB) |
| CFG-02 Sửa | AC-06 (invalidate cache đúng key), AC-07 (quyền) |
| CFG-03 Xem/tải | AC-04 (404), AC-05 (X-Cache MISS→HIT), AC-09/BR-09 (Content-Type) |
| Xóa (inline) | AC-12 (xóa cứng, shared vẫn còn → fallback) |
