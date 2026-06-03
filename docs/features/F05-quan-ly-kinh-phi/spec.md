---
title: "Quản lý kinh phí"
id: "F05"
owner: "PO/BA"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-01
---

# Quản lý kinh phí

> Nguồn sự thật về **nghiệp vụ** của feature. Mọi luật, dữ liệu, tiêu chí nghiệm thu
> nằm ở đây. `frontend.md` và `backoffice.md` chỉ mô tả giao diện và trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

Sau khi đề tài được giao và chuyển sang `DANG_THUC_HIEN` (F04), kinh phí được cấp và chi theo
khoản mục trong suốt quá trình thực hiện. Hiện việc theo dõi kinh phí làm thủ công trên bảng tính,
tách rời sổ kế toán thật của hệ thống tài chính: chủ nhiệm không biết còn lại bao nhiêu theo dự
toán, chuyên viên khó phát hiện chênh lệch giữa số liệu RMS và số liệu tài chính, và đến khi quyết
toán để đóng đề tài thì dữ liệu đã lệch khó truy nguyên.

F05 số hóa việc **theo dõi** dự toán và giao dịch kinh phí ở mức đề tài, rồi **đối soát** chúng với
hệ thống tài chính qua tích hợp (API, fallback nhập file). RMS **không thay thế kế toán** — sổ cái
thật vẫn ở hệ thống tài chính; RMS phản ánh, gắn chi tiêu với đề tài và phát hiện chênh lệch để
chuyên viên xử lý (xem [ADR-0004](../../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md)).

**Kết quả mong đợi:**
- Mỗi đề tài `DANG_THUC_HIEN` có dự toán theo khoản mục (`DuToanKinhPhi`) và sổ giao dịch cấp/chi
  (`GiaoDichKinhPhi`); chủ nhiệm xem được dự toán vs thực chi và giải trình khoản chi.
- Chuyên viên chạy đối soát định kỳ; mỗi giao dịch có `trangThaiDoiSoat` (`KHOP`/`LECH`/`CHUA_DOI_SOAT`),
  chênh lệch được xử lý có truy vết; tài chính lỗi vẫn đối soát thủ công được (degrade).
- Khi đề tài `DAT`, chuyên viên quyết toán; chỉ đóng đề tài (`HOAN_THANH`) khi **không còn giao dịch
  `LECH` tồn đọng** (phối hợp F06).

## 2. Phạm vi

- **Trong phạm vi:**
  - Lập/sửa dự toán kinh phí theo khoản mục (`DuToanKinhPhi`) cho đề tài `DANG_THUC_HIEN`.
  - Ghi nhận giao dịch cấp/chi (`GiaoDichKinhPhi` loai `CAP`/`CHI`) gắn khoản mục, có thể đính chứng từ.
  - Đối soát giao dịch với hệ thống tài chính qua API; **fallback nhập file CSV/Excel** khi tài chính
    lỗi/chưa có API; gán `trangThaiDoiSoat` theo `maGiaoDichTaiChinh`.
  - Chuyên viên xử lý chênh lệch (`LECH`): điều chỉnh/khớp lại hoặc đánh dấu giải quyết có `lyDo`.
  - Chủ nhiệm (FE) xem kinh phí đề tài mình (dự toán vs thực chi theo khoản mục), giải trình khoản chi,
    đính chứng từ — **không** tự chạy đối soát.
  - Quyết toán khi đề tài `DAT` → đóng đề tài `HOAN_THANH` (phối hợp F06), với điều kiện không còn `LECH`.
  - Thông báo chênh lệch đối soát & kết quả quyết toán (qua **B04**).
