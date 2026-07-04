// =====================================================================
// RMS Prototype — Đại học Thủy Lợi (tenant pilot)
// Bản mẫu tương tác để TRÌNH BÀY VỚI DEV.
// Mỗi màn hình có panel "📋 Đặc tả cho DEV" ánh xạ UI ↔ spec:
//   - Trạng thái (status enum) · Hành động × Vai trò · Business rule ảnh hưởng UI
// Nguồn: docs/features/<mã>/spec.md · AGENTS.md §3 (ánh xạ feature↔module)
// LƯU Ý: dữ liệu là MÔ PHỎNG, không phải dữ liệu thật.
// =====================================================================

// ---------------------------------------------------------------------
// 1. MENU theo vai trò (RBAC — ADR-0009: một web app, phân quyền ở backend)
// ---------------------------------------------------------------------
const menus = {
    admin: [
        { group: 'Tổng quan', items: [
            { id: 'B06', icon: 'pie-chart', label: 'Trang chủ (Dashboard)' }
        ]},
        { group: 'Quản lý Đề tài (E1–E2)', items: [
            { id: 'F02', icon: 'calendar', label: 'Kỳ nhận đề xuất' },
            { id: 'F01', icon: 'file-text', label: 'Đề xuất đề tài' },
            { id: 'F03', icon: 'users', label: 'Xét duyệt Hội đồng' },
            { id: 'F04', icon: 'clock', label: 'Quản lý Tiến độ' },
            { id: 'F05', icon: 'dollar-sign', label: 'Quản lý Kinh phí' },
            { id: 'F06', icon: 'check-square', label: 'Nghiệm thu' }
        ]},
        { group: 'Sản phẩm & Mở rộng (E3–E4)', items: [
            { id: 'F07', icon: 'book', label: 'Sản phẩm KHCN' },
            { id: 'F09', icon: 'award', label: 'Đề tài Cấp trên' },
            { id: 'F10', icon: 'briefcase', label: 'Đề tài Sinh viên' },
            { id: 'F11', icon: 'truck', label: 'Dự án PV Sản xuất' },
            { id: 'F12', icon: 'activity', label: 'Hoạt động KH' }
        ]},
        { group: 'Hệ thống (E0)', items: [
            { id: 'B03', icon: 'user', label: 'Người dùng (IAM)' },
            { id: 'B01', icon: 'settings', label: 'Danh mục Cấu hình' }
        ]}
    ],
    lecturer: [
        { group: 'Tổng quan', items: [
            { id: 'B06', icon: 'home', label: 'Trang cá nhân' }
        ]},
        { group: 'Nghiên cứu của tôi', items: [
            { id: 'MY_PROJECTS', icon: 'folder', label: 'Đề tài của tôi' },
            { id: 'P03', icon: 'clock', label: 'Quy đổi Giờ giảng' }
        ]},
        { group: 'Khai báo thành tích NCKH', items: [
            { id: 'F07', icon: 'book', label: 'Sản phẩm KHCN' },
            { id: 'F09', icon: 'award', label: 'Đề tài Cấp trên' },
            { id: 'F12', icon: 'activity', label: 'Hoạt động Khoa học' }
        ]},
        { group: 'Công tác Chuyên môn', items: [
            { id: 'F03', icon: 'edit', label: 'Chấm điểm Hội đồng' },
            { id: 'F10', icon: 'users', label: 'Hướng dẫn Sinh viên' }
        ]},
        { group: 'Cá nhân', items: [
            { id: 'F08', icon: 'user', label: 'Lý lịch Khoa học' }
        ]}
    ],
    student: [
        { group: 'Tổng quan', items: [
            { id: 'B06', icon: 'home', label: 'Trang chủ' }
        ]},
        { group: 'Hoạt động NCKH', items: [
            { id: 'F10', icon: 'folder', label: 'Đề tài Đăng ký' },
            { id: 'F07', icon: 'star', label: 'Thành tích / Sản phẩm' }
        ]}
    ]
};

// ---------------------------------------------------------------------
// 2. Badge trạng thái — bản đồ nhãn → lớp màu (bao phủ enum các feature)
// ---------------------------------------------------------------------
const STATUS_CLASS = {
    approved: ['Đã duyệt', 'Đúng hạn', 'Đã nộp', 'Đang mở', 'Đang hoạt động', 'Đạt', 'Hiệu lực', 'Đã xác nhận', 'Hoàn thành', 'Active'],
    pending:  ['Chờ duyệt', 'Chờ họp', 'Chờ mở', 'Chờ bảo vệ', 'Chờ giải ngân đợt 2', 'Đang xử lý', 'Chờ chấm', 'Đang chấm', 'Chờ nghiệm thu', 'Chờ xác nhận GVHD', 'Tạm khóa', 'PENDING'],
    rejected: ['Đã đóng', 'Đã hủy', 'Không đạt', 'Từ chối', 'Ngừng hoạt động', 'Trễ hạn', 'Tạm dừng', 'Quá hạn', 'Đang sửa đổi'],
    info:     ['Đang thực hiện', 'Đang xét duyệt', 'Đang nghiệm thu', 'Giữa kỳ (50%)'],
    draft:    ['Nháp', 'DRAFT']
};
function statusBadge(text) {
    for (const cls in STATUS_CLASS) {
        if (STATUS_CLASS[cls].includes(text)) return `<span class="status-badge status-${cls}">${text}</span>`;
    }
    return text;
}

