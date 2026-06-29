---
title: "Quy đổi giờ giảng"
id: "P03"
epic: "E4"
owner: "<PO/BA phụ trách>"
status: Draft        # Draft | Review | Approved
version: 0.2
updated: 2026-06-29
---

# Quy đổi giờ giảng *(Platform / xuyên suốt)*

> **Nguồn sự thật về nghiệp vụ** của năng lực quy đổi giờ giảng. Đây là **trục xuyên suốt** của hệ
> thống theo khảo sát ĐH Thủy Lợi: mọi hoạt động khoa học được quy đổi ra **giờ giảng** cho giảng
> viên và tự động đổ về [lý lịch khoa học (F08)](../F08-ly-lich-khoa-hoc/).
>
> Quy ước tầng: file này dùng **ngôn ngữ nghiệp vụ**; mô hình dữ liệu/API ở `design.md`.

## 1. Bối cảnh & mục tiêu

- Trường quy đổi mọi hoạt động khoa học (đề tài, bài báo, hội nghị, phục vụ cộng đồng, SHTT) ra **giờ
  giảng** để tính khối lượng/định mức cho giảng viên.
- Cần một **cơ chế cấu hình công thức** quy đổi theo từng loại hoạt động (và vai trò người tham gia),
  thay vì hardcode — vì công thức do Trường quy định và **có thể thay đổi theo năm học/năm tài khóa/quy chế**.
- Kết quả: mỗi sự kiện khoa học sinh ra **bản ghi giờ giảng** gắn với giảng viên, tổng hợp tự động vào
  lý lịch (F08) và phục vụ báo cáo (B02).

### 1.1 Quyết định nghiệp vụ về kỳ quy đổi

- **P03 là nguồn sự thật của công thức/định mức quy đổi giờ giảng.** B01 chỉ cung cấp danh mục và tham
  số dùng chung (loại hoạt động, năm học, năm tài khóa, danh mục cấp/loại...), không lưu luật tính giờ.
- Hệ thống hỗ trợ 2 loại kỳ quy đổi:
  - `ACADEMIC_YEAR` — năm học, vd `2026-2027`.
  - `FISCAL_YEAR` — năm tài khóa/năm ngân sách, vd `2026`.
- **Mặc định dùng `ACADEMIC_YEAR`** cho quy đổi giờ giảng, vì giờ giảng phục vụ khối lượng/định mức giảng
  viên và hiển thị trong F08. Tenant có thể cấu hình `FISCAL_YEAR` nếu quy chế của Trường yêu cầu.
- Mỗi bản ghi giờ giảng lưu rõ `recognitionPeriodType` và `recognitionPeriodCode`; báo cáo có thể lọc theo
  năm học hoặc năm tài khóa nếu tenant bật cả hai trục lịch.

## 2. Phạm vi

- **Trong phạm vi:**
  - Cấu hình **công thức/định mức** quy đổi theo loại hoạt động, vai trò và loại kỳ (`ACADEMIC_YEAR` /
    `FISCAL_YEAR`), có hiệu lực theo phiên bản.
  - Tính giờ giảng cho một sự kiện hoạt động (đầu vào từ F09–F12, F07) theo công thức đang hiệu lực.
  - Phân bổ giờ giảng theo **vai trò** (chủ nhiệm/thành viên/hướng dẫn/tác giả chính…) và tỉ lệ đóng góp.
  - Ghi nhận, điều chỉnh (có lý do, có audit) và tổng hợp giờ giảng theo giảng viên/kỳ quy đổi.
- **Ngoài phạm vi:**
  - Quản trị danh mục nền như năm học, năm tài khóa, loại hoạt động lookup — thuộc B01.
  - Định mức lao động/khối lượng giảng dạy tổng thể của Trường (thuộc hệ thống đào tạo/HR).
  - Quyết toán thù lao theo giờ giảng (tài chính/nhân sự).

## 3. Luồng nghiệp vụ chính

1. Quản trị (BO) cấu hình **bộ công thức quy đổi** theo loại hoạt động, loại kỳ và khoảng hiệu lực.
2. Một feature nguồn (F07/F09/F10/F11/F12) ghi nhận sự kiện đủ điều kiện (vd: bài báo được duyệt, đề tài
   nghiệm thu đạt, hội nghị được phê duyệt) → phát **yêu cầu quy đổi** kèm ngày nghiệp vụ của sự kiện.
