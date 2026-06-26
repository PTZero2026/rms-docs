---
title: "Đề tài cấp trên (Tỉnh/Bộ/Nhà nước)"
id: "F09"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.2
updated: 2026-06-26
---

# Đề tài cấp trên (Tỉnh / Bộ / Nhà nước)

> **Nguồn sự thật về nghiệp vụ.** Mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Trường tham gia các đề tài **cấp Tỉnh/Bộ/Nhà nước** do cơ quan cấp trên chủ trì quy trình. RMS **không**
  quản lý full lifecycle (đề cương → hội đồng → nghiệm thu nội bộ) như đề tài cấp cơ sở (F01–F06); chỉ
  **quản lý đầu mục**: ghi nhận thông tin, minh chứng, **phê duyệt** và **tính giờ giảng** cho giảng viên tham gia.
- Mục tiêu: có bức tranh đầy đủ về hoạt động NCKH của Trường ở mọi cấp và đổ giờ giảng về lý lịch khoa học (F08).

## 2. Phạm vi

- **Trong phạm vi:**
  - **Kê khai/cập nhật đầu mục** đề tài cấp trên: mã, tên, **cấp** (Tỉnh/Bộ/Nhà nước), cơ quan chủ trì,
    chủ nhiệm, thành viên & vai trò, thời gian bắt đầu/kết thúc, kinh phí tổng *(tham khảo, không đối soát)*.
  - Đính kèm **minh chứng** (quyết định/hợp đồng cấp trên) và cập nhật **kết quả**.
  - **Phê duyệt** đầu mục bởi QLKH theo vòng đời **Nháp → Chờ duyệt → Đã duyệt** (kèm **Trả lại** để bổ sung).
  - **Quy đổi giờ giảng (P03)** cho thành viên khi đầu mục được duyệt → tổng hợp vào F08.
- **Ngoài phạm vi:**
  - Vòng đời phê duyệt/nghiệm thu **nội bộ** (đề cương, hội đồng) — do cơ quan cấp trên thực hiện.
  - **Quản lý/đối soát kinh phí** đề tài cấp trên (dự toán, giải ngân, quyết toán) — RMS chỉ lưu kinh phí
    tổng ở mức tham khảo, **không** chạy nghiệp vụ tài chính.

## 3. Luồng nghiệp vụ chính

1. Giảng viên/chuyên viên **kê khai/cập nhật** đầu mục đề tài cấp trên + minh chứng, rồi **gửi duyệt**
   (Nháp → Chờ duyệt).
2. Chuyên viên **QLKH phê duyệt** hoặc **Trả lại** (kèm lý do) để giảng viên bổ sung/sửa.
3. Khi đầu mục **Đã duyệt** → **phát sinh quy đổi giờ giảng (P03)** cho thành viên theo **cấp đề tài & vai
   trò** → tự động tổng hợp vào **lý lịch khoa học (F08)**.

