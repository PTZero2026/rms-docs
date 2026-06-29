---
title: "Dự án phục vụ sản xuất"
id: "F11"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.3
updated: 2026-06-26
---

# Dự án phục vụ sản xuất

> **Nguồn sự thật về nghiệp vụ.** Mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Các **viện** thuộc Trường thực hiện **dự án phục vụ sản xuất**, thường **liên kết với công ty bên
  ngoài** để triển khai nhiệm vụ tư vấn, chuyển giao, dịch vụ kỹ thuật hoặc hợp đồng sản xuất ứng dụng.
  Nguồn dữ liệu tối thiểu theo biên bản: **tên dự án, thành viên, kinh phí**.
- RMS quản lý F11 theo hướng **đầu mục dự án + minh chứng + xác nhận**; không chạy nghiệp vụ dự toán/giải
  ngân/quyết toán và **không tham chiếu sang F05**.
- Mục tiêu: ghi nhận đầy đủ hoạt động phục vụ sản xuất, gắn về **đơn vị/viện chủ trì**, **đối tác ngoài**,
  **thành viên tham gia**, kinh phí tổng và quy đổi giờ giảng qua P03 để tự động đổ về lý lịch khoa học (F08).

## 2. Phạm vi

- **Trong phạm vi:**
  - Kê khai/cập nhật đầu mục dự án: mã/tên dự án, đơn vị/viện chủ trì, **đối tác/công ty ngoài**, chủ nhiệm
    hoặc người phụ trách, thành viên & vai trò, thời gian thực hiện, **kinh phí hợp đồng/tổng kinh phí**.
  - Đính kèm **minh chứng**: hợp đồng, phụ lục hợp đồng, biên bản nghiệm thu/bàn giao, văn bản xác nhận kết quả.
  - **Xác nhận/phê duyệt** đầu mục bởi QLKH theo vòng đời tối giản **Nháp → Chờ duyệt → Đã duyệt**, có
    **Trả lại** để bổ sung.
  - Ghi nhận kết quả và **quy đổi giờ giảng (P03)** cho thành viên theo vai trò/tỉ lệ đóng góp; tổng hợp vào F08.
- **Ngoài phạm vi:**
  - Quản lý chi tiết **dự toán, tạm ứng, giải ngân, quyết toán, thanh lý hợp đồng**. F11 chỉ lưu số tiền
    tổng/hợp đồng để phục vụ thống kê và quy đổi giờ giảng; không tạo hồ sơ hay tham chiếu sang F05.
  - Quản lý pháp lý vòng đời hợp đồng với đối tác ngoài ở mức CRM/procurement.
  - Theo dõi deliverable kỹ thuật chi tiết của dự án; RMS chỉ lưu mô tả kết quả và minh chứng nghiệm thu/bàn giao.

## 3. Luồng nghiệp vụ chính

1. Viện/chuyên viên hoặc giảng viên phụ trách **kê khai dự án**: thông tin dự án, đơn vị/viện, đối tác
   ngoài, thành viên, vai trò, kinh phí tổng và minh chứng ban đầu.
2. Người kê khai **gửi duyệt**. Chuyên viên QLKH kiểm tra thông tin/minh chứng rồi **duyệt** hoặc **Trả lại**
   kèm lý do để bổ sung.
3. Khi dự án đủ điều kiện theo cấu hình, hệ thống phát sinh **yêu cầu quy đổi giờ giảng (P03)** theo loại
   hoạt động `APPLIED_PROJECT`, vai trò và tỉ lệ đóng góp.
4. Khi có kết quả/biên bản nghiệm thu, người phụ trách cập nhật **kết quả dự án** và minh chứng hoàn thành;
   QLKH xác nhận kết quả nếu tenant chọn mốc tính giờ ở giai đoạn hoàn thành.