// ---------------------------------------------------------------------
// 3. Dữ liệu mô phỏng + ĐẶC TẢ CHO DEV (spec) từng feature
//    Vòng đời F-series (đề tài cấp trường): Đề xuất→Xét duyệt→Thực hiện→Kinh phí→Nghiệm thu
//    [Nghiên cứu A..E] biểu diễn 1 đề tài đi hết 5 bước để demo Lifecycle Stepper.
// ---------------------------------------------------------------------
const mockDB = {
    F02: {
        code: 'F02', title: 'Kỳ nhận đề xuất (ProposalCall)', lifecycle: 'FMAIN', activeStep: 1,
        cols: ['Mã Đợt', 'Tên Đợt', 'Lĩnh vực', 'Thời gian', 'Số ĐX', 'Trạng thái'],
        data: [
            ['DKG-2026-01', 'Đợt 1 - NCKH Cấp Trường 2026', 'Đa lĩnh vực', '01/01/2026 – 28/02/2026', '12', 'Đang mở'],
            ['DKG-2026-02', 'Chuyên đề - Thủy lợi & BĐKH', 'Công trình thủy', '—', '0', 'Nháp'],
            ['DKG-2025-02', 'Đợt 2 - Sinh viên NCKH 2025', 'Sinh viên', '01/09/2025 – 30/10/2025', '34', 'Đã đóng']
        ],
        btn: 'Tạo kỳ kêu gọi',
        spec: {
            purpose: 'Chuyên viên tạo/cấu hình/mở-đóng kỳ nhận đề xuất — điều kiện tiên quyết của F01.',
            statuses: ['Nháp (DRAFT)', 'Đang mở (OPEN)', 'Đã đóng (CLOSED)', 'Đã hủy (CANCELLED)'],
            actions: [
                ['Tạo/sửa kỳ (khi DRAFT)', 'Chuyên viên QL KHCN'],
                ['Mở · Đóng · Hủy · Gia hạn endDate', 'Chuyên viên QL KHCN'],
                ['Xem kỳ đang mở + "Nộp đề xuất"', 'Nhà khoa học']
            ],
            rules: [
                'BR-03: Nút "Mở kỳ" chỉ bật khi đủ trường bắt buộc (name, code, dates, ≥1 lĩnh vực, template, criteria set).',
                'BR-06: Kỳ OPEN đã có ≥1 đề tài SUBMITTED → khóa sửa dates/lĩnh vực/template, chỉ cho gia hạn endDate.',
                'BR-07/08: Không hủy kỳ đã có đề xuất (phải Đóng); nhà khoa học chỉ thấy kỳ OPEN còn hạn.'
            ]
        }
    },
    F01: {
        code: 'F01', title: 'Đề xuất đề tài (ResearchProject)', lifecycle: 'FMAIN', activeStep: 1,
        cols: ['Mã ĐX', 'Tên Đề xuất', 'Chủ nhiệm', 'Kỳ', 'Trạng thái'],
        data: [
            ['DX-26-001', '[Nghiên cứu A] Chống sạt lở đê biển Nam Định', 'PGS.TS Nguyễn Trọng', 'DKG-2026-01', 'Đã nộp'],
            ['—', 'Cảm biến IoT quan trắc mực nước hồ chứa', 'TS. Lê Thị Mai', 'DKG-2026-01', 'Nháp'],
            ['DX-26-007', 'Vật liệu địa kỹ thuật cho đê bao', 'ThS. Trần Văn Hùng', 'DKG-2026-01', 'Đang xét duyệt']
        ],
        btn: 'Tạo đề xuất mới',
        spec: {
            purpose: 'Chủ nhiệm soạn/nộp thuyết minh theo biểu mẫu của kỳ; chuyên viên tiếp nhận, trả lại bổ sung, chốt danh sách sang F03.',
            statuses: ['Nháp (DRAFT)', 'Đã nộp (SUBMITTED)', 'Đang xét duyệt (UNDER_REVIEW)', 'Đã hủy (CANCELLED)'],
            actions: [
                ['Soạn · Lưu nháp · Nộp (form nhiều bước) · Hủy — chỉ khi DRAFT', 'Chủ nhiệm'],
                ['Tiếp nhận · Trả lại bổ sung (→DRAFT) · Chốt danh sách', 'Chuyên viên QL KHCN'],
                ['Xem hồ sơ (chỉ đọc)', 'Thành viên đề tài']
            ],
            rules: [
                'BR-05/06: Chỉ sửa khi DRAFT; sau nộp form chuyển chỉ đọc + banner, chỉ mở lại khi chuyên viên trả lại.',
                'BR-01/02: Nút "Nộp" ở bước Xem lại chỉ bật khi kỳ còn mở + đủ trường bắt buộc; liệt kê trường thiếu.',
                'BR-07: projectCode sinh khi nộp lần đầu, giữ nguyên qua các lần trả lại/nộp lại.'
            ]
        }
    },
    F03: {
        code: 'F03', title: 'Xét duyệt Hội đồng (Committee)', lifecycle: 'FMAIN', activeStep: 2,
        cols: ['Mã HĐ', 'Tên Hội đồng', 'Chủ tịch', 'Đề tài đánh giá', 'Trạng thái'],
        data: [
            ['HD-26-002', 'HĐ Xét duyệt khối CNTT', 'GS.TS Nguyễn X', '[Nghiên cứu B] AI dự báo lũ', 'Chờ họp'],
            ['HD-26-003', 'HĐ Xét duyệt khối Công trình', 'PGS.TS Phạm Y', '[Nghiên cứu A] Chống sạt lở đê biển', 'Đang chấm'],
            ['HD-26-001', 'HĐ Xét duyệt khối Kinh tế', 'GS.TS Lê Z', 'Mô hình kinh tế tuần hoàn', 'Đã duyệt']
        ],
        btn: 'Lập hội đồng',
        spec: {
            purpose: 'Lập hội đồng, mở đợt đánh giá, thành viên chấm điểm theo bộ tiêu chí; hệ thống tổng hợp điểm; chuyên viên kết luận APPROVED/REJECTED theo ngưỡng.',
            statuses: ['Đề tài: UNDER_REVIEW → APPROVED / REJECTED', 'Phiếu (ScoreSheet): DRAFT → SUBMITTED', 'Đợt (Round): COLLECTING_SCORES → CONCLUDED'],
            actions: [
                ['Lập/sửa HĐ · phân công · mở đợt · ra kết luận', 'Chuyên viên QL KHCN'],
                ['Chấm điểm & gửi phiếu (của mình)', 'Thành viên hội đồng'],
                ['Theo dõi tiến trình + kết quả (đọc)', 'Chủ nhiệm']
            ],
            rules: [
                'BR-03 Xung đột lợi ích: ẩn đề tài mà thành viên là chủ nhiệm/thành viên khỏi hàng chờ chấm.',
                'BR-07: Nút "Ra kết luận" chỉ bật khi số phiếu SUBMITTED ≥ MIN_SUBMITTED_SCORE_SHEETS.',
                'BR-05/10/11: Điểm ∈ [0,maxScore] & đủ mọi tiêu chí mới gửi; sau CONCLUDED khóa phiếu; nhận xét ẩn danh người chấm.'
            ]
        }
    },
    F04: {
        code: 'F04', title: 'Quản lý Tiến độ (ProgressReport)', lifecycle: 'FMAIN', activeStep: 3,
        cols: ['Mã ĐT', 'Tên Đề tài', 'Chủ nhiệm', 'Kỳ báo cáo', 'Trạng thái'],
        data: [
            ['DT-26-003', '[Nghiên cứu C] Mô hình kinh tế tuần hoàn', 'ThS. Trần Văn Hùng', 'Giữa kỳ (50%)', 'Đúng hạn'],
            ['DT-26-006', 'Quan trắc chất lượng nước sông Hồng', 'TS. Lê Thị Mai', 'Kỳ 1', 'Trễ hạn'],
            ['DT-25-009', 'Tối ưu vận hành hồ chứa đa mục tiêu', 'PGS.TS Nguyễn Trọng', 'Cuối kỳ', 'Tạm dừng']
        ],
        btn: 'Nhắc nộp báo cáo',
        spec: {
            purpose: 'Giao đề tài chính thức (ProjectAssignment) rồi theo dõi các kỳ báo cáo tiến độ: nộp, duyệt/yêu cầu sửa, tạm dừng/tiếp tục, chuyển chờ nghiệm thu.',
            statuses: ['Đề tài: APPROVED → IN_PROGRESS ↔ SUSPENDED → PENDING_ACCEPTANCE', 'Báo cáo: PENDING_SUBMISSION → SUBMITTED → PASSED / REVISION_REQUESTED', 'Cờ "Trễ hạn" (không phải status)'],
            actions: [
                ['Nộp/nộp lại báo cáo (đề tài của mình)', 'Chủ nhiệm'],
                ['Giao đề tài · lập lịch kỳ · duyệt · yêu cầu sửa · tạm dừng · chuyển nghiệm thu', 'Chuyên viên QL KHCN'],
                ['Xem', 'Thành viên đề tài / Quản trị']
            ],
            rules: [
                'BR-13/15: Nút "Xác nhận giao đề tài" chỉ bật khi đủ căn cứ (số QĐ/HĐ, ngày, approvedBudget, file); lệch đề xuất phải nhập note.',
                'BR-04/05: Đề tài SUSPENDED → disable nút nộp; "Yêu cầu chỉnh sửa" bắt buộc officerComment.',
                'BR-09/10: Nhãn "Trễ hạn" đỏ khi quá dueDate; "Chuyển chờ nghiệm thu" chỉ bật khi kỳ cuối PASSED + đủ sản phẩm cam kết.'
            ]
        }
    },
    F05: {
        code: 'F05', title: 'Quản lý Kinh phí (Budget)', lifecycle: 'FMAIN', activeStep: 4, specialRender: 'F05',
        cols: ['Mã ĐT', 'Tên Đề tài', 'KP được cấp', 'Phí QL', 'Đã chi', 'Trạng thái'],
        data: [
            ['DT-25-004', '[Nghiên cứu D] Vật liệu mới đập thủy điện', '200.000.000đ', '10.000.000đ', '120.000.000đ', 'Đang thực hiện'],
            ['DT-25-005', 'Đánh giá tác động môi trường hồ chứa', '150.000.000đ', '7.500.000đ', '150.000.000đ', 'Hoàn thành']
        ],
        btn: 'Xác nhận cấp kinh phí',
        spec: {
            purpose: 'Số hóa vòng đời kinh phí: xác nhận tổng cấp (tách phí quản lý & KP thực hiện), ghi khoản chi + chứng từ, quyết toán/đóng đề tài.',
            statuses: ['BudgetAllocation: CONFIRMED / CANCELLED', 'Đề tài liên quan: IN_PROGRESS · SUSPENDED (chỉ xem) · PASSED · COMPLETED', 'Giao dịch: type = EXPENSE'],
            actions: [
                ['Xác nhận cấp KP + override phí QL (BUDGET.ALLOCATE)', 'Chuyên viên'],
                ['Tạo/sửa/xóa khoản chi + chứng từ (BUDGET.EXPENSE)', 'Chủ nhiệm (đề tài của mình)'],
                ['Quyết toán & đóng đề tài (BUDGET.SETTLE)', 'Chuyên viên'],
                ['Cấu hình phí quản lý (BUDGET.CONFIG)', 'Quản trị hệ thống']
            ],
            rules: [
                'BR-03: Tổng chi vượt KP thực hiện → vẫn cho lưu nhưng hiện CẢNH BÁO vượt kinh phí (không chặn).',
                'BR-06: Sau khi đề tài COMPLETED → khóa khoản chi & kinh phí, chỉ đọc.',
                'BR-10: Phí QL = min(floor(cấp × rate), cap); cho override; đổi cấu hình không hồi tố đề tài đã xác nhận.'
            ]
        }
    },
    F06: {
        code: 'F06', title: 'Nghiệm thu (Acceptance)', lifecycle: 'FMAIN', activeStep: 5,
        cols: ['Mã ĐT', 'Tên Đề tài', 'Hội đồng NT', 'Điểm TB', 'Trạng thái'],
        data: [
            ['DT-25-005', '[Nghiên cứu E] Tác động môi trường hồ chứa', 'HD-NT-01', '—', 'Chờ nghiệm thu'],
            ['DT-25-004', 'Vật liệu mới đập thủy điện', 'HD-NT-02', '86.5', 'Đạt'],
            ['DT-24-011', 'Mô hình dự báo hạn hán ĐBSCL', 'HD-NT-03', '—', 'Đang nghiệm thu']
        ],
        btn: 'Lập hội đồng nghiệm thu',
        spec: {
            purpose: 'Nghiệm thu đề tài qua hội đồng chấm điểm (dùng chung mô hình HĐ với F03, type=ACCEPTANCE) → kết luận ĐẠT/KHÔNG ĐẠT làm cơ sở quyết toán & đóng đề tài.',
            statuses: ['Đề tài: PENDING_ACCEPTANCE → UNDER_ACCEPTANCE → PASSED / FAILED → COMPLETED', 'FAILED có thể quay lại IN_PROGRESS để làm lại'],
            actions: [
                ['Đăng ký nghiệm thu + nộp hồ sơ cuối', 'Chủ nhiệm'],
                ['Lập HĐ ACCEPTANCE · mở đợt · ra kết luận · cho làm lại', 'Chuyên viên'],
                ['Chấm & gửi phiếu (trừ xung đột lợi ích)', 'Thành viên hội đồng']
            ],
            rules: [
                'BR-01: Chỉ cho đăng ký khi kỳ báo cáo cuối PASSED và đủ sản phẩm cam kết APPROVED — thiếu thì chặn, nêu rõ thiếu gì.',
                'BR-03: Xung đột lợi ích — ẩn đề tài & chặn tạo phiếu nếu thành viên là chủ nhiệm/thành viên đề tài.',
                'BR-07/08: Chỉ kết luận khi đủ phiếu tối thiểu; aggregateScore ≥ ngưỡng → PASSED, ngược lại FAILED.'
            ]
        }
    },
    F07: {
        code: 'F07', title: 'Sản phẩm KHCN (ResearchOutput)',
        cols: ['Tên Sản phẩm', 'Phân loại', 'Đề tài liên quan', 'Tác giả', 'Trạng thái'],
        data: [
            ['Predicting coastal erosion using Machine Learning', 'Bài báo SCIE Q1', 'DT-26-003', 'TS. Lê Thị Mai', 'Đã duyệt'],
            ['Bằng độc quyền sáng chế đập ngầm', 'Sáng chế', 'DT-25-004', 'PGS.TS Nguyễn Trọng', 'Chờ duyệt'],
            ['Giáo trình Thủy văn công trình', 'Sách/Giáo trình', '—', 'GS.TS Nguyễn X', 'Nháp']
        ],
        btn: 'Khai báo Sản phẩm',
        spec: {
            purpose: 'Khai báo & duyệt sản phẩm KHCN gắn với đề tài; nguồn dữ liệu cho F08 (lý lịch) và P03 (giờ giảng).',
            specWarning: '⚠ spec.md & ui.md của F07 hiện là TEMPLATE RỖNG — cần PO/BA điền trước khi DEV hiện thực. Dưới đây suy ra từ các feature tham chiếu.',
            statuses: ['approvalStatus: DRAFT → chờ duyệt → APPROVED (đã duyệt) — cần xác nhận enum chính thức'],
            actions: [
                ['Khai báo / sửa sản phẩm', 'Chủ nhiệm / Tác giả'],
                ['Duyệt sản phẩm', 'Chuyên viên (cần chốt)']
            ],
            rules: [
                'Sản phẩm cam kết phải APPROVED mới đủ điều kiện vào nghiệm thu (F06 BR-01).',
                'F08 chỉ gom bản sản phẩm ĐÃ DUYỆT vào lý lịch (view tổng hợp, không nhập tay).',
                '→ Cần bổ sung: danh mục phân loại, ma trận quyền, quy tắc duyệt.'
            ]
        }
    },
    F09: {
        code: 'F09', title: 'Đề tài Cấp trên (E4 — optional)',
        cols: ['Mã ĐT', 'Tên Đề tài', 'Cấp quản lý', 'Chủ nhiệm', 'Trạng thái'],
        data: [
            ['NN-25-002', 'Đánh giá an toàn hồ đập vùng Tây Bắc', 'Cấp Nhà nước', 'GS.TS Nguyễn X', 'Đang thực hiện'],
            ['BO-26-014', 'Công nghệ dự báo lũ lưu vực sông Cả', 'Cấp Bộ', 'PGS.TS Phạm Y', 'Đã duyệt']
        ],
        btn: 'Thêm đề tài cấp trên',
        spec: {
            purpose: 'Quản lý đề tài do cấp trên (Nhà nước/Bộ/Tỉnh) quản lý, trường tham gia. Năng lực E4 bật/tắt per-tenant (ADR-0012).',
            specWarning: 'Feature E4 optional (Draft) — bật/tắt theo tenant. Xác nhận scope với PO trước khi hiện thực.',
            statuses: ['Theo vòng đời đề tài rút gọn (tham chiếu F01–F06)'],
            actions: [['Quản lý hồ sơ đề tài cấp trên', 'Chuyên viên QL KHCN']],
            rules: ['Bật/tắt theo cấu hình tenant (variation-points) — tenant tắt E4 sẽ ẩn menu này.']
        }
    },
    F10: {
        code: 'F10', title: 'Đề tài Sinh viên (E4 — optional)', lifecycle: 'F10', activeStep: 2,
        cols: ['Mã ĐT', 'Tên Đề tài', 'Nhóm SV', 'GVHD', 'Đợt', 'Trạng thái'],
        data: [
            ['SV-26-021', 'App cảnh báo ngập lụt đô thị Hà Nội', 'Nhóm 62TH-01 (Trần Bình)', 'TS. Lê Thị Mai', 'DKG-2025-02', 'Chờ xác nhận GVHD'],
            ['SV-26-008', 'Mô hình thu nước mưa cho vùng khô hạn', 'Nhóm 61KT-03', 'ThS. Trần Văn Hùng', 'DKG-2025-02', 'Đang thực hiện'],
            ['SV-25-045', 'Vật liệu lọc nước giá rẻ từ phụ phẩm NN', 'Nhóm 60MT-02', 'PGS.TS Nguyễn Trọng', 'DKG-2024-02', 'Đạt']
        ],
        btn: 'Đăng ký / Hướng dẫn đề tài SV',
        spec: {
            purpose: 'Quản lý đề tài NCKH của sinh viên có GVHD, quy trình rút gọn có nghiệm thu; đề tài đạt sinh giờ giảng cho GVHD qua P03.',
            statuses: ['DRAFT → MENTOR_PENDING → SUBMITTED → APPROVED → IN_PROGRESS → FINAL_SUBMITTED → UNDER_ACCEPTANCE → PASSED/FAILED → COMPLETED / CANCELLED'],
            actions: [
                ['Quản lý đợt · sơ duyệt/phê duyệt · nghiệm thu · đóng đề tài', 'Chuyên viên QLKH/Khoa'],
                ['Xác nhận hướng dẫn (MENTOR_CONFIRM)', 'GV hướng dẫn'],
                ['Đăng ký/sửa nháp · nộp kết quả', 'Sinh viên']
            ],
            rules: [
                'BR-04: Bắt buộc ≥1 GVHD đã xác nhận trước khi nộp chính thức → chặn nộp nếu chưa.',
                'BR-01/02/03: Chỉ nộp trong đợt đang mở; SV chọn từ danh sách đồng bộ (không nhập tay); chặn vượt giới hạn số SV/nhóm.',
                'BR-07/13: Sau APPROVED, đổi thành viên/GVHD/tên/mục tiêu phải có lý do + audit.'
            ]
        }
    },
    F11: {
        code: 'F11', title: 'Dự án Phục vụ Sản xuất (E4 — optional)',
        cols: ['Mã DA', 'Tên Dự án', 'Đối tác/DN', 'Giá trị HĐ', 'Trạng thái'],
        data: [
            ['SX-26-003', 'Tư vấn thiết kế kênh tưới Bắc Hưng Hải', 'Cty TNHH Thủy lợi Hải Dương', '850.000.000đ', 'Đang thực hiện']
        ],
        btn: 'Thêm dự án',
        spec: {
            purpose: 'Quản lý dự án chuyển giao/phục vụ sản xuất với doanh nghiệp. Năng lực E4 optional (ADR-0012).',
            specWarning: 'Feature E4 optional (Draft) — cần PO xác nhận scope & vòng đời riêng.',
            statuses: ['Cần chốt enum vòng đời hợp đồng dự án'],
            actions: [['Quản lý hồ sơ dự án', 'Chuyên viên QL KHCN']],
            rules: ['Bật/tắt theo cấu hình tenant.']
        }
    },
    F12: {
        code: 'F12', title: 'Hoạt động Khoa học (E4 — optional)',
        cols: ['Mã HĐ', 'Tên Hoạt động', 'Loại', 'Thời gian', 'Trạng thái'],
        data: [
            ['HDKH-26-05', 'Hội thảo Quốc gia Thủy lợi 2026', 'Hội thảo', '15/03/2026', 'Đã duyệt'],
            ['HDKH-26-09', 'Seminar khoa Công trình - Chuyên đề đê điều', 'Seminar', '20/04/2026', 'Chờ duyệt']
        ],
        btn: 'Thêm hoạt động',
        spec: {
            purpose: 'Ghi nhận hoạt động khoa học (hội thảo, seminar, bình duyệt...) làm nguồn quy đổi giờ giảng P03. E4 optional.',
            specWarning: 'Feature E4 optional (Draft) — cần PO chốt danh mục loại hoạt động & quy tắc quy đổi.',
            statuses: ['Cần chốt enum'],
            actions: [['Ghi nhận / duyệt hoạt động', 'Chuyên viên / Quản trị']],
            rules: ['Là nguồn sự kiện cho P03 (quy đổi giờ giảng).']
        }
    },
    B01: {
        code: 'B01', title: 'Danh mục & Cấu hình (sys-config-service)',
        cols: ['Key', 'Phạm vi', 'Group', 'MIME', 'Active'],
        data: [
            ['catalog.research_field', 'Chung', 'catalog', 'application/json', 'Active'],
            ['catalog.position', 'Chung', 'catalog', 'application/json', 'Active'],
            ['budget.management_fee', 'Tenant: TLU', 'finance', 'application/json', 'Active'],
            ['home.widgets.lecturer', 'Tenant: TLU', 'ui', 'application/json', 'Active']
        ],
        btn: 'Tạo cấu hình',
        spec: {
            purpose: 'Kho cấu hình key–value dạng blob đa tenant, có fallback bản dùng chung; phục vụ dropdown/tham số vận hành mà không cần deploy lại (ADR-0013).',
            statuses: ['KHÔNG có status/workflow. Chỉ cờ boolean: active (ẩn/hiện khỏi UI chọn) + public (metadata). Xóa cứng, không versioning, không audit.'],
            actions: [
                ['Tạo/sửa/xóa bản CHUNG (tenantId=NULL)', 'super_admin'],
                ['Tạo/sửa/xóa bản của tenant', 'tenant_admin (tenant của mình)'],
                ['Đọc ngầm (không có UI)', 'user']
            ],
            rules: [
                'BR-01: (tenantId, key) duy nhất → tạo trùng báo 409 "đã tồn tại", gợi ý dùng Sửa.',
                'BR-06: Khi Sửa để trống ô nội dung = giữ nguyên content cũ (chỉ cập nhật metadata).',
                'BR-03/11: Đọc fallback bản riêng → bản shared; đang dùng bản chung phải ghi rõ "đang dùng bản Chung".'
            ]
        }
    },
    B03: {
        code: 'B03', title: 'Quản lý Người dùng (IAM)',
        cols: ['Họ tên', 'Email', 'Đơn vị', 'Vai trò', 'Nguồn', 'Trạng thái'],
        data: [
            ['Nguyễn Văn A', 'a.nv@tlu.edu.vn', 'Phòng KHCN', 'admin', 'ADMIN', 'Đang hoạt động'],
            ['TS. Lê Thị Mai', 'mai.lt@tlu.edu.vn', 'Khoa CNTT', 'author', 'AUTO', 'Đang hoạt động'],
            ['ThS. Trần Văn Hùng', 'hung.tv@tlu.edu.vn', 'Khoa Kinh tế', 'staff', 'AUTO', 'Tạm khóa'],
            ['Trần Bình', 'binh.t@e.tlu.edu.vn', '62TH', 'user', 'AUTO', 'Đang hoạt động']
        ],
        btn: 'Tạo tài khoản',
        spec: {
            purpose: 'Quản lý tập trung tài khoản (một vai trò cố định userType) gắn 1-1 với Keycloak (email+OTP), có ActivityLog. spec v0.4 bám code.',
            statuses: ['Tài khoản: Đang hoạt động · Tạm khóa · Ngừng hoạt động', 'UserType (cố định 4): admin(17q) · staff(11q) · author(3q) · user(1q)', 'AuthorUpgradeRequest: PENDING/APPROVED/REJECTED'],
            actions: [
                ['Tạo · sửa · khóa/mở · ngừng · đổi vai trò · duyệt nâng cấp author', 'admin'],
                ['Nộp yêu cầu nâng cấp author', 'user'],
                ['Xem danh sách/nhật ký', 'admin + staff']
            ],
            rules: [
                'BR-02: Không tự khóa/ngừng chính mình → nút Khóa disable trên tài khoản đang đăng nhập.',
                'BR-12: Phải còn ≥1 admin hoạt động → chặn khóa/đổi vai trò admin cuối cùng (409).',
                'BR-09: Email chỉ đọc sau tạo (Keycloak quản); BR-04: không xóa cứng khi có dữ liệu (chỉ soft delete).'
            ]
        }
    },
    MY_PROJECTS: {
        code: 'MY', title: 'Đề tài đang thực hiện của tôi', lifecycle: 'FMAIN',
        cols: ['Mã ĐT', 'Tên Đề tài', 'Vai trò', 'Kỳ báo cáo tới', 'Trạng thái'],
        data: [
            ['DX-26-001', '[Nghiên cứu A] Chống sạt lở đê biển Nam Định', 'Chủ nhiệm', '—', 'Chờ duyệt'],
            ['DT-26-003', '[Nghiên cứu C] Mô hình kinh tế tuần hoàn', 'Chủ nhiệm', '30/07/2026', 'Đúng hạn']
        ],
        btn: 'Đăng ký Đề xuất',
        spec: {
            purpose: 'Khung nhìn cá nhân của giảng viên: gom đề tài mình là chủ nhiệm/thành viên, deep-link sang F01/F04.',
            statuses: ['Hiển thị theo trạng thái đề tài nguồn (F01–F06)'],
            actions: [['Xem chi tiết · nộp báo cáo · đăng ký đề xuất mới', 'Chủ nhiệm']],
            rules: ['Lọc theo phạm vi dữ liệu người dùng (chỉ đề tài của mình).']
        }
    },
    F08: { code: 'F08', title: 'Lý lịch Khoa học', specialRender: 'F08' },
    P03: { code: 'P03', title: 'Quy đổi Giờ giảng NCKH', specialRender: 'P03' }
};

