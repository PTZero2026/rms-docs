---
title: "Checklist bàn giao ĐH Thủy Lợi dùng thử"
id: "handover-thuy-loi"
status: Draft
updated: 2026-07-08
source: "docs/epics/BienBan_TongHop_NCKH_ThuyLoi.md"
---

# Checklist bàn giao ĐH Thủy Lợi dùng thử

> ĐH Thủy Lợi = tenant đầu tiên kích hoạt năng lực mở rộng **E4** (bật/tắt per-tenant — [ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md)).
> Nhóm theo khối **chặn cứng → sẵn sàng**. Cấu hình tenant chỉ điền *giá trị* vào sổ điểm biến thiên
> ([variation-points.md](../architecture/variation-points.md)); cấm rẽ nhánh theo tenant trong code.

## A. Chốt nghiệp vụ (PO / Trường — chặn cứng)
- [ ] **Công thức quy đổi giờ giảng P03** từng loại hoạt động — số liệu hiện chỉ *seed đề xuất*, chưa phải nguồn sự thật (P03 §8, F11 §7)
- [ ] `tlu.baseHoursScieQ1` — bắt buộc nhập trước khi công thức P03 chuyển `ACTIVE`
- [ ] Xác nhận hệ số suy luận `SCIE_Q2 = 0.5` (đang gắn cờ `NEEDS_PO_VALIDATION`)
- [ ] `tlu.allowSupportAmountToHours` (mặc định `false`) — có quy đổi tiền hỗ trợ ra giờ không
- [ ] Quy tắc phân bổ giờ theo vai trò / tỉ lệ đóng góp (`VP-TH-ALLOC`)
- [ ] `periodType` = `ACADEMIC_YEAR` hay `FISCAL_YEAR` (`VP-TH-PERIOD`)
- [ ] **Phạm vi vòng đời F10 (đề tài SV)** — đầu mục / rút gọn / full lifecycle (`VP-MODE`)
- [ ] **Cơ chế link tự động đề tài ↔ bài báo** (F07, 2 luồng bài) — chặn build-out F07
- [ ] Phạm vi kinh phí F11 / F12 — chỉ ghi nhận hay dự toán / giải ngân
- [ ] Danh mục biểu mẫu chuẩn (thuyết minh / tờ trình / hợp đồng / biên bản) — `VP-FORM`
- [ ] Template trích xuất lý lịch KH + quy trình ký xác nhận (`VP-CV-TPL`)

## B. Cấu hình tenant Thủy Lợi (sổ điểm biến thiên — [ADR-0012](../architecture/decisions/0012-ranh-gioi-loi-vs-cau-hinh-tenant.md))
- [ ] `VP-BRAND`: tên hiển thị, logo, slug, realm Keycloak
- [ ] `VP-FEAT`: bật E4 (F09–F12, P03); lõi F01–F08 / B01–B04 bật sẵn
- [ ] `VP-WF`: graph vòng đời đề tài cấp cơ sở (8 bước theo biên bản) + map từng bước → `statusSemantic`
- [ ] `VP-GE`: chọn guard / effect từ danh mục cố định
- [ ] `VP-CAT`: seed danh mục — `RESEARCH_TOPIC_CATEGORY` (tier `UPPER` cho F09), `ProductType`, loại hoạt động F12, đơn vị / viện, học hàm / học vị
- [ ] `VP-CRIT`: bộ tiêu chí xét duyệt (F03) + nghiệm thu (F06)
- [ ] `VP-EVID-REQ`: minh chứng bắt buộc theo cấp / loại × giai đoạn (`khai_bao` / `ket_qua`)
- [ ] `VP-MODE`: mức quản lý mỗi loại (F09 đầu mục, F10 chờ chốt, F11 đầu mục)
- [ ] `VP-HOME`: widget + bố cục trang chủ theo vai trò
- [ ] `VP-PROFILE` / `VP-FIELD`: trường hồ sơ hiển thị / bắt buộc
- [ ] `VP-PARAM`: hạn nộp, ngưỡng điểm, số phiếu tối thiểu, `REMINDER_DAYS_BEFORE_DUE`, `MAX_REDO_COUNT`, `teachingHourTrigger` (F09 / F11)
- [ ] `VP-ROLE` / `VP-SCOPE`: ánh xạ vai trò RMS ↔ người của Trường + phạm vi dữ liệu theo đơn vị

