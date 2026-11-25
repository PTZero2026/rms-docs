---
title: "Thuật ngữ — RMS"
status: Review
updated: 2026-11-24
---

# Thuật ngữ dùng chung

Nguồn quy chiếu tên gọi & khái niệm cho toàn bộ tài liệu. Khi một thuật ngữ trùng với
thực thể dữ liệu, cột "Thực thể" trỏ tới `../architecture/data-model.md`.

## Thuật ngữ của đợt thử nghiệm

| Thuật ngữ | Nghĩa trong RMS |
|---|---|
| Lát cắt INVEST | Một kết quả nghiệp vụ kiểm tra độc lập, có mã US liên kết về feature và AC nguồn. |
| Web / Mobile / Shared | Tiền tố chỉ nơi nghiệm thu chính. Mobile ở đợt này là web trên điện thoại. Shared là hành vi hoặc dữ liệu dùng chung cho nhiều màn hình, vai trò hay tác vụ nền. |
| Bản chụp báo cáo kỳ | Tập mã hồ sơ trong quyền tại thời điểm trích xuất. Dòng chi tiết và số tổng dùng cùng tập này. |
| Gợi ý có căn cứ | Kết quả AI kèm phiên bản tài liệu và vị trí trích dẫn. Người dùng có quyền mở nguồn, kiểm và quyết định sử dụng. |
| Khuyến nghị chờ duyệt | Giá trị mặc định để lập kế hoạch. Mã RV liên kết use case, người có quyền chốt và bằng chứng cần xem. |

## Vòng đời & nghiệp vụ cốt lõi

