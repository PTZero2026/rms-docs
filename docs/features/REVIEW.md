---
title: "Rà soát hiện trạng tài liệu theo chuẩn SDD"
status: Draft
updated: 2026-06-12
---

# Rà soát hiện trạng SDD — RMS

> Bản **chụp mốc** (2026-06-12) đánh giá độ chín tài liệu 12 feature trước khi chuẩn hóa lớp
> Epic → Feature. Nguồn sự thật chi tiết vẫn là `spec.md` từng feature; **tracker sống** (checklist
> cập nhật theo thời gian) ở [README.md](README.md). File này không lặp lại nội dung spec — chỉ đánh giá.

## 1. Ma trận độ chín

Trạng thái: ✅ Đầy đủ · 🟡 Một phần · 🔴 Khung mẫu · `–` chưa tách/chưa có.
Số trong ngoặc là số dòng file (tham chiếu độ dày nội dung).

| Mã | Feature | spec.md | design.md | ui.md | test-plan.md |
|---|---|:---:|:---:|:---:|:---:|
| F01 | Đề xuất đề tài | ✅ (183) | ✅ | ✅ (201) | ✅ (70) |
| F02 | Kỳ nhận đề xuất | ✅ (160) | – | ✅ (164) | ✅ (65) |
| F03 | Xét duyệt hội đồng | ✅ (178) | – | ✅ (185) | ✅ (71) |
| F04 | Quản lý tiến độ | ✅ (249) | – | ✅ (149) | ✅ (58) |
| F05 | Quản lý kinh phí | ✅ (256) | – | ✅ (147) | ✅ (59) |
| F06 | Nghiệm thu | ✅ (194) | – | ✅ (173) | 🔴 (30) |
| F07 | Sản phẩm khoa học | 🔴 (47) | – | 🟡 (70) | 🔴 (30) |
| F08 | Lý lịch khoa học | 🔴 (47) | – | 🟡 (65) | 🔴 (30) |
| B01 | Danh mục & cấu hình | ✅ (221) | – | ✅ (147) | ✅ (72) |
| B02 | Báo cáo & thống kê | 🔴 (47) | – | 🔴 (44) | 🔴 (30) |
| B03 | Quản lý người dùng | ✅ (250) | ✅ | ✅ (123) | ✅ (68) |
| B04 | Thông báo | ✅ (194) | – | ✅ (202) | ✅ (73) |

> F05 còn có `prototype.md`. design.md mới tách ở **F01** và **B03** (làm mẫu quy ước spec↔design).

## 2. Truy vết Business Rule ↔ Acceptance Criteria

Số mã `BR-xx`/`AC-xx` **duy nhất** trong mỗi spec:

| Mã | BR | AC | Nhận xét |
|---|:--:|:--:|---|
| F01 | 11 | 11 | Cân đối, có Given/When/Then. |
| F02 | 8 | 8 | Cân đối. |
| F03 | 11 | 10 | **AC < BR** → kiểm tra BR nào chưa có AC phủ. |
| F04 | 15 | 15 | Cân đối; spec phức tạp nhất (3 state machine). |
| F05 | 14 | 16 | AC > BR (bình thường — 1 BR nhiều AC). |
| F06 | 12 | 12 | Cân đối ở spec; **test-plan chưa phủ** (còn khung). |
| F07 | 1 | 2 | Chỉ placeholder mẫu. |
| F08 | 1 | 2 | Chỉ placeholder mẫu. |
| B01 | 13 | 14 | Cân đối (AC > BR là bình thường — *không* phải lỗi). |
| B02 | 1 | 2 | Chỉ placeholder mẫu. |
| B03 | 11 | 12 | Cân đối. |
| B04 | 10 | 10 | Cân đối. |

**Kết luận quy ước:** 9/12 feature dùng `BR-xx`/`AC-xx` chuẩn với nội dung thực. 3 feature
(**F07, F08, B02**) chỉ còn placeholder. Điểm cần soát truy vết: **F03** (AC ít hơn BR).

## 3. Điểm sẵn sàng theo SDD

| Mức | Feature | Ý nghĩa |
|---|---|---|
| 🟢 Sẵn sàng | **F01, B03** | spec + design + ui + test đầy đủ; là mẫu chuẩn của repo. |
| 🟡 Gần sẵn sàng | **F02, F03, F04, F05, B01, B04** | spec/ui/test đủ; **thiếu `design.md`** (bổ sung khi vào pha dev). |
| 🟠 Gần đủ, vướng test | **F06** | spec/ui đủ nhưng **test-plan còn khung** (30 dòng) → cần viết test bám AC. |
| 🔴 Chưa sẵn sàng | **F07, F08, B02** | spec/test chỉ khung mẫu; cần PO/BA điền nội dung thực. |

Tổng: **2 🟢 · 6 🟡 · 1 🟠 · 3 🔴**. Toàn bộ spec đang `status: Draft`; version dao động 0.1–0.3
(F01/B01 = 0.2, B03 = 0.3, còn lại 0.1) — chưa có spec nào `Approved`.

## 4. Khoảng trống lớn (top gaps)

1. **3 spec khung mẫu** — F07, F08, B02: thiếu Bối cảnh/Luồng/BR/AC/Dữ liệu thực. *(chặn dev các feature này)*
2. **F06 test-plan còn khung** — spec đã chốt nhưng chưa có test case bám AC.
3. **design.md chưa tách** cho F02–F06, B01, B04 — truy vết BR → hiện thực kỹ thuật chưa có.
4. **F03 cần cập nhật** — phê duyệt **đạo đức song song** (`type=ETHICS_REVIEW`) và mô hình **cuộc họp/biên bản**
   (dùng chung với F06 theo ADR-0003); soát BR chưa có AC.
5. **Open-points §7** ở F01–F06 chưa chốt (mã đề tài, gia hạn, giới hạn làm lại…) — cần PO quyết.
6. **Cổng công khai** chưa có mã feature/owner rõ ràng.

## 5. Khuyến nghị phân tầng

- **Tier 1 — trước khi code F01–F06:** PO chốt open-points §7; cập nhật F03 (đạo đức + cuộc họp);
  viết test-plan F06 bám AC.
- **Tier 2 — chuẩn hóa nội dung:** PO/BA điền đầy đủ F07, F08, B02 (theo template).
- **Tier 3 — chuẩn bị dev:** tách `design.md` cho F02–F06, B01, B04; chi tiết hóa test-plan & dữ liệu mẫu;
  nâng spec đã chốt lên `status: Review/Approved`.

> Các hạng mục Tier 1–3 nằm **ngoài phạm vi** đợt chuẩn hóa Epic→Feature hiện tại; được theo dõi ở
> checklist [README.md §4/§7](README.md) và xử lý ở các bước kế tiếp.
