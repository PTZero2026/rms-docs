---
title: "Danh mục & cấu hình"
id: "B01"
epic: "E0"
owner: "PO/BA"
status: Draft        # Draft | Review | Approved
version: 0.3
updated: 2026-06-29
---

# Danh mục & cấu hình

> Nguồn sự thật về **nghiệp vụ** của feature. Mọi luật, dữ liệu, tiêu chí nghiệm thu
> nằm ở đây. `ui.md` mô tả giao diện và trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

B01 là **feature nền tảng dùng chung** của RMS: nó sở hữu các danh mục và tham số cấu hình mà hầu hết
các feature nghiệp vụ khác tham chiếu tới (đơn vị, lĩnh vực, loại sản phẩm, bộ tiêu chí đánh giá, mẫu
biểu thuyết minh, tham số hệ thống). Nếu các danh mục này không nhất quán hoặc bị sửa tùy tiện, dữ liệu
toàn hệ thống sẽ lệch: đề tài gắn sai lĩnh vực, hội đồng chấm sai thang điểm, kỳ nhận đề xuất dùng mẫu cũ.

Hiện trạng (chưa có hệ thống): danh mục nằm rải rác trong file Excel/quy chế giấy, mỗi phòng ban giữ một
bản, không có lịch sử thay đổi. B01 tập trung hóa việc quản trị các danh mục này vào một nơi duy nhất,
thuần mặt **BackOffice (BO)**, do **Quản trị hệ thống** vận hành.

Kết quả mong đợi:

- Một nguồn dữ liệu danh mục/cấu hình thống nhất, có mã duy nhất, có lịch sử thay đổi (audit).
- Bảo vệ toàn vẹn tham chiếu: danh mục đang được feature khác dùng không bị xóa cứng làm hỏng dữ liệu.
- Cho phép thay đổi tham số vận hành (ngưỡng điểm xét duyệt, số ngày nhắc hạn báo cáo…) mà không cần
  sửa code/deploy lại.

## 2. Phạm vi

- **Trong phạm vi:**
  - Quản lý các **danh mục có entity riêng** (vì bị FK nghiệp vụ trỏ tới): **Unit** (cây), **ResearchField**
    (cây), **ProductType**.
  - Quản lý các **danh mục lookup chung** qua cặp bảng generic `Catalog`/`CatalogItem` — xem **§3.1 Sổ
    danh mục (registry)**. Thêm một loại danh mục mới chỉ cần thêm một dòng `Catalog` (không cần migration/deploy).
  - Quản lý **SystemSetting** (tham số khóa–giá trị) như ngưỡng điểm xét duyệt, số ngày nhắc hạn báo cáo…
  - Quản lý danh mục/kỳ lịch nền như **năm học** và **năm tài khóa** để các feature khác tham chiếu.
  - Quản lý **CriteriaSet** và **EvaluationCriterion** (bộ tiêu chí `PROPOSAL_REVIEW` / `ACCEPTANCE`, mỗi tiêu chí có
    `maxScore` và `weight`) dùng chung cho F03 (xét duyệt) và F06 (nghiệm thu).
  - Quản lý **mẫu biểu thuyết minh** (biểu mẫu được kỳ nhận đề xuất F02 áp dụng) — cấu trúc biểu mẫu, không
    phải nội dung thuyết minh của từng đề tài.
  - Xóa mềm theo `recordStatus` (`ACTIVE` | `INACTIVE` | `DELETED`); chặn xóa cứng khi đang được tham chiếu.
  - Ghi nhật ký (audit) cho mọi thay đổi danh mục/cấu hình.

- **Ngoài phạm vi:**
  - Quản lý **người dùng, vai trò, quyền** (RBAC: `Role`/`Permission`) — thuộc B03. Lưu ý phân biệt với
    danh mục lookup `USER_ROLE_LABEL` ("vị trí, vai trò người dùng" để **hiển thị/phân loại**), do B01
    sở hữu, **không** điều khiển phân quyền.
  - Hạ tầng gửi thông báo, `eventType`, mẫu/kênh thông báo — thuộc B04. Phân biệt với danh mục lookup
    `NOTIFICATION_CATEGORY` ("phân loại thông báo" để gắn nhãn/lọc), do B01 sở hữu.
  - Vòng đời **kỳ nhận đề xuất** (mở/đóng kỳ, gán mẫu biểu vào kỳ) — thuộc F02; B01 chỉ cung cấp mẫu biểu
    để F02 lựa chọn.
  - Quá trình **chấm điểm** theo bộ tiêu chí — thuộc F03/F06; B01 chỉ định nghĩa bộ tiêu chí.
  - Công thức/định mức quy đổi giờ giảng — thuộc P03; B01 chỉ cung cấp danh mục/kỳ lịch để P03 tham chiếu.
  - Mặt người dùng (FE): không có. Nhà khoa học chỉ **đọc gián tiếp** danh mục qua các feature khác.

