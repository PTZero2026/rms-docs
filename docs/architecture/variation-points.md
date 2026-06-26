---
title: "Sổ điểm biến thiên (variation points) — RMS đa tổ chức"
status: Draft
version: 0.1
updated: 2026-06-24
---

# Sổ điểm biến thiên — cấu hình per-tenant

> **Hợp đồng giữa sản phẩm lõi và cấu hình tenant** ([ADR-0012](decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)).
> Liệt kê **tường minh** mọi chỗ được phép khác nhau giữa các trường — và khác **như thế nào**. Chỉ những điểm
> có trong sổ này mới được cấu hình per-tenant; mọi chỗ khác là **lõi cố định**, giống nhau cho mọi tenant.
>
> Quy ước: spec lõi (`features/*`) mô tả *điểm biến thiên*; hồ sơ `docs/tenants/<trường>/` điền *giá trị*.
> Thêm một dòng vào sổ này là một quyết định kiến trúc (xem [ADR-0012](decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)) —
> không "cấu hình ngầm".

## Cách đọc

- **Mã VP** — định danh điểm biến thiên (tham chiếu được từ hồ sơ tenant).
- **Cơ chế** — thứ cho phép biến thiên (graph, danh mục, tham số, cờ…).
- **Mức** — *Bật/tắt* (on/off) · *Chọn* (chọn từ danh mục cố định) · *Giá trị* (điền số/chuỗi/bảng) · *Graph* (dựng sơ đồ).
- **Mặc định** — giá trị seed nếu tenant không ghi đè (trường mới chạy được ngay).
- **Ai cấu hình** — vai trò chỉnh (Quản trị hệ thống / Quản trị tenant / Dev).
- **Ranh giới** — phần KHÔNG được biến thiên (giữ trong lõi).

## 1. Phạm vi & feature

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-FEAT | Feature nào bật cho tenant | Cờ feature per-tenant | Bật/tắt | Bộ lõi F01–F08, B01–B04 bật; E4 (P03, F09–F12) tắt | Quản trị hệ thống | [ADR-0012](decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md) |
| VP-MODE | Mức quản lý của một loại đối tượng | Cờ trong feature | Chọn | Theo spec feature | Quản trị tenant | vd F09 "đầu mục" vs full lifecycle |
| VP-HOME | Tập widget & bố cục **trang chủ** mặc định theo vai trò | Field/layout config per-tenant trên **bộ widget chuẩn** (không tạo widget tuỳ biến) | Bật/tắt + Giá trị (thứ tự) | Bố cục mặc định theo vai trò (bộ widget chuẩn B06) | Quản trị tenant | [B06](../features/B06-trang-chu/) (BR-05) |
| VP-EVID-REQ | **Loại minh chứng bắt buộc** để duyệt, theo **cấp/loại × giai đoạn** | `CatalogItem.extra.requiredEvidence` (jsonb) trên item cấp/loại; loại minh chứng từ danh mục `EVIDENCE_TYPE` | Giá trị | *(chưa có — mỗi trường tự cấu hình)* | Quản trị tenant | [F09](../features/F09-de-tai-cap-tren/) (BR-02), dùng chung F10–F12 |

## 2. Định danh & đăng nhập

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-IDP | Nhà cung cấp định danh (IdP) | Cấu hình IdP theo `realm` | Chọn | Keycloak email-OTP | Quản trị hệ thống | [ADR-0008](decisions/0008-keycloak-idp-dang-nhap-email-otp.md); Microsoft Entra cần ADR mới |
| VP-PROV | Cách khởi tạo tài khoản | Tham số | Chọn | Auto-provision khi đăng nhập lần đầu, role `USER` | Quản trị hệ thống | [ADR-0008](decisions/0008-keycloak-idp-dang-nhap-email-otp.md) |
| VP-SYNC | Đồng bộ GV/SV từ hệ thống ngoài | Adapter tích hợp | Bật/tắt + Giá trị | Tắt (khai báo trong RMS) | Quản trị hệ thống | `integrations.md` (cần bổ sung) |

