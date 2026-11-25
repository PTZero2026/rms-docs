---
title: "Thông báo — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Review
updated: 2026-11-25
---

# Thông báo — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt test:** API/worker (sinh `Notification`, hàng đợi, retry, dead-letter, job nhắc hạn), FE (trung tâm
  thông báo, tùy chọn nhận), BO (mẫu, ma trận kênh, nhật ký gửi, gửi lại).
- **Môi trường:** staging với **Email/SMS gateway giả lập** cho phép ép kết quả OK/lỗi; job scheduler chạy
  thủ công được; `SystemSetting` (B01) chỉnh được (`maxRetry`, `progressReport.reminderDaysBeforeDue`).
- **Dữ liệu mẫu:** ≥1 chủ nhiệm có email + SĐT; ≥1 chủ nhiệm **không có SĐT**; 1 chuyên viên có phạm vi đơn vị;
  mẫu thông báo cho các `eventType` chính; một `eventType` **cố tình thiếu mẫu** cho AC-10; đề tài có báo cáo
  tiến độ sắp/đã quá hạn.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | F03 ra kết quả APPROVED cho đề tài X, chủ nhiệm là người nhận, mẫu `PROPOSAL_REVIEW_APPROVED` đã có | Kích hoạt sự kiện `PROPOSAL_REVIEW_APPROVED` | Tạo bản ghi IN_APP `SUBMITTED` cho chủ nhiệm; hiển thị ở trung tâm thông báo; `link` trỏ đề tài X | Happy |