## 3. Luồng nghiệp vụ chính

Luồng quản trị một mục danh mục (áp dụng chung cho mọi loại danh mục/cấu hình): tạo mới → sửa →
vô hiệu hóa hoặc xóa. Việc xóa luôn kiểm tra ràng buộc tham chiếu trước khi cho phép.

```mermaid
flowchart TD
    A["Quản trị mở màn hình danh mục (BO)"] --> B{Chọn hành động}
    B -->|Tạo mới| C["Nhập dữ liệu + mã"]
    C --> D{Mã hợp lệ & duy nhất<br/>trong cùng loại?}
    D -->|Không| C
    D -->|Có| E{"Cây: cha hợp lệ,<br/>không tạo vòng?"}
    E -->|Không| C
    E -->|Có| F["Lưu bản ghi (ACTIVE)<br/>+ ghi AuditLog"]
    B -->|Sửa| G["Cập nhật trường cho phép"]
    G --> D
    B -->|Vô hiệu hóa| H["Đặt recordStatus = INACTIVE<br/>+ ghi audit"]
    B -->|Xóa| I{"Đang được<br/>thực thể khác tham chiếu?"}
    I -->|Có| J["Từ chối xóa cứng<br/>(gợi ý vô hiệu hóa)"]
    I -->|Không| K["Đặt recordStatus = DELETED<br/>(xóa mềm) + ghi audit"]
    F --> Z["Hiển thị kết quả"]
    H --> Z
    J --> Z
    K --> Z
```

Luồng riêng của **CriteriaSet**: khi lưu/sửa bộ tiêu chí, hệ thống tính tổng `weight` các tiêu chí con
và **cảnh báo** nếu khác 100% (không chặn lưu — xem BR-07).

### 3.1 Sổ danh mục (catalog registry)

Màn hình cấu hình danh mục có một **nav trái** liệt kê các danh mục cần cấu hình. Mỗi mục dưới đây là
một danh mục; cột **Cơ chế lưu** cho biết nó dùng entity riêng hay cặp bảng generic `Catalog`/`CatalogItem`
(xem [data-model §4.2](../../architecture/data-model.md)). Danh sách **mở** — "Có thể phát sinh thêm":
thêm danh mục lookup mới = thêm một dòng `Catalog`, không cần migration/deploy (BR-12).

| Danh mục (nav trái) | `Catalog.code` / entity | Cơ chế lưu | Cấu trúc | Ghi chú nghiệp vụ |
|---|---|---|---|---|
| Địa chỉ (Tỉnh/Huyện/Xã) | `ADMINISTRATIVE_DIVISION` | generic | TREE (3 cấp) | `extra.level` = `PROVINCE`/`DISTRICT`/`WARD`; seed dữ liệu hành chính, ít sửa tay |
| Năm học | `ACADEMIC_YEAR` | generic | FLAT | Mã kỳ năm học, vd `2026-2027`; `extra.startDate`/`extra.endDate`; dùng cho P03/F08/B02 |
| Năm tài khóa | `FISCAL_YEAR` | generic | FLAT | Mã năm tài khóa/ngân sách, vd `2026`; `extra.startDate`/`extra.endDate`; dùng khi tenant quy đổi giờ theo năm tài khóa |
| Đơn vị công tác | `Unit` | entity riêng | TREE | Bị `User.unitId`, `ResearchProject.hostUnitId` trỏ tới |
| Phân loại đề tài NCKH | `RESEARCH_TOPIC_CATEGORY` | generic | FLAT | Nhãn/cấp đề tài (vd cấp nhà nước/bộ/cơ sở). `extra.tier` (`UPPER`/`BASE`) lọc cấp trên (F09); `extra.requiredEvidence` cấu hình minh chứng bắt buộc theo giai đoạn (VP-EVID-REQ) |
| Loại minh chứng | `EVIDENCE_TYPE` | generic | FLAT | Loại tài liệu minh chứng (vd `DECISION`/`CONTRACT`/`ACCEPTANCE`/`OUTPUT`); dùng cho quy tắc minh chứng bắt buộc F09–F12 |
| Cơ quan chủ trì cấp trên | `MANAGING_BODY` | generic | FLAT | Cơ quan quản lý đề tài cấp trên (Bộ/Tỉnh/Quỹ…); `UpperProject.managingBodyItemId` (F09) trỏ tới |
| Chuyên ngành đề tài NCKH | `ResearchField` | entity riêng | TREE | Lĩnh vực/chuyên ngành; bị `ResearchProject.researchFieldId` trỏ tới (xem §7 điểm mở) |
| Phân loại thông báo | `NOTIFICATION_CATEGORY` | generic | FLAT | Nhãn để lọc/nhóm tin — **khác** `eventType`/mẫu của B04 |
| Phân loại đánh giá đề tài | `EVALUATION_CATEGORY` | generic | FLAT | Nhãn phân loại đợt/kết quả đánh giá — **khác** `CriteriaSet` |
| Chức vụ | `POSITION` | generic | FLAT | Chức vụ cán bộ (hiển thị, lý lịch F08) |
| Vị trí, vai trò người dùng | `USER_ROLE_LABEL` | generic | FLAT | Nhãn vị trí/vai trò hiển thị — **khác** RBAC `Role` của B03 |
| *(loại sản phẩm)* | `ProductType` | entity riêng | FLAT | Đã có; quản lý chung cùng hub |

