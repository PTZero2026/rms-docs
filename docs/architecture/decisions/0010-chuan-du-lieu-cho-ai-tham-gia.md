---
title: "ADR-0010: Chuẩn dữ liệu để AI tham gia hệ thống (actor model · suggestion gate · provenance · domain event)"
status: Proposed
date: 2026-06-10
deciders: "SA, Tech lead, PO/BA"
---

# ADR-0010: Chuẩn dữ liệu để AI tham gia hệ thống

## Bối cảnh

Định hướng: RMS sau này sẽ có **AI tham gia như một tác nhân** — gợi ý phân loại lĩnh vực, chấm sơ bộ
đề xuất, đề nghị chuyển trạng thái, soạn nháp thông báo, và **quan sát/phản ứng theo sự kiện** của hệ thống.
Yêu cầu lúc này không phải xây tính năng AI, mà **chốt chuẩn dữ liệu trước** để mở rộng về sau mà **không phá
5 luật bất biến** ([AGENTS.md §4](../../../AGENTS.md)).

Mô hình dữ liệu hiện tại ([data-model.md](../data-model.md)) **giả định mọi tác nhân là con người**:
`AuditLog.actorId → User`, `WorkflowHistory.triggeredBy`, trường audit chung `createdBy/updatedBy → User`.
Đồng thời **thiếu ba thứ** AI cần: (a) nơi lưu *đề xuất của AI* tách khỏi *sự thật authoritative*; (b) **provenance**
(model nào, prompt version nào, input gì, confidence bao nhiêu, nguồn nào) để audit và eval; (c) **phân loại nhạy
cảm** để biết trường nào được/không được gửi cho model (nhất là model ngoài).

Điểm mạnh sẵn có cần tận dụng (không làm lại): **`statusSemantic`** ([data-model §3.1](../data-model.md)) là một
*từ vựng trạng thái ổn định* để AI suy luận xuyên tổ chức; **`AuditLog`/`WorkflowHistory` append-only** là nền của
event log; **RLS đa tenant** ([ADR-0008](0008-keycloak-idp-dang-nhap-email-otp.md)); **`ai/context`** máy-đọc.

## Quyết định

Chốt **5 chuẩn dữ liệu** + một **ranh giới vàng**. Tất cả là chuẩn *cấu trúc dữ liệu*, không kéo theo hạ tầng AI
nào ở thời điểm này.

**Ranh giới vàng:** AI **không bao giờ** tự ghi sự thật authoritative (đổi `status`, ghi `ScoreSheet`, set
`researchFieldId`…). Mọi tác động của AI đi qua: *đề xuất* → *con người duyệt* → *domain service dùng chung* (kernel
workflow + guard, [ADR-0007](0007-workflow-engine-dong-per-tenant.md)). AI luôn chạy như một **actor trong scope
tenant** (RLS `app.current_tenant`), chịu phân quyền backend như mọi actor ([AGENTS.md §4.1](../../../AGENTS.md)).

| # | Chuẩn | Nội dung | Vì sao bây giờ |
|---|---|---|---|
| 1 | **Actor model mở rộng** | Tác nhân = (`actorType` `HUMAN`\|`SYSTEM`\|`AI_AGENT`, `actorId`, `onBehalfOf?`). Áp cho `AuditLog`, `WorkflowHistory.triggeredBy`, và quy ước trường audit chung. | Đắt nhất để retrofit — nằm ở *mọi* bảng. Hoãn = migration toàn hệ thống. |
| 2 | **Suggestion gate** | Thực thể `AiSuggestion` generic giữ *đề xuất* của AI tách khỏi authoritative; con người `ACCEPT/REJECT`; khi accept mới gọi domain service. | Giữ luật §4.1/§4.2; AI không được phép viết thẳng vào trạng thái nghiệp vụ. |
| 3 | **Provenance** | Mỗi output AI ghi `modelId`, `promptVersion`, `inputHash`, `confidence`, `sources[]`. | Không có thì sau không audit/eval được "vì sao AI quyết vậy" (`ai/evals`). |
| 4 | **Domain Event envelope** | Sự kiện nghiệp vụ có `eventType` (đặt theo `statusSemantic`, ổn định), `payload` typed, `schemaVersion`, `actor`, `occurredAt`; phát qua **outbox trong cùng transaction lõi**. | Vừa là cổng AI *quan sát* hệ thống, vừa là đường tiến hoá sang Event Stream mà không phá tính nhất quán mạnh. |
| 5 | **Phân loại nhạy cảm** | Quy ước gắn nhãn `dataClassification` (`PUBLIC`\|`INTERNAL`\|`SENSITIVE`) cho trường/thực thể. | Tầng AI cần biết cái gì *không* được gửi ra model ngoài. Rẻ nếu làm sớm, ngấm vào quy ước. |