| TC-02 | AC-01 | Như TC-01 | Mở trung tâm thông báo của chủ nhiệm, bấm thông báo | Điều hướng đúng tới đề tài X qua `link` | Happy |
| TC-03 | AC-02 | Người nhận đã **tắt EMAIL** nhóm sự kiện không bắt buộc; sự kiện đó phát sinh | Kích hoạt sự kiện | Có bản ghi IN_APP; **không** có bản ghi EMAIL | Happy |
| TC-04 | AC-02 | Người nhận **bật** EMAIL nhóm không bắt buộc; ma trận BO bật EMAIL | Kích hoạt sự kiện | Có cả IN_APP và EMAIL (EMAIL đi hàng đợi → `SUBMITTED`) | Happy |
| TC-05 | AC-03 | `eventType` "Ưu tiên = Thường", ma trận + tùy chọn bật SMS | Kích hoạt sự kiện | **Không** tạo bản ghi SMS; có IN_APP/EMAIL theo cấu hình | Biên/Lỗi |
| TC-06 | AC-03 | `eventType` "Ưu tiên = Cao", SMS bật, người nhận có SĐT | Kích hoạt sự kiện | Có bản ghi SMS, gửi qua gateway → `SUBMITTED` | Happy |
| TC-07 | AC-04 | Bản ghi EMAIL `PENDING_SEND`, gateway ép **lỗi**, `maxRetry = 3` | Cho worker chạy hết các lần thử | Mỗi lần lỗi tăng `retryCount`, giữ `PENDING_SEND`, backoff; lần thứ 3 lỗi → `ERROR`, có `failureReason` | Biên/Lỗi |
| TC-08 | AC-04 | Bản ghi EMAIL `PENDING_SEND`, gateway ép lỗi lần 1 rồi **OK** lần 2 | Cho worker chạy | Lần 1 retry, lần 2 → `SUBMITTED`; không vào `ERROR` | Biên/Lỗi |
| TC-09 | AC-05 | Có bản ghi `ERROR`; chuyên viên có quyền `NOTIFICATION.RESEND`, trong phạm vi | Vào BO-03, bấm "Gửi lại" bản ghi đó | Reset `PENDING_SEND`, `retryCount = 0`, vào hàng đợi; gateway OK → `SUBMITTED`; ghi `AuditLog` | Happy |
| TC-10 | AC-05 | Nhiều bản ghi `ERROR` | Lọc "Chỉ lỗi", chọn nhiều, "Gửi lại đã chọn" | Tất cả reset `PENDING_SEND` và vào hàng đợi; hiển thị kết quả N bản ghi | Happy |
| TC-11 | AC-06 | Trung tâm thông báo có IN_APP chưa đọc | Mở một thông báo | Bản ghi đó `SUBMITTED → READ`; badge giảm 1 | Happy |
| TC-12 | AC-06 | Nhiều IN_APP chưa đọc | Bấm "Đánh dấu tất cả đã đọc" | Mọi IN_APP chưa đọc **của chính người dùng** → `READ`; badge = 0 | Happy |
| TC-13 | AC-07 | Báo cáo tiến độ còn đúng `N` ngày tới hạn (`progressReport.reminderDaysBeforeDue = N`) | Chạy job nhắc hạn | Phát `PROGRESS_REPORT_DUE_SOON` cho chủ nhiệm | Happy |
| TC-14 | AC-07 | Như TC-13, đã nhắc một lần | Chạy job nhắc hạn **lần nữa** cùng mốc | **Không** tạo thông báo trùng cho cùng (đề tài × kỳ × mốc) | Biên/Lỗi |
| TC-15 | AC-08 | Quản trị **tắt EMAIL** cho `eventType` ở ma trận BO; có người nhận đã bật tùy chọn EMAIL | Lưu ma trận, kích hoạt sự kiện | **Không** bản ghi EMAIL nào được tạo cho mọi người nhận; IN_APP vẫn có | Biên/Lỗi |
| TC-16 | AC-09 | Nhóm sự kiện **bắt buộc** (BR-08) | Vào FE-04 tùy chọn nhận | Công tắc EMAIL nhóm đó bị khóa ở trạng thái bật, có chú thích | Happy |
| TC-17 | AC-10 | `eventType` **thiếu mẫu** cho kênh đang gửi | Kích hoạt sự kiện | IN_APP dùng nội dung mặc định và nhật ký đánh dấu lượt thiếu mẫu. Email cùng sự kiện vẫn dùng mẫu của email. [Ca DB và worker](../../../apps/backend/test/db/notice-templates.test.mjs) · [Ca quản trị và chuyên viên](../../../e2e/notification/preferences/templates.spec.ts) | Biên/Lỗi |
| TC-18 | AC-03 / BR-03 | `eventType` cao, SMS bật, người nhận **không có SĐT** | Kích hoạt sự kiện | Bỏ qua SMS cho người đó (degrade, không lỗi); IN_APP/EMAIL vẫn gửi | Biên/Lỗi |
| TC-19 | AC-01 / BR-10 | Hai người dùng A, B đều có thông báo | A đăng nhập, mở trung tâm thông báo | A chỉ thấy thông báo của A; không thấy của B | Negative |
| TC-20 | AC-05 / Permission | Chuyên viên **không có quyền** `NOTIFICATION.RESEND` hoặc bản ghi ngoài phạm vi | Thử gọi gửi lại (API trực tiếp) | Bị từ chối (403/không thấy bản ghi); không thay đổi trạng thái | Negative |
| TC-21 | AC-09 / Permission | Người dùng FE thường | Thử mở BO-01/BO-02/BO-03 (route/API) | Bị từ chối truy cập | Negative |
| TC-22 | AC-06 | Trung tâm thông báo lỗi tải | Ép API danh sách lỗi, mở FE-02 | Báo lỗi tại hộp thư. Mở được tùy chọn; **Thử lại** giữ bộ lọc Chưa đọc và URL, trả đúng hai tin chưa đọc của chủ nhiệm. [Ca Chrome](../../../e2e/notification/deadline-reminder/acceptance.spec.ts) | Biên/Lỗi |
| TC-23 | AC-01 | F04 xác nhận `ProjectAssignment.EFFECTIVE` cho đề tài X | Kích hoạt `PROJECT_ASSIGNED` | Chủ nhiệm/thành viên đề tài nhận IN_APP/EMAIL/SMS theo cấu hình; `link` trỏ tới tab tiến độ/giao đề tài | Happy |
| TC-24 | AC-01 | F05 cập nhật `BudgetAllocation` sang `DISBURSED` | Kích hoạt `BUDGET_ALLOCATION_DISBURSED` | Chủ nhiệm/chuyên viên phụ trách nhận IN_APP/EMAIL theo cấu hình; `link` trỏ tới tab kinh phí | Happy |

## 3. Trường hợp biên & negative

- **Người nhận không có SĐT** → SMS bị bỏ qua, không tính là lỗi (TC-18).
- **Thiếu mẫu** cho `eventType` × kênh → lỗi cấu hình có kiểm soát, IN_APP vẫn ra (TC-17).
- **Job nhắc hạn chạy lặp** → không trùng nhờ khóa idempotent (TC-14).
- **Gateway lỗi tạm thời rồi phục hồi** → retry thành công, không vào dead-letter (TC-08).
- **Gateway lỗi liên tục** → vào `ERROR` đúng sau `maxRetry`, có `failureReason` (TC-07).
- **Xem chéo dữ liệu** người khác (FE) và ngoài phạm vi (BO) → bị chặn (TC-19, TC-20).
- **Truy cập màn hình quản trị bằng người dùng thường** → bị chặn (TC-21).
- **Tắt EMAIL cấp sự kiện đè tùy chọn cá nhân** → không tạo EMAIL kể cả người đã bật (TC-15).
- **Danh sách rỗng / rỗng do lọc / lỗi tải** ở FE-02 và BO-03 → hiển thị đúng trạng thái tương ứng (TC-22 và kiểm tra UI).

