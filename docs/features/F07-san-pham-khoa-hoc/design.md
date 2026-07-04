---
title: "Sản phẩm khoa học — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "BE DEV"
status: Review        # Draft | Review | Approved
version: 0.1
updated: 2026-07-04
---

# Sản phẩm khoa học — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu và maintain file này.
> PO/BA chỉ cần soát **§1 Bảng truy vết** để chắc mọi `BR-xx`/`AC-xx` đều có lời giải kỹ thuật.
> DRY: không chép lại schema dùng chung — trỏ [`../../architecture/data-model.md §4.6`](../../architecture/data-model.md#46-sản-phẩm--lý-lịch-f07-f08).

## 0. Ánh xạ nghiệp vụ ↔ kỹ thuật

**Module quyền:** `PRODUCT`.

| Nhãn nghiệp vụ | `Permission.code` đề xuất |
|----------------|---------------------------|
| Xem sản phẩm của mình / đề tài mình tham gia | `PRODUCT.VIEW_OWN` |
| Kê khai/sửa sản phẩm của mình | `PRODUCT.CREATE_OWN`, `PRODUCT.UPDATE_OWN` |
| Xem sản phẩm theo phạm vi quản lý | `PRODUCT.VIEW` |
| Nhập hộ/sửa theo phạm vi | `PRODUCT.CREATE`, `PRODUCT.UPDATE` |
| Duyệt/từ chối sản phẩm | `PRODUCT.APPROVE` |
| Mở lại/đính chính sản phẩm đã duyệt | `PRODUCT.REOPEN` |

**Trạng thái duyệt:** `ResearchOutput.approvalStatus` dùng `PENDING_APPROVAL`, `APPROVED`, `REJECTED`; nếu cần
lưu nháp lâu dài thì bổ sung `DRAFT` vào data-model và contract.

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01 | State machine cho `approvalStatus`; transition tập trung trong `ProductService`. Không update trạng thái trực tiếp từ controller. | §3 |
| BR-02 | Guard phân nhánh `*_OWN` cho tác giả/chủ nhiệm; `PRODUCT.CREATE/UPDATE` cho chuyên viên nhập hộ + scope. | §3, B03 |
| BR-03 | Validate `researchProjectId`: user thuộc `ProjectMember` hoặc có `PRODUCT.*` trong scope; chặn gửi duyệt mới khi project `COMPLETED`. | §3 |
| BR-04 | FK `productTypeId -> ProductType`; chỉ nhận `recordStatus=ACTIVE` cùng tenant. | data-model §4.2/§4.6 |
| BR-05 | Request submit validate required fields: `name`, `productTypeId`, `publicationYear`, `authors[]`, `publicationInfo`, attachment. | §3, §4 |
| BR-06 | Validate `publicationYear <= currentYear`; nếu có `ProjectAssignment.EFFECTIVE.startDate` thì `publicationYear >= startYear`. | §3 |
| BR-07 | `Attachment(targetType='ResearchOutput')` tối thiểu 1 trước submit; hiện data-model có `evidenceAttachmentId`, triển khai nên hỗ trợ 1-n qua `Attachment`. | §2 |
| BR-08 | Duplicate detector dùng normalized `name` + `publicationYear` + overlap `authors.userId/name`; hard unique cho cùng project/type/name/year. | §3 |
| BR-09 | `approve/reject` endpoint cần `PRODUCT.APPROVE`; reject request bắt buộc `rejectionReason`. | §4 |
| BR-10 | `APPROVED` khóa field chính; mutation phải đi qua `reopen/correct` với `reason`, audit đầy đủ. | §3 |
| BR-11 | `ProductRequirementChecker` đối chiếu `ExpectedOutput(productTypeId,minQuantity)` với count `ResearchOutput.APPROVED`. | §3 |
| BR-12 | Queries cho F08/B02/F04/F06 luôn filter `approvalStatus=APPROVED`; `REJECTED` chỉ hiển thị cho người kê khai/chuyên viên. | §3 |
| BR-13 | Read guard áp RBAC + data scoping; không trả dữ liệu ngoài phạm vi dù FE ẩn. | §3 |
| BR-14 | Ghi `AuditLog` cho create/submit/approve/reject/reopen/correct/attach/detach. | §3 |
| AC-01 | `POST /products` + `POST /products/{id}:submit` validate và chuyển `PENDING_APPROVAL`. | §4 |
| AC-02 | Cho `researchProjectId=null`; sau `APPROVED`, F08 aggregation lấy theo tác giả nội bộ. | §3 |
| AC-03 | `POST /products/{id}:approve` set `APPROVED`, `approvedBy`, `approvedAt`, lock field. | §4 |
| AC-04 | `POST /products/{id}:reject` set `REJECTED`, lưu `rejectionReason`. | §4 |
| AC-05 | Submit thiếu attachment → 422. | §3 |
| AC-06 | Validate năm công bố → 422. | §3 |
| AC-07 | Guard gắn đề tài ngoài phạm vi → 403. | §3 |
| AC-08 | Thiếu `PRODUCT.APPROVE` → 403. | §4 |
| AC-09 | Duplicate detector trả warning cần `duplicateOverride=true` nếu vẫn gửi. | §3 |
| AC-10 | Update field chính của `APPROVED` → 409/422, gợi ý reopen. | §3 |
| AC-11 | Requirement checker trả `{ satisfied: true }`. | §4 |
| AC-12 | Requirement checker trả danh sách thiếu theo `productTypeId`. | §4 |
| AC-13 | List/detail guard theo scope. | §3 |

## 2. Mô hình dữ liệu

Tham chiếu [`data-model.md §4.6`](../../architecture/data-model.md#46-sản-phẩm--lý-lịch-f07-f08).

| Thực thể | Trường dùng | Ghi chú F07 |
|----------|-------------|-------------|
| `ResearchOutput` | `id`, `researchProjectId?`, `productTypeId`, `name`, `authors`, `publicationYear`, `publicationInfo`, `approvalStatus` | Thực thể trung tâm; `researchProjectId=null` cho sản phẩm ngoài đề tài RMS. |
| `ProductType` | `id`, `code`, `name`, `category`, `recordStatus` | Danh mục per-tenant, quản ở B01. |
| `Attachment` | `targetType`, `targetId`, `evidenceTypeItemId`, `storageKey` | Minh chứng; khuyến nghị 1-n theo `ResearchOutput`. |
| `ResearchProject`/`ProjectMember` | `statusSemantic`, `principalInvestigatorId`, `userId`, `projectRole` | Kiểm quyền gắn đề tài và filter sản phẩm theo đề tài. |
| `ProjectAssignment` | `startDate`, `status=EFFECTIVE` | Kiểm biên năm công bố khi gắn đề tài. |
| `AuditLog` | `action`, `targetType=RESEARCH_OUTPUT`, `targetId`, `oldValue`, `newValue` | Ghi mọi transition và mutation quan trọng. |

**Bổ sung cần chốt khi triển khai:**
- `ResearchOutput` fields: `submittedAt`, `approvedBy`, `approvedAt`, `rejectedBy`, `rejectedAt`,
  `rejectionReason`, `correctionReason`.
- `ExpectedOutput` hoặc cấu trúc chuẩn hóa tương đương: `researchProjectId`, `productTypeId`, `minQuantity`,
  `note`, dùng cho BR-11.
- `authors` schema: `[{ userId?, name, affiliation?, order, role? }]`; `userId` dùng để F08 gom sản phẩm theo
  tác giả nội bộ.
- Unique/cảnh báo: normalized name nên lưu trường dẫn xuất `normalizedName` để tìm trùng ổn định.

## 3. Ràng buộc & bất biến kỹ thuật

- **Tenant isolation:** mọi query lọc `tenantId` qua RLS/scope; `ProductType` và `ResearchOutput` phải cùng tenant.
- **Transition tập trung:** `submit`, `approve`, `reject`, `reopen` nằm trong service/domain layer, không để
  controller tự set `approvalStatus`.
- **Sản phẩm đã duyệt là nguồn cho hệ thống khác:** F08/B02/F04/F06 chỉ đọc `APPROVED`; thay đổi bản duyệt
  phải audit và invalidation cache nếu có.
- **Đối chiếu cam kết:** checker không đổi trạng thái đề tài. Nó chỉ trả `satisfied` và `missing[]`; F04/F06
  quyết định chuyển workflow qua domain service chung.
- **Minh chứng:** dùng `Attachment` chung, không lưu binary trong DB. Nếu data-model giữ `evidenceAttachmentId`
  một file, API vẫn nên expose danh sách để mở rộng; bản tối thiểu có thể giới hạn 1 file.
- **Duplicate warning:** không coi cảnh báo trùng là lỗi 422 trừ hard-duplicate trong cùng project/type/name/year.
- **Audit:** event tối thiểu: `CREATE_PRODUCT`, `SUBMIT_PRODUCT`, `APPROVE_PRODUCT`, `REJECT_PRODUCT`,
  `REOPEN_PRODUCT`, `UPDATE_PRODUCT`, `ATTACH_PRODUCT_EVIDENCE`, `DETACH_PRODUCT_EVIDENCE`.

## 4. API / hợp đồng (đề xuất — chốt khi định nghĩa `packages/api-contracts`)

| Thao tác | Gợi ý endpoint | Quyền |
|----------|----------------|-------|
| Danh sách sản phẩm của tôi | `GET /products/mine` | `PRODUCT.VIEW_OWN` |
| Danh sách theo phạm vi quản lý | `GET /products` | `PRODUCT.VIEW` + scope |
| Chi tiết sản phẩm | `GET /products/{id}` | owner/project member hoặc `PRODUCT.VIEW` + scope |
| Tạo/lưu nháp sản phẩm | `POST /products` | `PRODUCT.CREATE_OWN` hoặc `PRODUCT.CREATE` |
| Sửa sản phẩm chưa duyệt | `PATCH /products/{id}` | owner hoặc `PRODUCT.UPDATE` + scope |
| Gửi duyệt | `POST /products/{id}:submit` | owner hoặc `PRODUCT.UPDATE` + scope |
| Duyệt | `POST /products/{id}:approve` | `PRODUCT.APPROVE` + scope |
| Từ chối | `POST /products/{id}:reject` body `{ reason }` | `PRODUCT.APPROVE` + scope |
| Mở lại/đính chính | `POST /products/{id}:reopen` body `{ reason }` | `PRODUCT.REOPEN` + scope |
| Kiểm sản phẩm cam kết | `GET /projects/{projectId}/products/requirements` | F04/F06 service hoặc `PRODUCT.VIEW` + scope |

**Response kiểm cam kết (gợi ý):**

```json
{
  "projectId": "uuid",
  "satisfied": false,
  "requirements": [
    { "productTypeId": "uuid", "required": 2, "approved": 1, "missing": 1 }
  ]
}
```

## 5. Điểm kỹ thuật cần chốt

- **Nháp sản phẩm:** bổ sung `DRAFT` vào `approvalStatus` hay chỉ tạo bản ghi khi gửi duyệt.
- **Sản phẩm cam kết:** thêm bảng `ExpectedOutput` hay chuẩn hóa một phần `ResearchProject.proposalDocument`.
- **Minh chứng nhiều file:** data-model hiện có `evidenceAttachmentId`; nghiệp vụ cần ít nhất một minh chứng,
  nên triển khai 1-n `Attachment` sẽ linh hoạt hơn.
- **Hợp nhất sản phẩm trùng:** bản này chỉ cảnh báo; cần feature sau nếu muốn merge nhiều kê khai của đồng tác giả.
