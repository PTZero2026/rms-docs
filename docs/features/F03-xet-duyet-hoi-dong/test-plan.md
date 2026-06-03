---
title: "Xét duyệt hội đồng — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.1
updated: 2026-06-01
---

# Xét duyệt hội đồng — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [`spec.md`](./spec.md). Không có AC tương ứng = thiếu yêu cầu,
> báo lại BA/PO.

## 1. Phạm vi kiểm thử

- **Mặt test:** BO (chuyên viên & thành viên hội đồng), API domain (chuyển trạng thái, tính điểm),
  FE (chủ nhiệm xem kết quả/thông báo).
- **Môi trường:** STAGING, SSO test, B04 thông báo bật.
- **Dữ liệu mẫu:**
  - Đợt kêu gọi `KG-2026-01` đã `DONG`, gán bộ tiêu chí `XET_DUYET` gồm 3 tiêu chí
    (`diemToiDa=10`, `trongSo` lần lượt 0.5/0.3/0.2).
  - `CauHinhHeThong`: `XET_DUYET.SO_PHIEU_TOI_THIEU=3`, `XET_DUYET.NGUONG_DAT=7.0`, `CONG_KHAI_NHAN_XET=false`.
  - Hội đồng `HD-XD-01` với 4 thành viên (chủ tịch, 2 phản biện, thư ký).
  - Đề tài DT-A (`DA_NOP`, chủ nhiệm U1); DT-B (`DA_NOP`, chủ nhiệm là thành viên hội đồng U-CT để test xung đột lợi ích).

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | DT-A `DA_NOP`, HĐ HD-XD-01 đã có thành viên, đợt đã gán bộ tiêu chí | Chuyên viên tạo `DotDanhGia` cho DT-A | Đợt tạo `DANG_CHAM`; DT-A → `DANG_XET_DUYET`; chủ nhiệm nhận thông báo; có audit | Happy |
| TC-02 | AC-02 | Thành viên U2 (không xung đột), đợt DT-A `DANG_CHAM` | Nhập đủ điểm 3 tiêu chí trong `[0,10]` + nhận xét, gửi phiếu | `PhieuCham` `NHAP → DA_GUI`; `tongDiem` = Σ(diem×trongSo); phiếu bị khóa | Happy |
| TC-03 | AC-03 | DT-A có ≥3 phiếu `DA_GUI`, `diemTongHop=8.0` (≥7.0) | Chuyên viên ra kết luận | `ketLuan=DAT`; đợt `DA_KET_LUAN`; DT-A → `DUYET`; chủ nhiệm nhận thông báo duyệt; audit | Happy |
| TC-04 | AC-04 | DT-A có ≥3 phiếu `DA_GUI`, `diemTongHop=6.0` (<7.0) | Chuyên viên ra kết luận | `ketLuan=KHONG_DAT`; DT-A → `TU_CHOI`; chủ nhiệm nhận thông báo từ chối | Biên/Lỗi |
| TC-05 | AC-04 (BR-08) | DT-A có đủ phiếu, `diemTongHop=7.0` đúng bằng ngưỡng | Chuyên viên ra kết luận | `≥ NGUONG_DAT` → `DAT` → DT-A `DUYET` (kiểm tra biên đúng bằng ngưỡng) | Biên/Lỗi |
| TC-06 | AC-05 | DT-A chỉ có 2 phiếu `DA_GUI` (< 3) | Chuyên viên cố ra kết luận | Bị chặn; hiển thị "còn thiếu 1 phiếu"; DT-A vẫn `DANG_XET_DUYET` | Biên/Lỗi |
| TC-07 | AC-06 | DT-B do thành viên U-CT làm chủ nhiệm | U-CT mở hàng chờ chấm (BO-04) | DT-B không xuất hiện; gọi API tạo `PhieuCham` cho DT-B → bị từ chối | Negative |
| TC-08 | AC-07 | Thành viên U2, tiêu chí `diemToiDa=10` | Nhập `diem=11` rồi gửi phiếu | Lỗi validate; không gửi được; phiếu giữ `NHAP` | Negative |
| TC-09 | AC-08 | U2 đã có 1 `PhieuCham` trong đợt DT-A | Tạo phiếu thứ hai cho cùng đợt | Bị từ chối do trùng (unique cặp khóa) | Negative |
| TC-10 | AC-09 | Đăng nhập bằng tài khoản Thành viên hội đồng | Gọi API ra kết luận / lập hội đồng | Trả 403; không thực hiện; không đổi trạng thái | Negative |
| TC-11 | AC-10 | Đợt DT-A `DA_KET_LUAN` | Thành viên cố gửi/sửa phiếu | Bị từ chối (đợt đã khóa) | Negative |
| TC-12 | AC-01 (BR-02) | DT thuộc đợt kêu gọi **chưa** gán `tieuChiXetDuyetId` | Chuyên viên tạo `DotDanhGia` | Bị chặn; thông báo "đợt chưa gán bộ tiêu chí xét duyệt" | Biên/Lỗi |
| TC-13 | AC-01 (BR-01) | DT-A `DA_NOP` nhưng hội đồng **chưa** có thành viên | Chuyên viên tạo `DotDanhGia` | Bị chặn; DT-A không đổi trạng thái | Biên/Lỗi |
| TC-14 | AC-02 (BR-05) | Thành viên bỏ trống điểm 1 tiêu chí | Gửi phiếu | Bị chặn; báo "phải chấm đủ tất cả tiêu chí" | Biên/Lỗi |
| TC-15 | AC-03 / FE-02 (BR-11) | DT-A `DUYET`, `CONG_KHAI_NHAN_XET=false` | Chủ nhiệm mở màn Kết quả (FE-02) | Thấy kết luận DUYET; **không** thấy nhận xét hội đồng | Happy |
| TC-16 | BR-11 | Đặt `CONG_KHAI_NHAN_XET=true`, DT-A `DUYET` | Chủ nhiệm mở FE-02 | Thấy nhận xét hội đồng, danh tính người chấm ẩn | Happy |
| TC-17 | AC-03 (BR-06) | 3 phiếu `tongDiem` = 8.0 / 7.0 / 9.0 | Hệ thống tính `diemTongHop` | `diemTongHop = 8.0` (trung bình), làm tròn 2 chữ số | Happy |