> Quy tắc CRUD ở §3 và §4 áp dụng **đồng nhất** cho cả danh mục generic lẫn entity riêng: mã duy nhất
> trong cùng danh mục (BR-01), chống vòng với danh mục TREE (BR-03), chặn xóa cứng khi còn tham chiếu
> (BR-02), xóa mềm + audit (BR-04/BR-05).

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Mã danh mục duy nhất | Trường `code` của mỗi danh mục (`Unit`, `ResearchField`, `ProductType`, `CriteriaSet`…) là duy nhất, không trùng trong cùng loại danh mục. Với `CatalogItem`, `code` duy nhất theo (`tenantId`, `catalogId`) — trùng mã giữa hai danh mục khác nhau là hợp lệ. Với `SystemSetting`, `key` là duy nhất toàn cục. | Unique constraint ở CSDL; báo lỗi rõ ràng khi trùng. |
| BR-02 | Không xóa cứng danh mục đang dùng | Danh mục đang được thực thể khác tham chiếu (FK) không được xóa cứng (`ON DELETE RESTRICT`). Hệ thống chỉ cho **xóa mềm** (`recordStatus = DELETED`) hoặc **vô hiệu hóa** (`INACTIVE`). | Bảo toàn dữ liệu lịch sử (đề tài cũ vẫn trỏ tới lĩnh vực đã ngừng dùng). |
| BR-03 | Cây không tạo vòng | Với danh mục cây (`Unit.parentUnitId`, `ResearchField.parentFieldId`, và `CatalogItem.parentItemId` của `Catalog` có `structure = TREE`), một nút **không thể** chọn chính nó hoặc một nút con/cháu của nó làm cha. | Kiểm tra chu trình trước khi lưu. |
| BR-04 | Vô hiệu hóa thay vì xóa khi còn tham chiếu | Mục `INACTIVE` không xuất hiện trong danh sách chọn mới ở các feature khác, nhưng vẫn hiển thị trên các bản ghi cũ đã gắn nó. | Mục `DELETED` ẩn hoàn toàn khỏi UI chọn mới. |
| BR-05 | Mọi thay đổi danh mục/cấu hình ghi audit | Tạo/sửa/vô hiệu/xóa mềm bất kỳ danh mục hay tham số cấu hình nào đều ghi `AuditLog` với `oldValue`/`newValue`. | Append-only; phục vụ truy vết ai-đổi-gì-khi-nào. |
| BR-06 | Tham số cấu hình đúng kiểu | `SystemSetting.value` phải hợp lệ theo `dataType` (vd `INT`, `DECIMAL`, `BOOLEAN`, `STRING`). Lưu giá trị sai kiểu bị từ chối. | Ràng buộc tham số nghiệp vụ, vd ngưỡng điểm phải là số trong khoảng cho phép. |
| BR-07 | Tổng trọng số bộ tiêu chí nên bằng 100% | Tổng `weight` các `EvaluationCriterion` trong một `CriteriaSet` **nên** bằng 100%. Nếu khác, hệ thống **cảnh báo** nhưng vẫn cho lưu. | Không chặn cứng để hỗ trợ bộ tiêu chí đang soạn dở. |
| BR-08 | Mỗi tiêu chí có điểm tối đa & trọng số hợp lệ | `EvaluationCriterion.maxScore > 0` và `0 ≤ weight ≤ 100`. | Đảm bảo F03/F06 tính điểm tổng hợp được. |
| BR-09 | `ProductType.category` thuộc tập cố định | `category` chỉ nhận một trong `ARTICLE` \| `PATENT` \| `SOLUTION` \| `TRAINING` \| `OTHER`. | Enum chốt cứng ở data-model, không sửa qua UI. |
| BR-10 | Phân quyền theo vai trò | Chỉ **Quản trị hệ thống** được CRUD toàn bộ danh mục. **Chuyên viên QL KHCN** chỉ được xem; riêng **CriteriaSet/EvaluationCriterion** được quản lý (tạo/sửa) theo phân quyền nghiệp vụ. | Chi tiết ở `ui.md` §2 Permission matrix. |
| BR-11 | `CatalogItem` thuộc đúng cấu trúc danh mục | `parentItemId` chỉ được đặt khi `Catalog.structure = TREE`; với danh mục `FLAT`, `parentItemId` phải null. Nút cha phải cùng `catalogId` với nút con. | Tránh trộn mục giữa hai danh mục khác nhau. |
| BR-12 | Phát sinh danh mục mới không cần deploy | Thêm một loại danh mục lookup mới = thêm một dòng `Catalog` (`code`, `name`, `structure`) rồi nhập `CatalogItem`. Không sửa schema, không deploy. Danh mục `isSystem = true` (loại lõi hệ thống) **không** được đổi `code` hay xóa qua UI. | Hỗ trợ "có thể phát sinh thêm"; bảo vệ các loại lõi mà feature khác phụ thuộc. |
| BR-13 | Giá trị `extra` đúng schema khai báo | Nếu `Catalog.extraSchema` được khai báo, `CatalogItem.extra` phải hợp lệ theo schema đó (vd địa chỉ bắt buộc `extra.level ∈ {PROVINCE, DISTRICT, WARD}`). | Validate khi lưu; cho phép trường mở rộng đặc thù mà không cần cột riêng. |

