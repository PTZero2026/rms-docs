---
title: "ADR-0013: Rủi ro cấu trúc & quyết định cần chốt cho sys-config-service (B01)"
status: Proposed
date: 2026-07-04
deciders: "SA, Tech lead, PO/BA"
extends: "ADR-0012 (ranh giới lõi vs cấu hình tenant)"
---

# ADR-0013: Rủi ro cấu trúc & quyết định cần chốt cho sys-config-service (B01)

## Bối cảnh

[B01 (`sys-config-service`)](../../features/B01-danh-muc-cau-hinh/spec.md) bản v0.3 đã thu hẹp scope
đúng: một microservice giữ **cấu hình khóa–giá trị dạng blob** (`key → content bytes` + metadata),
đa tenant với **fallback dùng chung** (`tenantId = NULL`), cache Redis 5 phút, tự đoán MIME. Đây là
cơ chế hiện thực điểm biến thiên "danh mục/cấu hình" của [ADR-0012](0012-ranh-gioi-loi-vs-cau-hinh-tenant.md).

Refactor v0.3 là đúng hướng. Tuy nhiên khi review cấu trúc, nổi lên **6 điểm cần một quyết định có ý
thức** — nếu để mặc định, chúng trở thành nợ kỹ thuật hoặc rủi ro vận hành âm thầm. ADR này **ghi
nhận** các điểm đó và đề xuất hướng xử lý để đội chốt (accept / amend / defer), tránh "quên không quyết".

## Quyết định

> Trạng thái **Proposed**: mỗi mục dưới đây là **đề xuất** kèm mức ưu tiên. Cần PO/Tech lead xác nhận
> trước khi đưa vào `design.md`. Mục đánh dấu **[cần PO chốt]** có ảnh hưởng nghiệp vụ, không thuần kỹ thuật.

### D1 — 🔴 Tách blob nhị phân lớn khỏi bảng cấu hình
**Vấn đề:** một bảng `sys_configuration` đang gánh hai loại dữ liệu khác bản chất: *tham số nóng nhỏ*
(feature flag, JSON config vài KB) và *blob nặng tới 20 MB* (ảnh, PDF, template base64). Chúng khác
nhau về pattern truy cập: tham số nhỏ hợp cache 5 phút; blob nặng thì phình RAM Redis và row DB lớn.
**Đề xuất:** file nhị phân lớn để ở **kho object (MinIO/S3)**, bảng cấu hình chỉ giữ *tham chiếu* (URL/key
object) + metadata. Trước mắt nếu chưa tách hạ tầng: **không cache** các row có `mimeType` nhị phân, và
đặt ngưỡng mềm (vd cảnh báo khi content > 1 MB). *Ưu tiên cao.*

### D2 — 🟠 Hợp đồng nội dung theo `refer` [cần PO chốt]
**Vấn đề:** service lưu bytes và *đoán* định dạng, **không validate** nội dung có đúng cái consumer
mong đợi. Toàn bộ ràng buộc format bị đẩy sang quy ước ngầm (spec §7.1). Một PUT làm hỏng JSON của
`CONFIG.FE` → tủ vẫn nhận, màn hình tiêu thụ **vỡ âm thầm**.
**Đề xuất:** khai báo một **schema kỳ vọng theo `refer`** (vd `FRONTEND` ⇒ JSON hợp lệ theo JSON Schema);
khi ghi, nếu `refer` có schema thì validate, sai → 400. `refer` không có schema thì giữ nguyên hành vi
lưu tự do như hiện tại. *Ưu tiên cao — chặn lỗi lan sang consumer.*

### D3 — 🟠 Sổ đăng ký key (key registry) [cần PO chốt]
**Vấn đề:** `key` và `refer` là chuỗi tự do, không có danh sách key hợp lệ. Bên ghi & bên đọc thỏa
thuận ngoài hệ thống; gõ sai một ký tự → consumer nhận 404 mà không ai biết. Khó khám phá, dễ lệch.
**Đề xuất:** duy trì một **sổ đăng ký key nghiệp vụ chung** (khởi đầu là tài liệu, có thể tiến hóa thành
bảng seed) liệt kê: key, `refer`, ý nghĩa, ai ghi, ai đọc, schema (D2). Neo vào
[sổ điểm biến thiên](../variation-points.md) của [ADR-0012](0012-ranh-gioi-loi-vs-cau-hinh-tenant.md) —
key cấu hình chính là điểm biến thiên, không được "cấu hình lén". *Ưu tiên trung bình.*

