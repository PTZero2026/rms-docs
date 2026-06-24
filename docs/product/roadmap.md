---
title: "Roadmap — RMS"
status: Approved
updated: 2026-06-24
---

# Roadmap (Now / Next / Later)

Lộ trình ưu tiên theo **năng lực** (capability), không theo mốc lịch cứng: dựng xong khúc đầu vòng
đời (nhận đề xuất → đề xuất → xét duyệt) trên nền tảng dùng chung, rồi tới thực hiện đề tài, cuối
cùng là công bố & phân tích. Vòng đời tổng thể: xem `vision.md`.

Mỗi giai đoạn có **Mục tiêu** (kết quả mong đợi) và **Hoàn thành khi** (tiêu chí thoát) — chỉ chuyển
sang giai đoạn sau khi tiêu chí của giai đoạn hiện tại đã đạt.

## Now — Nền tảng & đầu vòng đời

**Mục tiêu:** nhận và xét duyệt được một đề xuất từ đầu đến cuối, trên nền người dùng + danh mục.

- **B03 — Quản lý người dùng**: tài khoản, vai trò, phân quyền; **đăng nhập email-OTP** & **kích hoạt
  tài khoản lần đầu** (admin cấp tài khoản, không tự đăng ký / quên mật khẩu — [ADR-0008](../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md)).
- **B01 — Danh mục & cấu hình**: dữ liệu dùng chung (lĩnh vực, đơn vị, loại…).
- **F02 — Kỳ nhận đề xuất**: mở kỳ nhận, đặt thời gian & tiêu chí.
- **F01 — Đề xuất đề tài**: nộp thuyết minh (đề cương) trong một kỳ nhận đề xuất.
- **F03 — Xét duyệt hội đồng**: hội đồng khoa học chấm điểm → chấp nhận/từ chối. Gồm:
  - **Hội đồng & thành viên**: lập hội đồng (chủ tịch / phản biện / ủy viên / thư ký) từ *danh mục
    thành viên hội đồng* (master-data quản trị ở BO, gồm cả chuyên gia ngoài đơn vị).
  - **Phê duyệt đạo đức (song song)**: hội đồng đạo đức (`EvaluationCommittee` `type=ETHICS_REVIEW`,
    tái dùng mô hình hội đồng) thẩm định song song xét duyệt khoa học — đề tài phải đạt **cả hai**.
  - **Cuộc họp phê duyệt đề cương**: lịch họp, thành phần, **biên bản & quyết nghị** (mô hình *Cuộc họp*
    dùng chung, định nghĩa từ F03 — F06 tái dùng cho họp nghiệm thu).

**Hoàn thành khi:** một đề xuất đi trọn vòng *đăng nhập → mở kỳ → nộp đề cương → hội đồng khoa học chấm
**và** hội đồng đạo đức phê duyệt (song song) qua cuộc họp có biên bản → có kết quả chấp nhận/từ chối*,
với người dùng & danh mục được quản trị trên BO.

## Next — Thực hiện đề tài

**Mục tiêu:** theo dõi đề tài đã duyệt cho tới khi nghiệm thu.

- **F04 — Quản lý tiến độ**: báo cáo tiến độ định kỳ.
- **F05 — Quản lý kinh phí**: giao dịch & đối soát với hệ thống tài chính.
- **F06 — Nghiệm thu**: hội đồng nghiệm thu đánh giá kết quả cuối qua **cuộc họp nghiệm thu** (tái dùng mô hình *Cuộc họp* & hội đồng từ F03).

**Hoàn thành khi:** một đề tài đã duyệt có thể *báo cáo tiến độ → ghi nhận & đối soát kinh phí →
nghiệm thu qua hội đồng* và đóng vòng đời.

## Later — Công bố & phân tích

**Mục tiêu:** khai thác đầu ra, dữ liệu tích lũy; mở phần công khai ra ngoài.

- **F07 — Sản phẩm khoa học**: kê khai sản phẩm, gắn về đề tài nguồn.
- **F08 — Lý lịch khoa học**: hồ sơ năng lực nhà khoa học.
- **B02 — Báo cáo & thống kê (nâng cao)**: tổng hợp toàn hệ thống.
- **Cổng công khai (public)**: khu vực không cần đăng nhập cho persona **Khách** xem *nội dung công
  khai* — tóm tắt đề tài (F01), sản phẩm khoa học đã công bố (F07), thành viên nhóm. Chỉ đọc, không
  lộ dữ liệu nội bộ (thuyết minh đầy đủ, kinh phí, phiếu chấm). Xem `personas.md`, `glossary.md`.