## 5. Dữ liệu

Thực thể do B01 sở hữu, định nghĩa tại [`../../architecture/data-model.md`](../../architecture/data-model.md)
§4.2 (Danh mục dùng chung) và §4.4 (CriteriaSet/EvaluationCriterion). B01 **không** định nghĩa lại trường mới
mà dùng đúng các trường đã có:

- **Unit** (`id`, `code`, `name`, `parentUnitId` self-FK, `recordStatus`) — cây đơn vị.
- **ResearchField** (`id`, `code`, `name`, `parentFieldId` self-FK, `recordStatus`) — cây lĩnh vực/chuyên ngành nghiên cứu.
- **ProductType** (`id`, `code`, `name`, `category` enum `ARTICLE`|`PATENT`|`SOLUTION`|`TRAINING`|`OTHER`).
- **SystemSetting** (`key` PK, `value`, `dataType`, `description`) — tham số khóa–giá trị.
- **Catalog** (`id`, `code`, `name`, `structure` `FLAT`|`TREE`, `isSystem`, `extraSchema` jsonb, `recordStatus`)
  & **CatalogItem** (`id`, `catalogId`, `code`, `name`, `parentItemId` self-FK, `sortOrder`, `extra` jsonb,
  `recordStatus`) — cặp bảng generic cho các danh mục lookup ở §3.1 (địa chỉ, chức vụ, phân loại đề tài/
  thông báo/đánh giá, vị trí–vai trò hiển thị…).
- **CriteriaSet** (`id`, `name`, `type` `PROPOSAL_REVIEW`|`ACCEPTANCE`) & **EvaluationCriterion**
  (`id`, `criteriaSetId`, `name`, `maxScore`, `weight`) — dùng chung cho F03/F06.

> Với P03, B01 chỉ lưu danh mục/kỳ lịch (`ACADEMIC_YEAR`, `FISCAL_YEAR`) và tham số nền nếu cần.
> Công thức/định mức, version hiệu lực và quy tắc phân bổ là dữ liệu nghiệp vụ do P03 sở hữu.

Trường audit dùng chung (`createdAt/By`, `updatedAt/By`) và quy ước xóa mềm `recordStatus`
(`ACTIVE`|`INACTIVE`|`DELETED`) theo data-model §1. Toàn vẹn tham chiếu `ON DELETE RESTRICT` theo
data-model §5.

