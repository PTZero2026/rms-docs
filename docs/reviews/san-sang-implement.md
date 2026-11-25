---
title: "RMS · Báo cáo rà soát trước triển khai"
owner: "SA và BA/PO theo ủy nhiệm"
status: Review
updated: 2026-11-24
---

# RMS sẵn sàng giao task nào?

**Giao N01 cho Platform/BE ngay trên local/CI.** Checkout hiện có web, UI, lockfile và bộ E2E. Đầu ra của N01 là hai workspace backend và API contract, một operation health, client sinh từ contract và lần gọi thật từ web. QA dựng lại từ checkout sạch và kiểm CI phát hiện client lệch contract. Các task nghiệp vụ mở theo phụ thuộc của từng lát. [Phiếu N01 và thứ tự N02–N14](../guides/ke-hoach-implement-rms.md)

## Kết quả rà soát của SA

| Vướng mắc trước rà soát | Quyết định và tác động đến task |
|---|---|
| N01 chờ hạ tầng và ngân sách pilot | SA-01 chốt triển khai local/CI. Ops đối chiếu tài nguyên, chi phí và quota tại N11/N14. |
| B01 lấy quyền từ realm, B03 có cả thiết kế nhiều role và spec một role | SA-02 dùng Keycloak cho danh tính, B03 cho quyền. Mỗi tài khoản có một userType. B01 kiểm quyền hiện hành, kể cả khi trả từ cache. Admin trường chỉ ghi cấu hình của trường, quyền ghi shared được cấp riêng. Fixture US-01 tách người quản trị khỏi người chỉ xem. |
| Thiếu ranh giới transaction, cache và retry | SA-03 chốt RLS, context trong transaction và FK theo tenant. SA-05 chốt dịch vụ blob riêng cùng adapter catalog. SA-06 ghi outbox/audit cùng giao dịch, theo dõi giao nhận từng kênh. N02, N08, N09 và N11 có tình huống lỗi và kết quả cần chứng minh. |
| Chưa rõ nơi lưu cấu hình giao diện có phiên bản | SA-04 đưa VP-THEME vào catalog. N05–N07 kiểm hai trường, hai lần áp dụng cùng revision và hoàn nguyên. |
| Đề nghị xét duyệt, nghiệm thu và quyết toán có nhiều nơi cùng mô tả chuyển bước | F04 chốt cam kết khi giao. F07 đếm theo từng loại sản phẩm. F06 chốt kết luận đúng vòng. F05 sở hữu lệnh quyết toán và gọi P01 để đóng. F03/F06 dùng chung cuộc họp và biên bản, kết quả đạo đức độc lập với điểm khoa học. |

SA bổ sung 12 thiết kế feature còn thiếu và mô tả điểm tương tác của P01/P02. Thiết kế B03 và UI cũ được lưu dưới ref. ADR-0013 có kết luận cho cả sáu vấn đề về blob, schema, key, phạm vi shared, cờ public và chuẩn hóa hoa/thường. [Sáu quyết định SA](../architecture/rms-v0-sa-review.md) · [ADR-0016](../architecture/decisions/0016-nen-tang-trien-khai-va-cach-ly-tenant.md) · [ADR-0013](../architecture/decisions/0013-cau-truc-sys-config-service.md) · [Ma trận 20 feature](../features/README.md)

## Kết quả rà soát của BA/PO

Sổ có **40 quyết định**. Có 17 quyết định đã chấp thuận từ ngày 21/11, 22 quyết định chốt cho triển khai trong lượt này, và RV-31 có ngưỡng tạm chốt đủ để viết task đánh giá. BA/PO giữ các đầu mối tại trường để nghiệm thu bằng dữ liệu thực tế. [Sổ quyết định và căn cứ theo từng mã](../../specs/review-decisions.md)

| Mã chốt trong lượt này | Điều DEV/QA cần thấy được |
|---|---|
| RV-06–10, RV-12 | Nháp lưu được khi thiếu trường của bước nộp. Đúng hạn vẫn nhận, gửi lặp chỉ cấp một mã. Lý do trả có nội dung. Mở vòng đồng thời chỉ sinh một vòng. Kiểm lại xung đột khi gửi phiếu và quyền khi mở thẻ việc. |
| RV-14–23 | Giao đề tài có tệp căn cứ đọc được, cùng tên kỳ ở hai đề tài tạo hai kỳ riêng. Retry dùng lại tin cũ. Nộp trễ được gắn nhãn. Phí áp trần, số dư bằng 0 khác vượt mức. Tệp hết quyền phải thay. Mỗi sản phẩm đạt chỉ tính một lần, mỗi phiếu phải thuộc đúng vòng nghiệm thu. |
| RV-26, RV-27, RV-29 | Kiểm minh chứng theo cấp/giai đoạn ở bước duyệt F09 và theo loại của tenant ở bước gửi F12. Xác nhận GVHD thuộc đúng đăng ký F10. |
| RV-38–40 | Việc hạn hôm nay và việc thiếu hạn thuộc Tất cả. Mở tin chỉ đánh dấu tin của người nhận, quay lại giữ bộ lọc. Danh sách kỳ Đang nhận dùng cả trạng thái và khoảng ngày. |

Hai lát AI đã có tiêu chí nguồn F01/AC-12 và F07/AC-14. Các ca bao gồm mất quyền khi mở lại, nguồn chỉ được dùng metadata và tiếp tục thủ công. Ba lát mobile đã có tiêu chí tại B06, B04 và F02. [Danh mục 35 lát, spec, plan và task](../../specs/README.md)

