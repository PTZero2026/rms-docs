---
title: "ADR-0012: Ranh giới sản phẩm lõi vs cấu hình tenant (cấu hình, đừng rẽ nhánh)"
status: Accepted
date: 2026-06-24
deciders: "SA, Tech lead, PO/BA"
extends: "ADR-0007 (ranh giới vàng workflow → toàn sản phẩm)"
---

# ADR-0012: Ranh giới sản phẩm lõi vs cấu hình tenant

## Bối cảnh

RMS là sản phẩm **đa tổ chức** (multi-tenant): một sản phẩm phục vụ nhiều trường (ĐH Thủy Lợi là tenant đầu
tiên có phạm vi đặc thù — xem [E4](../../epics/E4-hoat-dong-mo-rong.md)). Nhu cầu mỗi trường khác nhau: quy
trình, danh mục, công thức quy đổi, biểu mẫu, cách đăng nhập, feature bật/tắt.

Rủi ro nếu không có kỷ luật: mỗi yêu cầu mới của một trường bị viết thẳng vào spec/code lõi ("đặc thù Thủy
Lợi"), dẫn tới **rẽ nhánh theo khách hàng** — trường thứ 2, thứ 3 đụng vào là gãy, hoặc phải fork sản phẩm.
Đây là cái chết kinh điển của sản phẩm SaaS đa tổ chức.

[ADR-0007](0007-workflow-engine-dong-per-tenant.md) đã giải đúng bài này cho **một** khía cạnh (vòng đời
`ResearchProject`) bằng **"ranh giới vàng"**: tenant chỉ chọn graph + chọn guard/effect *từ danh mục cố định*;
cài đặt luôn nằm trong code lõi. ADR này **nâng nguyên tắc đó thành luật toàn sản phẩm**.

## Quyết định

**Tách bạch hai lớp, không trộn:**

| Lớp | Là gì | Chứa | Ở đâu |
|---|---|---|---|
| **Sản phẩm lõi** | Tập **năng lực tối đa** + khai báo **CÓ THỂ cấu hình cái gì** (điểm biến thiên) | Spec năng lực (tenant-agnostic), schema cấu hình | `docs/features/*`, `docs/architecture/*` |
| **Cấu hình tenant** | **Giá trị** một trường chọn + feature bật + đặc thù | Giá trị cấu hình, cờ feature, ngoại lệ | `docs/tenants/<trường>/` |

> **Luật:** spec lõi **không bao giờ** chứa lựa chọn cụ thể của một trường. Lõi mô tả *điểm biến thiên*
> (chỗ được phép khác nhau và khác **như thế nào**); tenant điền *giá trị*. Mọi chỗ biến thiên hợp lệ được
> liệt kê tường minh ở **[sổ điểm biến thiên](../variation-points.md)** — đó là **hợp đồng** giữa lõi và tenant.

### Cây quyết định — áp cho MỌI yêu cầu "thêm/khác" của một trường

1. **A — Năng lực mới, trường khác cũng có thể cần?**
   → Thêm vào **lõi** dạng feature **bật/tắt được** (optional capability). Trung lập, **không** gắn tên trường.
   *Ví dụ: P03 quy đổi giờ giảng, F09–F12.*
2. **B — Biến thể của hành vi đã có?**
   → Biến thành **điểm cấu hình** trong lõi (đăng ký ở sổ điểm biến thiên); tenant chọn giá trị. Không fork spec.
   *Ví dụ: vòng đời → workflow graph; danh mục → B01; công thức giờ giảng → tham số P03; SSO Keycloak↔Microsoft → IdP theo realm.*
3. **C — Chỉ đặc thù một trường, khó tổng quát?**
   → Cô lập ở **hồ sơ tenant** (loại C, có cờ rõ); **không** rò vào lõi. Hiếm — nếu xuất hiện nhiều, đó là tín
   hiệu phải tổng quát hóa thành (B).

Phần lớn yêu cầu rơi vào **A hoặc B → không phải fork sản phẩm cho từng trường.**

### Quy tắc đi kèm
- **Chuẩn hóa xuyên tổ chức:** thứ phải so sánh/báo cáo giữa các trường dùng lớp **ngữ nghĩa chuẩn** cố định
  (vd `statusSemantic` của [ADR-0007](0007-workflow-engine-dong-per-tenant.md)), không phụ thuộc tên do tenant đặt.
- **Mặc định hợp lý:** mỗi điểm biến thiên có **giá trị mặc định (default tenant/template seed)**; trường mới
  chạy được ngay với mặc định, chỉ ghi đè chỗ thật sự khác.
- **Thêm điểm biến thiên là quyết định có cân nhắc:** mở một chỗ cho phép tenant khác nhau làm tăng không gian
  tổ hợp — chỉ thêm khi có nhu cầu thật, và phải đăng ký ở sổ điểm biến thiên (không "cấu hình ngầm").

## Phương án đã cân nhắc

- **A — Lõi cấu hình-được + cấu hình per-tenant (chọn):** một sản phẩm, nhiều trường qua cấu hình; chi phí là
  kỷ luật ranh giới + duy trì sổ điểm biến thiên. Mở rộng tự nhiên [ADR-0007](0007-workflow-engine-dong-per-tenant.md).
- **B — Fork theo khách hàng (mỗi trường một bản):** nhanh lúc đầu, nhưng chi phí bảo trì bùng nổ tuyến tính
  theo số trường; vá lỗi/nâng cấp phải nhân bản. Loại.
- **C — Lõi cứng, ép mọi trường theo một quy trình:** đơn giản nhất nhưng trái thực tế (mỗi trường có quy chế
  NCKH riêng) — bán không được. Loại.

## Hệ quả

- Tạo **[`docs/architecture/variation-points.md`](../variation-points.md)** — sổ đăng ký mọi điểm biến thiên
  (cơ chế, mặc định, ai cấu hình). Là tài liệu kiểm soát chống "cấu hình lén".
- Khu vực **`docs/tenants/<trường>/`** chứa hồ sơ cấu hình từng trường (giá trị + feature bật + ngoại lệ loại C).
- **Tái định khung [E4](../../epics/E4-hoat-dong-mo-rong.md)** từ "epic của ĐH Thủy Lợi" → **"năng lực mở rộng
  optional"** (trung lập); ĐH Thủy Lợi trở thành *tenant đầu tiên bật* các năng lực đó.
- Mọi `spec.md` mới phải tự hỏi cây quyết định A/B/C trước khi viết; reviewer PO/BA chặn nếu thấy đặc thù một
  trường lọt vào lõi.
- Khi sang code (repo thực thi): điểm biến thiên hiện thực bằng feature flag + bảng cấu hình per-tenant + seed
  mặc định; **không** `if (tenant === 'thuy-loi')` trong domain logic.
