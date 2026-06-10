---
title: "Đề xuất đề tài — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-09
---

# Đề xuất đề tài — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

- **Chủ nhiệm đề tài** (nhà khoa học): tạo, soạn, lưu nháp, nộp đề xuất; xem trạng thái & lý do trả
  lại; nộp lại sau khi được trả lại. Vào từ menu "Đề xuất của tôi" hoặc từ một kỳ `OPEN` → "Tạo đề xuất".
- **Thành viên đề tài** (nhà khoa học): xem đề tài mình tham gia; **không** chỉnh sửa nội dung hồ sơ
  (BR-05). Quyền sửa mặc định chỉ thuộc chủ nhiệm.
- **Chuyên viên QL KHCN:** tiếp nhận, kiểm tra hồ sơ theo kỳ; trả lại bổ sung kèm lý do; chốt danh
  sách hợp lệ để chuyển sang xét duyệt (F03). Phạm vi dữ liệu theo đơn vị/kỳ được phân công (overview §4.1).
- **Quản trị hệ thống:** chỉ cấu hình quyền (B03); không thao tác nghiệp vụ F01.

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION` (data-model §4.1). UI chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Quyền | Chuyên viên QL KHCN | Quản trị hệ thống | Chủ nhiệm |
|-----------|-------|:-------------------:|:-----------------:|:---------:|
| Xem danh sách/chi tiết đề xuất (theo phạm vi) | `RESEARCH_PROJECT.VIEW` | ✓ | ✓ | chỉ của mình |
| Tiếp nhận/đánh dấu đã kiểm tra | `RESEARCH_PROJECT.RECEIVE` | ✓ | – | – |
| Trả lại bổ sung (`SUBMITTED`→`DRAFT`) | `RESEARCH_PROJECT.RETURN_FOR_REVISION` | ✓ | – | – |
| Chốt danh sách sang xét duyệt | `RESEARCH_PROJECT.FINALIZE` | ✓ | – | – |
| Hủy đề xuất (trước xét duyệt) | `RESEARCH_PROJECT.CANCEL` | ✓ | – | của mình |
| Tạo/sửa nội dung hồ sơ | — | – | – | ✓ (khi `DRAFT`) |

> Chuyển `SUBMITTED` → `UNDER_REVIEW` và gán hội đồng thuộc **F03** (`RESEARCH_PROJECT.APPROVE` /
> module `review`), không nằm trong F01.

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm chủ nhiệm / thành viên (quyền sở hữu đề tài)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| MH-01 | Danh sách đề xuất của tôi | Xem các đề xuất của chủ nhiệm theo trạng thái; tạo mới. |
| MH-02 | Tạo/sửa đề xuất — form nhiều bước | Soạn thuyết minh theo biểu mẫu kỳ, lưu nháp. |
| MH-03 | Bước thành viên | Thêm/sửa/xóa thành viên đề tài (`ProjectMember`). |
| MH-04 | Bước dự toán kinh phí | Nhập `requestedBudget` và `durationMonths`. |
| MH-05 | Bước tài liệu đính kèm | Tải lên/xóa file (`Attachment`). |
| MH-06 | Xem lại & nộp | Tổng hợp, kiểm tra hợp lệ, nộp (`DRAFT` → `SUBMITTED`). |
| MH-07 | Chi tiết đề xuất (chỉ đọc) | Xem hồ sơ đã nộp, trạng thái, `projectCode`, lý do trả lại. |

### 2.2 Nhóm chuyên viên QL KHCN (quyền quản trị nghiệp vụ)

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| MH-11 | Danh sách đề xuất theo kỳ | Lọc/tìm đề xuất của một kỳ; theo dõi trạng thái. |
| MH-12 | Chi tiết hồ sơ đề xuất | Xem đầy đủ hồ sơ, thành viên, dự toán, tài liệu, lịch sử. |
| MH-13 | Tiếp nhận & kiểm tra | Đánh dấu đã kiểm tra; checklist hồ sơ. |
| MH-14 | Trả lại bổ sung | Trả về `DRAFT` kèm `reason` khi còn hạn. |
| MH-15 | Chốt danh sách xét duyệt | Chọn các đề xuất hợp lệ, chốt để chuyển F03. |

## 3. Mô tả màn hình & thao tác

Wireframe đặt trong `./assets/` (bổ sung khi có), link Figma nếu có.

### MH-01 — Danh sách đề xuất của tôi
- **Bố cục:** bảng các đề xuất của người dùng (cột: `projectCode` hoặc "—" khi chưa nộp, tên, kỳ kêu
  gọi, lĩnh vực, trạng thái, cập nhật gần nhất). Nút **Tạo đề xuất**.
- **Tạo đề xuất:** mở dialog chọn **kỳ nhận đề xuất đang `OPEN`** (chỉ liệt kê kỳ `OPEN` còn hạn). Chọn
  xong → tạo `ResearchProject` ở `DRAFT`, điều hướng tới MH-02. → AC-01.
- **Badge trạng thái:** `DRAFT` (xám "Nháp"), `SUBMITTED` (xanh "Đã nộp"), `CANCELLED` (đỏ "Đã hủy").
- **Trạng thái rỗng:** chưa có đề xuất → minh họa + CTA "Tạo đề xuất". Nếu không có kỳ nào `OPEN`:
  thông báo "Hiện chưa có kỳ nhận đề xuất nào đang mở".
- **Đang tải:** skeleton bảng. **Lỗi:** banner + nút "Thử lại".

### MH-02 — Tạo/sửa đề xuất (form nhiều bước)
- **Stepper:** Thông tin chung → Thuyết minh → Thành viên (MH-03) → Dự toán (MH-04) → Tài liệu
  (MH-05) → Xem lại & nộp (MH-06). Cho phép nhảy bước; mọi bước **Lưu nháp** giữ `DRAFT`.
- **Thông tin chung:** `name` (bắt buộc), `researchFieldId` (chọn trong lĩnh vực của kỳ — BR-03),
  `hostUnitId`, `abstract`.
- **Thuyết minh:** render động theo `proposalTemplateId` của kỳ (lưu vào `proposalDocument` jsonb).
  Đánh dấu trường bắt buộc bằng dấu *.
- **Chỉ sửa khi `DRAFT`:** nếu đề xuất ở `SUBMITTED`, form chuyển chế độ chỉ đọc và hiện banner "Hồ sơ
  đã nộp, chỉ sửa được sau khi chuyên viên trả lại bổ sung" (BR-05) → AC-05.
- **Lưu nháp:** lưu mọi thay đổi, hiển thị "Đã lưu nháp lúc HH:mm". Tự lưu nháp khi rời bước (tùy
  chọn). → AC-01.

### MH-03 — Bước thành viên
- Danh sách thành viên hiện có; dòng chủ nhiệm gắn cố định vai trò `PRINCIPAL_INVESTIGATOR`, không xóa được
  (BR-04). Thêm thành viên: tìm `User` theo tên/email, chọn `projectRole`
  (`MEMBER`/`SECRETARY`), nhập `responsibility`.
- **Validate:** không cho thêm trùng người dùng → cảnh báo "Thành viên đã có trong đề tài" (BR-08) → AC-09.

### MH-04 — Bước dự toán kinh phí
- `requestedBudget` (VND, định dạng nhóm nghìn, số nguyên ≥ 0 — BR-09), `durationMonths` (số tháng,
  > 0). Validate tại chỗ: số âm/0/không phải số → báo lỗi inline.

### MH-05 — Bước tài liệu đính kèm
- Kéo-thả/chọn file → tải lên object storage, tạo `Attachment` (`targetType='ResearchProject'`). Hiển
  thị tên, dung lượng, loại; cho xóa khi `DRAFT`. Báo lỗi nếu vượt dung lượng/định dạng không hỗ
  trợ. Trong khi upload: progress; lỗi mạng → cho thử lại từng file.

### MH-06 — Xem lại & nộp
- Tổng hợp toàn bộ hồ sơ. **Kiểm tra hợp lệ phía người dùng** (phản ánh sớm BR-01..BR-04): liệt kê
  trường thiếu/sai và liên kết về bước tương ứng; vô hiệu hóa nút **Nộp** khi chưa hợp lệ.
- **Nộp:** xác nhận → gọi API nộp. Backend là nơi quyết định (validate lại). Thành công → chuyển
  `SUBMITTED`, hiển thị `projectCode` và `submittedAt` → AC-02. Nếu backend báo hết hạn (AC-03) hoặc thiếu
  trường (AC-04): hiển thị lỗi tương ứng, giữ `DRAFT`.

### MH-07 — Chi tiết đề xuất (chỉ đọc)
- Xem hồ sơ đã nộp: `projectCode`, trạng thái, `submittedAt`, thuyết minh, thành viên, dự toán, tài liệu.
- **Lý do trả lại:** khi đề xuất bị trả về `DRAFT`, hiển thị banner nổi bật với `reason` của chuyên
  viên và nút "Sửa & nộp lại" (mở MH-02 ở chế độ sửa) → AC-07. `projectCode` giữ nguyên ở lần nộp lại → AC-11.
- **Hủy đề xuất:** nút "Hủy đề xuất" cho `DRAFT`/`SUBMITTED` (trước xét duyệt), yêu cầu nhập lý do (BR-10).

### MH-11 — Danh sách đề xuất theo kỳ
- **Bộ lọc:** kỳ nhận đề xuất (mặc định kỳ đang chọn), trạng thái (`DRAFT`/`SUBMITTED`/`CANCELLED`), lĩnh vực,
  đơn vị chủ trì, khoảng `submittedAt`, từ khóa (`projectCode`/tên/chủ nhiệm).
- **Bảng:** `projectCode`, tên, chủ nhiệm, lĩnh vực, đơn vị, trạng thái, `submittedAt`, số tài liệu. Phân
  trang server-side (overview §4.5). Sắp xếp theo `submittedAt`.
- **Phạm vi dữ liệu:** chỉ hiển thị đề xuất trong phạm vi đơn vị/kỳ của chuyên viên (AC-06).
- **Trạng thái rỗng/tải/lỗi:** thông báo "Kỳ chưa có đề xuất nào"; skeleton; banner lỗi + thử lại.

### MH-12 — Chi tiết hồ sơ đề xuất
- Hiển thị toàn bộ: thông tin chung, `proposalDocument` (render theo biểu mẫu kỳ), `ProjectMember`,
  `requestedBudget`/`durationMonths`, `Attachment` (xem/tải), và **lịch sử trạng thái** từ
  `AuditLog` (nộp/trả lại/hủy kèm `reason`, ai, khi nào).
- Nút hành động theo trạng thái & quyền: Tiếp nhận, Trả lại bổ sung, Hủy.

### MH-13 — Tiếp nhận & kiểm tra
- Chuyên viên xem hồ sơ `SUBMITTED`, đối chiếu checklist (đủ trường biểu mẫu, lĩnh vực hợp lệ, tài
  liệu kèm theo). Đánh dấu **đã kiểm tra** (ghi nhận nội bộ, không đổi `status`). Kết quả dẫn
  tới một trong hai hành động: trả lại (MH-14) hoặc đưa vào danh sách chốt (MH-15).

### MH-14 — Trả lại bổ sung
- Áp dụng cho đề xuất `SUBMITTED` khi **kỳ còn hạn** (BR-06). Nhập `reason` (bắt buộc) → xác nhận →
  `SUBMITTED` → `DRAFT`, mở khóa cho chủ nhiệm sửa, gửi thông báo (B04), ghi `AuditLog` → AC-07.
- Nếu kỳ **đã hết hạn**: nút trả lại bị vô hiệu hóa, tooltip "Kỳ đã hết hạn nộp, không thể trả
  lại bổ sung" (AC-08).

### MH-15 — Chốt danh sách xét duyệt
- Chọn nhiều đề xuất `SUBMITTED` hợp lệ trong một kỳ → **Chốt danh sách**. Đánh dấu sẵn sàng đưa vào
  xét duyệt; bàn giao sang **F03** (việc chuyển `SUBMITTED` → `UNDER_REVIEW` & gán hội đồng do F03
  thực hiện) → AC-10. Cảnh báo nếu trong tập chọn có đề xuất chưa kiểm tra/đang còn vấn đề.

## 4. Thông báo & trạng thái

| Tình huống | Thông báo |
|------------|-----------|
| Lưu nháp thành công | "Đã lưu nháp lúc HH:mm." |
| Nộp thành công | "Đã nộp đề xuất. Mã đề tài: {projectCode}." |
| Quá hạn nộp | "Đã hết hạn nộp của kỳ nhận đề xuất. Không thể nộp." (AC-03) |
| Thiếu trường bắt buộc | "Vui lòng hoàn thiện các trường: {danh sách}." (AC-04) |
| Sửa sau khi nộp | "Hồ sơ đã nộp, chỉ sửa được sau khi được trả lại bổ sung." (AC-05) |
| Thành viên trùng | "Thành viên đã có trong đề tài." (AC-09) |
| Bị trả lại bổ sung | Banner: "Hồ sơ được trả lại để bổ sung. Lý do: {reason}." (AC-07) |
| Không có quyền | "Bạn không có quyền truy cập đề xuất này." (AC-06) |

- **Trạng thái rỗng:** danh sách trống, không có kỳ `OPEN`, chưa có thành viên/tài liệu — đều có
  minh họa + hướng dẫn.
- **Đang tải:** skeleton/spinner cho danh sách, form, upload.
- **Lỗi:** lỗi mạng/máy chủ → banner + "Thử lại"; lỗi nhập liệu → inline cạnh trường.

## 5. Audit & nhật ký

Ghi `AuditLog` (append-only, data-model §4.7) cho mọi hành động đổi trạng thái/quan trọng:

| Hành động | `action` | Ghi nhận |
|-----------|-----------|----------|
| Nộp đề xuất | `RESEARCH_PROJECT.SUBMIT` | `oldValue/newValue` trạng thái, `projectCode`, `submittedAt`, người nộp |
| Trả lại bổ sung | `RESEARCH_PROJECT.RETURN_FOR_REVISION` | `reason`, trạng thái `SUBMITTED`→`DRAFT`, người thực hiện |
| Chốt danh sách | `RESEARCH_PROJECT.FINALIZE` | danh sách `researchProjectId`, kỳ, người chốt |
| Hủy đề xuất | `RESEARCH_PROJECT.CANCEL` | `reason`, trạng thái, người thực hiện |

- Lịch sử hiển thị tại MH-12. Quyền xem nhật ký: chuyên viên (phạm vi của mình) và quản trị.
- Mọi chuyển trạng thái đi qua domain service `proposal`, không update enum trực tiếp (spec BR-11).

## 6. Liên kết AC

| Màn hình | AC liên quan |
|----------|--------------|
| MH-01 | AC-01, AC-06 |
| MH-02 | AC-01, AC-04, AC-05, AC-11 |
| MH-03 | AC-09 |
| MH-04 | AC-04 |
| MH-05 | AC-04 |
| MH-06 | AC-02, AC-03, AC-04 |
| MH-07 | AC-02, AC-05, AC-07, AC-11 |
| MH-11 | AC-06 |
| MH-12 | AC-02, AC-07, AC-11 |
| MH-13 | AC-02 |
| MH-14 | AC-07, AC-08 |
| MH-15 | AC-10 |