const fallbackData = (id) => ({
    code: id, title: `Danh sách dữ liệu ${id}`,
    cols: ['Mã ID', 'Tên / Nội dung chính', 'Ngày cập nhật', 'Trạng thái'],
    data: [[`M-${id}-01`, 'Dữ liệu mô phỏng 1', '04/07/2026', 'Đang hoạt động']],
    btn: 'Thêm mới'
});

// ---------------------------------------------------------------------
// 4. Điều hướng / khởi tạo
// ---------------------------------------------------------------------
let menuElementsMap = {};
let currentRole = 'admin';

document.addEventListener('DOMContentLoaded', () => switchRole('admin'));

function switchRole(role) {
    currentRole = role;
    const nameMap = {
        admin: { name: 'Nguyễn Văn A (Phòng KHCN)', avatar: 'AD' },
        lecturer: { name: 'TS. Lê Thị Mai (Khoa CNTT)', avatar: 'LM' },
        student: { name: 'Trần Bình (62TH)', avatar: 'TB' }
    };
    document.getElementById('user-name').innerText = nameMap[role].name;
    document.getElementById('user-avatar').innerText = nameMap[role].avatar;

    const navList = document.getElementById('sidebar-nav');
    navList.innerHTML = '';
    menuElementsMap = {};
    let firstMenuEl = null, firstItem = null;

    menus[role].forEach(group => {
        const header = document.createElement('div');
        header.className = 'nav-group-header';
        header.innerText = group.group;
        navList.appendChild(header);
        group.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.onclick = () => loadContent(item, li, role);
            li.innerHTML = `<i data-feather="${item.icon}" class="nav-icon"></i> <span>${item.label}</span>`;
            menuElementsMap[item.id] = li;
            navList.appendChild(li);
            if (!firstItem) { firstItem = item; firstMenuEl = li; }
        });
    });
    feather.replace();
    loadContent(firstItem, firstMenuEl, role);
}