**Hoàn thành khi:** sản phẩm khoa học gắn được về đề tài nguồn, báo cáo tổng hợp chạy trên toàn hệ
thống, và nội dung đã công bố xem được công khai qua cổng public.

## Later (mở rộng) — Hoạt động khoa học mở rộng & Quy đổi giờ giảng (E4)

**Bối cảnh:** phát sinh từ khảo sát **ĐH Thủy Lợi** ([biên bản](../epics/BienBan_TongHop_NCKH_ThuyLoi.md)).
Mở rộng phạm vi khỏi vòng đời đề tài *cấp cơ sở* sang **mọi loại hoạt động khoa học**, với trục xuyên
suốt **quy đổi giờ giảng**. *Trạng thái: Draft — nhiều điểm chặn cần chốt với Trường (xem [E4](../epics/E4-hoat-dong-mo-rong.md)).*

**Mục tiêu:** mọi hoạt động khoa học của giảng viên được ghi nhận, phê duyệt/cấp kinh phí khi cần, và
**quy đổi ra giờ giảng** — tự động tổng hợp vào lý lịch khoa học (F08).

- **P03 — Quy đổi giờ giảng** *(Platform xuyên suốt)*: engine + cấu hình công thức quy đổi theo loại hoạt động; nguồn nuôi F08.
- **F09 — Đề tài cấp trên** (Tỉnh/Bộ/Nhà nước): quản lý **đầu mục** (không full lifecycle).
- **F10 — Đề tài sinh viên**: tính giờ giảng cho GV hướng dẫn *(phạm vi vòng đời chờ chốt)*.
- **F11 — Dự án phục vụ sản xuất**: dự án viện + đối tác ngoài (tên/thành viên/kinh phí).
- **F12 — Hoạt động khoa học & minh chứng**: gộp hội nghị/hội thảo + phục vụ cộng đồng + SHTT (quy trình chung).

**Phụ thuộc kỹ thuật mới cần quyết định:** SSO **Microsoft Entra ID** (cần ADR mới, khác [ADR-0008](../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md));
**đồng bộ GV/SV** theo cơ chế xác nhận; **số hóa dữ liệu cũ 5 năm**.

**Hoàn thành khi:** từng loại hoạt động (F09–F12) phát sinh đúng giờ giảng qua P03, tự tổng hợp vào lý
lịch khoa học (F08), và đã chốt phương án SSO Microsoft / đồng bộ GV-SV / số hóa 5 năm.

## Xuyên suốt (cross-cutting)

- **B04 — Thông báo**: chạy kèm các feature (email/SMS) để nhắc hạn báo cáo, báo kết quả xét
  duyệt/nghiệm thu… Triển khai theo nhu cầu của feature đang làm, không dồn vào một giai đoạn.

## Bảng ánh xạ feature ↔ giai đoạn

| Mã | Feature | FE | BO | Công khai | Giai đoạn |
|----|---------|:--:|:--:|:--:|-----------|
| B03 | Quản lý người dùng | – | ✓ | – | Now |
| B01 | Danh mục & cấu hình | – | ✓ | – | Now |
| F02 | Kỳ nhận đề xuất | ✓ | ✓ | – | Now |
| F01 | Đề xuất đề tài | ✓ | ✓ | ✓¹ | Now |
| F03 | Xét duyệt hội đồng | ✓ | ✓ | – | Now |
| F04 | Quản lý tiến độ | ✓ | ✓ | – | Next |
| F05 | Quản lý kinh phí | ✓ | ✓ | – | Next |
| F06 | Nghiệm thu | ✓ | ✓ | – | Next |
| F07 | Sản phẩm khoa học | ✓ | ✓ | ✓¹ | Later |
| F08 | Lý lịch khoa học | ✓ | ✓ | – | Later |
| B02 | Báo cáo & thống kê | – | ✓ | – | Later |
| P03 | Quy đổi giờ giảng *(E4)* | ✓² | ✓ | – | Later (mở rộng) |
| F09 | Đề tài cấp trên *(E4)* | ✓ | ✓ | – | Later (mở rộng) |
| F10 | Đề tài sinh viên *(E4)* | ✓ | ✓ | – | Later (mở rộng) |
| F11 | Dự án phục vụ sản xuất *(E4)* | ✓ | ✓ | – | Later (mở rộng) |
| F12 | Hoạt động khoa học & minh chứng *(E4)* | ✓ | ✓ | – | Later (mở rộng) |
| B04 | Thông báo | ✓ | ✓ | – | Xuyên suốt |