- **Ngoài phạm vi:**
  - Hạch toán/kế toán đầy đủ (sổ cái, định khoản) → ở **hệ thống tài chính**, không phải RMS
    ([ADR-0004](../../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md)).
  - Giao đề tài/ký hợp đồng đưa đề tài vào `DANG_THUC_HIEN` → thuộc **F04**.
  - Kết luận nghiệm thu `DAT`/`KHONG_DAT` → thuộc **F06**; F05 chỉ xử lý phần quyết toán trước khi đóng.
  - Cấu hình tham số (ngưỡng cảnh báo vượt dự toán, chế độ chặn/cảnh báo, lịch đối soát) → **B01**.
  - Định nghĩa danh mục khoản mục dùng chung (nếu chuẩn hóa) → **B01**.

## 3. Luồng nghiệp vụ chính

Phần này mô tả luồng độc lập giao diện. Chuyển trạng thái `DeTai` bám đúng máy trạng thái ở
[data-model §3](../../architecture/data-model.md#3-vòng-đời-đề-tài-state-machine).

### 3.1 Luồng tổng quát (sequence)

```mermaid
sequenceDiagram
    actor CN as Chủ nhiệm đề tài
    actor CV as Chuyên viên QL KHCN
    participant SYS as RMS (budget service)
    participant FIN as Hệ thống tài chính

    Note over CV,SYS: Đề tài đã DANG_THUC_HIEN (F04)
    CV->>SYS: Lập DuToanKinhPhi theo khoản mục
    CN->>SYS: Ghi nhận / xem GiaoDichKinhPhi (CAP/CHI), đính chứng từ, giải trình
    SYS->>SYS: Cảnh báo/chặn nếu tổng CHI vượt dự toán [BR-03]

    Note over CV,FIN: Đối soát định kỳ (job) hoặc thủ công
    CV->>SYS: Chạy đối soát
    alt Tài chính sẵn sàng (API)
        SYS->>FIN: Truy vấn giao dịch theo mã đề tài / maGiaoDichTaiChinh
        FIN-->>SYS: Danh sách giao dịch tài chính
    else Tài chính lỗi / chưa có API [BR-05]
        CV->>SYS: Nhập file CSV/Excel (degrade)
    end
    SYS->>SYS: So khớp theo maGiaoDichTaiChinh → KHOP / LECH / CHUA_DOI_SOAT
    SYS-->>CN: Thông báo nếu có chênh lệch (B04) [BR-06]
    CV->>SYS: Xử lý LECH (điều chỉnh/khớp lại / đánh dấu giải quyết + lyDo) [BR-04]

    Note over CV,SYS: Khi đề tài DAT (F06) → quyết toán
    CV->>SYS: Yêu cầu quyết toán & đóng đề tài
    SYS->>SYS: Kiểm tra: không còn giao dịch LECH tồn đọng [BR-07]
    SYS->>SYS: DeTai: DAT → HOAN_THANH (phối hợp F06)
    SYS-->>CN: Thông báo đề tài đã quyết toán & hoàn thành
```

### 3.2 Chuyển trạng thái đề tài trong phạm vi F05

```mermaid
stateDiagram-v2
    DANG_THUC_HIEN --> DANG_THUC_HIEN : Lập dự toán, ghi giao dịch, đối soát (không đổi trạng thái)
    DAT --> HOAN_THANH : Quyết toán xong, không còn LECH [BR-07]
    HOAN_THANH --> [*]
```

> F05 không tự chuyển đề tài vào `DANG_THUC_HIEN` (do F04) hay sang `DAT` (do F06). F05 chỉ kích hoạt
> chuyển `DAT → HOAN_THANH` khi quyết toán đạt điều kiện; chuyển trạng thái qua domain service dùng
> chung, không update enum trực tiếp ([data-model §5](../../architecture/data-model.md#5-ghi-chú-toàn-vẹn)).

### 3.3 Vòng đời trạng thái đối soát của một giao dịch

```mermaid
stateDiagram-v2
    [*] --> CHUA_DOI_SOAT : Ghi nhận GiaoDichKinhPhi
    CHUA_DOI_SOAT --> KHOP : Đối soát khớp maGiaoDichTaiChinh & số tiền [BR-04]
    CHUA_DOI_SOAT --> LECH : Đối soát phát hiện chênh lệch / không tìm thấy [BR-04]
    LECH --> KHOP : Chuyên viên điều chỉnh & khớp lại [BR-04]
    LECH --> KHOP : Đánh dấu đã giải quyết (kèm lyDo, ghi audit) [BR-04]
    KHOP --> CHUA_DOI_SOAT : Sửa số tiền/khoản mục giao dịch → cần đối soát lại
```

> Giao dịch chỉ chuyển trạng thái đối soát qua hành động đối soát/xử lý lệch của chuyên viên (hoặc job).
> Chủ nhiệm sửa giao dịch của mình ở mức cho phép sẽ đưa giao dịch về `CHUA_DOI_SOAT` (BR-08).

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Chỉ quản kinh phí khi đang thực hiện | Chỉ lập/sửa `DuToanKinhPhi` và ghi `GiaoDichKinhPhi` cho đề tài có `trangThai=DANG_THUC_HIEN` (hoặc `TAM_DUNG` — chỉ xem, không thêm chi). Đề tài chưa giao hoặc đã `HOAN_THANH` không nhận giao dịch mới. | Phụ thuộc F04 |
| BR-02 | Số tiền hợp lệ | `soTien` (giao dịch) và `soTienDuToan` (dự toán) là **số nguyên VND > 0** (`bigint`), không số thực, không âm/không 0. Đơn vị thống nhất VND. | Tiền tệ lưu `bigint` ([data-model §1](../../architecture/data-model.md#1-quy-ước-chung)) |
| BR-03 | Tổng chi vs dự toán | Tổng `GiaoDichKinhPhi` loai `CHI` của một khoản mục **không vượt** `DuToanKinhPhi` của khoản mục đó. Hành vi khi vượt theo cấu hình `KINH_PHI.CHE_DO_VUOT_DU_TOAN` (`CANH_BAO` = cho ghi kèm cảnh báo / `CHAN` = chặn). | Cấu hình B01; mặc định `CANH_BAO` |
| BR-04 | Chỉ chuyên viên đối soát & xử lý lệch | Chỉ **Chuyên viên QL KHCN** được chạy đối soát, nhập file đối soát và xử lý giao dịch `LECH` (điều chỉnh/khớp lại/đánh dấu giải quyết kèm `lyDo`). Đối soát so khớp theo `maGiaoDichTaiChinh` & `soTien` → gán `trangThaiDoiSoat`. | RBAC backend (overview §4.1) |
| BR-05 | Degrade đối soát thủ công | Khi API tài chính lỗi/chưa sẵn sàng, chuyên viên đối soát bằng cách **nhập file CSV/Excel** giao dịch tài chính; kết quả đối soát tương đương API. Hệ thống không được khóa nghiệp vụ kinh phí chỉ vì tài chính lỗi. | [ADR-0004](../../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md); [integrations §4](../../architecture/integrations.md#4-hệ-thống-tài-chính-đối-soát-kinh-phí--f05) |
| BR-06 | Thông báo chênh lệch | Sau mỗi lần đối soát phát sinh giao dịch `LECH`, hệ thống gửi thông báo cho chuyên viên phụ trách và chủ nhiệm đề tài liên quan (qua **B04**), kèm liên kết tới giao dịch lệch. | Kênh & mẫu ở B04 |
| BR-07 | Không HOAN_THANH khi còn LECH | Chỉ cho quyết toán & chuyển `DeTai: DAT → HOAN_THANH` khi **không còn** giao dịch `trangThaiDoiSoat=LECH` tồn đọng của đề tài. Còn `LECH` → chặn, liệt kê giao dịch cần xử lý. | [ADR-0004](../../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md); phối hợp F06 |
| BR-08 | Chủ nhiệm chỉ xem/giải trình | **Chủ nhiệm đề tài** chỉ **xem** dự toán vs thực chi của đề tài mình, **giải trình** khoản chi và **đính chứng từ**; **không** chạy đối soát, **không** đổi `trangThaiDoiSoat`, **không** sửa dự toán. Nếu chính sách cho chủ nhiệm nhập đề nghị chi, giao dịch tạo ở `CHUA_DOI_SOAT` và phải được chuyên viên đối soát. | Data scoping: chỉ đề tài của mình (overview §4.1) |
| BR-09 | Khóa đối chiếu duy nhất | `maGiaoDichTaiChinh` khi đã gán phải **duy nhất** trong phạm vi nguồn tài chính (không hai giao dịch RMS cùng map một mã chứng từ). Giao dịch chưa có mã giữ `CHUA_DOI_SOAT`. | Tránh khớp trùng khi đối soát |
| BR-10 | Sửa giao dịch → đối soát lại | Sửa `soTien`/`khoanMuc`/`loai` của giao dịch đã `KHOP` đưa giao dịch về `CHUA_DOI_SOAT` và yêu cầu đối soát lại. Giao dịch đã thuộc đề tài `HOAN_THANH` thì khóa, không sửa. | Giữ toàn vẹn quyết toán |
| BR-11 | Truy vết mọi thay đổi kinh phí | Lập/sửa dự toán, ghi/sửa giao dịch, chạy đối soát, xử lý lệch, quyết toán đều ghi `NhatKyHeThong` (append-only). | Audit (overview §4.2) |

## 5. Dữ liệu

Dùng chung mô hình ở [data-model §4.5](../../architecture/data-model.md#45-thực-hiện-đề-tài-f04-f05).
F05 thao tác trên `DuToanKinhPhi`, `GiaoDichKinhPhi` gắn với `DeTai`.

| Thực thể | Vai trò trong F05 | Trường trọng yếu |
|---|---|---|
| `DeTai` | Đối tượng có kinh phí | `trangThai` (`DANG_THUC_HIEN`/`DAT`/`HOAN_THANH`), `chuNhiemId`, `kinhPhiDeXuat` (tham chiếu) |
| `DuToanKinhPhi` | Dự toán theo khoản mục | `deTaiId`, `khoanMuc`, `soTienDuToan` (`bigint` VND, > 0), `ky` |
| `GiaoDichKinhPhi` | Giao dịch cấp/chi | `deTaiId`, `khoanMuc`, `soTien` (`bigint` VND, > 0), `loai` (`CAP`/`CHI`), `ngay`, `trangThaiDoiSoat` (`CHUA_DOI_SOAT`/`KHOP`/`LECH`), `maGiaoDichTaiChinh` |
| `TaiLieuDinhKem` | Chứng từ khoản chi | `loaiDoiTuong=GIAO_DICH_KINH_PHI`, `doiTuongId`, `duongDan` (object storage) |
| `CauHinhHeThong` | Tham số kinh phí | `KINH_PHI.CHE_DO_VUOT_DU_TOAN` (`CANH_BAO`/`CHAN`), `KINH_PHI.NGUONG_CANH_BAO_VUOT` (%), `KINH_PHI.LICH_DOI_SOAT` |
| `ThongBao` | Thông báo lệch & quyết toán | Sinh khi có `LECH` và khi quyết toán/`HOAN_THANH` (B04) |
| `NhatKyHeThong` | Audit | Lập/sửa dự toán, ghi/sửa giao dịch, đối soát, xử lý lệch, quyết toán |

> **Trường có thể cần bổ sung vào data-model (cùng PR khi chốt):** `GiaoDichKinhPhi.lyDoXuLyLech`
> (ghi lý do khi đánh dấu `LECH` đã giải quyết), `GiaoDichKinhPhi.dienGiai`/`noiDungGiaiTrinh` (giải
> trình của chủ nhiệm), `GiaoDichKinhPhi.nguonDoiSoat` (`API`/`FILE`). Ràng buộc: `soTien > 0`,
> `soTienDuToan > 0`; `maGiaoDichTaiChinh` unique khi không null trong phạm vi nguồn (BR-09).
> Nếu dùng các trường này, cập nhật [data-model §4.5](../../architecture/data-model.md#45-thực-hiện-đề-tài-f04-f05).

## 6. Acceptance criteria

- **AC-01 (Happy — lập dự toán)** — Given một đề tài `DANG_THUC_HIEN`; When chuyên viên lập
  `DuToanKinhPhi` cho các khoản mục với `soTienDuToan` là số nguyên VND > 0; Then hệ thống lưu dự toán
  theo khoản mục, hiển thị tổng dự toán và ghi audit.
- **AC-02 (Happy — ghi giao dịch chi trong dự toán)** — Given đề tài `DANG_THUC_HIEN` đã có dự toán
  khoản mục X; When ghi một `GiaoDichKinhPhi` loai `CHI` cho khoản mục X với `soTien` > 0 mà tổng chi
  khoản mục **không vượt** dự toán; Then giao dịch được lưu ở `trangThaiDoiSoat=CHUA_DOI_SOAT`, cập
  nhật thực chi của khoản mục, ghi audit.
- **AC-03 (Happy — đối soát khớp qua API)** — Given có các giao dịch `CHUA_DOI_SOAT` với
  `maGiaoDichTaiChinh` khớp số tiền bên tài chính; When chuyên viên chạy đối soát qua API; Then các
  giao dịch khớp chuyển `KHOP`, các giao dịch lệch/không tìm thấy chuyển `LECH`, hệ thống thông báo
  chênh lệch (B04) và ghi audit.
- **AC-04 (Happy — degrade nhập file)** — Given API tài chính không sẵn sàng; When chuyên viên nhập
  file CSV/Excel giao dịch tài chính để đối soát; Then hệ thống so khớp theo `maGiaoDichTaiChinh` và
  gán `trangThaiDoiSoat` y như đối soát API; nghiệp vụ kinh phí không bị khóa (BR-05).
- **AC-05 (Happy — xử lý lệch)** — Given một giao dịch `LECH`; When chuyên viên điều chỉnh để khớp lại
  hoặc đánh dấu đã giải quyết kèm `lyDo`; Then giao dịch chuyển `KHOP`, lưu `lyDo` và ghi audit.
- **AC-06 (Happy — quyết toán & đóng đề tài)** — Given đề tài `DAT` và **không còn** giao dịch `LECH`
  tồn đọng; When chuyên viên thực hiện quyết toán & đóng đề tài; Then `DeTai` chuyển `DAT → HOAN_THANH`
  (qua domain service, phối hợp F06), chủ nhiệm nhận thông báo, ghi audit.
- **AC-07 (Negative — chặn quyết toán khi còn LECH)** — Given đề tài `DAT` còn ≥ 1 giao dịch `LECH`;
  When chuyên viên cố quyết toán/đóng đề tài; Then hệ thống chặn, liệt kê giao dịch `LECH` cần xử lý,
  đề tài giữ `DAT` (BR-07).
- **AC-08 (Negative — số tiền không hợp lệ)** — Given chuyên viên/chủ nhiệm nhập `soTien` ≤ 0 hoặc
  không phải số nguyên; When lưu giao dịch/dự toán; Then hệ thống báo lỗi validate, không lưu (BR-02).
- **AC-09 (Biên — vượt dự toán theo cấu hình)** — Given `KINH_PHI.CHE_DO_VUOT_DU_TOAN=CHAN` và một
  giao dịch `CHI` làm tổng chi khoản mục vượt dự toán; When ghi giao dịch; Then hệ thống chặn. Với
  `CHE_DO_VUOT_DU_TOAN=CANH_BAO`, giao dịch được ghi kèm cảnh báo vượt dự toán (BR-03).
- **AC-10 (Negative — chủ nhiệm không được đối soát)** — Given người dùng là **Chủ nhiệm đề tài**;
  When gọi hành động chạy đối soát / đổi `trangThaiDoiSoat` / sửa dự toán; Then hệ thống trả 403,
  không thực hiện (BR-04, BR-08).
- **AC-11 (Negative — sai phạm vi dữ liệu)** — Given chủ nhiệm A; When truy cập kinh phí của đề tài
  không thuộc A; Then hệ thống từ chối (403/ẩn), chỉ thấy đề tài của mình (BR-08).
- **AC-12 (Negative — kinh phí khi chưa thực hiện)** — Given đề tài chưa `DANG_THUC_HIEN` (vd `DUYET`)
  hoặc đã `HOAN_THANH`; When ghi giao dịch chi mới; Then hệ thống chặn (BR-01).
- **AC-13 (Biên — mã đối chiếu trùng)** — Given một `maGiaoDichTaiChinh` đã gán cho giao dịch khác;
  When đối soát/gán mã đó cho giao dịch thứ hai; Then hệ thống từ chối khớp trùng (BR-09).

## 7. Phụ thuộc & rủi ro

**Phụ thuộc:**
- **F04** — đề tài phải ở `DANG_THUC_HIEN` mới quản kinh phí; F04 đưa đề tài vào trạng thái này.
- **F06** — kết luận nghiệm thu `DAT` là tiền đề quyết toán; chuyển `DAT → HOAN_THANH` là điểm phối
  hợp chung giữa F05 (quyết toán kinh phí) và F06 (đóng đề tài) — xem
  [data-model §3](../../architecture/data-model.md#3-vòng-đời-đề-tài-state-machine).
- **Hệ thống tài chính** — nguồn đối soát qua API/file; có chế độ degrade thủ công
  ([integrations §4](../../architecture/integrations.md#4-hệ-thống-tài-chính-đối-soát-kinh-phí--f05),
  [ADR-0004](../../architecture/decisions/0004-doi-soat-kinh-phi-qua-api.md)).
- **B01** — tham số `CauHinhHeThong` (`CHE_DO_VUOT_DU_TOAN`, `NGUONG_CANH_BAO_VUOT`, `LICH_DOI_SOAT`)
  và danh mục khoản mục (nếu chuẩn hóa).
- **B03** — vai trò & quyền (Chuyên viên QL KHCN; Chủ nhiệm đề tài) và data scoping.
- **B04** — kênh thông báo chênh lệch đối soát và kết quả quyết toán.

**Rủi ro & điểm cần làm rõ:**
- **Định nghĩa "khớp" khi đối soát:** khớp theo `maGiaoDichTaiChinh` + đúng `soTien`, hay cho phép sai
  số/tỷ giá? Hiện giả định khớp tuyệt đối số nguyên VND; cần PO/Tài chính xác nhận.
- **Chế độ vượt dự toán:** `CANH_BAO` vs `CHAN` ở mức khoản mục hay tổng đề tài; ngưỡng cảnh báo (%) —
  cần PO chốt và phản ánh ở B01.
- **Quyền nhập giao dịch của chủ nhiệm:** chủ nhiệm chỉ giải trình/đính chứng từ, hay được nhập đề nghị
  chi (tạo giao dịch `CHUA_DOI_SOAT` chờ chuyên viên)? Mặc định hiện tại: chỉ xem/giải trình (BR-08).
- **Ai sở hữu chuyển `DAT → HOAN_THANH`:** F05 hay F06 kích hoạt; thống nhất domain service dùng chung,
  F05 cung cấp điều kiện "không còn LECH". Cần chốt với F06 để tránh hai feature cùng đổi trạng thái.
- **Định dạng file đối soát:** schema cột CSV/Excel (mã chứng từ, số tiền, ngày, mã đề tài) cần thống
  nhất với Tài chính; xử lý dòng lỗi/định dạng sai khi nhập.
- **Đối soát đồng thời với sửa giao dịch:** tránh race khi job đối soát chạy lúc chủ nhiệm sửa giao
  dịch (BR-10) — cần khóa lạc quan/đánh dấu phiên đối soát.