## 4. Checklist hồi quy

- **F01–F07 vẫn phát đúng sự kiện** sau khi đổi mẫu/ma trận: trả lại đề xuất (F01), kết quả xét duyệt (F03),
  giao đề tài và hạn báo cáo (F04), đợt cấp/chênh lệch kinh phí (F05), lịch & kết quả nghiệm thu (F06),
  duyệt/từ chối sản phẩm (F07).
- **Đổi `maxRetry` / số ngày nhắc hạn ở B01** phản ánh đúng vào hành vi worker và job (không hardcode).
- **Thay đổi người nhận/vai trò ở B03** không làm hỏng phân giải người nhận và phạm vi dữ liệu của chuyên viên.
- **Badge số chưa đọc** đồng bộ giữa FE-01 và FE-02 sau khi đọc/đánh dấu.
- **Gửi lại hàng loạt** không tạo trùng và không bỏ sót bản ghi đã chọn.
- **Audit** vẫn ghi đầy đủ khi sửa mẫu, ma trận, gửi lại, sửa tham số.

## Ca biên theo quyết định triển khai

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-25 · [US-16/TC-03](../../../specs/016-shared-deadline-reminder/quickstart.md) | AC-07 | Thông báo trong ứng dụng đã có nhưng kênh email lỗi | tác vụ chạy lại cùng mốc | vẫn một thông báo và theo dõi được lần gửi lại |

## Giữ bộ lọc hộp thư

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-26 | AC-11 | Mai có hai tin chưa đọc | Chọn Chưa đọc và mở tin thứ nhất | Chi tiết hiển thị nội dung và còn một tin chưa đọc. |
| TC-27 | AC-11 | Đang xem chi tiết từ bộ lọc Chưa đọc | Dùng nút Back của trình duyệt, rồi tải lại | Bộ lọc vẫn được chọn và danh sách chỉ còn tin thứ hai. |
| TC-28 | AC-11 | Chỉ còn một tin trong bộ lọc | Mở tin cuối và quay lại | Gặp trạng thái rỗng, có thể chuyển Tất cả và mở lại tin đã đọc mà số đếm giữ ở 0. |
| TC-29 | AC-11 | Đăng nhập người khác, biết mã tin của Mai | Đi thẳng tới mã tin | Hiện trạng thái ngoài phạm vi, nội dung và trạng thái của tin của Mai được bảo toàn. |

**Đối chứng TC-09, TC-10, TC-20 và TC-21.** Tạo hai thư bị từ chối trong khoa, một thư lỗi của khoa khác và một thư chưa rõ kết quả giao. Kiểm người dùng thường bị từ chối, chuyên viên lọc đúng hai thư, lệnh hỗn hợp hoàn tác, hai lệnh gửi lại đồng thời chỉ một lệnh thành công. Kiểm 0 lần thử sau đưa vào hàng đợi, hai bản ghi audit và đúng hai Message-ID khi worker chạy lại. [Ca PostgreSQL](../../../apps/backend/test/db/notification.test.mjs) · [Ca Chrome](../../../e2e/notification/delivery-log/acceptance.spec.ts)

**TC-07/08.** Cấu hình thử cho một trường là 2 lần và 7 giây. Ca DB kiểm lỗi SMTP 451 lần đầu, thời gian chờ, lỗi lần hai và trạng thái cuối. Khi B01 gián đoạn, số cuộc gọi SMTP và số lần thử đều bằng 0. Ca tích hợp đọc hai chính sách khác nhau từ B01 qua credential worker, đồng thời kiểm yêu cầu thiếu credential trả 401. [Worker](../../../apps/backend/test/db/notification.test.mjs) · [Đọc B01](../../../e2e/notification/preferences/acceptance.spec.ts)

**TC-05, TC-06, TC-18 và AC-03.** Dùng hai người nhận cùng trường, một số điện thoại tổng hợp và một người thiếu số. Phát sự kiện thường kể cả khi có cấu hình SMS cũ sai, sự kiện cao qua bí danh và sự kiện sau khi người dùng tắt SMS. Đối chiếu số lượt theo kênh, nội dung HTTP và mã chống trùng. Tiếp tục thử đổi tùy chọn hoặc xóa số khi tin đã xếp hàng, gỡ mẫu, không có gateway, HTTP 422, 429 và 503. [Kiểm PostgreSQL và gateway loopback](../../../apps/backend/test/db/notice-sms.test.mjs) · [Kiểm Chrome](../../../e2e/notification/preferences/sms.spec.ts)