> **Mốc phát sinh giờ giảng cấu hình linh động per-tenant.** Một tham số cấu hình chọn mốc tính giờ:
> khi duyệt **kê khai dự án** hoặc khi duyệt **kết quả/nghiệm thu** ([VP-PARAM](../../architecture/variation-points.md#4-danh-mục--dữ-liệu-tham-chiếu),
> vd `f11.teachingHourTrigger`). **Cách tính** qua P03 là lõi cố định: idempotent, phân bổ theo vai trò/tỉ lệ,
> ghi audit; chỉ mốc kích hoạt biến thiên.

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Gắn đơn vị/viện | Mỗi dự án phải thuộc đúng một đơn vị/viện chủ trì của Trường | Từ danh mục `Unit` (B01); phục vụ phân quyền & báo cáo |
| BR-02 | Đối tác ngoài bắt buộc | Dự án phục vụ sản xuất phải ghi nhận ít nhất một công ty/đối tác bên ngoài | Có thể chọn từ danh mục `EXTERNAL_PARTNER` hoặc tạo bản ghi đối tác nháp theo quyền |
| BR-03 | Kinh phí mức đầu mục | F11 chỉ lưu kinh phí hợp đồng/tổng kinh phí ở mức ghi nhận; không quản lý dòng dự toán/giải ngân/quyết toán | Tiền VND; không tham chiếu sang F05 |
| BR-04 | Minh chứng bắt buộc cấu hình động | Loại minh chứng bắt buộc để duyệt được cấu hình theo **loại dự án × giai đoạn**; khi duyệt thiếu loại bắt buộc thì chặn | Loại minh chứng từ `EVIDENCE_TYPE` (B01); dùng VP-EVID-REQ |
| BR-05 | Vòng đời xác nhận | Trạng thái tối thiểu: **Nháp → Chờ duyệt → Đã duyệt**, có **Trả lại** kèm lý do về Nháp | Chuyển trạng thái qua domain service + ghi AuditLog, không tự đổi enum ở màn hình |
| BR-06 | Giờ giảng theo vai trò/tỉ lệ | Dự án đủ điều kiện mới sinh giờ giảng qua P03 cho thành viên theo vai trò và tỉ lệ đóng góp | Công thức/định mức ở P03; nguồn hoạt động `APPLIED_PROJECT` |
| BR-07 | Điều chỉnh có vết | Khi thu hồi/trả lại dự án đã duyệt hoặc sửa dữ liệu ảnh hưởng giờ giảng, giờ đã phát sinh được điều chỉnh tương ứng và ghi `AuditLog` | Qua P03; tránh tính trùng theo khóa nguồn sự kiện |

## 5. Dữ liệu (mức khái niệm)

Dự án phục vụ sản xuất (mã, tên, đơn vị/viện chủ trì, đối tác ngoài, chủ nhiệm/người phụ trách, thành viên
& vai trò, tỉ lệ đóng góp, kinh phí hợp đồng/tổng kinh phí, thời gian, kết quả, minh chứng đính kèm, trạng
thái duyệt, lý do trả lại, tham chiếu bản ghi giờ giảng P03).

## 6. Acceptance criteria

- **AC-01** *(BR-01)* — Given kê khai dự án, When lưu mà thiếu đơn vị/viện chủ trì, Then hệ thống chặn và
  yêu cầu chọn đơn vị/viện.
- **AC-02** *(BR-02)* — Given dự án phục vụ sản xuất, When gửi duyệt mà chưa có đối tác ngoài, Then hệ thống
  chặn và nêu rõ cần bổ sung đối tác/công ty liên kết.
- **AC-03** *(BR-03)* — Given nhập kinh phí dự án, When lưu, Then hệ thống lưu kinh phí tổng bằng VND ở mức
  đầu mục, không yêu cầu nhập dòng dự toán/giải ngân và không tạo tham chiếu sang F05.
- **AC-04** *(BR-04)* — Given cấu hình yêu cầu minh chứng loại `CONTRACT` ở giai đoạn duyệt kê khai, When
  QLKH duyệt dự án thiếu loại minh chứng đó, Then hệ thống chặn và nêu rõ loại còn thiếu.
- **AC-05** *(BR-05)* — Given người kê khai gửi duyệt, When QLKH **Trả lại** kèm lý do, Then dự án về
  **Nháp**, lưu lý do trả lại và người kê khai có thể sửa/bổ sung rồi gửi lại.
- **AC-06** *(BR-05,07)* — Given QLKH duyệt/trả lại/thu hồi dự án, When lưu thay đổi trạng thái, Then hệ
  thống ghi `AuditLog` append-only kèm actor, thời điểm và lý do nếu có.
- **AC-07** *(BR-06,07)* — Given dự án đủ điều kiện phát sinh giờ giảng, When xử lý quy đổi, Then thành viên
  được tính giờ qua P03 theo vai trò/tỉ lệ; When xử lý lại cùng sự kiện, Then không phát sinh giờ trùng.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** P03 (giờ giảng), F08 (lý lịch), B01 (đơn vị/viện, `EXTERNAL_PARTNER`, `EVIDENCE_TYPE`),
  B03 (phân quyền), P02 (audit).
- **Cấu hình động:**
  - **Loại minh chứng bắt buộc** theo loại dự án/giai đoạn qua VP-EVID-REQ.
  - **Mốc phát sinh giờ giảng** qua tham số `f11.teachingHourTrigger`; đề xuất pilot dùng
    `ON_RESULT_APPROVED` để chỉ tính giờ khi có kết quả/nghiệm thu.
  - **Đối tác ngoài** qua danh mục `EXTERNAL_PARTNER`; cần cơ chế tạo nhanh nhưng vẫn kiểm soát trùng.
- **Đề xuất cấu hình minh chứng tối thiểu cho tenant pilot:**

  | Giai đoạn | Loại minh chứng | Bắt buộc | Mục đích |
  |---|---|:--:|---|
  | `khai_bao` | `CONTRACT` — Hợp đồng/văn bản giao nhiệm vụ với đối tác | ✓ | Chứng minh dự án có đối tác ngoài và giá trị/khối lượng cam kết |
  | `khai_bao` | `APPENDIX` — Phụ lục hợp đồng | ○ | Bổ sung khi thay đổi thời gian, kinh phí hoặc phạm vi |
  | `ket_qua` | `ACCEPTANCE_MINUTES` — Biên bản nghiệm thu/thanh lý | ✓ | Mốc xác nhận dự án hoàn thành để phát sinh giờ giảng |
  | `ket_qua` | `HANDOVER_RECORD` — Biên bản bàn giao sản phẩm | ○ | Bổ sung khi có sản phẩm/chuyển giao cụ thể |
  | `ket_qua` | `RESULT_CONFIRMATION` — Văn bản xác nhận kết quả của đối tác/đơn vị | ○ | Dự phòng khi không có biên bản bàn giao riêng |
  | mọi giai đoạn | `OTHER` — Khác | ○ | Lưu hồ sơ bổ trợ |

  Seed `requiredEvidence` đề xuất:

  ```json
  {
    "khai_bao": ["CONTRACT"],
    "ket_qua": ["ACCEPTANCE_MINUTES"]
  }
  ```

- **Ví dụ seed đề xuất cho công thức/định mức giờ giảng P03** *(không phải nguồn sự thật; khi được PO duyệt
  phải cấu hình thành bộ công thức trong [P03](../P03-quy-doi-gio-giang/))*:

  | Giá trị hợp đồng/tổng kinh phí | Tổng giờ quy đổi gợi ý |
  |---:|---:|
  | Dưới 100.000.000 VND | 20 giờ |
  | Từ 100.000.000 đến dưới 300.000.000 VND | 40 giờ |
  | Từ 300.000.000 đến dưới 500.000.000 VND | 60 giờ |
  | Từ 500.000.000 đến dưới 1.000.000.000 VND | 80 giờ |
  | Từ 1.000.000.000 VND trở lên | 100 giờ |

  Quy tắc phân bổ đề xuất:
  - Nếu có `contributionRate` và tổng tỉ lệ hợp lệ (=100%), phân bổ `tổng giờ × contributionRate`.
  - Nếu chưa nhập tỉ lệ, dùng mặc định: chủ nhiệm/người phụ trách 40%, thư ký/điều phối 20% (nếu có),
    phần còn lại chia đều cho thành viên tham gia.
  - Mỗi dự án chỉ sinh giờ một lần theo `eventKey`; thu hồi/sửa dữ liệu ảnh hưởng giờ thì P03 ghi điều chỉnh,
    không tạo bản ghi trùng.

- **Điểm cần PO chốt còn lại:**
  - Có chấp nhận `RESULT_CONFIRMATION` thay thế `ACCEPTANCE_MINUTES` trong một số dự án không có nghiệm thu
    chính thức hay không.
  - Bảng giờ pilot ở trên dùng ngay cho Thủy Lợi hay cần điều chỉnh ngưỡng/giờ theo quy chế nội bộ.