**Đề xuất bổ sung** (cần thêm vào data-model nếu được duyệt, ngoài phạm vi trường hiện có):

- Mẫu biểu thuyết minh hiện được tham chiếu qua `ProposalCall.proposalTemplateId` nhưng **chưa có thực thể
  riêng** trong data-model. *Đề xuất bổ sung* thực thể `BieuMauThuyetMinh`
  (`id`, `code`, `name`, `cauTruc` jsonb — danh sách trường/section, `recordStatus`) để B01 quản lý
  vòng đời mẫu biểu. Trước khi được duyệt, các AC liên quan mẫu biểu coi là phụ thuộc mở (xem §7).
- `EvaluationCriterion` hiện chưa có cờ ẩn/khôi phục riêng; dùng chung quy ước xóa mềm của bộ cha. Nếu cần
  vô hiệu từng tiêu chí, *đề xuất bổ sung* `recordStatus` cho `EvaluationCriterion`.

## 6. Acceptance criteria

- **AC-01** — Given Quản trị hệ thống đang ở màn hình quản lý `ResearchField`, When tạo mới một lĩnh vực với
  `code` chưa tồn tại và đầy đủ trường bắt buộc, Then bản ghi được lưu với `recordStatus = ACTIVE` và
  một bản ghi `AuditLog` được tạo. *(happy)*
- **AC-02** — Given đã tồn tại một `ResearchField` có `code = "LV-01"`, When Quản trị tạo/sửa một lĩnh vực khác
  với `code = "LV-01"`, Then hệ thống từ chối lưu và báo lỗi "mã đã tồn tại". *(biên – trùng mã, BR-01)*
- **AC-03** — Given một `Unit` A là cha của `Unit` B, When Quản trị sửa A để chọn B (hoặc chính A) làm
  `parentUnitId`, Then hệ thống từ chối và báo "không thể tạo vòng trong cây đơn vị". *(lỗi – chu trình, BR-03)*
- **AC-04** — Given một `ResearchField` đang được ít nhất một `ResearchProject` tham chiếu, When Quản trị yêu cầu xóa
  lĩnh vực đó, Then hệ thống **không** xóa cứng, mà thông báo lĩnh vực đang được sử dụng và đề nghị
  vô hiệu hóa thay thế. *(lỗi – RESTRICT, BR-02)*
- **AC-05** — Given một `ResearchField` không còn bản ghi nào tham chiếu, When Quản trị xóa, Then bản ghi được
  đặt `recordStatus = DELETED` (xóa mềm), không còn xuất hiện ở danh sách chọn mới, và audit được ghi.
  *(happy/biên – xóa mềm, BR-04/BR-05)*
- **AC-06** — Given Quản trị đang sửa tham số `SystemSetting` có `key = "PROPOSAL_REVIEW.PASSING_SCORE"` với
  `dataType = DECIMAL`, When nhập giá trị không phải số (vd "abc"), Then hệ thống từ chối và báo lỗi
  sai kiểu dữ liệu. *(lỗi – kiểu dữ liệu, BR-06)*
- **AC-07** — Given Quản trị đang soạn một `CriteriaSet` loại `PROPOSAL_REVIEW` với các `EvaluationCriterion` có tổng
  `weight` = 90%, When lưu bộ tiêu chí, Then hệ thống hiển thị **cảnh báo** "tổng trọng số chưa đạt 100%"
  nhưng vẫn lưu thành công. *(biên – cảnh báo, BR-07)*
- **AC-08** — Given một người dùng có vai trò **Chuyên viên QL KHCN** (không phải Quản trị hệ thống),
  When họ cố tạo/sửa danh mục `Unit`, Then hệ thống từ chối với lỗi thiếu quyền; nhưng When họ tạo/sửa
  `CriteriaSet`, Then được phép theo phân quyền nghiệp vụ. *(quyền, BR-10)*
- **AC-09** — Given Quản trị tạo `EvaluationCriterion` với `maxScore = 0`, When lưu, Then hệ thống từ chối và
  báo `maxScore` phải lớn hơn 0. *(lỗi – ràng buộc tiêu chí, BR-08)*
- **AC-10** — Given Quản trị mở danh mục `POSITION` (Chức vụ) và đã có `CatalogItem` `code = "TP"`, When tạo
  mục khác cùng danh mục với `code = "TP"`, Then hệ thống từ chối ("mã đã tồn tại trong danh mục");
  nhưng When tạo `code = "TP"` trong danh mục `USER_ROLE_LABEL`, Then được phép. *(biên – trùng mã theo phạm vi danh mục, BR-01)*