function loadContent(item, menuElement, role) {
    const activeEl = menuElement || menuElementsMap[item.id];
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (activeEl) activeEl.classList.add('active');
    document.getElementById('page-title').innerText = item.label;
    document.getElementById('breadcrumb-current').innerText = item.label;

    const container = document.getElementById('content-body');
    if (item.id === 'B06') { renderDashboard(container, role); return; }

    const cfg = mockDB[item.id] || fallbackData(item.id);
    if (cfg.specialRender === 'F08') renderProfileF08(container);
    else if (cfg.specialRender === 'P03') renderWorkloadP03(container);
    else if (cfg.specialRender === 'F05') renderBudgetF05(container, cfg);
    else renderGenericTable(container, cfg);
}

function navigateFromShortcut(id, role) {
    let target = null;
    menus[role].forEach(g => { const f = g.items.find(i => i.id === id); if (f) target = f; });
    if (target) loadContent(target, null, role);
}

// ---------------------------------------------------------------------
// 5. Dashboard (B06)
// ---------------------------------------------------------------------
function renderDashboard(container, role) {
    let html = '';
    if (role === 'admin') {
        html = `
            <h3 class="section-h">Thao tác nhanh (Quick Actions)</h3>
            <div class="shortcut-grid">
                ${shortcut('F02','plus-circle','Mở Đợt Đăng ký Mới',role)}
                ${shortcut('F03','users','Lập Hội đồng Xét duyệt',role)}
                ${shortcut('F04','bell','Xem Đề tài Trễ hạn',role)}
                ${shortcut('F05','dollar-sign','Duyệt Kinh phí',role)}
            </div>
            <h3 class="section-h">Tổng quan Dữ liệu (ĐH Thủy Lợi)</h3>
            <div class="dashboard-grid">
                ${stat('Đề tài đang thực hiện','120','')}
                ${stat('Đợt kêu gọi đang mở','2','var(--warning)')}
                ${stat('Đề tài trễ hạn báo cáo','5','var(--danger)')}
                ${stat('Sản phẩm chờ duyệt','18','var(--primary-color)')}
            </div>
            <div class="dev-panel">
                <div class="dev-panel-title">📋 Đặc tả cho DEV — B06 Trang chủ</div>
                <ul class="dev-list">
                    <li><b>Read-only</b>: mọi widget chỉ điều hướng deep-link sang feature nguồn — không có nút tạo/sửa/duyệt (BR-02).</li>
                    <li><b>BR-01</b>: mọi widget lọc theo vai trò + phạm vi dữ liệu, <b>kiểm ở backend</b> (UI ẩn/hiện không thay thế).</li>
                    <li><b>BR-04</b>: ẩn widget của feature đang TẮT cho tenant (tenant tắt E4 → ẩn widget giờ giảng P03, đề tài SV F10).</li>
                    <li><b>BR-07</b>: khối thông báo chỉ hiện N=5 bản ghi IN_APP gần nhất; "Xem tất cả" → B04.</li>
                    <li>Trạng thái widget: <b>Đang tải (skeleton riêng) · Rỗng · Lỗi cục bộ</b> (lỗi 1 widget không hỏng cả trang).</li>
                </ul>
            </div>`;
    } else if (role === 'lecturer') {
        html = `
            <h3 class="section-h">Thao tác nhanh</h3>
            <div class="shortcut-grid">
                ${shortcut('MY_PROJECTS','file-plus','Đăng ký Đề cương mới',role)}
                ${shortcut('F07','book-open','Khai báo Bài báo / SP',role)}
                ${shortcut('P03','clock','Xem Quy đổi Giờ NCKH',role)}
            </div>
            <div class="dashboard-grid">
                ${stat('Đề tài Chủ nhiệm','2','')}
                ${stat('Bài báo khoa học','5','')}
                ${stat('Giờ chuẩn NCKH đạt được','550h','var(--success)')}
            </div>
            <div class="dev-panel"><div class="dev-panel-title">📋 Đặc tả cho DEV</div>
                <ul class="dev-list"><li>Widget "Việc cần làm" gom theo <b>statusSemantic chuẩn hoá của P01</b> (workflow engine dùng chung).</li>
                <li>Dải nhắc "Hoàn thiện hồ sơ" nếu F08 thiếu trường bắt buộc.</li></ul></div>`;
    } else {
        html = `
            <h3 class="section-h">Thao tác nhanh</h3>
            <div class="shortcut-grid">
                ${shortcut('F10','plus-square','Đăng ký Đề tài Mới',role)}
                ${shortcut('F10','upload','Nộp Báo cáo Tiến độ',role)}
            </div>
            <div class="dashboard-grid">
                ${stat('Đề tài NCKH tham gia','1','')}
                ${stat('Điểm Rèn luyện NCKH','+10','var(--success)')}
            </div>
            <div class="dev-panel"><div class="dev-panel-title">📋 Đặc tả cho DEV</div>
                <ul class="dev-list"><li>Vai trò <b>user</b> chỉ có 1 quyền nền (meetings.view); các widget NCKH SV thuộc E4 — ẩn nếu tenant tắt F10.</li></ul></div>`;
    }
    container.innerHTML = html;
    feather.replace();
}
const shortcut = (id, icon, label, role) =>
    `<div class="shortcut-card" onclick="navigateFromShortcut('${id}','${role}')"><i data-feather="${icon}" class="shortcut-icon"></i><br>${label}</div>`;
const stat = (title, value, color) =>
    `<div class="stat-card"><div class="stat-title">${title}</div><div class="stat-value"${color ? ` style="color:${color}"` : ''}>${value}</div></div>`;

