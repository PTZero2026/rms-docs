---
title: "Lý lịch khoa học — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "BE DEV"
status: Review        # Draft | Review | Approved
version: 0.1
updated: 2026-06-25
---

# Lý lịch khoa học — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu và maintain file này.
> PO/BA chỉ cần soát **§1 Bảng truy vết** để chắc mọi `BR-xx`/`AC-xx` đều có lời giải kỹ thuật.
> DRY: không chép lại schema — trỏ [`../../architecture/data-model.md §4.1, §4.6`](../../architecture/data-model.md).
>
> Ranh giới: F08 sở hữu **nội dung hồ sơ** + **khung nhìn lý lịch (view)**; **không** đụng định danh/vai trò
> (thuộc [B03](../B03-quan-ly-nguoi-dung/design.md)). Tập trường biến thiên theo tenant qua **VP-PROFILE**
> ([variation-points](../../architecture/variation-points.md), [ADR-0012](../../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)).

## 0. Ánh xạ nghiệp vụ ↔ kỹ thuật

**Loại học hàm/học vị** (`AcademicQualification.kind`):

| Nhãn nghiệp vụ (spec.md) | Enum | Danh mục FK (`titleItemId`) |
|--------------------------|------|------------------------------|
| Học hàm (GS/PGS)         | `RANK`   | `ACADEMIC_RANK` |
| Học vị (TS/ThS/CN)       | `DEGREE` | `ACADEMIC_DEGREE` |

**Trạng thái công tác** (dẫn xuất, không lưu cờ): `WorkHistory.toDate IS NULL` ⇒ "Đang công tác".

**Quyền module `PROFILE`** (`Permission.code = MODULE.ACTION`, B03 quản danh mục quyền):

| Nhãn (ui.md §2) | `Permission.code` |
|-----------------|-------------------|
| Xem hồ sơ của mình | `PROFILE.VIEW_OWN` |
| Sửa hồ sơ của mình | `PROFILE.UPDATE_OWN` |
| Xem hồ sơ người khác | `PROFILE.VIEW` |
| Sửa hộ hồ sơ người khác | `PROFILE.UPDATE` |
| Trích xuất lý lịch | `PROFILE.EXPORT_CV` |