## C. Tích hợp kỹ thuật
- [ ] **SSO Microsoft Entra ID** — Trường yêu cầu mail Microsoft; **mâu thuẫn [ADR-0008](../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md) (Keycloak OTP) → cần ADR mới** trước dùng thử (`VP-IDP`)
- [ ] `VP-PROV`: cách khởi tạo tài khoản (auto-provision role `USER`)
- [ ] **Đồng bộ GV / SV** (`VP-SYNC`) — cơ chế "xác nhận, không khai lại" từ HR / hệ SV; **hiện chưa có tích hợp** (rủi ro F10)
- [ ] Object storage S3 / MinIO cho file đính kèm — pre-signed URL
- [ ] Email / SMS gateway (SMTP / REST) cho B04; fallback IN_APP nếu lỗi
- [ ] Hệ thống tài chính (đối soát kinh phí F05 — [ADR-0004](../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md)) — API / CSV, fallback thủ công
- [ ] Đầu mối kỹ thuật + credential từng hệ thống tích hợp phía Trường

## D. Dữ liệu
- [ ] **Số hóa dữ liệu cũ 5 năm** (`VP-MIGRATE`) — phạm vi + định dạng nguồn + mapping
- [ ] Seed danh mục B01 tối thiểu + tham số hệ thống
- [ ] Import GV / SV ban đầu; đảm bảo còn ≥1 admin hoạt động (B03 BR-12)
- [ ] Nghiệm thu chất lượng dữ liệu sau migrate (đếm, đối chiếu mẫu)

## E. Hoàn thiện tài liệu chặn dev (từ [REVIEW.md](../features/REVIEW.md))
- [ ] **F07, F08, B02** — hiện khung mẫu rỗng (1 BR + 2 AC placeholder); F07 / F08 cần cho E4
- [ ] **Sửa mâu thuẫn B03**: `design.md` lỗi thời (role many-to-many) vs `spec.md` v0.4 (`UserType` single-role, `POST /admin/users`)
- [ ] **B01 `design.md` thiếu** (spec trỏ tới file không tồn tại)
- [ ] F03: bổ sung AC còn thiếu (AC 10 < BR 11) + phê duyệt đạo đức song song + mô hình cuộc họp / biên bản
- [ ] F06 test-plan còn khung → điền
- [ ] `design.md` chưa tách cho F02–F06, B04
- [ ] Đóng open-points §7 các spec (mã đề tài F01, gia hạn / làm lại…)

## F. Kiểm thử trước dùng thử
- [ ] Chạy hết AC trong test-plan cho luồng lõi (F01 → F06 end-to-end; F01 là tracer bullet)
- [ ] Test đường mở rộng E4: đầu mục F09 / F11 → sinh giờ P03 → hiện F08 (idempotent, không tính trùng)
- [ ] Test RBAC: mỗi persona chỉ thấy / làm đúng quyền (kiểm ở backend, không dựa UI)
- [ ] Test cách ly tenant (RLS) — không rò dữ liệu tenant khác
- [ ] Test audit: mọi đổi trạng thái ghi `AuditLog` append-only
- [ ] Test thông báo đa kênh + nhắc hạn idempotent (B04)
- [ ] Test xuất báo cáo / lý lịch KH + ký xác nhận

## G. Vận hành & hỗ trợ dùng thử
- [ ] Môi trường pilot riêng (tenant Thủy Lợi tách biệt)
- [ ] Tài khoản admin Trường + hướng dẫn onboarding
- [ ] Kịch bản dùng thử + tiêu chí nghiệm thu (success metrics: giảm thời gian xử lý ≥30%, nộp đúng hạn ≥80%…)
- [ ] Kênh báo lỗi / phản hồi + SLA hỗ trợ
- [ ] Kế hoạch backup / khôi phục + retention audit log
- [ ] Đầu mối nghiệm thu 2 phía + lịch review giữa kỳ

---

## Chặn cứng — phải xong trước dùng thử
| Khối | Hạng mục chặn |
|---|---|
| A | Công thức giờ giảng P03 (`tlu.baseHoursScieQ1`, SCIE_Q2, phân bổ vai trò) |
| C | ADR mới cho SSO Microsoft Entra ID + tích hợp đồng bộ GV/SV |
| E | F07 / F08 hết trạng thái khung mẫu |

Còn lại (B, D, F, G) làm song song.
