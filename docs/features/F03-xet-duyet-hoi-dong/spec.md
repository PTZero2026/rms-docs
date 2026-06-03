---
title: "Xét duyệt hội đồng"
id: "F03"
owner: "PO/BA"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-01
---

# Xét duyệt hội đồng

> Nguồn sự thật về **nghiệp vụ** của feature. Mọi luật, dữ liệu, tiêu chí nghiệm thu
> nằm ở đây. `frontend.md` và `backoffice.md` chỉ mô tả giao diện và trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

Sau khi đợt kêu gọi đóng và chuyên viên chốt danh sách đề xuất hợp lệ (F01/F02), các đề tài cần được
một **hội đồng chuyên môn** đánh giá để chấp nhận hoặc từ chối đưa vào thực hiện. Hiện quy trình này
chạy thủ công (gửi hồ sơ giấy/email, tổng hợp điểm bằng bảng tính), khó truy vết, dễ sai sót khi cộng
điểm theo trọng số và dễ xung đột lợi ích.

F03 số hóa toàn bộ vòng xét duyệt: lập hội đồng `loai=XET_DUYET`, phân công thành viên, mở đợt đánh giá
cho từng đề tài, để thành viên chấm điểm theo bộ tiêu chí, hệ thống tự tổng hợp điểm và hỗ trợ chuyên
viên ra kết luận theo ngưỡng cấu hình.

**Kết quả mong đợi:**
- Đề tài chuyển trạng thái `DA_NOP → DANG_XET_DUYET → DUYET | TU_CHOI` có truy vết đầy đủ.
- Điểm tổng hợp tính tự động theo trọng số, không cộng tay; kết luận minh bạch theo ngưỡng.
- Chủ nhiệm được thông báo kết quả và (nếu công khai) nhận xét của hội đồng.

## 2. Phạm vi

- **Trong phạm vi:**
  - Lập `HoiDong` loai `XET_DUYET`, phân công `ThanhVienHoiDong` (chủ tịch/phản biện/ủy viên/thư ký).
  - Tạo `DotDanhGia` cho từng đề tài → chuyển `DeTai` sang `DANG_XET_DUYET`.
  - Thành viên hội đồng điền `PhieuCham` (điểm từng `TieuChiDanhGia` + nhận xét), gửi phiếu `NHAP → DA_GUI`.
  - Tính `diemTongHop` theo trọng số; chuyên viên ra kết luận `DUYET | TU_CHOI` theo ngưỡng `CauHinhHeThong`.
  - Thông báo kết quả cho chủ nhiệm (qua B04); chủ nhiệm xem tiến trình & kết quả ở FE.
- **Ngoài phạm vi:**
  - Tạo/sửa `BoTieuChi`, `TieuChiDanhGia` và ngưỡng điểm → thuộc **B01** (danh mục & cấu hình).
  - Gán bộ tiêu chí cho đợt kêu gọi (`DotKeuGoi.tieuChiXetDuyetId`) → thuộc **F02**.
  - Tiếp nhận/chốt danh sách đề xuất → thuộc **F01**.
  - Nghiệm thu kết quả (`loai=NGHIEM_THU`) → thuộc **F06** (dùng chung mô hình, xem [ADR-0003](../../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md)).
  - Giao đề tài/ký hợp đồng sau khi `DUYET` → thuộc **F04**.

## 3. Luồng nghiệp vụ chính