> 5 quyền trên đăng ký vào danh mục `Permission` của B03 (BR-07 của B03); `VIEW_OWN`/`UPDATE_OWN`/`EXPORT_CV`
> gắn mặc định vào vai trò thấp nhất `USER`.

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01 | Hồ sơ = các trường nội dung trên `User` + con `AcademicQualification`/`WorkHistory` (FK `userId`, 1-n). Phân biệt tự sửa vs sửa hộ bằng `target.id == session.userId` (cần `*_OWN`) hay `PROFILE.UPDATE`. | data-model §4.1/§4.6, §3 |
| BR-02 | Endpoint cập nhật hồ sơ **không nhận** field `email`/`keycloakId`; chỉ đọc, đồng bộ từ Keycloak (như B03 BR-09). | §3, ADR-0008 |
| BR-03 | "Trường/Viện" **không có cột riêng** — dẫn xuất từ `User.tenantId` → `Tenant.name`; API trả read-only, không nhận input. | §3, data-model §4.8 |
| BR-04 | `TenantProfileFieldConfig` (per-tenant): mỗi field code có `visible`/`required`. Backend validate `required` khi lưu, lọc field `visible=false` khỏi response. | §2, §3 |
| BR-05 | `AcademicQualification(kind, titleItemId, yearAwarded)`; CHECK `titleItemId` thuộc catalog khớp `kind`; CHECK `yearAwarded ≤ extract(year, now())` và `≥ extract(year, dateOfBirth)` nếu có. | §2, §3 |
| BR-06 | `WorkHistory(fromDate, toDate nullable)`; CHECK `toDate IS NULL OR fromDate ≤ toDate`; `toDate IS NULL` = đang công tác. | §2 |
| BR-07 | Lý lịch = **read-only aggregation query**, không bảng riêng: join `User` + `AcademicQualification` + `WorkHistory` + `ResearchOutput(approvalStatus=APPROVED)` + `ProjectMember`→`ResearchProject` + tổng giờ P03 (nếu bật). | §3, data-model §4.6 |
| BR-08 | Trích xuất: render template per-tenant (VP-CV-TPL) từ kết quả aggregation tại thời điểm gọi; ghi `AuditLog(EXPORT_CV)` kèm mã mẫu. | §3, §4 |
| BR-09 | Guard kiểm `PROFILE.*` + **data scoping** (VP-SCOPE) ở backend; FE chỉ ẩn/hiện. Chủ hồ sơ luôn qua `*_OWN`. | §3, ADR-0005 |
| BR-10 | Mọi cập nhật/ trích xuất ghi `AuditLog(actorId, targetId, oldValue, newValue)`; sửa hộ ⇒ `actorId ≠ targetId`. | §3, §4 |
| AC-01 | `PATCH /profiles/me` lưu trường cơ bản/liên hệ; `AuditLog(UPDATE_PROFILE, actor=target)`. | §3, §4 |
| AC-02 | `email` không nằm trong schema request `PATCH /profiles/*` (BR-02). | §3 |
| AC-03 | Validate `TenantProfileFieldConfig`: `required` trống → 422; `visible=false` → field ẩn khỏi response & form. | §3 |
| AC-04 | "Trường/Viện" dẫn xuất từ tenant (BR-03), field read-only. | §3 |
| AC-05 | Thêm 2 dòng `AcademicQualification` khác `kind` (DEGREE/RANK), `titleItemId` đúng catalog. | §2, §3 |
| AC-06 | CHECK `yearAwarded` (BR-05) vi phạm → 422 "Năm nhận không hợp lệ". | §2 |
| AC-07 | `WorkHistory.toDate = NULL` → trả cờ `isCurrent=true`. | §2 |
| AC-08 | CHECK `fromDate ≤ toDate` (BR-06) vi phạm → 422. | §2 |
| AC-09 | Aggregation query (BR-07) chỉ lấy `ResearchOutput.approvalStatus = APPROVED`; read-only, không endpoint ghi. | §3 |
| AC-10 | Mục giờ giảng chỉ tính/đưa vào response nếu `feature P03 enabled` cho tenant (VP-FEAT). | §3 |
| AC-11 | `PATCH /profiles/{userId}` cần `PROFILE.UPDATE` + phạm vi; `AuditLog(UPDATE_PROFILE, actor≠target)`. | §3, §4 |
| AC-12 | Guard `PROFILE.VIEW` + data scoping; thiếu quyền/ngoài phạm vi → **403** dù FE ẩn nút. | §3 |
| AC-13 | `POST /profiles/{userId}/cv:export` chọn `templateId` (VP-CV-TPL); render + `AuditLog(EXPORT_CV)`. | §3, §4 |

## 2. Mô hình dữ liệu

Tham chiếu [`data-model.md §4.1, §4.6`](../../architecture/data-model.md). F08 **không** định nghĩa lại
thực thể; chỉ liệt kê trường dùng và ràng buộc đặc thù.

| Thực thể | Trường dùng | Ghi chú F08 |
|----------|-------------|-------------|
| `User` | `id`, `tenantId`, `fullName`, `gender`, `dateOfBirth`, `phoneNumber`, `address`, `unitId`, `positionId`, `academicTitle`; (`email`, `keycloakId` chỉ đọc) | Trường nội dung hồ sơ; `email`/định danh do B03/Keycloak quản (BR-02) |
| `AcademicQualification` | `id`, `userId`, `kind`(`RANK`\|`DEGREE`), `titleItemId`, `yearAwarded`, `note` | 1-n theo `userId`; CHECK catalog khớp `kind` + năm (BR-05) |
| `WorkHistory` | `id`, `userId`, `organization`, `unitId?`, `positionItemId?`, `fromDate`, `toDate?`, `description?` | 1-n; CHECK `fromDate ≤ toDate` (BR-06) |
| `CatalogItem` | `ACADEMIC_RANK`, `ACADEMIC_DEGREE`, `POSITION`, `ADMINISTRATIVE_DIVISION` (tham chiếu) | Quản ở B01; per-tenant qua VP-CAT |
| `AuditLog` | `actorId`, `action`, `targetType=USER`, `targetId`, `oldValue`, `newValue`, `occurredAt` | `UPDATE_PROFILE`, `EXPORT_CV` (BR-10) |