3. P03 xác định kỳ ghi nhận (năm học/năm tài khóa), chọn công thức **đang hiệu lực theo ngày nghiệp vụ**,
   tính số giờ, phân bổ theo vai trò → tạo **bản ghi giờ giảng**.
4. Bản ghi giờ giảng tự động hiển thị trong **lý lịch khoa học (F08)** của từng giảng viên.
5. Khi cần điều chỉnh (sai sót/đặc cách), chuyên viên sửa có lý do; thay đổi ghi `AuditLog`.

> *(Diagram chi tiết đặt ở `assets/`, nhúng Mermaid khi spec chín.)*

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | P03 sở hữu công thức | Công thức/định mức quy đổi giờ giảng được cấu hình và version trong P03; feature nguồn và B01 không hardcode luật tính giờ | B01 chỉ cung cấp danh mục/tham số nền |
| BR-02 | Loại kỳ quy đổi | Mỗi bộ công thức khai báo `periodType = ACADEMIC_YEAR` hoặc `FISCAL_YEAR`; mặc định tenant mới là `ACADEMIC_YEAR` | Điểm biến thiên `VP-TH-PERIOD` |
| BR-03 | Hiệu lực công thức | Công thức có `validFrom`/`validTo`; sự kiện áp công thức đang hiệu lực tại **ngày nghiệp vụ nguồn** (`sourceOccurredAt`), không phụ thuộc ngày hệ thống xử lý lại | Ngày nguồn do F07/F09/F10/F11/F12 phát sang P03 |
| BR-04 | Kỳ ghi nhận | Bản ghi giờ giảng lưu `recognitionPeriodType` và `recognitionPeriodCode`, suy ra từ `sourceOccurredAt` theo lịch năm học/năm tài khóa của tenant | Default F08 tổng hợp theo năm học |
| BR-05 | Phân bổ theo vai trò | Giờ giảng phân bổ theo vai trò & tỉ lệ đóng góp giữa các thành viên | Công thức phân bổ cần PO chốt |
| BR-06 | Điều kiện phát sinh | Chỉ sự kiện ở trạng thái hợp lệ (vd duyệt/nghiệm thu đạt) mới sinh giờ giảng | Mỗi feature nguồn định nghĩa "trạng thái hợp lệ" |
| BR-07 | Điều chỉnh có vết | Mọi điều chỉnh giờ giảng thủ công phải có lý do và ghi audit | Theo luật bất biến §4 (AGENTS.md) |
| BR-08 | Idempotent | Một sự kiện không bị tính giờ trùng lặp khi xử lý lại | Khóa theo nguồn sự kiện |
| BR-09 | Không chồng lấn công thức | Trong cùng tenant, không cho 2 công thức cùng `activityType` + vai trò/phạm vi + `periodType` có khoảng hiệu lực chồng lấn | Tránh chọn công thức mơ hồ |
| BR-10 | Hồi tố có kiểm soát | Khi đổi công thức, bản ghi đã quy đổi không tự đổi; muốn áp dụng hồi tố phải chạy lệnh tính lại/điều chỉnh có lý do và audit | Giữ ổn định số liệu đã chốt |

> *Các giá trị/công thức cụ thể (số giờ theo loại bài báo, cấp đề tài…) — **cần PO chốt với Trường** (biên bản §D).*

## 5. Dữ liệu (mức khái niệm)

- **Công thức/định mức quy đổi**: `activityType`, điều kiện áp dụng, `periodType`, `validFrom`, `validTo`,
  tham số tính giờ, quy tắc phân bổ theo vai trò, trạng thái phiên bản.
- **Yêu cầu quy đổi từ nguồn**: `sourceType`, `sourceId`, `eventKey`, `sourceOccurredAt`, loại hoạt động,
  danh sách người tham gia/vai trò/tỉ lệ.
- **Bản ghi giờ giảng**: giảng viên, nguồn sự kiện (loại + tham chiếu), vai trò, số giờ, `recognitionPeriodType`,
  `recognitionPeriodCode`, trạng thái, lý do điều chỉnh.

### 5.1 Gợi ý khóa kỳ

| `periodType` | Ví dụ `recognitionPeriodCode` | Nguồn lịch | Ghi chú |
|---|---|---|---|
| `ACADEMIC_YEAR` | `2026-2027` | B01/tenant calendar | Mặc định cho P03/F08 |
| `FISCAL_YEAR` | `2026` | B01/tenant calendar | Dùng khi trường quy định giờ giảng theo năm tài khóa |