| Thuật ngữ | Định nghĩa | Thực thể |
|-----------|------------|----------|
| Đề tài | Đơn vị nghiên cứu được đề xuất và quản lý xuyên suốt vòng đời trong hệ thống. | `ResearchProject` |
| Kỳ nhận đề xuất | Khoảng thời gian đơn vị mở để tiếp nhận hồ sơ đề xuất đề tài, có lĩnh vực, biểu mẫu và tiêu chí xét duyệt riêng; không phải thời gian thực hiện/hoàn thành đề tài. | `ProposalCall` |
| Đề xuất | Hành động/hồ sơ đăng ký một đề tài mới trong một kỳ nhận đề xuất. | `ResearchProject` |
| Thuyết minh | Hồ sơ mô tả chi tiết đề tài khi đề xuất; **còn gọi là đề cương**. | — |
| Đề cương | Tên gọi khác của **Thuyết minh** (dùng nhất ở "họp phê duyệt đề cương" — F03). | — |
| Xét duyệt | Quy trình hội đồng đánh giá đề xuất để chấp nhận/từ chối. | `EvaluationCommittee`, `ScoreSheet` |
| Hội đồng | Nhóm chuyên gia đánh giá đề tài. **Hội đồng khoa học**: xét duyệt (`type=PROPOSAL_REVIEW`) hoặc nghiệm thu (`type=ACCEPTANCE`); **hội đồng đạo đức**: thẩm định đạo đức nghiên cứu (`type=ETHICS_REVIEW`), chạy song song xét duyệt. | `EvaluationCommittee` |
| Phiếu chấm | Phiếu cho điểm/nhận xét của một thành viên hội đồng. | `ScoreSheet` |
| Phê duyệt đạo đức | Thẩm định khía cạnh đạo đức nghiên cứu của đề tài (hội đồng đạo đức), chạy **song song** xét duyệt khoa học; khi thuộc diện thẩm định đạo đức, đề tài phải đạt cả hai (điểm kiểm đã chốt tại [RV-11](../../specs/review-decisions.md#rv-11)). | `EvaluationCommittee` |
| Cuộc họp (hội đồng) | Phiên họp hội đồng để **phê duyệt đề cương** hoặc **nghiệm thu**; có lịch, thành phần, biên bản & quyết nghị. Mô hình dùng chung F03/F06. | — |
| Biên bản họp | Văn bản ghi diễn biến & kết luận/quyết nghị của một cuộc họp hội đồng. | — |
| Tiến độ | Quá trình thực hiện đề tài, theo dõi qua các báo cáo định kỳ. | `ProgressReport` |
| Báo cáo tiến độ | Báo cáo định kỳ về kết quả thực hiện đề tài. | `ProgressReport` |
| Kinh phí | Ngân sách cấp cho đề tài và các giao dịch chi/đối soát. | `BudgetTransaction` |
| Giao dịch kinh phí | Một khoản chi/thu liên quan đề tài, dùng để đối soát tài chính. | `BudgetTransaction` |
| Đối soát | So khớp giao dịch kinh phí với hệ thống tài chính ngoài. | — |
| Nghiệm thu | Quy trình hội đồng đánh giá kết quả cuối của đề tài. | `EvaluationCommittee`, `ScoreSheet` |
| Sản phẩm khoa học | Bài báo, sáng chế, giải pháp… sinh ra từ đề tài. | `ResearchOutput` |
| Lý lịch khoa học | Hồ sơ năng lực/thành tích nghiên cứu của một nhà khoa học. | `User`, `ResearchOutput` |
| Công bố | Việc công khai/ghi nhận sản phẩm khoa học của đề tài. | `ResearchOutput` |

## Vai trò & người dùng

| Thuật ngữ | Định nghĩa | Mặt dùng |
|-----------|------------|----------|
| Chủ nhiệm đề tài | Nhà khoa học chịu trách nhiệm chính: nộp đề xuất, báo cáo tiến độ, kê khai sản phẩm. | FE |
| Thư ký đề tài | Thành viên hỗ trợ chuẩn bị hồ sơ. Trong F01, chủ nhiệm lưu và nộp đề xuất. | FE |
| Thành viên đề tài | Nhà khoa học tham gia đề tài, xem thông tin liên quan. | FE |
| Chuyên viên QL KHCN | Cán bộ quản lý: tiếp nhận, kiểm tra, theo dõi toàn bộ vòng đời. | BO |
| Thành viên hội đồng | Chuyên gia chấm điểm khi xét duyệt, nghiệm thu hoặc thẩm định đạo đức. | BO |
| Quản trị hệ thống | Admin: cấu hình danh mục, quản lý người dùng & phân quyền. | BO |
| Khách | Người truy cập công khai, chỉ xem nội dung đã công bố của đề tài (tóm tắt, sản phẩm khoa học, thành viên). | FE (công khai) |

Chi tiết: `personas.md`.

## Hệ thống & kiến trúc

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| RMS | Research Management System — hệ thống quản lý nghiên cứu khoa học. |
| Portal người dùng (FE) | Giao diện web cho nhà khoa học. |
| BackOffice (BO) | Giao diện web quản trị cho chuyên viên/hội đồng/admin. |
| Khu vực công khai | Phần FE truy cập được không cần đăng nhập, chỉ hiển thị nội dung đã công bố. |
| Nội dung công khai | Dữ liệu đề tài được phép hiển thị công khai (tóm tắt, sản phẩm khoa học, thành viên); không gồm dữ liệu nội bộ như thuyết minh đầy đủ, kinh phí, phiếu chấm. |
| Danh mục | Dữ liệu cấu hình dùng chung (lĩnh vực, đơn vị, loại sản phẩm…). |
| Phân quyền | Cơ chế gán quyền truy cập theo vai trò. |
| SSO | Đăng nhập một lần qua hệ thống định danh nội bộ (OIDC/SAML). |
| Permission matrix | Bảng ánh xạ hành động ↔ vai trò trong một feature quản trị. |
| Audit / Nhật ký | Bản ghi các hành động quan trọng để truy vết. |

## Quy ước tài liệu

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| Feature `F0x` | Tính năng hướng người dùng cuối (có thể kèm mặt quản trị). |
| Feature `B0x` | Tính năng thuần quản trị / hạ tầng dùng chung. |
| `spec.md` | Nguồn sự thật nghiệp vụ của một feature. |
| BR (Business rule) | Quy tắc nghiệp vụ trong `spec.md`. |
| AC (Acceptance criteria) | Tiêu chí chấp nhận (Given/When/Then), đầu vào cho `test-plan.md`. |
| ADR | Architecture Decision Record — ghi nhận quyết định kiến trúc. |

## Changelog

| Ngày | Trạng thái | Thay đổi |
|------|------------|----------|
| 2026-11-18 | Review | Bổ sung thuật ngữ INVEST, kênh, bản chụp kỳ và nguồn AI; liên kết điểm chặn thẩm định đạo đức. |
| 2026-06-11 | Approved | Bổ sung thuật ngữ **hội đồng đạo đức / phê duyệt đạo đức**, **cuộc họp & biên bản họp**; ghi chú **đề cương = thuyết minh**; làm rõ loại hội đồng (`PROPOSAL_REVIEW`/`ACCEPTANCE`/`ETHICS_REVIEW`). |
| 2026-06-11 | Approved | Thêm vai trò *Thư ký đề tài*, *Khách*; thêm thuật ngữ *Khu vực công khai* và *Nội dung công khai*; duyệt & chuyển Draft → Approved. |
| 2026-06-01 | Draft | Bản thảo đầu tiên. |