Chuẩn 1–3 + 5 là **dữ liệu cho AI**; chuẩn 4 là **giao điểm** với hướng Event Stream — đồng bộ với outbox đã bàn
(domain event là nền chung cho cả AI-observe lẫn event-stream về sau).

## Phương án đã cân nhắc

- **A — 5 chuẩn data + ranh giới vàng (chọn):** AI cắm vào được mà giữ trọn luật bất biến; chi phí hôm nay chỉ là
  vài cột + 2 bảng + quy ước, không kéo hạ tầng AI.
- **B — Tạo "user ảo" cho mỗi AI agent:** né được việc đổi schema actor, nhưng phá ngữ nghĩa `User`, không có chỗ
  cho provenance, và trộn lẫn người–máy trong mọi truy vấn/báo cáo. Loại.
- **C — Cho AI ghi thẳng authoritative rồi audit sau:** đơn giản nhất nhưng **trái §4.1/§4.2** — AI tự đổi trạng
  thái, mất human gate, rủi ro nghiệp vụ. Loại.
- **D — Làm full event sourcing + vector DB/RAG ngay:** "AI-ready" trên giấy nhưng over-engineer khi chưa có tính
  năng AI nào; gánh nặng vận hành không tương xứng. Loại — chỉ cần *data trích ra được*, không cần infra AI lúc này.

## Hệ quả

**Được:**
- AI tham gia về sau **không cần migration phá vỡ** — actor/provenance/suggestion đã sẵn chỗ.
- Mọi hành động AI **truy vết được** (provenance) và **eval được** (`ai/evals`), trong khi quyền quyết định cuối vẫn
  ở con người + domain service.
- Domain event envelope là **một viên gạch dùng chung** cho cả AI-observe và lộ trình Event Stream — không làm hai lần.

**Phải làm tiếp (cập nhật [data-model.md](../data-model.md)):**
- **Actor:** thêm `actorType` enum vào `AuditLog` và `WorkflowHistory.triggeredBy`; bổ sung ghi chú actor vào quy
  ước trường audit chung §1. Thêm `ActorType` vào `packages/domain-types`.
- **Suggestion:** thêm thực thể `AiSuggestion` (§4.7) với `status` `PENDING`\|`ACCEPTED`\|`REJECTED`, `decidedBy`,
  `decidedAt`; khi `ACCEPTED` mới gọi kernel/domain service để tạo tác động thật.
- **Provenance:** nhúng cụm trường provenance vào `AiSuggestion` (hoặc tách `AiProvenance` nếu tái dùng cho luồng
  AI không-suggestion sau này).
- **Domain Event:** thêm `DomainEvent`/`outbox` (envelope typed, `schemaVersion`, `actor`, phát trong transaction
  lõi); chi tiết tải vận chuyển (in-process → broker) thuộc một ADR Event Stream riêng — ADR này chỉ chốt *hình
  dạng dữ liệu sự kiện*.
- **Phân loại:** thêm quy ước `dataClassification` vào §1; gắn nhãn dần cho trường nhạy cảm (PII, file minh chứng).
- **Bất biến vẫn giữ:** `AiSuggestion`, `DomainEvent`, `AuditLog`, `WorkflowHistory` đều append-only
  ([AGENTS.md §4.4](../../../AGENTS.md)); AI là actor chịu RLS + RBAC như mọi actor.
- **Chưa làm:** event sourcing đầy đủ, vector DB/RAG, versioning toàn cục (chỉ cân nhắc version `proposalDocument`
  nếu cần input AI tái lập tại thời điểm T).