¹ Chỉ phần **nội dung công khai** (tóm tắt đề tài, sản phẩm đã công bố) hiển thị qua **Cổng công khai**
ở *Later* — không phải toàn bộ dữ liệu của feature.

² P03 là năng lực nền (không có màn hình người dùng cuối riêng); giảng viên xem giờ giảng qua **lý lịch khoa học (F08)**.

## Phụ thuộc chính

- F01 cần **F02** (phải có kỳ nhận đề xuất) và **B01/B03** (danh mục + người dùng).
- F03, F06 cùng dùng **EvaluationCommittee / ScoreSheet / Cuộc họp** — thống nhất mô hình từ F03. **Hội
  đồng đạo đức** tái dùng `EvaluationCommittee` với `type=ETHICS_REVIEW` (không tách feature); **phê duyệt
  đạo đức chạy song song** xét duyệt khoa học — đề tài phải đạt cả hai mới `APPROVED`.
- **Đăng nhập** theo [ADR-0008](../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md):
  Keycloak email-OTP, realm-per-tenant — Keycloak = xác thực (authN), B03 = phân quyền (authZ).
- `Cuộc họp` (Meeting) và giá trị enum `type=ETHICS_REVIEW` cần bổ sung vào `../architecture/data-model.md`
  + scope/BR của F03 — xem `../architecture/migration-coverage.md` (open question đạo đức đã chốt).
- F05 phụ thuộc tích hợp **hệ thống tài chính** (đối soát) — xem `../architecture/integrations.md`.
- B02 phụ thuộc dữ liệu do các feature F sinh ra → đặt ở Later là hợp lý.
- **Cổng công khai** phụ thuộc **F06 + F07**: phải có đề tài nghiệm thu & sản phẩm công bố mới có nội
  dung để hiển thị → đặt ở Later. *(Chưa có mã feature riêng — nếu phình to nên tách ADR + feature code.)*

> Roadmap là tài liệu sống. Mỗi khi đổi thứ tự ưu tiên / thêm feature / đóng một giai đoạn: cập nhật
> phần giai đoạn tương ứng **và** bảng ánh xạ, sửa `updated` ở frontmatter, rồi ghi một dòng vào Changelog.

## Changelog

| Ngày | Trạng thái | Thay đổi |
|------|------------|----------|
| 2026-06-24 | Draft (E4) | Thêm giai đoạn **Later (mở rộng) — E4** từ khảo sát ĐH Thủy Lợi: **P03** quy đổi giờ giảng + **F09–F12** (đề tài cấp trên, đề tài SV, dự án phục vụ sản xuất, hoạt động khoa học & minh chứng); thêm 5 dòng bảng ánh xạ; nêu phụ thuộc SSO Microsoft / đồng bộ GV-SV / số hóa 5 năm. |
| 2026-06-11 | Approved | *Now*: bổ sung **đăng nhập & kích hoạt lần đầu** (B03, ADR-0008); làm rõ **hội đồng + cuộc họp** (F03 phê duyệt đề cương, F06 nghiệm thu); thêm **phê duyệt đạo đức song song** (hội đồng đạo đức `type=ETHICS_REVIEW`, tái dùng mô hình). |
| 2026-06-11 | Approved | Viết lại theo cấu trúc *Mục tiêu + Hoàn thành khi* cho mỗi giai đoạn; thêm **Cổng công khai** (persona Khách) vào *Later* và cột "Công khai" trong bảng ánh xạ; chuẩn hóa mã **B04**; bổ sung mục Changelog; duyệt & chuyển Draft → Approved. |
| 2026-06-01 | Draft | Bản thảo đầu tiên. |