> **Mốc phát sinh giờ giảng cấu hình linh động per-tenant.** Một **tham số cấu hình** chọn mốc tính giờ —
> khi duyệt **kê khai** (ghi nhận lúc tham gia) hoặc khi duyệt **kết quả hoàn thành**
> ([VP-PARAM](../../architecture/variation-points.md#4-danh-mục--dữ-liệu-tham-chiếu), vd `f09.teachingHourTrigger`).
> **Cách tính** (engine P03, idempotent, ghi audit) là lõi cố định; chỉ **mốc kích hoạt** biến thiên.
>
> *(Diagram chi tiết đặt ở `assets/`, nhúng Mermaid khi spec chín.)*

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Quản lý đầu mục | Chỉ quản lý thông tin/đầu mục, minh chứng & kết quả; không chạy vòng đời nội bộ | Phân biệt với F01–F06; mức quản lý cấu hình per-tenant ([VP-MODE](../../architecture/variation-points.md#1-phạm-vi--feature)) |
| BR-01b | Cấp đề tài từ danh mục | **Cấp** lấy từ danh mục dùng chung `RESEARCH_TOPIC_CATEGORY` (B01), lọc các item `extra.tier = UPPER`; không hardcode | Trường tự bật/tắt cấp áp dụng ([VP-CAT](../../architecture/variation-points.md#4-danh-mục--dữ-liệu-tham-chiếu)); `code` là khóa định mức giờ giảng P03 |
| BR-02 | Minh chứng bắt buộc cấu hình động | Loại minh chứng **bắt buộc** để duyệt được cấu hình theo **cấp × giai đoạn** (duyệt kê khai / duyệt kết quả), đọc từ `extra.requiredEvidence` của item cấp; khi duyệt thiếu loại bắt buộc → **chặn** | Loại minh chứng từ danh mục `EVIDENCE_TYPE` (B01); quy tắc per-tenant ([VP-EVID-REQ](../../architecture/variation-points.md#1-phạm-vi--feature)); đổi quy tắc không cần deploy |
| BR-03 | Vòng đời phê duyệt | Trạng thái **Nháp → Chờ duyệt → Đã duyệt**, có **Trả lại** (kèm lý do) về Nháp; một cấp duyệt bởi QLKH | Máy trạng thái **tối giản riêng** của F09 (không qua P01); chuyển trạng thái qua domain service + ghi audit, không tự đổi enum ở màn hình (AGENTS §4) |
| BR-04 | Giờ giảng khi duyệt | Đầu mục **Đã duyệt** mới phát sinh quy đổi giờ giảng qua P03; không tính trùng khi xử lý lại | Idempotent theo nguồn sự kiện ([P03](../P03-quy-doi-gio-giang/) BR-04,06); mốc kích hoạt cấu hình per-tenant (VP-PARAM `f09.teachingHourTrigger`) |
| BR-05 | Giờ giảng theo cấp & vai trò | Số giờ quy đổi theo **cấp đề tài** (Tỉnh/Bộ/Nhà nước) & **vai trò** (chủ nhiệm/thành viên) qua P03 | Công thức/định mức ở P03 ([VP-TH-FORMULA/ALLOC](../../architecture/variation-points.md#5-quy-đổi-giờ-giảng-p03)) |
| BR-06 | Điều chỉnh có vết | Khi **Trả lại/thu hồi** đầu mục đã duyệt, giờ giảng đã phát sinh được **điều chỉnh tương ứng**, ghi `AuditLog` | Qua P03 (điều chỉnh có lý do); luật bất biến AGENTS §4 |

## 5. Dữ liệu (mức khái niệm)

Đề tài cấp trên (mã, tên, **cấp** *(ref `RESEARCH_TOPIC_CATEGORY`, item `tier=UPPER`)*, cơ quan chủ trì, chủ nhiệm, thành viên & vai trò,
thời gian bắt đầu/kết thúc, kinh phí tổng *(tham khảo)*, kết quả, minh chứng đính kèm, **trạng thái duyệt**,
lý do trả lại).

## 6. Acceptance criteria

- **AC-01** *(BR-01)* — Given chuyên viên kê khai đề tài cấp Bộ, When lưu, Then đề tài được ghi nhận dạng
  **đầu mục** (không yêu cầu bước hội đồng/nghiệm thu nội bộ).
- **AC-02** *(BR-02)* — Given quy tắc minh chứng của cấp đề tài (vd cấp Bộ, giai đoạn duyệt kê khai) yêu cầu
  loại `DECISION`, When QLKH duyệt mà thiếu minh chứng loại đó, Then hệ thống **chặn** và nêu rõ loại còn thiếu.
- **AC-03** *(BR-03)* — Given giảng viên gửi duyệt, When QLKH **Trả lại** kèm lý do, Then đầu mục về **Nháp**
  và giảng viên có thể sửa/bổ sung rồi gửi lại.
- **AC-04** *(BR-03)* — Given QLKH chuyển trạng thái đầu mục (duyệt/trả lại), When lưu, Then thay đổi được
  ghi `AuditLog` (append-only).
- **AC-05** *(BR-04,05)* — Given đầu mục được **Đã duyệt**, When ghi nhận, Then phát sinh giờ giảng cho
  thành viên qua P03 theo **cấp & vai trò**; When xử lý lại cùng sự kiện, Then **không phát sinh giờ trùng**.
- **AC-06** *(BR-06)* — Given đầu mục đã duyệt bị **thu hồi/trả lại**, When xử lý, Then giờ giảng đã phát
  sinh được **điều chỉnh tương ứng** và ghi `AuditLog` kèm lý do.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** P03 (giờ giảng), F08 (lý lịch), B01 (danh mục `RESEARCH_TOPIC_CATEGORY` cho cấp,
  `EVIDENCE_TYPE` cho loại minh chứng, cơ quan chủ trì), B03 (vai trò), P01 (vòng đời/chuyển trạng thái), P02 (audit).
- **Cấu hình động (đã chốt — chi tiết ở [variation-points](../../architecture/variation-points.md)):**
  - **Cấp đề tài**: dùng lại danh mục `RESEARCH_TOPIC_CATEGORY`, lọc item `extra.tier = UPPER`
    (seed gợi ý: `STATE`/`MINISTRY`/`PROVINCE`/`FUND`/`INTERNATIONAL`) — VP-CAT.
  - **Loại minh chứng**: danh mục generic mới `EVIDENCE_TYPE` (seed `DECISION`/`CONTRACT`/`ACCEPTANCE`/`OUTPUT`/`OTHER`) — VP-CAT.
  - **Quy tắc minh chứng bắt buộc**: gắn vào `RESEARCH_TOPIC_CATEGORY.<item>.extra.requiredEvidence`
    `= { "khai_bao": [...], "ket_qua": [...] }`, theo **cấp × giai đoạn** — VP-EVID-REQ (dùng chung F09–F12).
- **Điểm cần PO chốt:**
  - Giá trị seed cụ thể cho tenant pilot (Thủy Lợi): cấp nào bật, mỗi cấp yêu cầu loại minh chứng nào ở mỗi giai đoạn.
  - **Mốc phát sinh giờ giảng** (duyệt kê khai vs. duyệt kết quả hoàn thành) — cấu hình per-tenant qua tham số `f09.teachingHourTrigger` (VP-PARAM).
  - Có theo dõi **kinh phí cấp trên** chi tiết không (mặc định **không** — chỉ lưu kinh phí tổng tham khảo).