## 3. Trường hợp biên & negative

- **Thiếu phiếu / không phiếu:** ra kết luận khi 0 phiếu hoặc < ngưỡng → chặn (TC-06).
- **Điểm biên:** `diem=0`, `diem=diemToiDa`, `diem>diemToiDa` (TC-08); `diemTongHop` đúng bằng `NGUONG_DAT` (TC-05).
- **Xung đột lợi ích:** thành viên là chủ nhiệm hoặc `ThanhVienDeTai` của đề tài (TC-07); kiểm tra
  mẫu số `SO_PHIEU_TOI_THIEU` đã loại trừ thành viên bị loại.
- **Trùng phiếu:** một thành viên hai phiếu/đợt (TC-09).
- **Sai quyền:** thành viên ra kết luận/lập hội đồng (TC-10); chủ nhiệm truy cập màn BO (403).
- **Khóa sau kết luận:** sửa/gửi phiếu khi `DA_KET_LUAN` (TC-11); đổi kết luận không qua "mở lại đợt".
- **Thiếu cấu hình:** đợt chưa gán bộ tiêu chí (TC-12); hội đồng chưa có thành viên (TC-13).
- **Bộ tiêu chí sai loai:** gắn `BoTieuChi` loai `NGHIEM_THU` vào đợt xét duyệt → bị chặn.
- **Mở lại đợt:** mở lại không nhập `lyDo` → bị chặn; mở lại có `lyDo` → ghi audit, đợt về `DANG_CHAM`.

## 4. Checklist hồi quy

- [ ] Vòng đời `DeTai` (data-model §3): `DA_NOP → DANG_XET_DUYET → DUYET/TU_CHOI` không cho nhảy ngoài sơ đồ.
- [ ] F01: chốt danh sách đề tài `DA_NOP` vẫn hoạt động; đề tài đã vào xét duyệt không bị trả lại bổ sung.
- [ ] F02: bộ tiêu chí `tieuChiXetDuyetId` của đợt vẫn áp dụng đúng khi tạo `DotDanhGia`.
- [ ] F04: đề tài `DUYET` chuyển tiếp sang giao đề tài/ký hợp đồng đúng.
- [ ] F06: mô hình dùng chung — tạo đợt `NGHIEM_THU` không bị ảnh hưởng bởi logic F03 (lọc theo `loai`).
- [ ] B01: đổi ngưỡng/`SO_PHIEU_TOI_THIEU` phản ánh đúng ở màn kết luận.
- [ ] B04: thông báo vào xét duyệt và kết quả gửi đúng người nhận (chủ nhiệm).
- [ ] Audit: lập HĐ / gửi phiếu / ra kết luận đều ghi `NhatKyHeThong`.
