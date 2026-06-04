---
title: "Danh mục & cấu hình"
id: "B01"
owner: "PO/BA"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-01
---

# Danh mục & cấu hình

> Nguồn sự thật về **nghiệp vụ** của feature. Mọi luật, dữ liệu, tiêu chí nghiệm thu
> nằm ở đây. `backoffice.md` chỉ mô tả giao diện và trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

B01 là **feature nền tảng dùng chung** của RMS: nó sở hữu các danh mục và tham số cấu hình mà hầu hết
các feature nghiệp vụ khác tham chiếu tới (đơn vị, lĩnh vực, loại sản phẩm, bộ tiêu chí đánh giá, mẫu
biểu thuyết minh, tham số hệ thống). Nếu các danh mục này không nhất quán hoặc bị sửa tùy tiện, dữ liệu
toàn hệ thống sẽ lệch: đề tài gắn sai lĩnh vực, hội đồng chấm sai thang điểm, đợt kêu gọi dùng mẫu cũ.

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
  - Quản lý (xem, tạo, sửa, vô hiệu hóa/xóa mềm) các danh mục: **Unit** (cây phân cấp), **ResearchField**
    (cây phân cấp), **ProductType**.
  - Quản lý **SystemSetting** (tham số khóa–giá trị) như ngưỡng điểm xét duyệt, số ngày nhắc hạn báo cáo…
  - Quản lý **CriteriaSet** và **EvaluationCriterion** (bộ tiêu chí `PROPOSAL_REVIEW` / `ACCEPTANCE`, mỗi tiêu chí có
    `maxScore` và `weight`) dùng chung cho F03 (xét duyệt) và F06 (nghiệm thu).
  - Quản lý **mẫu biểu thuyết minh** (biểu mẫu được đợt kêu gọi F02 áp dụng) — cấu trúc biểu mẫu, không
    phải nội dung thuyết minh của từng đề tài.
  - Xóa mềm theo `recordStatus` (`ACTIVE` | `INACTIVE` | `DELETED`); chặn xóa cứng khi đang được tham chiếu.
  - Ghi nhật ký (audit) cho mọi thay đổi danh mục/cấu hình.

- **Ngoài phạm vi:**
  - Quản lý **người dùng, vai trò, quyền** (RBAC) — thuộc B03.
  - Vòng đời **đợt kêu gọi** (mở/đóng đợt, gán mẫu biểu vào đợt) — thuộc F02; B01 chỉ cung cấp mẫu biểu
    để F02 lựa chọn.
  - Quá trình **chấm điểm** theo bộ tiêu chí — thuộc F03/F06; B01 chỉ định nghĩa bộ tiêu chí.
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

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Mã danh mục duy nhất | Trường `code` của mỗi danh mục (`Unit`, `ResearchField`, `ProductType`, `CriteriaSet`…) là duy nhất, không trùng trong cùng loại danh mục. Với `SystemSetting`, `key` là duy nhất toàn cục. | Unique constraint ở CSDL; báo lỗi rõ ràng khi trùng. |
| BR-02 | Không xóa cứng danh mục đang dùng | Danh mục đang được thực thể khác tham chiếu (FK) không được xóa cứng (`ON DELETE RESTRICT`). Hệ thống chỉ cho **xóa mềm** (`recordStatus = DELETED`) hoặc **vô hiệu hóa** (`INACTIVE`). | Bảo toàn dữ liệu lịch sử (đề tài cũ vẫn trỏ tới lĩnh vực đã ngừng dùng). |
| BR-03 | Cây không tạo vòng | Với danh mục cây (`Unit.parentUnitId`, `ResearchField.parentFieldId`), một nút **không thể** chọn chính nó hoặc một nút con/cháu của nó làm cha. | Kiểm tra chu trình trước khi lưu. |
| BR-04 | Vô hiệu hóa thay vì xóa khi còn tham chiếu | Mục `INACTIVE` không xuất hiện trong danh sách chọn mới ở các feature khác, nhưng vẫn hiển thị trên các bản ghi cũ đã gắn nó. | Mục `DELETED` ẩn hoàn toàn khỏi UI chọn mới. |
| BR-05 | Mọi thay đổi danh mục/cấu hình ghi audit | Tạo/sửa/vô hiệu/xóa mềm bất kỳ danh mục hay tham số cấu hình nào đều ghi `AuditLog` với `oldValue`/`newValue`. | Append-only; phục vụ truy vết ai-đổi-gì-khi-nào. |
| BR-06 | Tham số cấu hình đúng kiểu | `SystemSetting.value` phải hợp lệ theo `dataType` (vd `INT`, `DECIMAL`, `BOOLEAN`, `STRING`). Lưu giá trị sai kiểu bị từ chối. | Ràng buộc tham số nghiệp vụ, vd ngưỡng điểm phải là số trong khoảng cho phép. |
| BR-07 | Tổng trọng số bộ tiêu chí nên bằng 100% | Tổng `weight` các `EvaluationCriterion` trong một `CriteriaSet` **nên** bằng 100%. Nếu khác, hệ thống **cảnh báo** nhưng vẫn cho lưu. | Không chặn cứng để hỗ trợ bộ tiêu chí đang soạn dở. |
| BR-08 | Mỗi tiêu chí có điểm tối đa & trọng số hợp lệ | `EvaluationCriterion.maxScore > 0` và `0 ≤ weight ≤ 100`. | Đảm bảo F03/F06 tính điểm tổng hợp được. |
| BR-09 | `ProductType.category` thuộc tập cố định | `category` chỉ nhận một trong `ARTICLE` \| `PATENT` \| `SOLUTION` \| `TRAINING` \| `OTHER`. | Enum chốt cứng ở data-model, không sửa qua UI. |
| BR-10 | Phân quyền theo vai trò | Chỉ **Quản trị hệ thống** được CRUD toàn bộ danh mục. **Chuyên viên QL KHCN** chỉ được xem; riêng **CriteriaSet/EvaluationCriterion** được quản lý (tạo/sửa) theo phân quyền nghiệp vụ. | Chi tiết ở `backoffice.md` §2 Permission matrix. |