Phần này mô tả luồng độc lập giao diện. Chuyển trạng thái `DeTai` bám đúng máy trạng thái ở
[data-model §3](../../architecture/data-model.md#3-vòng-đời-đề-tài-state-machine).

### 3.1 Luồng tổng quát (sequence)

```mermaid
sequenceDiagram
    actor CV as Chuyên viên QL KHCN
    actor TV as Thành viên hội đồng
    participant SYS as RMS (review service)
    actor CN as Chủ nhiệm đề tài

    CV->>SYS: Lập HoiDong (loai=XET_DUYET), phân công ThanhVienHoiDong
    CV->>SYS: Tạo DotDanhGia cho từng đề tài (lấy BoTieuChi từ đợt kêu gọi)
    SYS->>SYS: DeTai: DA_NOP → DANG_XET_DUYET
    SYS-->>CN: Thông báo "đề tài đang xét duyệt"
    loop Mỗi thành viên (trừ người xung đột lợi ích)
        TV->>SYS: Mở hồ sơ, điền DiemTieuChi + nhận xét (PhieuCham NHAP)
        TV->>SYS: Gửi phiếu (NHAP → DA_GUI)
        SYS->>SYS: Tính tongDiem của phiếu theo trọng số
    end
    CV->>SYS: Xem bảng tổng hợp; yêu cầu ra kết luận
    SYS->>SYS: Kiểm tra đủ số phiếu DA_GUI tối thiểu; tính diemTongHop
    SYS->>SYS: So ngưỡng (CauHinhHeThong) → ketLuan DAT/KHONG_DAT
    SYS->>SYS: DeTai: DANG_XET_DUYET → DUYET | TU_CHOI
    SYS-->>CN: Thông báo kết quả DUYET/TU_CHOI (+ nhận xét nếu công khai)
```

### 3.2 Chuyển trạng thái đề tài trong phạm vi F03

```mermaid
stateDiagram-v2
    DA_NOP --> DANG_XET_DUYET : Chuyên viên tạo DotDanhGia (đã gán hội đồng) [BR-01]
    DANG_XET_DUYET --> DUYET : Đủ phiếu + diemTongHop ≥ ngưỡng [BR-05, BR-06]
    DANG_XET_DUYET --> TU_CHOI : Đủ phiếu + diemTongHop < ngưỡng [BR-05, BR-06]
    DUYET --> [*] : Bàn giao sang F04
    TU_CHOI --> [*]
```

### 3.3 Vòng đời phiếu chấm & đợt đánh giá

- `PhieuCham.trangThai`: `NHAP` (đang soạn, sửa được) → `DA_GUI` (đã gửi, khóa, không sửa).
- `DotDanhGia.trangThai`: `DANG_CHAM` (đang thu phiếu) → `DA_KET_LUAN` (đã có `ketLuan`). Sau khi
  kết luận, không nhận thêm/sửa phiếu.

## 4. Business rules

| ID    | Quy tắc | Mô tả | Ghi chú |
|-------|---------|-------|---------|
| BR-01 | Mở xét duyệt cần hội đồng | Chỉ tạo `DotDanhGia` (đưa đề tài vào xét) khi đề tài đang `DA_NOP` và đã có `HoiDong` loai `XET_DUYET` với ≥ 1 `ThanhVienHoiDong`. Tạo thành công → `DeTai` chuyển `DANG_XET_DUYET`. | Chuyển trạng thái qua domain service, không update enum trực tiếp |
| BR-02 | Bộ tiêu chí từ đợt kêu gọi | `DotDanhGia` dùng `BoTieuChi` lấy theo `DotKeuGoi.tieuChiXetDuyetId` của đề tài; bộ tiêu chí phải có `loai=XET_DUYET`. Không cho chấm nếu đợt kêu gọi chưa gán bộ tiêu chí. | Phụ thuộc F02/B01 |
| BR-03 | Xung đột lợi ích | Một thành viên hội đồng **không** được chấm đề tài mà mình là `chuNhiemId` hoặc có trong `ThanhVienDeTai`. Hệ thống ẩn đề tài đó khỏi hàng chờ chấm của thành viên và chặn tạo `PhieuCham`. | Loại trừ khi tính số phiếu tối thiểu |
| BR-04 | Một thành viên một phiếu / đợt | Mỗi cặp (`thanhVienHoiDongId`, `dotDanhGiaId`) chỉ có tối đa **một** `PhieuCham`. Không tạo phiếu thứ hai. | Unique trên cặp khóa (data-model §5) |
| BR-05 | Điểm hợp lệ theo tiêu chí | Mỗi `DiemTieuChi.diem` phải `0 ≤ diem ≤ TieuChiDanhGia.diemToiDa`. Phiếu phải có đủ điểm cho **tất cả** tiêu chí của bộ trước khi gửi. | Validate khi gửi phiếu (`NHAP → DA_GUI`) |
| BR-06 | Tính điểm theo trọng số | `PhieuCham.tongDiem = Σ(DiemTieuChi.diem × TieuChiDanhGia.trongSo)`. `DotDanhGia.diemTongHop = trung bình tongDiem các PhieuCham trạng thái DA_GUI`. Làm tròn 2 chữ số thập phân. | Hệ thống tính, không nhập tay |
| BR-07 | Đủ phiếu mới kết luận | Chỉ ra kết luận khi số `PhieuCham` `DA_GUI` ≥ `XET_DUYET.SO_PHIEU_TOI_THIEU` (`CauHinhHeThong`). Thiếu phiếu → chặn kết luận, báo còn thiếu. | Mặc định cấu hình; điều chỉnh ở B01 |
| BR-08 | Kết luận theo ngưỡng | `diemTongHop ≥ XET_DUYET.NGUONG_DAT` → `ketLuan=DAT` → `DeTai=DUYET`; ngược lại `ketLuan=KHONG_DAT` → `DeTai=TU_CHOI`. Đặt `DotDanhGia.trangThai=DA_KET_LUAN`. | Ngưỡng từ `CauHinhHeThong` |
| BR-09 | Tách bạch quyền | Chỉ **Chuyên viên QL KHCN** được lập hội đồng, mở đợt, ra kết luận. **Thành viên hội đồng** chỉ xem hồ sơ được phân công và chấm phiếu của mình. | RBAC backend (overview §4.1) |
| BR-10 | Khóa sau kết luận | Khi `DotDanhGia=DA_KET_LUAN`, không nhận/sửa/rút `PhieuCham`; không đổi kết luận trừ khi chuyên viên mở lại đợt có `lyDo` (ghi audit). | Mở lại là ngoại lệ, ghi `NhatKyHeThong` |
| BR-11 | Công khai nhận xét | Nhận xét hội đồng chỉ hiển thị cho chủ nhiệm khi `XET_DUYET.CONG_KHAI_NHAN_XET=true`; mặc định ẩn danh tính người chấm. | Cấu hình B01 |

## 5. Dữ liệu

Dùng chung mô hình hội đồng/đánh giá — xem [data-model §4.4](../../architecture/data-model.md#44-hội-đồng--đánh-giá-f03-f06).
F03 thao tác trên các thực thể với `loai=XET_DUYET`.

| Thực thể | Vai trò trong F03 | Trường trọng yếu |
|---|---|---|
| `HoiDong` | Hội đồng xét duyệt | `loai=XET_DUYET`, `trangThai` |
| `ThanhVienHoiDong` | Thành viên & chức danh | `hoiDongId`, `nguoiDungId`, `chucDanh` (`CHU_TICH`/`PHAN_BIEN`/`UY_VIEN`/`THU_KY`) |
| `BoTieuChi` / `TieuChiDanhGia` | Bộ tiêu chí chấm | `loai=XET_DUYET`; tiêu chí có `diemToiDa`, `trongSo` |
| `DotDanhGia` | Lượt đánh giá 1 đề tài | `deTaiId`, `hoiDongId`, `loai=XET_DUYET`, `trangThai`, `ketLuan`, `diemTongHop` |
| `PhieuCham` | Phiếu của 1 thành viên | `dotDanhGiaId`, `thanhVienHoiDongId`, `trangThai` (`NHAP`/`DA_GUI`), `nhanXet`, `tongDiem` |
| `DiemTieuChi` | Điểm từng tiêu chí | `phieuChamId`, `tieuChiDanhGiaId`, `diem` |
| `DeTai` | Đối tượng được xét | `trangThai` (đổi qua domain service) |
| `CauHinhHeThong` | Tham số ngưỡng | `XET_DUYET.SO_PHIEU_TOI_THIEU`, `XET_DUYET.NGUONG_DAT`, `XET_DUYET.CONG_KHAI_NHAN_XET` |
| `ThongBao` | Thông báo kết quả | Sinh khi vào xét duyệt & khi có kết luận (B04) |
| `NhatKyHeThong` | Audit | Lập HĐ, gửi phiếu, ra kết luận, mở lại đợt |

> Ràng buộc bổ sung F03 cần (đã có trong data-model): unique (`thanhVienHoiDongId`,`dotDanhGiaId`) cho
> `PhieuCham` (BR-04); `DotDanhGia.ketLuan` ∈ {`DAT`,`KHONG_DAT`,null}. Nếu cần thêm trường mới
> (vd `DotDanhGia.lyDoMoLai`), bổ sung vào data-model trong cùng PR.

## 6. Acceptance criteria

- **AC-01 (Happy — mở xét duyệt)** — Given một đề tài `DA_NOP` thuộc đợt kêu gọi đã đóng và đã gán
  bộ tiêu chí `XET_DUYET`, và đã có hội đồng `XET_DUYET` với ≥ 1 thành viên; When chuyên viên tạo
  `DotDanhGia` cho đề tài; Then hệ thống tạo đợt đánh giá `DANG_CHAM`, chuyển `DeTai` sang
  `DANG_XET_DUYET`, gửi thông báo cho chủ nhiệm và ghi audit.
- **AC-02 (Happy — chấm & gửi phiếu)** — Given thành viên hội đồng được phân công, không xung đột lợi
  ích, đợt đang `DANG_CHAM`; When thành viên nhập đủ điểm cho mọi tiêu chí (mỗi điểm trong `[0, diemToiDa]`)
  kèm nhận xét rồi gửi phiếu; Then `PhieuCham` chuyển `NHAP → DA_GUI`, hệ thống tính `tongDiem` theo
  trọng số và khóa phiếu không cho sửa.
- **AC-03 (Happy — kết luận DUYET)** — Given số phiếu `DA_GUI` ≥ ngưỡng tối thiểu và `diemTongHop` ≥
  `NGUONG_DAT`; When chuyên viên ra kết luận; Then `DotDanhGia.ketLuan=DAT`, đợt chuyển `DA_KET_LUAN`,
  `DeTai` chuyển `DUYET`, chủ nhiệm nhận thông báo kết quả.
- **AC-04 (Biên — điểm ngưỡng TU_CHOI)** — Given đủ phiếu nhưng `diemTongHop < NGUONG_DAT`; When chuyên
  viên ra kết luận; Then `ketLuan=KHONG_DAT`, `DeTai` chuyển `TU_CHOI`, chủ nhiệm nhận thông báo từ chối.
- **AC-05 (Biên — thiếu phiếu)** — Given số phiếu `DA_GUI` < `SO_PHIEU_TOI_THIEU`; When chuyên viên cố
  ra kết luận; Then hệ thống chặn, hiển thị số phiếu còn thiếu, không đổi trạng thái đề tài (BR-07).
- **AC-06 (Negative — xung đột lợi ích)** — Given thành viên hội đồng đồng thời là chủ nhiệm/thành viên
  của đề tài; When thành viên mở hàng chờ chấm; Then đề tài đó không xuất hiện và mọi cố gắng tạo
  `PhieuCham` cho đề tài đó bị từ chối (BR-03).
- **AC-07 (Negative — điểm vượt diemToiDa)** — Given thành viên nhập một `diem > diemToiDa` của tiêu chí;
  When gửi phiếu; Then hệ thống báo lỗi validate, không cho gửi, phiếu giữ `NHAP` (BR-05).
- **AC-08 (Negative — một thành viên một phiếu)** — Given thành viên đã có một `PhieuCham` trong đợt;
  When tạo phiếu thứ hai cho cùng đợt; Then hệ thống từ chối do trùng (BR-04).
- **AC-09 (Negative — sai quyền)** — Given người dùng là **Thành viên hội đồng** (không phải chuyên viên);
  When gọi hành động ra kết luận / lập hội đồng; Then hệ thống trả 403, không thực hiện (BR-09).
- **AC-10 (Negative — khóa sau kết luận)** — Given `DotDanhGia=DA_KET_LUAN`; When thành viên cố gửi/sửa
  phiếu; Then bị từ chối (BR-10).

## 7. Phụ thuộc & rủi ro

**Phụ thuộc:**
- **F01 / F02** — danh sách đề tài hợp lệ đã chốt; đợt kêu gọi đã đóng và đã gán `tieuChiXetDuyetId`.
- **B01** — `BoTieuChi`/`TieuChiDanhGia` loai `XET_DUYET` và các tham số `CauHinhHeThong`
  (`SO_PHIEU_TOI_THIEU`, `NGUONG_DAT`, `CONG_KHAI_NHAN_XET`).
- **B03** — vai trò & quyền (Chuyên viên QL KHCN, Thành viên hội đồng); tài khoản thành viên hội đồng.
- **B04** — kênh thông báo kết quả `DUYET`/`TU_CHOI` cho chủ nhiệm.
- **F04** — tiếp nhận đề tài sau khi `DUYET`.
- **F06** — chia sẻ mô hình hội đồng/phiếu chấm ([ADR-0003](../../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md));
  thay đổi model phải cân nhắc cả hai feature.

**Rủi ro & điểm cần làm rõ:**
- **Số phiếu hợp lệ khi có xung đột lợi ích:** nếu nhiều thành viên bị loại do BR-03, mẫu số tính
  `diemTongHop` và `SO_PHIEU_TOI_THIEU` cần loại trừ họ — cần PO xác nhận công thức.
- **Mở lại đợt sau kết luận (BR-10):** quy trình và quyền mở lại cần làm rõ (có cần phê duyệt cấp trên?).
- **Đồng nhất với F06:** tránh nhồi luật riêng của xét duyệt vào model dùng chung.
- **Thay đổi ngưỡng giữa chừng:** nếu B01 đổi `NGUONG_DAT` khi đợt đang chấm — chốt là kết luận dùng
  ngưỡng tại thời điểm ra kết luận (giả định hiện tại), cần PO duyệt.