> **Ranh giới:** Keycloak = authN, RMS = authZ; **quyền (RBAC) luôn do RMS quản**, không lấy role từ IdP
> ([ADR-0005](decisions/0005-sso-va-rbac.md)). Đây là lõi cố định, không biến thiên.

## 3. Vòng đời & quy trình

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-WF | Vòng đời `ResearchProject` (các bước, chuyển bước, vai trò) | Workflow graph (3 tầng), versioned | Graph + Chọn | Template seed (ERD `data-model.md §3`) | Quản trị tenant | [ADR-0007](decisions/0007-workflow-engine-dong-per-tenant.md) |
| VP-GE | Guard/effect áp vào từng transition | Chọn từ **danh mục cố định** | Chọn | Theo template | Quản trị tenant | [ADR-0007](decisions/0007-workflow-engine-dong-per-tenant.md) |
| VP-MEET | Mô hình cuộc họp/hội đồng (thành phần, biên bản) | Cấu hình hội đồng | Giá trị | Mô hình dùng chung F03 | Quản trị tenant | [ADR-0003](decisions/0003-mo-hinh-hoi-dong-dung-chung.md) |

> **Ranh giới vàng** ([ADR-0007](decisions/0007-workflow-engine-dong-per-tenant.md)): tenant chỉ chọn graph +
> chọn guard/effect *nào* áp vào transition *nào*, từ danh mục cố định. **Cài đặt** guard/effect luôn ở code
> lõi — không nhét logic vào engine. Báo cáo xuyên tổ chức dựa trên `statusSemantic` chuẩn hóa, **không** biến thiên.

## 4. Danh mục & dữ liệu tham chiếu

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-CAT | Danh mục dùng chung (đơn vị/viện, lĩnh vực, chức danh, loại sản phẩm, loại hoạt động…) | B01 catalog per-tenant | Giá trị | Seed tối thiểu | Quản trị tenant | [B01](../features/B01-danh-muc-cau-hinh/) |
| VP-CRIT | Bộ tiêu chí xét duyệt / nghiệm thu | B01 catalog | Giá trị | Mẫu mặc định | Quản trị tenant | [B01](../features/B01-danh-muc-cau-hinh/), F03/F06 |
| VP-PARAM | Tham số hệ thống (hạn mặc định, ngưỡng…) | B01 tham số | Giá trị | Theo spec | Quản trị tenant | [B01](../features/B01-danh-muc-cau-hinh/) |

## 5. Quy đổi giờ giảng (P03)

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-TH-FORMULA | Công thức/định mức quy đổi theo loại hoạt động | Bảng tham số per-tenant, hiệu lực theo kỳ | Giá trị | *(chưa có — mỗi trường tự cấp)* | Quản trị tenant | [P03](../features/P03-quy-doi-gio-giang/) |
| VP-TH-ALLOC | Quy tắc phân bổ giờ theo vai trò | Bảng tham số | Giá trị | *(chưa có)* | Quản trị tenant | [P03](../features/P03-quy-doi-gio-giang/) |

> **Ranh giới:** *cách tính* (engine quy đổi, idempotent, ghi audit) là lõi cố định; chỉ **tham số công thức**
> biến thiên. Lớp chuẩn hóa "giờ giảng" (đơn vị) giống nhau mọi tenant để tổng hợp vào lý lịch (F08).

## 6. Biểu mẫu & template

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-FORM | Biểu mẫu thuyết minh / tờ trình / hợp đồng / biên bản | Template per-tenant | Giá trị | Mẫu mặc định | Quản trị tenant | B01, F01/F03/F06 |
| VP-CV-TPL | Template trích xuất lý lịch khoa học (ký xác nhận) | Template per-tenant | Giá trị | Mẫu mặc định | Quản trị tenant | [F08](../features/F08-ly-lich-khoa-hoc/) |