## 6. Acceptance criteria

- **AC-01** *(BR-01,03)* — Given có công thức đang hiệu lực cho loại hoạt động X, When một sự kiện loại X
  được ghi nhận hợp lệ, Then hệ thống tính đúng số giờ theo công thức hiệu lực tại `sourceOccurredAt`.
- **AC-02** *(BR-02,04)* — Given tenant dùng mặc định năm học, When sự kiện có `sourceOccurredAt` thuộc năm học
  `2026-2027`, Then bản ghi giờ giảng có `recognitionPeriodType = ACADEMIC_YEAR` và `recognitionPeriodCode = 2026-2027`.
- **AC-03** *(BR-02,04)* — Given tenant cấu hình quy đổi theo năm tài khóa, When sự kiện có `sourceOccurredAt`
  thuộc năm tài khóa `2026`, Then bản ghi giờ giảng có `recognitionPeriodType = FISCAL_YEAR` và
  `recognitionPeriodCode = 2026`.
- **AC-04** *(BR-05)* — Given sự kiện có nhiều thành viên với vai trò khác nhau, When quy đổi, Then giờ
  giảng được phân bổ theo đúng quy tắc vai trò.
- **AC-05** *(BR-06,08)* — Given một sự kiện đã được quy đổi, When xử lý lại cùng sự kiện, Then không phát sinh giờ trùng.
- **AC-06** *(BR-07)* — Given chuyên viên điều chỉnh giờ giảng, When lưu, Then thay đổi được ghi `AuditLog` kèm lý do.
- **AC-07** *(BR-09)* — Given đã có công thức hiệu lực cho cùng loại hoạt động/vai trò/kỳ, When Quản trị tạo
  công thức mới có khoảng hiệu lực chồng lấn, Then hệ thống từ chối và báo khoảng hiệu lực bị trùng.
- **AC-08** *(BR-10)* — Given công thức mới được cấu hình sau khi đã có bản ghi giờ giảng, When lưu công thức,
  Then các bản ghi cũ không tự thay đổi; chỉ thay đổi khi chạy điều chỉnh/tính lại có lý do và audit.
- **AC-09** *(BR-04)* — Given giảng viên có các bản ghi giờ giảng, When mở lý lịch (F08), Then giờ giảng hiển
  thị & tổng hợp đúng theo kỳ ghi nhận.

## 7. Phụ thuộc & rủi ro

- **Phụ thuộc:** B01 (danh mục loại hoạt động), F08 (đích tổng hợp), B02 (báo cáo), P02 (audit); nguồn sự
  kiện F07/F09/F10/F11/F12.
- **Điểm nghiệp vụ cần PO chốt:** giá trị công thức/định mức quy đổi & quy tắc phân bổ vai trò (biên bản §D);
  lịch năm học/năm tài khóa của tenant; chính sách hồi tố khi số hóa dữ liệu cũ 5 năm.

## 8. Seed công thức ĐH Thủy Lợi (cần PO xác nhận)

### 8.1 Nguồn công khai đã rà

Các nguồn công khai của cổng KHCN ĐH Thủy Lợi hiện tìm được **không công bố trực tiếp** hệ số
"1 bài báo/1 sáng chế = bao nhiêu giờ giảng". Tuy nhiên có thể dùng làm nền cấu hình loại hoạt động và
điều kiện quy đổi:

| Nguồn | Nội dung dùng được cho P03 | Mức tin cậy |
|---|---|---|
| Quyết định 288/QĐ-ĐHTL ngày 14/04/2020 — Quy chế nhóm nghiên cứu mạnh ([trang tin](https://khcn.tlu.edu.vn/Home/News?page=3), [PDF](https://khcn.tlu.edu.vn/Home/DownloadFileNews/7?FileName=Quy%20che%20NCM.pdf)) | Bảng 3 có công thức quy đổi sản phẩm tương đương: bằng độc quyền giải pháp hữu ích tương đương 01 bài SCIE-Q1; bằng độc quyền sáng chế tương đương 02 bài SCIE-Q1. | Cao cho quy đổi sản phẩm tương đương; thấp nếu suy ra giờ giảng |
| Quyết định 255/QĐ-ĐHTL ngày 30/03/2021 — hỗ trợ hội nghị, công bố quốc tế, SHTT ([trang tin](https://khcn.tlu.edu.vn/Home/News?page=3), [PDF](https://khcn.tlu.edu.vn/Home/DownloadFileNews/7?FileName=255-QD-DHTL.pdf)) | Bảng phân loại bài báo theo SCIE/SSCI, Scopus Q1-Q4, Loại I/II/III tác giả và mức hỗ trợ VND; bằng sáng chế/giải pháp hữu ích có mức hỗ trợ riêng. | Cao cho danh mục/điều kiện; không phải công thức giờ |
| Quyết định 231/QĐ-ĐHTL ngày 18/03/2021 — đề tài NCKH trọng điểm ([trang tin](https://khcn.tlu.edu.vn/Home/News?page=2), [PDF](https://khcn.tlu.edu.vn/Home/DownloadFileNews/10?FileName=Q%C4%90231.pdf)) | Phụ lục kinh phí gắn đề tài trọng điểm với sản phẩm bài báo SCIE/SSCI Q1/Q2/Q3. | Cao cho điều kiện đầu ra; không phải công thức giờ |

### 8.2 Seed công thức cấu hình đề xuất

Seed này **không khẳng định là công thức chính thức của ĐH Thủy Lợi**. Nó là cấu hình khởi tạo để P03
có thể biểu diễn các quy định công khai, chờ PO/Trường điền `baseHoursScieQ1`.

| Mã công thức | Điều kiện nguồn | Công thức giờ đề xuất | Ghi chú |
|---|---|---|---|
| `TLU_PUBLICATION_SCIE_Q1` | Bài báo SCIE/SSCI Q1 hợp lệ | `hours = 1.0 * baseHoursScieQ1 * authorAllocation` | `baseHoursScieQ1` do tenant cấu hình |
| `TLU_PUBLICATION_SCIE_Q2` | Bài báo SCIE/SSCI Q2 hợp lệ | `hours = 0.5 * baseHoursScieQ1 * authorAllocation` | Hệ số 0.5 là **suy luận** từ yêu cầu NCM "2 SCIE-Q1 hoặc 1 SCIE-Q1 + 2 SCIE-Q2"; cần PO xác nhận |
| `TLU_UTILITY_SOLUTION` | Bằng độc quyền giải pháp hữu ích hợp lệ | `hours = 1.0 * baseHoursScieQ1 * authorAllocation` | Dựa trên QĐ 288: 01 giải pháp hữu ích tương đương 01 SCIE-Q1 |
| `TLU_PATENT` | Bằng độc quyền sáng chế hợp lệ | `hours = 2.0 * baseHoursScieQ1 * authorAllocation` | Dựa trên QĐ 288: 01 sáng chế tương đương 02 SCIE-Q1 |
| `TLU_PUBLICATION_SUPPORT_REF` | Bài báo/công bố quốc tế có hỗ trợ kinh phí theo QĐ 255 | `supportAmountVnd = lookup(journalRank, authorClass)` | Lưu làm **tham chiếu nguồn/metadata**, không tự đổi sang giờ nếu chưa có `hourValueVnd` được PO duyệt |

Tham số tối thiểu cần seed trong P03:

| Tham số | Kiểu | Mặc định | Ghi chú |
|---|---|---:|---|
| `tlu.baseHoursScieQ1` | DECIMAL | *(blank)* | Bắt buộc PO/Trường nhập trước khi bật công thức TLU |
| `tlu.defaultAuthorAllocation` | JSON | `{ "CORRESPONDING_OR_FIRST": 1.0 }` | Có thể thay bằng phân bổ nhiều tác giả nếu Trường yêu cầu |
| `tlu.allowSupportAmountToHours` | BOOLEAN | `false` | Chỉ bật nếu PO duyệt quy tắc đổi VND sang giờ |
| `tlu.hourValueVnd` | DECIMAL | *(blank)* | Chỉ dùng khi `allowSupportAmountToHours = true` |

Ví dụ nếu PO duyệt `tlu.baseHoursScieQ1 = 100`, P03 sẽ tính: SCIE-Q1 = 100 giờ, SCIE-Q2 = 50 giờ
*(nếu chấp nhận hệ số suy luận)*, giải pháp hữu ích = 100 giờ, sáng chế = 200 giờ trước khi phân bổ tác giả.