- **AC-11** — Given danh mục `ADMINISTRATIVE_DIVISION` có `structure = TREE` và một mục "Tỉnh" đang là cha của
  một mục "Huyện", When Quản trị sửa mục "Tỉnh" để chọn "Huyện" (hoặc chính nó) làm `parentItemId`,
  Then hệ thống từ chối với lỗi tạo vòng. *(lỗi – chu trình, BR-03/BR-11)*
- **AC-12** — Given Quản trị tạo một loại danh mục mới bằng cách thêm một `Catalog` (`code = "ACADEMIC_RANK"`,
  `structure = FLAT`), When lưu và nhập các `CatalogItem`, Then danh mục mới xuất hiện ở nav trái và dùng được
  ngay, **không** cần migration/deploy; và một `AuditLog` được ghi. *(happy – mở rộng, BR-12)*
- **AC-13** — Given danh mục `ADMINISTRATIVE_DIVISION` khai báo `extraSchema` yêu cầu `extra.level ∈ {PROVINCE, DISTRICT, WARD}`,
  When Quản trị lưu một `CatalogItem` thiếu `level` hoặc sai giá trị, Then hệ thống từ chối và báo lỗi schema. *(lỗi – BR-13)*
- **AC-14** — Given một `CatalogItem` thuộc `POSITION` đang được ít nhất một hồ sơ người dùng tham chiếu,
  When Quản trị yêu cầu xóa mục đó, Then hệ thống **không** xóa cứng mà đề nghị vô hiệu hóa (INACTIVE),
  và mục `INACTIVE` không còn xuất hiện ở danh sách chọn mới. *(lỗi – RESTRICT, BR-02/BR-04)*

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc xuôi (feature khác dùng B01):** F01/F02 dùng `ResearchField`, mẫu biểu thuyết minh và bộ tiêu chí
  xét duyệt; F03/F06 dùng `CriteriaSet`/`EvaluationCriterion`; F07 dùng `ProductType`; F04/B04 dùng
  `SystemSetting` (số ngày nhắc hạn báo cáo). Mọi feature đều dùng `Unit`. Các danh mục lookup generic
  (`POSITION`, `ADMINISTRATIVE_DIVISION`, …) được F08 (lý lịch), B03 (hồ sơ người dùng) và các form khác
  tham chiếu qua `CatalogItem.id`.
- **Phụ thuộc ngược:** B03 cung cấp vai trò/quyền để kiểm soát truy cập B01 (RBAC). `audit` module ghi
  `AuditLog`.
- **Rủi ro – thay đổi cấu hình tác động vận hành:** đổi `PROPOSAL_REVIEW.PASSING_SCORE` hay số ngày nhắc hạn ảnh
  ảnh hưởng tới F03/F04 đang chạy. Giảm thiểu: ghi audit đầy đủ (BR-05) và cảnh báo phạm vi ảnh hưởng.
- **Rủi ro – xóa nhầm danh mục:** giảm thiểu bằng `RESTRICT` + xóa mềm (BR-02/BR-04).
- **Điểm cần làm rõ (mở):**
  1. Thực thể `BieuMauThuyetMinh` chưa có trong data-model — cần ADR/PR bổ sung trước khi triển khai
     phần quản lý mẫu biểu (xem §5 "đề xuất bổ sung").
  2. Ranh giới phân quyền `CriteriaSet` giữa Quản trị hệ thống và Chuyên viên QL KHCN cần PO chốt cuối
     (hiện đặt theo BR-10 và Permission matrix ở `ui.md`).
  3. **"Chuyên ngành đề tài NCKH" vs `ResearchField`:** hiện ánh xạ "Chuyên ngành" về entity `ResearchField`
     đã có (đang bị `ResearchProject` trỏ tới). Nếu PO xác định "Chuyên ngành" là một trục phân loại **khác**
     với "lĩnh vực", cần tách thành danh mục generic riêng (`RESEARCH_SPECIALIZATION`) — chốt trước khi seed.
  4. **"Đơn vị công tác" vs `Unit`:** hiện dùng chung cây `Unit`. Nếu cần phân biệt "đơn vị công tác của cán bộ"
     với "đơn vị chủ trì đề tài", cân nhắc một danh mục generic riêng — hiện coi là một.