## 7. Trường dữ liệu & phân quyền

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-FIELD | Trường tùy chọn: bắt buộc / ẩn / nhãn | Field config per-tenant | Chọn | Theo spec feature | Quản trị tenant | *(cần thêm cơ chế)* |
| VP-PROFILE | Trường hồ sơ người dùng nào *hiển thị / bắt buộc* (giới tính, năm sinh, địa chỉ, chức vụ, học hàm-học vị, quá trình công tác) | Field config per-tenant trên **bộ trường chuẩn** (không tạo trường tùy biến) | Bật/tắt + Giá trị (cờ bắt buộc) | Trường lõi (họ tên) bật; phần mở rộng hiển thị, không bắt buộc | Quản trị tenant | [F08](../features/F08-ly-lich-khoa-hoc/) (BR-04) |
| VP-ROLE | Ánh xạ vai trò RMS ↔ con người của trường | Cấu hình role per-tenant | Giá trị | Bộ role chuẩn | Quản trị tenant | [ADR-0005](decisions/0005-sso-va-rbac.md), [B03](../features/B03-quan-ly-nguoi-dung/) |
| VP-SCOPE | Phạm vi dữ liệu (data scoping) theo đơn vị/kỳ | Cấu hình scope | Giá trị | Theo spec RBAC | Quản trị tenant | [ADR-0005](decisions/0005-sso-va-rbac.md) |

> **Ranh giới:** *quyền nguyên tử* `MODULE.ACTION` và việc **kiểm quyền ở backend** là lõi cố định; chỉ *bộ
> vai trò* và *ánh xạ người→vai trò* biến thiên.
>
> **Ranh giới VP-PROFILE:** khung thực thể `User` + bảng con `AcademicQualification`/`WorkHistory`
> (`data-model.md §4.1, §4.6`), định danh Keycloak, và *cách* F08 tổng hợp lý lịch là **lõi cố định**; chỉ
> *tập trường hiển thị/bắt buộc* + *danh mục* (`POSITION`, `ACADEMIC_RANK`, `ACADEMIC_DEGREE`, `ADMINISTRATIVE_DIVISION` — qua
> VP-CAT) biến thiên. **Không** cho tenant tạo trường tùy biến mới ở giai đoạn này.

## 8. Vận hành & dữ liệu khởi tạo

| Mã VP | Điểm biến thiên | Cơ chế | Mức | Mặc định | Ai cấu hình | Feature/ADR |
|---|---|---|---|---|---|---|
| VP-MIGRATE | Phạm vi & nguồn số hóa dữ liệu cũ | Kế hoạch import per-tenant | Giá trị | Không | Quản trị hệ thống | `migration-coverage.md` |
| VP-BRAND | Tên hiển thị, logo, slug, realm | Thuộc tính `Tenant` | Giá trị | — | Quản trị hệ thống | `data-model.md §4.8` |

---

## Không được biến thiên (lõi cố định — để rõ ràng)

Những thứ sau **giống nhau cho mọi tenant**, không có trong sổ điểm biến thiên:

- Một web app, phân quyền ở backend; quyền nguyên tử `MODULE.ACTION` ([ADR-0009](decisions/0009-hop-nhat-mot-web-phan-quyen.md), [ADR-0005](decisions/0005-sso-va-rbac.md)).
- Vòng đời `ResearchProject` đi qua domain service dùng chung; lớp `statusSemantic` chuẩn hóa ([ADR-0007](decisions/0007-workflow-engine-dong-per-tenant.md)).
- Audit append-only cho mọi đổi trạng thái ([ADR-0010](decisions/0010-chuan-du-lieu-cho-ai-tham-gia.md)).
- Cô lập dữ liệu đa tổ chức bằng RLS theo `tenantId` (`data-model.md §1, §4.8`).
- Tiền VND, ngày `dd/MM/yyyy`, giờ Asia/Ho_Chi_Minh lưu UTC.

> Khi một yêu cầu của trường đòi đụng vào nhóm "không biến thiên" này, **không** mở điểm biến thiên mới một cách
> phản xạ — cân nhắc lại theo cây quyết định A/B/C của [ADR-0012](decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md),
> và nếu thật sự cần thì phải qua một ADR.