### D4 — 🟡 An toàn thao tác trên bản shared [cần PO chốt]
**Vấn đề:** ba yếu tố cộng lại thành rủi ro tập trung: *xóa cứng* + *không lịch sử/versioning* + *ghi có
hiệu lực ngay, không duyệt* (spec §2, §7.4–§7.5). Một thao tác lỡ tay trên **bản shared** đập ngay vào
**mọi tenant**, không hoàn tác, không biết ai làm.
**Đề xuất (tối thiểu):** (a) **audit gọn** cho thao tác ghi/xóa bản shared — ai, key nào, khi nào (không
cần `oldValue/newValue` đầy đủ); (b) **xác nhận hai bước** khi sửa/xóa bản `tenantId = NULL` ở UI.
**Cân nhắc thêm:** bảng `sys_configuration_history` để rollback bản shared. *Ưu tiên trung bình; PO chốt
mức độ đầu tư.*

### D5 — 🟡 Hoàn thiện hoặc bỏ cờ `public`
**Vấn đề:** cờ `public` được lưu nhưng **không có tác dụng** (không bypass auth như tên gợi ý — spec §7.3),
là yếu tố nửa vời gây hiểu nhầm.
**Đề xuất:** hoặc **bỏ hẳn** khỏi data-model, hoặc **hoàn thiện** thành một route đọc public thật (không
cần JWT) có kiểm soát. Không để trạng thái mập mờ hiện tại. *Ưu tiên thấp; quyết theo có nhu cầu FE đọc
config trước đăng nhập hay không.*

### D6 — 🟡 Chuẩn hóa hoa/thường của `key`
**Vấn đề:** BR-05 cho phép cả hoa lẫn thường trong `key`, nhưng namespace cache dùng dạng thường
(AC-06 dùng `config.fe` cho key `CONFIG.FE`). Nếu tồn tại đồng thời `CONFIG.FE` và `config.fe` (hai row
hợp lệ khác nhau) → **đụng cùng một cache key** → trả nhầm nội dung.
**Đề xuất:** coi `key` **case-insensitive** — chuẩn hóa lowercase khi lưu, khi kiểm tra trùng (BR-01),
khi đọc và khi tạo cache namespace. Bổ sung thành một business rule trong spec. *Ưu tiên trung bình — là
khe hở đúng/sai, rẻ để sửa.*

## Phương án đã cân nhắc

- **A — Ghi nhận thành ADR + chốt từng điểm (chọn):** hiện các quyết định ngầm ra để đội quyết có ý
  thức; chi phí là một vòng review. Phù hợp văn hóa ADR của repo ([ADR-0001](0001-ghi-nhan-quyet-dinh-kien-truc.md)).
- **B — Sửa thẳng vào `spec.md`/`design.md` không ghi ADR:** nhanh, nhưng mất dấu vết *tại sao* và làm
  spec (BA-owned) lẫn quyết định kiến trúc. Loại.
- **C — Để nguyên, xử lý khi phát sinh sự cố:** rẻ trước mắt, nhưng D1/D2/D4 là loại lỗi *âm thầm* —
  phát hiện khi đã ảnh hưởng nhiều tenant. Loại.

## Hệ quả

- Các mục **[cần PO chốt]** (D2, D3, D4) đưa ra buổi review PO/BA + Tech lead; kết quả cập nhật ngược vào
  [B01 spec.md](../../features/B01-danh-muc-cau-hinh/spec.md) (business rule mới) và `design.md` (chưa tồn
  tại — dựng cùng dịp).
- D1, D6 là quyết định kỹ thuật — Tech lead chốt, phản ánh ở `design.md`.
- Sổ đăng ký key (D3) liên kết vào [`variation-points.md`](../variation-points.md) — key cấu hình là điểm
  biến thiên theo [ADR-0012](0012-ranh-gioi-loi-vs-cau-hinh-tenant.md).
- Khi các mục được chốt, cập nhật ADR này sang **Accepted** và ghi rõ quyết định cuối cho từng D#.
- Đây là repo docs-only ([ADR-0011](0011-tach-code-quay-ve-docs-only.md)) — ADR này định hướng cho spec/
  design, việc hiện thực code diễn ra ở repo thực thi sau.
