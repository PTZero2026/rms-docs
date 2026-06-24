# Biên bản họp & Tổng hợp yêu cầu — Phần mềm NCKH (ĐH Thủy Lợi)

> **Phiên bản:** 1.0
> **Ngày lập:** 24/06/2026
> **Người lập:** BA dự án PM CĐT

---

## A. Biên bản họp (MoM)

### A.1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Chủ đề | Khảo sát yêu cầu Phần mềm Quản lý Nghiên cứu Khoa học (NCKH) |
| Đơn vị khảo sát | Đại học Thủy Lợi |
| Đầu mối phía Trường | Đại diện đơn vị IT / Phòng Quản lý Khoa học (QLKH) |
| Đơn vị thực hiện | Đội dự án PM CĐT (BA / PO) |
| Ngày họp | `____ / ____ / 2026` (cập nhật) |
| Hình thức | Họp trao đổi yêu cầu nghiệp vụ |

**Mục tiêu buổi họp:** Khai thác nhu cầu nghiệp vụ quản lý NCKH của Trường, làm rõ phạm vi các phân hệ và yêu cầu tích hợp hệ thống để làm đầu vào xây dựng phần mềm.

### A.2. Tóm tắt kết quả trao đổi

Phòng QLKH cần một hệ thống quản lý toàn diện 7 phân hệ nghiệp vụ NCKH: đề tài, dự án phục vụ sản xuất, công bố/bài báo, hội nghị/hội thảo, phục vụ cộng đồng, sở hữu trí tuệ và lý lịch khoa học của giảng viên. Điểm xuyên suốt là các hoạt động khoa học đều được quy đổi ra giờ giảng cho giảng viên và tự động tổng hợp vào lý lịch khoa học.

Về kỹ thuật, Trường yêu cầu đăng nhập SSO qua hệ thống mail Microsoft, đồng bộ dữ liệu giảng viên/sinh viên (xác nhận thay vì khai báo lại), số hóa dữ liệu cũ trong 5 năm, và triển khai trên một tenant riêng cho Đại học Thủy Lợi với khả năng cấu hình lại flow/tính năng.

### A.3. Các quyết định & thống nhất chính

1. Phạm vi gồm 7 phân hệ nghiệp vụ NCKH (chi tiết tại Phần B).
2. Mọi hoạt động khoa học (đề tài, bài báo, hội nghị, phục vụ cộng đồng, SHTT) được quy đổi ra giờ giảng cho giảng viên.
3. Lý lịch khoa học của giảng viên được tổng hợp tự động từ các sự kiện và trích xuất theo template khi cần xác nhận.
4. Đăng nhập dùng SSO qua tài khoản Microsoft của Trường.
5. Đồng bộ thông tin giảng viên/sinh viên khi onboarding theo cơ chế xác nhận, không khai báo lại.
6. Số hóa và chuyển đổi dữ liệu cũ trong phạm vi 5 năm.
7. Tạo tenant riêng cho Đại học Thủy Lợi, cho phép setup lại flow/tính năng.

### A.4. Việc cần làm tiếp theo (Action Items)

| # | Nội dung công việc | Phụ trách | Ghi chú / Hạn |
|---|---|---|---|
| 1 | Tổng hợp & gửi lại biên bản + bản yêu cầu để Trường xác nhận | Đội dự án (BA) | Sau buổi họp |
| 2 | Cung cấp bộ biểu mẫu, quy chế NCKH, quy định quy đổi giờ giảng | Phòng QLKH | Cần thu thập |
| 3 | Cung cấp danh sách hệ thống hiện có & đầu mối kỹ thuật (đăng ký tín chỉ, app SV, HR, mail) | Đơn vị IT | Cần thu thập |
| 4 | Làm rõ phương án SSO Microsoft & cơ chế đồng bộ GV/SV | Hai bên | Buổi kỹ thuật |
| 5 | Thống nhất phạm vi & cách số hóa dữ liệu 5 năm | Hai bên | Cần chốt |
| 6 | Lập kế hoạch tạo tenant riêng & cấu hình flow | Đội dự án | Sau khi chốt phạm vi |

---

## B. Tổng hợp yêu cầu nghiệp vụ

### B.1. Tổng quan nhu cầu Phòng QLKH

Phần mềm NCKH cần quản lý 7 nhóm nghiệp vụ chính:

| # | Phân hệ | Mô tả ngắn |
|---|---|---|
| 1 | Quản lý đề tài | Đề tài cấp Tỉnh/Bộ/Nhà nước, cấp cơ sở (giảng viên), đề tài sinh viên |
| 2 | Quản lý dự án phục vụ sản xuất | Dự án thuộc các viện, liên kết công ty bên ngoài |
| 3 | Quản lý công bố / bài báo | ~700 bài/năm; bài độc lập và bài thuộc đề tài |
| 4 | Quản lý hội nghị / hội thảo | Giảng viên cung cấp thông tin, QLKH phê duyệt & cấp kinh phí |
| 5 | Quản lý phục vụ cộng đồng | Quy trình tương tự hội nghị/hội thảo |
| 6 | Quản lý sở hữu trí tuệ | Quy trình tương tự hội nghị/hội thảo |
| 7 | Quản lý lý lịch khoa học giảng viên | Tự động tổng hợp sự kiện; trích xuất & ký xác nhận theo template |

