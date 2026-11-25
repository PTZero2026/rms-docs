---
title: "E1 — Tiếp nhận & Xét duyệt"
id: "E1"
status: Draft
updated: 2026-11-24
---

# E1 — Tiếp nhận & Xét duyệt

## Mục tiêu (outcome)
Một đề tài đi trọn: **mở kỳ → nộp đề xuất → hội đồng khoa học chấm *và* hội đồng đạo đức phê duyệt
(song song) qua cuộc họp có biên bản → kết luận chấp nhận/từ chối**.

## Pha
Now.

## Feature thành phần
| Mã | Feature | Module | Vai trò trong Epic |
|---|---|---|---|
| [F02](../features/F02-dot-keu-goi/) | Kỳ nhận đề xuất | `call` | Mở/đóng kỳ, thời gian, lĩnh vực, biểu mẫu, tiêu chí |
| [F01](../features/F01-de-xuat-de-tai/) ★ | Đề xuất đề tài | `proposal` | Tạo/nộp thuyết minh, thành viên, dự toán; sinh mã đề tài. **Tracer bullet** end-to-end |
| [F03](../features/F03-xet-duyet-hoi-dong/) | Xét duyệt hội đồng + đạo đức | `review` | Hội đồng, chấm điểm, đạo đức song song, cuộc họp/biên bản |

## Phụ thuộc
- **Epic**: E0 (RBAC, danh mục, workflow, thông báo).
- **ADR**: [0003 Hội đồng dùng chung](../architecture/decisions/0003-mo-hinh-hoi-dong-dung-chung.md)
  (mô hình `EvaluationCommittee`/`ScoreSheet` — F03 dùng `type=PROPOSAL_REVIEW` & `ETHICS_REVIEW`).
- **Nội bộ**: F01 phụ thuộc kỳ mở của F02; F03 chấm trên hồ sơ do F01 nộp.

## Căn cứ giao việc

F01 cấp mã theo kỳ và giữ mã khi nộp lại. F02 dùng cửa sổ nhận theo ngày Việt Nam. F03 chốt khoa học và đạo đức theo RV-11, biên bản gắn đúng hội đồng/vòng. [Nguồn F03](../features/F03-xet-duyet-hoi-dong/spec.md)

## Định nghĩa hoàn thành (Exit criteria)
- [ ] Tạo & mở được kỳ nhận đề xuất; tự đóng khi hết hạn (F02).
- [ ] Nộp đề xuất trong kỳ, sinh mã đề tài, ghi thời điểm nộp + audit (F01).
- [ ] Hội đồng KH + đạo đức chấm song song; tổng hợp điểm; kết luận chấp nhận/từ chối qua cuộc họp có biên bản (F03).