**Các lựa chọn trong phạm vi được giao.** BA/PO dùng số theo kỳ với tiền tố tenant cho mã đề tài, ghim mẫu khi mở kỳ, giữ nguyên hạn khi tạm dừng, dùng PDF làm bản in lý lịch ở hệ thống đích và chọn luồng sinh viên rút gọn cho fixture. DEV có thể kiểm các lựa chọn này bằng dữ liệu giả. Khi trường chọn tham số, mẫu và quy chế, đầu mối nghiệp vụ đối chiếu với ca tương ứng. [Đề xuất](../features/F01-de-xuat-de-tai/spec.md) · [Tiến độ](../features/F04-quan-ly-tien-do/spec.md) · [Lý lịch](../features/F08-ly-lich-khoa-hoc/design.md) · [Đề tài sinh viên](../features/F10-de-tai-sinh-vien/spec.md)

## Phạm vi và kiểm chứng ngày 24/11/2026

Đã rà E0–E4, sản phẩm, kiến trúc và ADR, 20 bộ hồ sơ feature, kế hoạch tích hợp, hướng dẫn vận hành/bàn giao, các báo cáo v0 và 35 bộ Spec Kit. Đã đối chiếu tài liệu khảo sát, giới thiệu và hướng dẫn của trường (6 PDF, 3 PowerPoint) để xác định các việc cần dữ liệu hoặc đối tác. Ví dụ, tài liệu giải pháp xếp kết nối kế toán sau thử nghiệm, phù hợp với chế độ rà thủ công RV-24. Biên bản khảo sát và đánh giá cũ được giữ theo mốc lịch sử. [Mô tả giải pháp](../sales/rms-mo-ta-giai-phap-chi-tiet.pdf) · [Biên bản khảo sát](../epics/BienBan_TongHop_NCKH_ThuyLoi.md)

| Phép kiểm | Kết quả quan sát |
|---|---|
| Mã nguồn nghiệp vụ → thiết kế, UI, ca kiểm | 20/20 feature đủ bốn tệp. 200 BR có tham chiếu trong thiết kế. Cả 202 AC có tham chiếu trong thiết kế, UI và ít nhất một dòng TC của test plan. Có 310 TC cấp feature. |
| Liên kết tài liệu | Kiểm đích đường dẫn nội bộ trong tài liệu Markdown dự án, gồm bản lưu. Với template dùng lại, kiểm đường dẫn từ thư mục feature đích. |
| Spec Kit theo từng thư mục | 35/35 lượt prerequisites trả đúng FEATURE_DIR và đủ research, data-model, contracts, quickstart, tasks. 108 AC cấp lát, 140 TC gồm ca biên và khác tenant. 560 mục checklist đặc tả được đánh dấu. |
| Task đích | Kiểm mã module, đường dẫn OpenAPI, field của data-model trong T004 và thứ tự mã T của từng lát. Có 277 task, gồm 3 fixture mobile đã đánh dấu và 274 task còn mở. N01–N14 là phiếu kỹ thuật riêng. |
| Hồi quy của bản web hiện tại | 67/67 ca nghiệp vụ đạt. ESLint đạt. Build chạy typecheck cho web/UI và tạo bản Vite thành công. Playwright V0 trên Chrome local đạt 22/22, gồm các ca điện thoại 320/360/390 px. |

Lệnh dùng để chạy lại từ gốc monorepo. Đặt SPECIFY_FEATURE_DIRECTORY theo lát khi giao việc, vì cấu hình mặc định của checkout trỏ đến US-35.

```sh
for slice in specs/[0-9]*-*; do
  SPECIFY_FEATURE_DIRECTORY="$slice" bash .specify/scripts/bash/check-prerequisites.sh \
    --json --require-spec --require-tasks --include-tasks || exit 1
done
corepack pnpm lint
corepack pnpm test
corepack pnpm build
RMS_BROWSER_CHANNEL=chrome npm --prefix e2e run test:v0
```

## Điều kiện còn lại trước pilot thật

| Chủ trì | Thời điểm và bằng chứng |
|---|---|
| BE, IAM, DBA, QA | Sau khi dựng backend, kiểm hai realm thật, quyền và thu hồi qua API, tenant trên pool, giao dịch đồng thời, quyền tệp và audit bất biến. N12–N13 đo trên bản tích hợp. |
| Ops và chủ ngân sách | Trước mở môi trường pilot, xác nhận TLS, SMTP, quota, khu vực lưu, backup và chi phí. N14 diễn tập restore/rollback cùng build sẽ bàn giao. |
| Phòng KHCN, tài chính, đại diện trường | Đợt A đối chiếu danh sách và số đếm B02 tại kỳ 2027. Đợt B đối chiếu chứng từ và chế độ quyết toán. Từng phân hệ E4 cần ví dụ đã ký, gồm định mức và phân bổ nếu có giờ giảng. |
| Chủ dữ liệu và QA AI | Duyệt quyền nguồn trước khi dùng hồ sơ thật. RV-31 dùng bộ 50 hồ sơ gán nhãn độc lập, mục tiêu tìm ít nhất 90% mục thiếu, tối đa 10% cảnh báo sai, 0 lần lộ dữ liệu và 0 dẫn chứng bịa. Ghi kết quả đo trước khi mở AI. |

[Bàn giao cho trường](../guides/handover-thuy-loi.md) · [Kế hoạch kiểm thử tích hợp](../guides/kiem-thu-rms.md)