**Cần bổ sung vào data-model (cùng PR khi triển khai):**
- `TenantProfileFieldConfig` (`tenantId`, `fieldCode`, `visible` bool, `required` bool) — hiện thực VP-PROFILE
  (BR-04). `fieldCode` ∈ {`gender`, `dateOfBirth`, `address`, `positionId`, `academicQualification`,
  `workHistory`, …}; trường lõi (`fullName`) không cấu hình được.
- Quyền `PROFILE.*` (§0) vào danh mục `Permission` của B03; CHECK constraint cho `AcademicQualification`/`WorkHistory`.

## 3. Ràng buộc & bất biến kỹ thuật

- **Lý lịch là view, không trạng thái riêng (BR-07):** không lưu bản tổng hợp; mỗi lần xem/trích xuất chạy
  aggregation từ nguồn (`ResearchOutput` đã duyệt, `ProjectMember`, P03). Đảm bảo không lệch/nhập trùng.
- **Ownership vs sửa hộ (BR-01/BR-09):** middleware phân nhánh: `target == session.userId` ⇒ kiểm `*_OWN`;
  ngược lại ⇒ kiểm `PROFILE.VIEW`/`PROFILE.UPDATE` **+ data scoping** (VP-SCOPE). Chủ hồ sơ luôn xem/sửa được
  hồ sơ mình bất kể phạm vi.
- **Field config áp ở backend (BR-04):** `required`/`visible` validate & lọc tại server — FE render theo config
  nhưng không phải lớp quyết định. Đổi config không xóa dữ liệu đã nhập (field ẩn vẫn lưu trong DB).
- **Trường/Viện bất biến phía nhập (BR-03):** dẫn xuất từ `tenantId`; không expose API set "trường/viện".
- **Email bất biến phía RMS (BR-02):** dùng lại ràng buộc B03 BR-09 — không expose API sửa `email` ở F08.
- **Giờ giảng tùy tenant (AC-10):** mục P03 chỉ tính khi feature bật (VP-FEAT); lớp chuẩn hóa "giờ giảng"
  giống nhau mọi tenant (variation-points §5).

## 4. API / hợp đồng (đề xuất — chốt khi định nghĩa `packages/api-contracts`)

| Thao tác | Gợi ý endpoint | Quyền |
|----------|----------------|-------|
| Xem hồ sơ của mình | `GET /profiles/me` | `PROFILE.VIEW_OWN` |
| Sửa hồ sơ của mình (gồm HH/HV, quá trình công tác) | `PATCH /profiles/me` | `PROFILE.UPDATE_OWN` |
| Xem hồ sơ người khác | `GET /profiles/{userId}` | `PROFILE.VIEW` + scope |
| Sửa hộ hồ sơ người khác | `PATCH /profiles/{userId}` | `PROFILE.UPDATE` + scope |
| Xem lý lịch tổng hợp | `GET /profiles/{userId}/cv` (`me` cho chính mình) | `PROFILE.VIEW(_OWN)` |
| Trích xuất lý lịch theo mẫu | `POST /profiles/{userId}/cv:export` (body: `templateId`) | `PROFILE.EXPORT_CV` |
| Đọc cấu hình trường hồ sơ của tenant | `GET /tenants/{id}/profile-field-config` | (đọc theo phiên) |

> `PATCH /profiles/*` nhận khối `academicQualifications[]` và `workHistory[]` (replace-set có validate), **không**
> nhận `email`. Response `GET /cv` gồm `personal`, `academicRanks[]`, `academicDegrees[]`, `workHistory[]`,
> `outputs[]`, `projects[]`, `teachingHours?` (vắng nếu tenant tắt P03).

## 5. Điểm kỹ thuật cần chốt

- **Lưu HH/HV & quá trình công tác:** replace-set toàn khối khi `PATCH` hay sub-resource riêng
  (`POST/DELETE /profiles/me/qualifications`)? Ảnh hưởng audit diff & concurrency.
- **Hiệu năng aggregation lý lịch:** cache theo `userId` + invalidation khi `ResearchOutput`/`ProjectMember`/P03
  đổi; hay query trực tiếp (đơn giản, đủ nhanh ở quy mô hiện tại).
- **Định dạng trích xuất:** PDF/DOCX, engine render template (VP-CV-TPL) — chốt ở pha thực thi.
- **`fieldCode` chuẩn hóa cho VP-PROFILE:** danh sách field cấu hình được + seed mặc định per-tenant.