> **Điểm chung quan trọng:** các hoạt động khoa học đều được quy đổi ra giờ giảng cho giảng viên và tự động bổ sung vào lý lịch khoa học.

### B.2. Quản lý đề tài

Phân loại đề tài và mức độ quản lý:

| Loại đề tài | Nội dung quản lý | Mức quản lý |
|---|---|---|
| Cấp Tỉnh / Bộ / Nhà nước | Quản lý đầu mục; thời gian; kết quả; tính giờ giảng | Quản lý đầu mục |
| Cấp cơ sở (giảng viên) | Có nguồn hỗ trợ tính trên đề tài công bố; tính giờ giảng cho GV | Quản lý vòng đời đầy đủ |
| Đề tài sinh viên | Tính giờ giảng cho giảng viên hướng dẫn | Dự kiến quản lý vòng đời |

#### Vòng đời đề tài cấp cơ sở

1. **Đợt kêu gọi** — mở đợt nhận đăng ký đề tài.
2. **Giảng viên nộp đề cương.**
3. **Họp hội đồng phê duyệt đề cương.**
4. **Phê duyệt thực hiện:**
   - Tờ trình phê duyệt
   - Ký hợp đồng thực hiện
5. **Thực hiện đề tài:**
   - Báo cáo tiến độ
   - Cập nhật công bố / bài báo
   - Gia hạn
   - Hủy
6. **Họp hội đồng nghiệm thu:**
   - Nghiệm thu đề tài (Biên bản họp)
   - Chấm điểm
   - Chỉnh sửa / giải trình (Biên bản giải trình)
7. **Thanh quyết toán.**
8. **Thanh lý hợp đồng.**

### B.3. Quản lý dự án phục vụ sản xuất

- Thuộc các viện; có liên kết với công ty bên ngoài.
- Quản lý thông tin: tên dự án; thành viên; kinh phí.

### B.4. Quản lý công bố / bài báo

Khối lượng ước tính khoảng **700 bài/năm**. Có 2 luồng:

- **Bài báo độc lập:** giảng viên cung cấp thông tin → Phòng QLKH phê duyệt và cấp kinh phí hỗ trợ.
- **Bài báo trong NCKH:** cần phương án tự liên kết (link) giữa đề tài và bài báo.

*Bài báo được quy ra giờ giảng cho giảng viên.*

### B.5. Quản lý hội nghị / hội thảo

Giảng viên tự cung cấp thông tin:

- Tờ trình phê duyệt cử đi
- Thông tin phát biểu tại hội nghị (minh chứng)
- Phòng QLKH phê duyệt và cấp kinh phí hỗ trợ

*Được quy ra giờ giảng cho giảng viên.*

### B.6. Quản lý phục vụ cộng đồng

Quy trình tương tự mục B.5 (Hội nghị / hội thảo): giảng viên cung cấp minh chứng → QLKH phê duyệt & cấp kinh phí → quy đổi giờ giảng.

### B.7. Quản lý sở hữu trí tuệ

Quy trình tương tự mục B.5 (Hội nghị / hội thảo): giảng viên cung cấp minh chứng → QLKH phê duyệt & cấp kinh phí → quy đổi giờ giảng.

### B.8. Quản lý lý lịch khoa học của giảng viên

- Mỗi giảng viên có một trang lý lịch khoa học riêng.
- Các sự kiện khoa học (đề tài, bài báo, hội nghị, SHTT...) được tự động bổ sung vào lý lịch.
- Khi cần xác nhận: Phòng QLKH trích xuất tự động theo template và ký xác nhận.

---

## C. Yêu cầu kỹ thuật & tích hợp hệ thống

| Hạng mục | Yêu cầu |
|---|---|
| Đăng nhập / SSO | Trường dùng hệ thống mail Microsoft; đăng nhập qua SSO (tài khoản Microsoft). |
| Đồng bộ dữ liệu | Đồng bộ thông tin giảng viên & sinh viên khi onboarding theo cơ chế xác nhận (GV/SV xác nhận, không khai báo lại). |
| Số hóa dữ liệu cũ | Cần phương án tích hợp & số hóa dữ liệu cũ; mong muốn phạm vi 5 năm. |
| Mô hình triển khai | Tạo tenant riêng cho Đại học Thủy Lợi; cho phép setup lại flow/tính năng theo đặc thù Trường. |

---

## D. Điểm cần làm rõ tiếp / Ghi chú

Một số điểm nên xác nhận lại với Trường ở các buổi làm việc sau:

- Cơ chế và công thức quy đổi giờ giảng cho từng loại hoạt động (đề tài, bài báo, hội nghị, cộng đồng, SHTT).
- Mức độ quản lý vòng đời đề tài sinh viên (đã xác nhận "dự kiến" — cần chốt phạm vi).
- Phương án kỹ thuật liên kết tự động giữa đề tài và bài báo.
- Phạm vi quản lý kinh phí: chỉ ghi nhận hay quản lý dự toán/giải ngân.
- Danh mục biểu mẫu chuẩn cho từng phân hệ (tờ trình, hợp đồng, biên bản, template lý lịch khoa học).
- Đầu mối & chi tiết kỹ thuật các hệ thống cần tích hợp (đăng ký tín chỉ, app sinh viên, HR, tài chính).
- Phạm vi và định dạng dữ liệu cũ cần số hóa trong 5 năm.