// ---------------------------------------------------------------------
// 6. Bảng danh sách + panel "Đặc tả cho DEV"
// ---------------------------------------------------------------------
function renderGenericTable(container, config) {
    let thead = ''; config.cols.forEach(c => thead += `<th>${c}</th>`);
    let tbody = '';
    config.data.forEach(row => {
        let tr = `<tr class="clickable-row" onclick="viewDetail('${config.code}','${row[0]}','${(row[1]||'').replace(/'/g, "\\'")}')">`;
        row.forEach(cell => tr += `<td>${statusBadge(cell)}</td>`);
        tbody += tr + '</tr>';
    });
    const btnHtml = config.btn ? `<button class="btn btn-primary" onclick="openForm('${config.code}')"><i data-feather="plus"></i> ${config.btn}</button>` : '';

    container.innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <h3 class="panel-title">${config.title} <span class="feature-tag">${config.code}</span></h3>
                <div>
                    <button class="btn btn-outline" style="margin-right:8px"><i data-feather="filter"></i> Lọc/Tìm kiếm</button>
                    ${btnHtml}
                </div>
            </div>
            <div class="table-wrapper"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>
        </div>
        ${config.lifecycle ? '<p class="hint">Mẹo: Click một dòng để xem Chi tiết + Vòng đời (Lifecycle Stepper).</p>' : ''}
        ${renderDevPanel(config)}`;
    feather.replace();
}

function renderDevPanel(config) {
    const s = config.spec;
    if (!s) return '';
    const warn = s.specWarning ? `<div class="dev-warning">${s.specWarning}</div>` : '';
    const statuses = (s.statuses || []).map(x => `<li>${x}</li>`).join('');
    const actions = (s.actions || []).map(a => `<tr><td>${a[0]}</td><td class="role-cell">${a[1]}</td></tr>`).join('');
    const rules = (s.rules || []).map(r => `<li>${r}</li>`).join('');
    return `
        <div class="dev-panel">
            <div class="dev-panel-title">📋 Đặc tả cho DEV — ${config.code} · <a href="../docs/features/" class="dev-src">docs/features/…/spec.md</a></div>
            ${warn}
            <p class="dev-purpose"><b>Mục đích:</b> ${s.purpose}</p>
            <div class="dev-grid">
                <div class="dev-col">
                    <h4><i data-feather="git-branch"></i> Trạng thái (enum)</h4>
                    <ul class="dev-list">${statuses}</ul>
                </div>
                <div class="dev-col">
                    <h4><i data-feather="shield"></i> Hành động × Vai trò</h4>
                    <table class="dev-action-table"><tbody>${actions}</tbody></table>
                </div>
                <div class="dev-col">
                    <h4><i data-feather="alert-triangle"></i> Business rule ảnh hưởng UI</h4>
                    <ul class="dev-list">${rules}</ul>
                </div>
            </div>
        </div>`;
}

// ---------------------------------------------------------------------
// 7. Chi tiết record + Lifecycle Stepper (theo feature)
// ---------------------------------------------------------------------
const LIFECYCLES = {
    FMAIN: {
        title: 'Vòng đời Đề tài cấp trường',
        steps: ['1. Đề xuất', '2. Xét duyệt', '3. Thực hiện', '4. Kinh phí', '5. Nghiệm thu']
    },
    F10: {
        title: 'Vòng đời Đề tài Sinh viên',
        steps: ['1. Đăng ký', '2. Xác nhận GVHD', '3. Phê duyệt', '4. Thực hiện', '5. Nghiệm thu']
    }
};

function viewDetail(code, recordId, recordName) {
    const container = document.getElementById('content-body');
    const cfg = mockDB[code] || Object.values(mockDB).find(m => m.code === code) || {};
    const lc = LIFECYCLES[cfg.lifecycle];

    let stepperBlock = '';
    if (lc) {
        let activeStep = cfg.activeStep || 1;
        let stepTitle = `Đang ở bước: ${lc.steps[activeStep - 1]}`;
        // Override theo đề tài demo [Nghiên cứu A..E] để minh họa từng bước
        const map = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
        for (const k in map) {
            if (recordName && recordName.includes(`[Nghiên cứu ${k}]`)) {
                activeStep = cfg.lifecycle === 'FMAIN' ? map[k] : activeStep;
                stepTitle = `Đang ở bước: ${lc.steps[activeStep - 1]}`;
            }
        }
        let stepperHTML = '<div class="stepper-container">';
        lc.steps.forEach((label, i) => {
            const num = i + 1;
            let statusClass = '', icon = num;
            if (num < activeStep) { statusClass = 'completed'; icon = '<i data-feather="check" style="width:16px"></i>'; }
            else if (num === activeStep) statusClass = 'active';
            stepperHTML += `<div class="step ${statusClass}"><div class="step-circle">${icon}</div><div class="step-label">${label}</div></div>`;
        });
        stepperHTML += '</div>';
        stepperBlock = `
            <div class="detail-section">
                <div class="section-title">${lc.title} (Lifecycle)</div>
                <p class="step-current">${stepTitle}</p>
                ${stepperHTML}
            </div>`;
    }

    container.innerHTML = `
        <div class="detail-view">
            <div class="detail-header">
                <div>
                    <div class="detail-title">${recordName || recordId} <span class="feature-tag">${cfg.code || code}</span></div>
                    <div class="detail-subtitle">Phân hệ: ${cfg.title || code}</div>
                </div>
                <div>
                    <button class="btn btn-outline" onclick="document.querySelector('.nav-item.active').click()"><i data-feather="arrow-left"></i> Quay lại</button>
                    <button class="btn btn-primary"><i data-feather="edit-2"></i> Cập nhật / Xử lý</button>
                </div>
            </div>
            ${stepperBlock}
            <div class="detail-section">
                <div class="section-title">Thông tin Hồ sơ</div>
                <div class="grid-2-cols">
                    <div>
                        ${infoRow('Mã số', recordId)}
                        ${infoRow('Đơn vị chủ trì', 'Khoa Công trình, ĐH Thủy Lợi')}
                        ${infoRow('Cấp quản lý', 'Cấp Trường')}
                    </div>
                    <div>
                        ${infoRow('Trạng thái', '<span class="status-badge status-pending">Đang xử lý</span>')}
                        ${infoRow('Kinh phí dự kiến', '150.000.000 VNĐ')}
                        ${infoRow('Thời gian', '12 tháng')}
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <div class="section-title">Tệp đính kèm (Minh chứng)</div>
                <div class="info-row"><i data-feather="paperclip" style="margin-right:8px;color:var(--primary-color)"></i>
                    <a href="#" style="color:var(--primary-color);text-decoration:none">ThuyetMinh_DeTai_BanCuoi.pdf (2.4 MB)</a></div>
            </div>
            <div class="detail-section audit-section">
                <div class="section-title"><i data-feather="list" style="width:16px"></i> Nhật ký (AuditLog — append-only, luật bất biến §4)</div>
                <div class="audit-row"><span class="audit-time">04/07/2026 09:12</span> Chuyên viên A <b>tiếp nhận</b> hồ sơ</div>
                <div class="audit-row"><span class="audit-time">03/07/2026 16:40</span> Chủ nhiệm <b>nộp</b> đề xuất (sinh mã ${recordId})</div>
                <div class="audit-row"><span class="audit-time">01/07/2026 10:05</span> Chủ nhiệm <b>tạo</b> bản nháp</div>
            </div>
            ${renderDevPanel(cfg)}
        </div>`;
    feather.replace();
}
const infoRow = (label, value) => `<div class="info-row"><div class="info-label">${label}:</div><div class="info-value">${value}</div></div>`;

// ---------------------------------------------------------------------
// 8. Màn hình đặc thù
// ---------------------------------------------------------------------
function renderBudgetF05(container, cfg) {
    container.innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <h3 class="panel-title">${cfg.title} <span class="feature-tag">F05</span></h3>
                <button class="btn btn-primary"><i data-feather="check"></i> ${cfg.btn}</button>
            </div>
            <div class="table-wrapper"><table>
                <thead><tr>${cfg.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
                <tbody>${cfg.data.map(r => `<tr class="clickable-row" onclick="viewDetail('F05','${r[0]}','${r[1].replace(/'/g,"\\'")}')">${r.map(c => `<td>${statusBadge(c)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>
        </div>
        <div class="detail-section">
            <div class="section-title">Thẻ tổng kinh phí — DT-25-004 (minh họa BR-03)</div>
            <div class="dashboard-grid">
                ${stat('Kinh phí được cấp', '200.000.000đ', '')}
                ${stat('Phí quản lý (5%)', '10.000.000đ', 'var(--text-muted)')}
                ${stat('KP thực hiện (cấp − phí)', '190.000.000đ', 'var(--primary-color)')}
                ${stat('Đã chi', '120.000.000đ', 'var(--success)')}
            </div>
            <div class="dev-warning" style="margin-top:8px">⚠ BR-03: nếu tổng chi vượt <b>190.000.000đ</b> → vẫn cho lưu nhưng hiện cảnh báo "vượt kinh phí" (không chặn).</div>
        </div>
        ${renderDevPanel(cfg)}`;
    feather.replace();
}

function renderProfileF08(container) {
    container.innerHTML = `
        <div class="detail-view">
            <div class="detail-header">
                <div><div class="detail-title">Hồ sơ Lý lịch Khoa học <span class="feature-tag">F08</span></div>
                    <div class="detail-subtitle">Cập nhật lần cuối: 25/06/2026</div></div>
                <button class="btn btn-primary"><i data-feather="download"></i> Trích xuất CV (PDF)</button>
            </div>
            <div class="detail-section">
                <div class="section-title">Thông tin cá nhân (Cơ bản)</div>
                <div class="grid-2-cols">
                    <div>
                        <div class="form-group"><label class="form-label">Họ và tên *</label><input type="text" class="form-control" value="TS. Lê Thị Mai"></div>
                        <div class="form-group"><label class="form-label">Ngày sinh</label><input type="date" class="form-control" value="1985-05-12"></div>
                        <div class="form-group"><label class="form-label">Email <span class="lock-tag">🔒 Đồng bộ từ hệ thống xác thực</span></label><input type="text" class="form-control" value="mai.lt@tlu.edu.vn" disabled></div>
                    </div>
                    <div>
                        <div class="form-group"><label class="form-label">Trường/Viện <span class="lock-tag">tự động theo tenant</span></label><input type="text" class="form-control" value="Trường Đại học Thủy Lợi" disabled></div>
                        <div class="form-group"><label class="form-label">Phòng ban</label><select class="form-control"><option>Khoa Công nghệ thông tin</option></select></div>
                        <div class="form-group"><label class="form-label">Chức vụ</label><select class="form-control"><option>Giảng viên chính</option></select></div>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <div class="section-title">Học hàm & Học vị <span style="font-size:12px;font-weight:400;color:var(--text-muted)">(hai bảng tách biệt — BR-05)</span></div>
                <div class="grid-2-cols">
                    <div><b class="mini-h">Học hàm</b>
                        <table class="mini-table"><tr><td>PGS</td><td>2020</td></tr></table></div>
                    <div><b class="mini-h">Học vị</b>
                        <table class="mini-table"><tr><td>Tiến sĩ (TS)</td><td>2014</td></tr><tr><td>Thạc sĩ (ThS)</td><td>2009</td></tr></table></div>
                </div>
            </div>
            <div class="detail-section">
                <div class="section-title">Lý lịch khoa học (View tổng hợp — read-only)</div>
                <div class="grid-2-cols">
                    <div>${infoRow('Sản phẩm đã duyệt (F07)', '5 công bố')}${infoRow('Vai trò đề tài (F01/F04)', 'Chủ nhiệm 2 · Thành viên 3')}</div>
                    <div>${infoRow('Giờ giảng quy đổi (P03)', '550h')}${infoRow('Mẫu trích xuất', 'VP-CV-TPL (per-tenant)')}</div>
                </div>
            </div>
            ${renderDevPanel({ code: 'F08', spec: {
                purpose: 'Quản lý hồ sơ cá nhân (tự phục vụ) + khung nhìn lý lịch khoa học tổng hợp (hồ sơ + F07 + vai trò đề tài + P03) để xét duyệt & trích xuất CV.',
                statuses: ['Không có state machine record. "Đang công tác" = trường "Đến" trống. Mục giờ giảng ẩn/hiện theo tenant bật/tắt P03.'],
                actions: [['Xem/sửa hồ sơ của mình (PROFILE.*_OWN)', 'Mọi người dùng'], ['Xem/sửa hộ + trích xuất CV người khác', 'Chuyên viên, Admin']],
                rules: [
                    'BR-04: Tập trường hiển thị/bắt buộc cấu hình per-tenant — trường "ẩn" không render, trường "bắt buộc" gắn * và chặn lưu nếu trống.',
                    'BR-02/03: Email chỉ đọc (Keycloak); Trường/Viện hiển thị tự động theo tenant, không có ô nhập.',
                    'BR-07: Phần khoa học của lý lịch là VIEW tổng hợp — không nhập tay, chỉ gom sản phẩm đã duyệt.'
                ]
            }})}
        </div>`;
    feather.replace();
}

function renderWorkloadP03(container) {
    container.innerHTML = `
        <div class="detail-view">
            <div class="detail-header"><div><div class="detail-title">Báo cáo Quy đổi Giờ NCKH <span class="feature-tag">P03</span></div>
                <div class="detail-subtitle">Kỳ: Năm học 2026-2027 (ACADEMIC_YEAR)</div></div></div>
            <div class="dashboard-grid">
                <div class="stat-card" style="border-left:4px solid var(--border-color)"><div class="stat-title">Định mức Yêu cầu (theo chức danh)</div><div class="stat-value">500 <span class="unit">giờ</span></div></div>
                <div class="stat-card" style="border-left:4px solid var(--success)"><div class="stat-title">Tổng giờ Đã Quy đổi (hợp lệ)</div><div class="stat-value" style="color:var(--success)">550 <span class="unit">giờ</span></div></div>
            </div>
            <div class="panel" style="margin-top:8px">
                <div class="panel-header"><h3 class="panel-title">Chi tiết bản ghi quy đổi</h3></div>
                <div class="table-wrapper"><table>
                    <thead><tr><th>Số giờ</th><th>Vai trò</th><th>Nguồn sự kiện</th><th>Ngày nghiệp vụ</th><th>Công thức áp dụng</th></tr></thead>
                    <tbody>
                        <tr><td>200</td><td>Chủ nhiệm</td><td>Đề tài cấp trường (F04)</td><td>15/06/2026</td><td>CT-DT-2026 v2</td></tr>
                        <tr><td>150</td><td>Tác giả chính</td><td>Bài báo SCIE Q1 (F07)</td><td>20/05/2026</td><td>CT-BB-2026 v1</td></tr>
                        <tr><td>200</td><td>GVHD</td><td>Đề tài SV đạt (F10)</td><td>10/04/2026</td><td>CT-SV-2026 v1</td></tr>
                    </tbody>
                </table></div>
            </div>
            ${renderDevPanel({ code: 'P03', spec: {
                purpose: 'Cấu hình công thức/định mức (có version, hiệu lực theo ngày) quy đổi hoạt động khoa học ra giờ giảng; phân bổ theo vai trò; tự đổ về F08.',
                statuses: ['Kỳ: ACADEMIC_YEAR (mặc định) | FISCAL_YEAR', 'Công thức có version + validFrom/validTo'],
                actions: [['Cấu hình công thức (TEACHINGHOUR.CONFIG)', 'Quản trị'], ['Xem bản ghi (của mình)', 'Giảng viên'], ['Điều chỉnh/tính lại có lý do', 'Quản trị, Chuyên viên']],
                rules: [
                    'BR-09: Chặn lưu khi khoảng hiệu lực CHỒNG LẤN (cùng activityType + vai trò + periodType) → báo trùng.',
                    'BR-07/10: Điều chỉnh thủ công bắt buộc lý do + audit; đổi công thức không tự sửa bản ghi cũ, hồi tố phải chạy tính lại.',
                    'BR-05: Nhiều tác giả → nhập tỉ lệ đóng góp để phân bổ giờ.'
                ]
            }})}
        </div>`;
    feather.replace();
}

// =====================================================================
// 9. FORM NHẬP LIỆU CHI TIẾT (bối cảnh giảng viên ĐH Thủy Lợi)
//    F01 (đề xuất đề tài, nhiều bước) + F07/F09/F10/F12 (khai báo)
//    Dữ liệu điền sẵn là MÔ PHỎNG để trình bày với DEV.
// =====================================================================

// Dispatcher: nút "Tạo/Khai báo" mở form tương ứng (fallback = modal)
function openForm(code) {
    if (code === 'F01' || code === 'MY') { renderProposalFormF01(1); return; }
    if (FORM_SPECS[code]) { renderDeclareForm(code); return; }
    openModal((mockDB[code] && mockDB[code].title) || 'Tạo mới');
}

function backToList() { document.querySelector('.nav-item.active').click(); }

// --- Helper render field ---------------------------------------------
function field(f) {
    const req = f.required ? ' <span class="req">*</span>' : '';
    const full = (['textarea', 'table', 'file', 'static', 'group'].includes(f.type) || f.full) ? ' full' : '';
    const hint = f.hint ? `<div class="field-hint">${f.hint}</div>` : '';
    let inner = '';
    if (f.type === 'select') {
        inner = `<select class="form-control">${f.options.map(o => `<option${o === f.value ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
        inner = `<textarea class="form-control" rows="${f.rows || 3}">${f.value || ''}</textarea>`;
    } else if (f.type === 'table') {
        inner = miniTable(f.cols, f.rows, f.addLabel);
    } else if (f.type === 'file') {
        inner = `<div class="file-drop"><i data-feather="upload-cloud"></i> Kéo-thả hoặc chọn tệp minh chứng</div>` +
            (f.files || []).map(x => `<div class="file-chip"><i data-feather="paperclip"></i> ${x} <i data-feather="x" class="file-x"></i></div>`).join('');
    } else if (f.type === 'static') {
        inner = `<div class="static-value">${f.value}</div>`;
    } else if (f.type === 'checkbox') {
        inner = `<label class="chk"><input type="checkbox"${f.value ? ' checked' : ''}> ${f.chkLabel || ''}</label>`;
    } else {
        const t = f.type === 'date' ? 'date' : 'text';
        inner = `<input type="${t}" class="form-control" value="${f.value || ''}"${f.disabled ? ' disabled' : ''}${f.placeholder ? ` placeholder="${f.placeholder}"` : ''}>`;
    }
    const lock = f.disabled ? ` <span class="lock-tag">🔒 ${f.lockNote || 'chỉ đọc'}</span>` : '';
    return `<div class="form-group${full}"><label class="form-label">${f.label || ''}${req}${lock}</label>${inner}${hint}</div>`;
}
function fieldset(title, fields, note) {
    return `<div class="detail-section">
        <div class="section-title">${title}</div>
        ${note ? `<p class="hint">${note}</p>` : ''}
        <div class="form-fields">${fields.map(field).join('')}</div>
    </div>`;
}
function miniTable(cols, rows, addLabel) {
    return `<table class="form-table">
        <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>${addLabel ? `<button class="btn btn-outline btn-sm add-row"><i data-feather="plus"></i> ${addLabel}</button>` : ''}`;
}
function formHeader(title, code, subtitle, submitLabel) {
    return `<div class="detail-header">
        <div><div class="detail-title">${title} <span class="feature-tag">${code}</span></div>
            <div class="detail-subtitle">${subtitle}</div></div>
        <div>
            <button class="btn btn-outline" onclick="backToList()"><i data-feather="arrow-left"></i> Quay lại</button>
            <button class="btn btn-outline"><i data-feather="save"></i> Lưu nháp</button>
            <button class="btn btn-primary"><i data-feather="send"></i> ${submitLabel || 'Gửi'}</button>
        </div>
    </div>`;
}

// --- F01: Đăng ký đề xuất đề tài (form nhiều bước) --------------------
const F01_STEPS = ['1. Thông tin chung', '2. Thành viên', '3. Thuyết minh', '4. Dự toán', '5. Xem lại & Nộp'];

function renderProposalFormF01(step) {
    const container = document.getElementById('content-body');
    const cur = Math.min(Math.max(step || 1, 1), 5);

    let stepper = '<div class="stepper-container form-stepper">';
    F01_STEPS.forEach((label, i) => {
        const n = i + 1;
        const cls = n < cur ? 'completed' : (n === cur ? 'active' : '');
        const icon = n < cur ? '<i data-feather="check" style="width:16px"></i>' : n;
        stepper += `<div class="step ${cls}" onclick="renderProposalFormF01(${n})" style="cursor:pointer">
            <div class="step-circle">${icon}</div><div class="step-label">${label}</div></div>`;
    });
    stepper += '</div>';

    const body = F01_STEP_BODY[cur]();

    const prevBtn = cur > 1 ? `<button class="btn btn-outline" onclick="renderProposalFormF01(${cur - 1})"><i data-feather="chevron-left"></i> Bước trước</button>` : '<span></span>';
    const nextBtn = cur < 5
        ? `<button class="btn btn-primary" onclick="renderProposalFormF01(${cur + 1})">Bước tiếp <i data-feather="chevron-right"></i></button>`
        : `<button class="btn btn-primary"><i data-feather="send"></i> Nộp đề xuất</button>`;

    container.innerHTML = `
        <div class="detail-view">
            ${formHeader('Đăng ký đề xuất đề tài NCKH cấp Trường', 'F01', 'Chủ nhiệm: TS. Lê Thị Mai · Khoa CNTT · Kỳ DKG-2026-01 (đang mở, còn 18 ngày)', 'Nộp đề xuất')}
            <div class="detail-section" style="padding-top:26px">${stepper}</div>
            ${body}
            <div class="form-nav">${prevBtn}${nextBtn}</div>
            ${renderDevPanel(mockDB.F01)}
        </div>`;
    feather.replace();
}

const F01_STEP_BODY = {
    1: () => fieldset('Bước 1 — Thông tin chung', [
        { label: 'Tên đề tài', type: 'text', required: true, full: true,
          value: 'Ứng dụng học sâu (Deep Learning) dự báo lũ thời gian thực cho lưu vực sông Hồng – Thái Bình' },
        { label: 'Lĩnh vực nghiên cứu', type: 'select', required: true,
          options: ['Công nghệ thông tin', 'Kỹ thuật tài nguyên nước', 'Kỹ thuật xây dựng công trình thủy', 'Kỹ thuật môi trường', 'Kinh tế – Quản lý'],
          value: 'Công nghệ thông tin', hint: 'Chỉ hiện lĩnh vực thuộc kỳ DKG-2026-01 (F02).' },
        { label: 'Đơn vị chủ trì', type: 'select', required: true, options: ['Khoa Công nghệ thông tin', 'Khoa Công trình', 'Khoa Kỹ thuật tài nguyên nước'], value: 'Khoa Công nghệ thông tin' },
        { label: 'Kỳ kêu gọi', type: 'text', value: 'DKG-2026-01 · Đợt 1 NCKH Cấp Trường 2026', disabled: true, lockNote: 'chọn từ màn danh sách kỳ' },
        { label: 'Cấp quản lý', type: 'select', options: ['Cấp Trường', 'Cấp Khoa'], value: 'Cấp Trường' },
        { label: 'Thời gian thực hiện (tháng)', type: 'text', required: true, value: '12', hint: 'durationMonths > 0 (BR).' },
        { label: 'Kinh phí đề xuất (VNĐ)', type: 'text', required: true, value: '250.000.000', hint: 'Số nguyên ≥ 0, nhóm nghìn; khớp tổng Dự toán ở Bước 4.' },
        { label: 'Tóm tắt (abstract)', type: 'textarea', rows: 4, required: true,
          value: 'Nghiên cứu xây dựng mô hình học sâu (LSTM/Transformer) kết hợp dữ liệu mưa – mực nước – ảnh viễn thám để dự báo lũ trước 6–24 giờ cho hạ lưu sông Hồng – Thái Bình, tích hợp cảnh báo sớm phục vụ vận hành hồ chứa và phòng chống thiên tai.' }
    ], 'Trường bắt buộc gắn dấu <span class="req">*</span>. Form thuyết minh (Bước 3) render động theo proposalTemplateId của kỳ.'),

    2: () => fieldset('Bước 2 — Thành viên tham gia', [
        { type: 'table', full: true, addLabel: 'Thêm thành viên',
          cols: ['Họ và tên', 'Học hàm/vị', 'Đơn vị', 'Vai trò', 'Nhiệm vụ chính'],
          rows: [
            ['Lê Thị Mai', 'TS', 'Khoa CNTT, ĐH Thủy Lợi', '<span class="status-badge status-info">Chủ nhiệm</span>', 'Chủ trì, thiết kế mô hình DL'],
            ['Nguyễn Trọng', 'PGS.TS', 'Khoa Công trình', 'Thành viên', 'Chuyên gia thủy văn, hiệu chỉnh mô hình'],
            ['Trần Văn Hùng', 'ThS', 'Khoa CNTT', 'Thư ký', 'Xử lý dữ liệu, lập trình'],
            ['Phạm Minh D', 'NCS', 'Khoa CNTT', 'Thành viên', 'Thu thập & tiền xử lý dữ liệu']
          ] }
    ], 'projectRole: PRINCIPAL_INVESTIGATOR / MEMBER / SECRETARY. Mỗi đề tài đúng 1 chủ nhiệm.'),

    3: () => fieldset('Bước 3 — Thuyết minh đề tài (theo mẫu của kỳ)', [
        { label: 'Tính cấp thiết', type: 'textarea', rows: 3, required: true,
          value: 'Lũ lụt hạ lưu sông Hồng gây thiệt hại lớn hằng năm; các mô hình thủy văn truyền thống hạn chế về thời gian tính và độ chính xác dự báo ngắn hạn.' },
        { label: 'Mục tiêu', type: 'textarea', rows: 3, required: true,
          value: 'Xây dựng mô hình DL dự báo mực nước/lưu lượng trước 6–24h với sai số < 10%; đóng gói thành dịch vụ cảnh báo sớm.' },
        { label: 'Nội dung nghiên cứu', type: 'textarea', rows: 3, required: true,
          value: '1) Thu thập & chuẩn hoá dữ liệu mưa–mực nước 2010–2025; 2) Thiết kế kiến trúc LSTM/Transformer; 3) Huấn luyện & hiệu chỉnh; 4) Kiểm định với trận lũ lịch sử; 5) Triển khai API cảnh báo.' },
        { label: 'Phương pháp & cách tiếp cận', type: 'textarea', rows: 2,
          value: 'Kết hợp học sâu chuỗi thời gian với đồng hoá dữ liệu; đối chứng mô hình MIKE 11 hiện có.' },
        { type: 'table', full: true, addLabel: 'Thêm sản phẩm dự kiến',
          cols: ['Sản phẩm dự kiến', 'Loại', 'Chỉ tiêu chất lượng'],
          rows: [
            ['Bài báo khoa học', 'SCIE Q1/Q2', '≥ 01 bài (đăng/nhận đăng)'],
            ['Phần mềm cảnh báo lũ', 'Sản phẩm ứng dụng', 'Chạy thử nghiệm tại 01 trạm'],
            ['Đào tạo', 'Nhân lực', 'Hỗ trợ 01 học viên cao học']
          ] }
    ], 'proposalDocument lưu jsonb, các trường render theo template kỳ; trường bắt buộc gắn <span class="req">*</span>.'),

    4: () => fieldset('Bước 4 — Dự toán kinh phí', [
        { type: 'table', full: true, addLabel: 'Thêm khoản mục',
          cols: ['Khoản mục', 'Diễn giải', 'Thành tiền (VNĐ)'],
          rows: [
            ['Công lao động khoa học', 'Chủ nhiệm & nhóm nghiên cứu', '150.000.000'],
            ['Nguyên, nhiên vật liệu', 'Dữ liệu, thuê hạ tầng tính toán (GPU/cloud)', '45.000.000'],
            ['Hội thảo, công tác phí', 'Khảo sát thực địa, hội thảo báo cáo', '30.000.000'],
            ['Văn phòng phẩm, in ấn', 'In ấn, tài liệu', '10.000.000'],
            ['Chi phí quản lý (5%)', 'Nộp Trường theo quy định', '15.000.000'],
            ['<b>TỔNG CỘNG</b>', '', '<b>250.000.000</b>']
          ] }
    ], 'Tổng dự toán phải khớp Kinh phí đề xuất ở Bước 1. Chi tiết giải ngân do F05 quản lý sau khi trúng tuyển.'),

    5: () => `
        <div class="detail-section">
            <div class="section-title">Bước 5 — Tài liệu đính kèm</div>
            <div class="form-fields">
                ${field({ type: 'file', label: 'Hồ sơ đề xuất', full: true,
                    files: ['ThuyetMinh_DuBaoLu_DeepLearning.pdf (2.4 MB)', 'LyLichKhoaHoc_LeThiMai.pdf (0.8 MB)', 'DuToan_KinhPhi.xlsx (46 KB)'] })}
            </div>
        </div>
        <div class="detail-section">
            <div class="section-title">Kiểm tra điều kiện nộp (BR-01 / BR-02)</div>
            ${checkRow(true, 'Kỳ DKG-2026-01 đang mở và còn hạn (còn 18 ngày)')}
            ${checkRow(true, 'Đã nhập đủ trường bắt buộc: tên, lĩnh vực, thời gian, kinh phí, tóm tắt, thuyết minh')}
            ${checkRow(true, 'Có tối thiểu 1 chủ nhiệm; tổng dự toán khớp kinh phí đề xuất')}
            ${checkRow(false, 'Chưa đính kèm Phiếu đồng ý của đơn vị chủ trì (không bắt buộc)')}
            <p class="hint" style="margin-top:12px">Nút "Nộp đề xuất" chỉ bật khi mọi điều kiện bắt buộc đạt. Sau khi nộp: sinh <b>projectCode</b>, hồ sơ chuyển <b>chỉ đọc</b> (BR-05/07).</p>
        </div>`
};
const checkRow = (ok, text) =>
    `<div class="check-row"><i data-feather="${ok ? 'check-circle' : 'circle'}" class="${ok ? 'chk-ok' : 'chk-off'}"></i> ${text}</div>`;

// --- F07 / F09 / F10 / F12: Form khai báo -----------------------------
const FORM_SPECS = {
    F07: {
        title: 'Khai báo Sản phẩm Khoa học', code: 'F07',
        subtitle: 'Người khai: TS. Lê Thị Mai · Khoa CNTT, ĐH Thủy Lợi',
        submit: 'Gửi duyệt',
        sections: [
            ['Loại & Thông tin chung', [
                { label: 'Loại sản phẩm', type: 'select', required: true,
                  options: ['Bài báo khoa học', 'Sách / Giáo trình / Chương sách', 'Sáng chế / Giải pháp hữu ích', 'Báo cáo hội nghị (proceedings)', 'Giải thưởng KHCN', 'Sản phẩm ứng dụng / Chuyển giao'],
                  value: 'Bài báo khoa học', hint: 'Chọn loại → hệ thống hiện bộ trường tương ứng.' },
                { label: 'Tên sản phẩm / Tiêu đề', type: 'text', required: true, full: true,
                  value: 'Deep learning-based real-time flood forecasting for the Red River basin' },
                { label: 'Ngôn ngữ', type: 'select', options: ['Tiếng Anh', 'Tiếng Việt', 'Khác'], value: 'Tiếng Anh' },
                { label: 'Năm công bố', type: 'text', required: true, value: '2026', hint: '≤ năm hiện tại.' }
            ], 'Bối cảnh minh họa: bài báo SCIE thuộc đề tài dự báo lũ của giảng viên.'],
            ['Thông tin công bố (Bài báo)', [
                { label: 'Tạp chí / Nhà xuất bản', type: 'text', required: true, value: 'Journal of Hydrology (Elsevier)' },
                { label: 'Phân loại', type: 'select', required: true, options: ['SCIE', 'SSCI', 'ESCI', 'Scopus', 'ACI', 'Danh mục HĐGSNN', 'Khác'], value: 'SCIE' },
                { label: 'Xếp hạng tạp chí', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4', 'Không xếp hạng'], value: 'Q1' },
                { label: 'Chỉ số ảnh hưởng (IF)', type: 'text', value: '6.4' },
                { label: 'ISSN', type: 'text', value: '0022-1694' },
                { label: 'DOI', type: 'text', value: '10.1016/j.jhydrol.2026.13xxxx' },
                { label: 'Tập / Số / Trang', type: 'text', value: 'Vol. 640 / — / 131025' }
            ]],
            ['Tác giả & Tỷ lệ đóng góp', [
                { type: 'table', full: true, addLabel: 'Thêm tác giả',
                  cols: ['Họ và tên', 'Vai trò', 'Đơn vị', 'Tỷ lệ đóng góp (%)'],
                  rows: [
                    ['Lê Thị Mai', '<span class="status-badge status-info">Tác giả chính & liên hệ</span>', 'Khoa CNTT, ĐH Thủy Lợi', '60'],
                    ['Nguyễn Trọng', 'Đồng tác giả', 'Khoa Công trình, ĐH Thủy Lợi', '25'],
                    ['Phạm Minh D', 'Đồng tác giả', 'Khoa CNTT, ĐH Thủy Lợi', '15']
                  ] }
            ], 'Tỷ lệ đóng góp dùng để P03 phân bổ giờ giảng quy đổi cho từng tác giả (BR-05).'],
            ['Liên kết & Minh chứng', [
                { label: 'Thuộc đề tài', type: 'select', options: ['DT-26-003 · Dự báo lũ Deep Learning', 'DT-25-004 · Vật liệu mới đập thủy điện', 'Không thuộc đề tài nào'], value: 'DT-26-003 · Dự báo lũ Deep Learning' },
                { label: 'Sản phẩm cam kết của đề tài?', type: 'checkbox', chkLabel: 'Có — tính vào điều kiện nghiệm thu (F06)', value: true },
                { type: 'file', label: 'Tệp minh chứng', full: true, files: ['FullText_JHydrol_2026.pdf (3.1 MB)', 'BiaTapChi_Scopus.png (0.4 MB)'] }
            ]]
        ],
        spec: {
            purpose: 'Giảng viên tự khai báo sản phẩm KHCN; sau khi duyệt sẽ đổ vào Lý lịch (F08) và làm nguồn quy đổi giờ giảng (P03).',
            specWarning: '⚠ spec.md F07 hiện RỖNG — bộ trường & danh mục phân loại dưới đây là ĐỀ XUẤT, cần PO/BA chốt.',
            statuses: ['Đề xuất: Nháp → Chờ duyệt → Đã duyệt (APPROVED) / Trả lại'],
            actions: [['Khai báo / sửa (khi Nháp/Trả lại)', 'Tác giả (giảng viên)'], ['Duyệt / trả lại', 'Chuyên viên QL KHCN']],
            rules: [
                'Bộ trường thay đổi theo "Loại sản phẩm" — mỗi loại một schema riêng.',
                'Chỉ sản phẩm ĐÃ DUYỆT mới hiện trong lý lịch F08 và tính giờ P03.',
                'Sản phẩm cam kết phải APPROVED mới đủ điều kiện đăng ký nghiệm thu (F06 BR-01).'
            ]
        }
    },

    F09: {
        title: 'Khai báo Đề tài Cấp trên', code: 'F09',
        subtitle: 'Người khai: TS. Lê Thị Mai · tham gia đề tài cấp Nhà nước/Bộ',
        submit: 'Gửi duyệt',
        sections: [
            ['Thông tin đề tài', [
                { label: 'Tên đề tài', type: 'text', required: true, full: true,
                  value: 'Nghiên cứu giải pháp cảnh báo sớm lũ quét, sạt lở đất khu vực miền núi phía Bắc' },
                { label: 'Mã số đề tài', type: 'text', value: 'ĐTĐL.CN-42/23' },
                { label: 'Cấp quản lý', type: 'select', required: true,
                  options: ['Cấp Nhà nước', 'Cấp Bộ', 'Cấp Tỉnh/Thành phố', 'Quỹ NAFOSTED', 'Nghị định thư / Hợp tác quốc tế', 'Khác'], value: 'Cấp Nhà nước' },
                { label: 'Cơ quan chủ trì', type: 'text', value: 'Trường Đại học Thủy Lợi' },
                { label: 'Cơ quan quản lý', type: 'text', value: 'Bộ Khoa học và Công nghệ' },
                { label: 'Vai trò của tôi', type: 'select', required: true,
                  options: ['Chủ nhiệm', 'Thư ký khoa học', 'Thành viên chính', 'Thành viên'], value: 'Thành viên chính' }
            ], 'Năng lực E4 (optional per-tenant). Giảng viên khai báo để ghi nhận vào lý lịch & quy đổi giờ.'],
            ['Thời gian & Kinh phí', [
                { label: 'Thời gian bắt đầu', type: 'date', value: '2023-01-01' },
                { label: 'Thời gian kết thúc', type: 'date', value: '2025-12-31' },
                { label: 'Tổng kinh phí (VNĐ)', type: 'text', value: '4.500.000.000' },
                { label: 'Kết quả nghiệm thu', type: 'select',
                  options: ['Đang thực hiện', 'Đã nghiệm thu – Xuất sắc', 'Đã nghiệm thu – Đạt', 'Không đạt'], value: 'Đang thực hiện' }
            ]],
            ['Tóm tắt & Minh chứng', [
                { label: 'Tóm tắt nội dung / kết quả', type: 'textarea', rows: 3, full: true,
                  value: 'Xây dựng hệ thống quan trắc và mô hình cảnh báo sớm lũ quét – sạt lở cho 5 tỉnh miền núi phía Bắc; chuyển giao quy trình cảnh báo cho địa phương.' },
                { type: 'file', label: 'Tệp minh chứng', full: true,
                  files: ['QuyetDinh_GiaoDeTai_BoKHCN.pdf (1.2 MB)', 'HopDong_NghienCuu.pdf (0.9 MB)'] }
            ]]
        ],
        spec: {
            purpose: 'Ghi nhận việc giảng viên tham gia đề tài do cấp trên quản lý; nguồn cho lý lịch F08 và quy đổi giờ P03.',
            specWarning: '⚠ Feature E4 (optional, Draft) — bật/tắt theo tenant; enum kết quả & quyền duyệt cần PO chốt.',
            statuses: ['Khai báo: Nháp → Chờ duyệt → Đã duyệt', 'Kết quả đề tài: Đang thực hiện / Đạt / Xuất sắc / Không đạt'],
            actions: [['Khai báo / sửa', 'Giảng viên'], ['Duyệt & đối chiếu minh chứng', 'Chuyên viên QL KHCN']],
            rules: [
                'Chỉ hiện menu khi tenant BẬT E4 (variation-points).',
                'Vai trò + cấp quản lý quyết định hệ số quy đổi giờ ở P03.',
                'Minh chứng (QĐ giao/HĐ/BB nghiệm thu) bắt buộc trước khi duyệt.'
            ]
        }
    },

    F10: {
        title: 'Đăng ký / Hướng dẫn Đề tài Sinh viên', code: 'F10',
        subtitle: 'GVHD: TS. Lê Thị Mai · Khoa CNTT · Đợt DKG-2025-02',
        submit: 'Xác nhận hướng dẫn',
        sections: [
            ['Thông tin đề tài', [
                { label: 'Tên đề tài', type: 'text', required: true, full: true,
                  value: 'Xây dựng ứng dụng di động cảnh báo ngập lụt đô thị Hà Nội theo thời gian thực' },
                { label: 'Lĩnh vực', type: 'select', required: true, options: ['Công nghệ thông tin', 'Kỹ thuật tài nguyên nước', 'Kỹ thuật môi trường'], value: 'Công nghệ thông tin' },
                { label: 'Đợt đăng ký', type: 'text', value: 'DKG-2025-02 · SV NCKH 2025', disabled: true, lockNote: 'chọn từ đợt đang mở' },
                { label: 'Đơn vị quản lý', type: 'select', options: ['Khoa Công nghệ thông tin', 'Khoa Công trình'], value: 'Khoa Công nghệ thông tin' },
                { label: 'Mục tiêu', type: 'textarea', rows: 2, required: true,
                  value: 'Thu thập dữ liệu ngập theo thời gian thực từ cảm biến + mạng xã hội, hiển thị bản đồ cảnh báo trên ứng dụng di động.' },
                { label: 'Sản phẩm dự kiến', type: 'textarea', rows: 2,
                  value: 'Ứng dụng Android; báo cáo tổng kết; 01 bài báo hội nghị sinh viên.' }
            ], 'Quy trình rút gọn có nghiệm thu. Đề tài đạt sinh giờ giảng cho GVHD qua P03.'],
            ['Nhóm sinh viên thực hiện', [
                { type: 'table', full: true, addLabel: 'Thêm sinh viên (tối đa 5)',
                  cols: ['Họ và tên', 'Mã SV', 'Lớp', 'Vai trò'],
                  rows: [
                    ['Trần Bình', '6215TH001', '62TH', '<span class="status-badge status-info">Trưởng nhóm</span>'],
                    ['Lê Hoàng An', '6215TH014', '62TH', 'Thành viên'],
                    ['Phạm Thu Hà', '6215TH027', '62TH', 'Thành viên']
                  ] }
            ], 'BR-02: SV chọn từ danh sách đồng bộ (không nhập tay). BR-03: chặn khi vượt giới hạn số SV/nhóm.'],
            ['Giảng viên hướng dẫn', [
                { label: 'GVHD', type: 'text', value: 'TS. Lê Thị Mai (Khoa CNTT)', disabled: true, lockNote: 'tài khoản đang đăng nhập' },
                { label: 'Trạng thái xác nhận', type: 'static', value: '<span class="status-badge status-pending">Chờ xác nhận GVHD</span>' }
            ], 'BR-04: bắt buộc ≥1 GVHD đã xác nhận trước khi nộp chính thức — nếu chưa, chặn nộp.']
        ],
        spec: {
            purpose: 'Sinh viên đăng ký, GVHD xác nhận hướng dẫn; đề tài đạt → sinh giờ giảng cho GVHD (P03).',
            statuses: ['DRAFT → MENTOR_PENDING → SUBMITTED → APPROVED → IN_PROGRESS → UNDER_ACCEPTANCE → PASSED/FAILED → COMPLETED'],
            actions: [['Đăng ký / sửa nháp', 'Sinh viên'], ['Xác nhận hướng dẫn (MENTOR_CONFIRM)', 'GV hướng dẫn'], ['Sơ duyệt / phê duyệt / nghiệm thu', 'Chuyên viên QLKH Khoa']],
            rules: [
                'BR-04: phải có ≥1 GVHD đã xác nhận mới cho nộp chính thức.',
                'BR-01/03: chỉ nộp trong đợt đang mở; chặn khi vượt số SV tối đa/nhóm.',
                'BR-07/13: sau APPROVED, đổi thành viên/GVHD/tên/mục tiêu phải có lý do + ghi AuditLog.'
            ]
        }
    },

    F12: {
        title: 'Khai báo Hoạt động Khoa học', code: 'F12',
        subtitle: 'Người khai: TS. Lê Thị Mai · Khoa CNTT, ĐH Thủy Lợi',
        submit: 'Gửi duyệt',
        sections: [
            ['Thông tin hoạt động', [
                { label: 'Tên hoạt động', type: 'text', required: true, full: true,
                  value: 'Hội thảo Quốc gia lần thứ 5: Thủy văn – Tài nguyên nước và Biến đổi khí hậu 2026' },
                { label: 'Loại hoạt động', type: 'select', required: true,
                  options: ['Hội thảo / Hội nghị khoa học', 'Seminar khoa học', 'Phản biện / Bình duyệt bài báo', 'Biên tập tạp chí', 'Tham gia hội đồng khoa học', 'Khác'], value: 'Hội thảo / Hội nghị khoa học' },
                { label: 'Cấp', type: 'select', required: true, options: ['Quốc tế', 'Quốc gia', 'Cấp Trường', 'Cấp Khoa'], value: 'Quốc gia' },
                { label: 'Vai trò', type: 'select', required: true,
                  options: ['Báo cáo viên (oral)', 'Trình bày poster', 'Chủ tọa phiên', 'Ban tổ chức / Ban chương trình', 'Tham dự'], value: 'Báo cáo viên (oral)' }
            ], 'Nguồn quy đổi giờ giảng P03 (hệ số theo loại + cấp + vai trò).'],
            ['Thời gian & Địa điểm', [
                { label: 'Từ ngày', type: 'date', value: '2026-03-15' },
                { label: 'Đến ngày', type: 'date', value: '2026-03-16' },
                { label: 'Địa điểm', type: 'text', value: 'Hà Nội' },
                { label: 'Đơn vị tổ chức', type: 'text', value: 'Hội Thủy lợi Việt Nam & Trường ĐH Thủy Lợi' }
            ]],
            ['Nội dung đóng góp & Minh chứng', [
                { label: 'Tên báo cáo / đóng góp (nếu có)', type: 'text', full: true,
                  value: 'Ứng dụng học sâu trong dự báo lũ ngắn hạn lưu vực sông Hồng' },
                { type: 'file', label: 'Tệp minh chứng', full: true,
                  files: ['GiayMoi_BaoCaoVien.pdf (0.6 MB)', 'GiayChungNhan_HoiThao.pdf (0.5 MB)', 'KyYeu_TrichDan.pdf (1.1 MB)'] }
            ]]
        ],
        spec: {
            purpose: 'Ghi nhận hoạt động khoa học của giảng viên (hội thảo, seminar, bình duyệt...) làm nguồn quy đổi giờ giảng P03.',
            specWarning: '⚠ Feature E4 (optional, Draft) — cần PO chốt danh mục loại hoạt động & bảng hệ số quy đổi.',
            statuses: ['Khai báo: Nháp → Chờ duyệt → Đã duyệt'],
            actions: [['Khai báo / sửa', 'Giảng viên'], ['Duyệt & đối chiếu minh chứng', 'Chuyên viên QL KHCN']],
            rules: [
                'Chỉ hiện menu khi tenant BẬT E4.',
                'Loại + cấp + vai trò quyết định số giờ quy đổi ở P03 (BR liên quan công thức).',
                'Minh chứng (giấy mời/chứng nhận/kỷ yếu) bắt buộc trước khi duyệt.'
            ]
        }
    }
};

function renderDeclareForm(code) {
    const container = document.getElementById('content-body');
    const f = FORM_SPECS[code];
    const warn = f.spec && f.spec.specWarning ? `<div class="dev-warning">${f.spec.specWarning}</div>` : '';
    const sections = f.sections.map(sec => fieldset(sec[0], sec[1], sec[2])).join('');
    container.innerHTML = `
        <div class="detail-view">
            ${formHeader(f.title, f.code, f.subtitle, f.submit)}
            ${warn}
            ${sections}
            ${renderDevPanel(f)}
        </div>`;
    feather.replace();
}

// ---------------------------------------------------------------------
// 10. Modal generic (fallback)
// ---------------------------------------------------------------------
function openModal(title) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('demo-modal').style.display = 'flex';
    document.getElementById('modal-title').innerText = title || 'Tạo mới';
    document.getElementById('modal-body').innerHTML =
        `<div class="form-group"><label class="form-label">Tên / Tiêu đề</label><input type="text" class="form-control" placeholder="Nhập thông tin..."></div>
         <p class="hint">Form thực tế render động theo template của feature (xem spec.md).</p>`;
}
function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('demo-modal').style.display = 'none';
}