## 5. Dữ liệu

Thực thể do B01 sở hữu, định nghĩa tại [`../../architecture/data-model.md`](../../architecture/data-model.md)
§4.2 (Danh mục dùng chung) và §4.4 (CriteriaSet/EvaluationCriterion). B01 **không** định nghĩa lại trường mới
mà dùng đúng các trường đã có:

- **Unit** (`id`, `code`, `name`, `parentUnitId` self-FK, `recordStatus`) — cây đơn vị.
- **ResearchField** (`id`, `code`, `name`, `parentFieldId` self-FK, `recordStatus`) — cây lĩnh vực nghiên cứu.
- **ProductType** (`id`, `code`, `name`, `category` enum `ARTICLE`|`PATENT`|`SOLUTION`|`TRAINING`|`OTHER`).
- **SystemSetting** (`key` PK, `value`, `dataType`, `description`) — tham số khóa–giá trị.
- **CriteriaSet** (`id`, `name`, `type` `PROPOSAL_REVIEW`|`ACCEPTANCE`) & **EvaluationCriterion**
  (`id`, `criteriaSetId`, `name`, `maxScore`, `weight`) — dùng chung cho F03/F06.

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

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc xuôi (feature khác dùng B01):** F01/F02 dùng `ResearchField`, mẫu biểu thuyết minh và bộ tiêu chí
  xét duyệt; F03/F06 dùng `CriteriaSet`/`EvaluationCriterion`; F07 dùng `ProductType`; F04/B04 dùng
  `SystemSetting` (số ngày nhắc hạn báo cáo). Mọi feature đều dùng `Unit`.
- **Phụ thuộc ngược:** B03 cung cấp vai trò/quyền để kiểm soát truy cập B01 (RBAC). `audit` module ghi
  `AuditLog`.
- **Rủi ro – thay đổi cấu hình tác động vận hành:** đổi `PROPOSAL_REVIEW.PASSING_SCORE` hay số ngày nhắc hạn ảnh
  ảnh hưởng tới F03/F04 đang chạy. Giảm thiểu: ghi audit đầy đủ (BR-05) và cảnh báo phạm vi ảnh hưởng.
- **Rủi ro – xóa nhầm danh mục:** giảm thiểu bằng `RESTRICT` + xóa mềm (BR-02/BR-04).
- **Điểm cần làm rõ (mở):**
  1. Thực thể `BieuMauThuyetMinh` chưa có trong data-model — cần ADR/PR bổ sung trước khi triển khai
     phần quản lý mẫu biểu (xem §5 "đề xuất bổ sung").
  2. Ranh giới phân quyền `CriteriaSet` giữa Quản trị hệ thống và Chuyên viên QL KHCN cần PO chốt cuối
     (hiện đặt theo BR-10 và Permission matrix ở `backoffice.md`).
