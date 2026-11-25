# Kiểm kê nút và danh sách chọn của RMS

Mỗi dòng trỏ tới một vị trí JSX trong ứng dụng. Các bảng lặp theo hồ sơ hoặc cấu hình có một dòng cho biểu thức sinh điều khiển. Cột cuối ghi callback, đích đến hoặc hành vi của component cha. Dấu ngoặc nhọn biểu thị tên lấy từ dữ liệu.

Đã đọc 95 tệp TSX trong `apps/web/src`. Bảng có 559 vị trí, gồm cả liên kết và những nơi gọi bộ chọn dùng chung. [Phạm vi kiểm tra trên trình duyệt](ra-soat-dieu-khien-shadcn.md).

## App.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [38](../../apps/web/src/App.tsx#L38) | Nút thao tác | Tải lại | location.reload() |
| [41](../../apps/web/src/App.tsx#L41) | Nút hộp thoại | Khôi phục dữ liệu mẫu | AlertDialogTrigger |
| [48](../../apps/web/src/App.tsx#L48) | Hủy | Hủy | Đóng hộp xác nhận |
| [49](../../apps/web/src/App.tsx#L49) | Xác nhận | Khôi phục | this.props.onRecover |
| [143](../../apps/web/src/App.tsx#L143) | Nút thao tác | Đóng | setError("") |
| [157](../../apps/web/src/App.tsx#L157) | Liên kết | Về tổng quan | routeUrl("B06") |

## auth/AccountHome.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [75](../../apps/web/src/auth/AccountHome.tsx#L75) | Liên kết | Về trang chủ | location.pathname |
| [84](../../apps/web/src/auth/AccountHome.tsx#L84) | Nút thao tác | Đăng nhập lại | location.reload() |
| [95](../../apps/web/src/auth/AccountHome.tsx#L95) | Mở / thu gọn | Giao diện đơn vị | setEditor(!editor) |
| [97](../../apps/web/src/auth/AccountHome.tsx#L97) | Mở / thu gọn | Cấu hình quy trình | setFlowOpen(!flowOpen) |
| [99](../../apps/web/src/auth/AccountHome.tsx#L99) | Mở / thu gọn | Kỳ nhận đề xuất | setCallsOpen(!callsOpen) |
| [100](../../apps/web/src/auth/AccountHome.tsx#L100) | Mở / thu gọn | Xét duyệt hội đồng | setReviewOpen(!reviewOpen) |
| [101](../../apps/web/src/auth/AccountHome.tsx#L101) | Mở / thu gọn | Phiếu nghiệm thu | setAcceptance(!acceptance) |
| [104](../../apps/web/src/auth/AccountHome.tsx#L104) | Mở / thu gọn | Báo cáo theo kỳ | setReportOpen(!reportOpen) |
| [107](../../apps/web/src/auth/AccountHome.tsx#L107) | Mở / thu gọn | Hồ sơ cá nhân | setProfileOpen(!profileOpen) |
| [108](../../apps/web/src/auth/AccountHome.tsx#L108) | Mở / thu gọn | Lý lịch khoa học | setCvOpen(!cvOpen) |
| [109](../../apps/web/src/auth/AccountHome.tsx#L109) | Mở / thu gọn | Sản phẩm ngoài đề tài | setIndependentOpen(!independentOpen) |
| [113](../../apps/web/src/auth/AccountHome.tsx#L113) | Mở / thu gọn | Quản lý người dùng | setDirectoryOpen(!directoryOpen) |
| [115](../../apps/web/src/auth/AccountHome.tsx#L115) | Mở / thu gọn | Hồ sơ nghiên cứu | setHistoryOpen(!historyOpen) |
| [117](../../apps/web/src/auth/AccountHome.tsx#L117) | Mở / thu gọn | Cấu hình hệ thống | setConfigOpen(!configOpen) |
| [119](../../apps/web/src/auth/AccountHome.tsx#L119) | Nút thao tác | Tải lại thông tin | { setAccount(undefined); setGeneration(generation+1) } |
| [120](../../apps/web/src/auth/AccountHome.tsx#L120) | Nút thao tác | Đăng xuất | logout().catch(() =&gt; setError("Không thể đăng xuất. Hãy thử lại.")) |

## demo/FixtureSignIn.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [72](../../apps/web/src/demo/FixtureSignIn.tsx#L72) | Gửi biểu mẫu | {challenge ? "Đăng nhập" : "Nhận mã mô phỏng"} | Gửi qua onSubmit của biểu mẫu |

## demo/Home.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [188](../../apps/web/src/demo/Home.tsx#L188) | Liên kết | {admin ? "Mở cấu hình" : call ? "Xem thông tin kỳ" : "Xem thông báo"} | heroUrl |
| [197](../../apps/web/src/demo/Home.tsx#L197) | Liên kết | {label} {n.toLocaleString("vi-VN")} | routeUrl(dest) |
| [239](../../apps/web/src/demo/Home.tsx#L239) | Liên kết | {t.title} {t.detail} {t.date ? " · " + vietnamDate(t.date) : ""} | routeUrl(t.feature, t.target) |
| [265](../../apps/web/src/demo/Home.tsx#L265) | Mở / thu gọn | {allTasks ? "Thu gọn" : "Xem thêm " + (tasks.length - 4) + " việc"} | setAllTasks(!allTasks) |
| [302](../../apps/web/src/demo/Home.tsx#L302) | Liên kết | {r.title} {r.fields.code &#124;&#124; "Bản nháp"} · {r.unit} | routeUrl(featureOf(r, session), r.id) |
| [322](../../apps/web/src/demo/Home.tsx#L322) | Liên kết | Lý lịch của tôi | routeUrl("F08") |
| [327](../../apps/web/src/demo/Home.tsx#L327) | Liên kết | Yêu cầu nâng quyền | routeUrl("B03", "requests") |
| [331](../../apps/web/src/demo/Home.tsx#L331) | Liên kết | Các kỳ đề xuất | routeUrl("F02") |
| [343](../../apps/web/src/demo/Home.tsx#L343) | Liên kết | Xem tất cả | routeUrl("B04") |
| [349](../../apps/web/src/demo/Home.tsx#L349) | Liên kết | {n.title} {n.fields.text &#124;&#124; "Thông báo trong ứng dụng"} | routeUrl("B04", n.id) |

## demo/ServiceStatus.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [23](../../apps/web/src/demo/ServiceStatus.tsx#L23) | Nút thao tác | Kiểm tra lại | { setStatus("loading"); setAttempt(attempt + 1) } |

## demo/Shell.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [120](../../apps/web/src/demo/Shell.tsx#L120) | Mở / thu gọn | Đơn vị làm việc {tenants[session.tenant]} | openSession |
| [135](../../apps/web/src/demo/Shell.tsx#L135) | Mở / thu gọn | {group} | setExpanded((prev) =&gt; (show ? prev.filter((g) =&gt; g !== group) : [...prev, group])) |
| [149](../../apps/web/src/demo/Shell.tsx#L149) | Liên kết | {label} | setMenu(false) |
| [165](../../apps/web/src/demo/Shell.tsx#L165) | Mở / thu gọn | {initials(session.name)} {session.name} {roleNames[session.role]} | openSession |
| [221](../../apps/web/src/demo/Shell.tsx#L221) | Liên kết | Đi đến nội dung | (e) =&gt; { e.preventDefault() document.getElementById("main")?.focus() } |
| [234](../../apps/web/src/demo/Shell.tsx#L234) | Mở / thu gọn | Mở điều hướng | { rememberOpener(); setMenu(true) } |
| [256](../../apps/web/src/demo/Shell.tsx#L256) | Mở / thu gọn | Tìm kiếm | { rememberOpener() setQuery("") setDialog("search") } |
| [271](../../apps/web/src/demo/Shell.tsx#L271) | Mở / thu gọn | "Thông báo, " + countUnread() + " chưa đọc" | { rememberOpener(); setDialog("notices") } |
| [280](../../apps/web/src/demo/Shell.tsx#L280) | Mở / thu gọn | Phiên mô phỏng | openSession |
| [295](../../apps/web/src/demo/Shell.tsx#L295) | Liên kết | {id === "B04" ? "Hộp thư" : id === "F02" ? "Kỳ đề xuất" : item.label} | routeUrl(id) |
| [321](../../apps/web/src/demo/Shell.tsx#L321) | Liên kết | {n.title} {n.status === "UNREAD" ? "Chưa đọc" : "Đã đọc"} | routeUrl("B04", n.id) |
| [336](../../apps/web/src/demo/Shell.tsx#L336) | Liên kết | Mở hộp thư | routeUrl("B04") |
| [365](../../apps/web/src/demo/Shell.tsx#L365) | Danh sách chọn | Đơn vị | choiceValue =&gt; setTenant(choiceValue as Tenant) |
| [378](../../apps/web/src/demo/Shell.tsx#L378) | Mở / thu gọn | {signIn ? "Chọn tài khoản có sẵn" : "Đăng nhập bằng email mẫu"} | setSignIn(!signIn) |
| [394](../../apps/web/src/demo/Shell.tsx#L394) | Nút thao tác | {a.title} {a.fields.platform === "true" ? "Quản trị nền tảng" : roleNames[roleForAccount(a)]} … | { const role = roleForAccount(a) p.switchSession({ ...person(tenant, role), userId: a.owner, name: a.title, u… |
| [454](../../apps/web/src/demo/Shell.tsx#L454) | Liên kết | {r.label} {r.meta} | routeUrl(r.feature, r.id) |

## demo/ui.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [77](../../apps/web/src/demo/ui.tsx#L77) | Liên kết | {label} | href |

## features/acceptance/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [58](../../apps/web/src/features/acceptance/view.tsx#L58) | Danh sách chọn | Tệp hồ sơ cuối | setFile |
| [60](../../apps/web/src/features/acceptance/view.tsx#L60) | Nút thao tác | Nộp hồ sơ nghiệm thu | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance",{params,body:{summary,fileId:file}}),… |
| [62](../../apps/web/src/features/acceptance/view.tsx#L62) | Mở / thu gọn | Lập hội đồng nghiệm thu | Hiện hoặc ẩn nội dung |
| [63](../../apps/web/src/features/acceptance/view.tsx#L63) | Danh sách chọn | "Vai trò nghiệm thu "+a.label | choiceValue =&gt; setSeats([...seats.filter(s=&gt;s.accountId!==a.id),...(choiceValue?[{accountId:a.id,role:choiceV… |
| [66](../../apps/web/src/features/acceptance/view.tsx#L66) | Nút thao tác | Lưu hội đồng nghiệm thu | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/acceptance/committees",{params:session.par… |
| [69](../../apps/web/src/features/acceptance/view.tsx#L69) | Danh sách chọn | Chọn hội đồng | setCommittee |
| [70](../../apps/web/src/features/acceptance/view.tsx#L70) | Danh sách chọn | Tiêu chí nghiệm thu | setCriteria |
| [71](../../apps/web/src/features/acceptance/view.tsx#L71) | Nút thao tác | Mở đợt nghiệm thu | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance/rounds",{params,body:{committeeId:comm… |
| [72](../../apps/web/src/features/acceptance/view.tsx#L72) | Nút thao tác | Chốt kết luận nghiệm thu | run(()=&gt;session.api.POST("/api/tenants/{slug}/acceptance/rounds/{id}/conclusion", {params:{path:{...session.p… |
| [78](../../apps/web/src/features/acceptance/view.tsx#L78) | Nút thao tác | Cho làm lại theo thời hạn | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance/redo",{params,body:{reason,deadline}})… |

## features/applied-project/register-applied-project/PartnerPicker.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [11](../../apps/web/src/features/applied-project/register-applied-project/PartnerPicker.tsx#L11) | Danh sách chọn | Chọn đối tác từ danh mục | choiceValue =&gt; { const partner=directory.find(p=&gt;p.code===choiceValue) if(partner)onChange([...selected,partn… |
| [20](../../apps/web/src/features/applied-project/register-applied-project/PartnerPicker.tsx#L20) | Nút thao tác | "Bỏ "+p.label | onChange(selected.filter(s=&gt;s.code!==p.code)) |

## features/applied-project/register-applied-project/ResultPanel.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [45](../../apps/web/src/features/applied-project/register-applied-project/ResultPanel.tsx#L45) | Danh sách chọn | Loại tệp kết quả | setCode |
| [47](../../apps/web/src/features/applied-project/register-applied-project/ResultPanel.tsx#L47) | Nút thao tác | Gửi kết quả xác nhận | save("submit") |
| [50](../../apps/web/src/features/applied-project/register-applied-project/ResultPanel.tsx#L50) | Nút thao tác | Xác nhận kết quả dự án | save("confirmResult") |
| [52](../../apps/web/src/features/applied-project/register-applied-project/ResultPanel.tsx#L52) | Nút thao tác | Trả kết quả bổ sung | save("returnResult") |
| [55](../../apps/web/src/features/applied-project/register-applied-project/ResultPanel.tsx#L55) | Nút thao tác | Xem giờ của dự án | loadHours() |

## features/applied-project/register-applied-project/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [62](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L62) | Nút thao tác | {r.title} | open(r) |
| [63](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L63) | Nút thao tác | Kê khai dự án mới | open() |
| [66](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L66) | Danh sách chọn | Loại dự án | setCategory |
| [68](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L68) | Danh sách chọn | Đơn vị chủ trì | setUnit |
| [73](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L73) | Nút thao tác | Lưu nháp dự án | act(false) |
| [73](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L73) | Nút thao tác | Gửi duyệt dự án | act(true) |
| [79](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L79) | Nút thao tác | {f.filename} | download(f.id).catch(e=&gt;setMessage(e.message)) |
| [81](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L81) | Danh sách chọn | Loại minh chứng | setEvidence |
| [87](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L87) | Nút thao tác | Duyệt dự án | act(false,"approve") |
| [88](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L88) | Nút thao tác | Trả dự án bổ sung | act(false,"return") |
| [89](../../apps/web/src/features/applied-project/register-applied-project/view.tsx#L89) | Nút thao tác | Thu hồi quyết định duyệt | act(false,"revoke") |

## features/assistant/Suggestions.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [31](../../apps/web/src/features/assistant/Suggestions.tsx#L31) | Nút thao tác | {kind==="proposal"?"Rà bản thuyết minh":"Lập thẻ đọc"} | load() |
| [32](../../apps/web/src/features/assistant/Suggestions.tsx#L32) | Nút thao tác | Mở lại bản gần nhất | load(items[0].id) |
| [34](../../apps/web/src/features/assistant/Suggestions.tsx#L34) | Liên kết | DOI {card.metadata.doi} | "https://doi.org/"+encodeURI(card.metadata.doi) |
| [36](../../apps/web/src/features/assistant/Suggestions.tsx#L36) | Nút thao tác | Mở căn cứ · {f.location} | load(card.id,undefined,f.key) |
| [39](../../apps/web/src/features/assistant/Suggestions.tsx#L39) | Nút thao tác | Dùng trường này | load(card.id,{field:f.key,choice:"use"}) |
| [40](../../apps/web/src/features/assistant/Suggestions.tsx#L40) | Nút thao tác | Bỏ trường này | load(card.id,{field:f.key,choice:"discard"}) |
| [51](../../apps/web/src/features/assistant/Suggestions.tsx#L51) | Nút thao tác | {x.title} · {x.doi} | setId(x.id) |

## features/attachments/ProjectFile.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [42](../../apps/web/src/features/attachments/ProjectFile.tsx#L42) | Nút thao tác | {busy?"Đang xác minh…":"Tải và xác nhận tệp"} | upload() |

## features/audit/audit-trail/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [62](../../apps/web/src/features/audit/audit-trail/view.tsx#L62) | Nút thao tác | Về danh sách hồ sơ | select("") |
| [67](../../apps/web/src/features/audit/audit-trail/view.tsx#L67) | Gửi biểu mẫu | Lọc sự kiện | Gửi qua onSubmit của biểu mẫu |
| [68](../../apps/web/src/features/audit/audit-trail/view.tsx#L68) | Mở / thu gọn | Mở thuyết minh | setEditing(!editing) |
| [69](../../apps/web/src/features/audit/audit-trail/view.tsx#L69) | Mở / thu gọn | Giao đề tài và tiến độ | setProgress(!progress) |
| [70](../../apps/web/src/features/audit/audit-trail/view.tsx#L70) | Mở / thu gọn | Kinh phí đề tài | setBudget(!budget) |
| [71](../../apps/web/src/features/audit/audit-trail/view.tsx#L71) | Mở / thu gọn | Sản phẩm khoa học | setProducts(!products) |
| [72](../../apps/web/src/features/audit/audit-trail/view.tsx#L72) | Mở / thu gọn | Nghiệm thu đề tài | setAcceptance(!acceptance) |
| [86](../../apps/web/src/features/audit/audit-trail/view.tsx#L86) | Gửi biểu mẫu | Tìm hồ sơ | Gửi qua onSubmit của biểu mẫu |
| [88](../../apps/web/src/features/audit/audit-trail/view.tsx#L88) | Liên kết | {p.title} | e=&gt;{if(!e.ctrlKey&amp;&amp;!e.metaKey){e.preventDefault();select(p.id)}} |
| [90](../../apps/web/src/features/audit/audit-trail/view.tsx#L90) | Nút thao tác | Trang trước | setSkip(Math.max(0,skip-size)) |
| [91](../../apps/web/src/features/audit/audit-trail/view.tsx#L91) | Nút thao tác | Trang sau | setSkip(skip+size) |
| [92](../../apps/web/src/features/audit/audit-trail/view.tsx#L92) | Nút thao tác | Tải lại {id?"lịch sử":"danh sách"} | refresh |

## features/budget/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [56](../../apps/web/src/features/budget/view.tsx#L56) | Mở / thu gọn | {d.allocation?"Điều chỉnh tổng cấp":"Cấp kinh phí"} | Hiện hoặc ẩn nội dung |
| [60](../../apps/web/src/features/budget/view.tsx#L60) | Nút thao tác | {d.allocation?"Lưu điều chỉnh":"Xác nhận cấp kinh phí"} | change(()=&gt;{ const body={amount:allocated,override:override.trim()&#124;&#124;null,note,revision:d.allocation?.revision… |
| [66](../../apps/web/src/features/budget/view.tsx#L66) | Nút thao tác | {d.files.find(x=&gt;x.id===f)?.filename??"Xem chứng từ"} | fileLink(f) |
| [67](../../apps/web/src/features/budget/view.tsx#L67) | Liên kết | Tải chứng từ | download.url |
| [68](../../apps/web/src/features/budget/view.tsx#L68) | Nút thao tác | Sửa khoản chi | edit(row) |
| [69](../../apps/web/src/features/budget/view.tsx#L69) | Nút thao tác | Đối soát khoản chi | {select(row.id);setReference(row.reference??"");setActual(row.transferred??"")} |
| [72](../../apps/web/src/features/budget/view.tsx#L72) | Nút thao tác | Lưu đối soát | change(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}/reconcile",{params… |
| [81](../../apps/web/src/features/budget/view.tsx#L81) | Nút thao tác | Lưu khoản chi | change(()=&gt;session.api.PUT("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}",{params:expensePar… |
| [83](../../apps/web/src/features/budget/view.tsx#L83) | Nút thao tác | Hủy khoản chi | change(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}/void",{params:expe… |
| [84](../../apps/web/src/features/budget/view.tsx#L84) | Nút thao tác | Quay về tạo khoản mới | setDraft(empty()) |
| [88](../../apps/web/src/features/budget/view.tsx#L88) | Nút thao tác | Quyết toán và đóng đề tài | change(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/budget/settle",{params,body:{manualReviewed:ch… |

## features/call/open-call/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [70](../../apps/web/src/features/call/open-call/view.tsx#L70) | Nút thao tác | Tạo kỳ nháp | run(()=&gt;edit()) |
| [73](../../apps/web/src/features/call/open-call/view.tsx#L73) | Nút thao tác | {row.code} · {status[row.status]} {row.name} Hạn {showDate(row.endDate)} | run(()=&gt;open(row.id)) |
| [75](../../apps/web/src/features/call/open-call/view.tsx#L75) | Nút thao tác | Trang trước | setSkip(skip-20) |
| [75](../../apps/web/src/features/call/open-call/view.tsx#L75) | Nút thao tác | Trang sau | setSkip(skip+20) |
| [81](../../apps/web/src/features/call/open-call/view.tsx#L81) | Danh sách chọn | {k==="templateId"?"Biểu mẫu":"Bộ tiêu chí"} | choiceValue =&gt; setForm({...form,[k]:choiceValue&#124;&#124;null}) |
| [83](../../apps/web/src/features/call/open-call/view.tsx#L83) | Nút thao tác | Lưu kỳ nháp | run(save) |
| [83](../../apps/web/src/features/call/open-call/view.tsx#L83) | Nút thao tác | Đóng biểu mẫu | setForm(undefined) |
| [87](../../apps/web/src/features/call/open-call/view.tsx#L87) | Nút thao tác | Lập đề xuất | setDraftCall(detail) |
| [89](../../apps/web/src/features/call/open-call/view.tsx#L89) | Nút thao tác | Sửa kỳ nháp | run(()=&gt;edit(detail)) |
| [89](../../apps/web/src/features/call/open-call/view.tsx#L89) | Nút thao tác | Mở kỳ | run(()=&gt;change("open")) |
| [90](../../apps/web/src/features/call/open-call/view.tsx#L90) | Nút thao tác | Đóng kỳ | run(()=&gt;change("close")) |
| [92](../../apps/web/src/features/call/open-call/view.tsx#L92) | Nút thao tác | Hủy kỳ | run(()=&gt;change("cancel")) |
| [93](../../apps/web/src/features/call/open-call/view.tsx#L93) | Nút thao tác | Gia hạn kỳ | run(()=&gt;change("extend")) |

## features/catalog/config-override/ConfigurationContent.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [56](../../apps/web/src/features/catalog/config-override/ConfigurationContent.tsx#L56) | Liên kết | Tải nội dung | Tải tệp detail.key |

## features/catalog/config-override/HomeLayoutEditor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [77](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L77) | Nút thao tác | Về cấu hình hệ thống | close |
| [79](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L79) | Danh sách chọn | Vai trò áp dụng | choiceValue =&gt; changeRole(choiceValue as HomeRole) |
| [93](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L93) | Nút thao tác | "Đưa "+labels[widget]+" lên" | move(i,-1) |
| [94](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L94) | Nút thao tác | "Đưa "+labels[widget]+" xuống" | move(i,1) |
| [100](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L100) | Nút thao tác | Lưu bố cục | save() |
| [105](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L105) | Nút thao tác | Tải bản hiện hành | load(0,true) |
| [117](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L117) | Nút thao tác | Trang trước | load(page.offset-10,false) |
| [119](../../apps/web/src/features/catalog/config-override/HomeLayoutEditor.tsx#L119) | Nút thao tác | Trang sau | load(page.offset+10,false) |

## features/catalog/config-override/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [140](../../apps/web/src/features/catalog/config-override/view.tsx#L140) | Nút thao tác | Tải lại danh sách | setQuery({...query}) |
| [141](../../apps/web/src/features/catalog/config-override/view.tsx#L141) | Mở / thu gọn | Bộ lọc cấu hình | Hiện hoặc ẩn nội dung |
| [143](../../apps/web/src/features/catalog/config-override/view.tsx#L143) | Danh sách chọn | {k==="active"?"Hoạt động":"Công khai"} | choiceValue =&gt; setFilters({...filters,[k]:choiceValue===""?undefined:choiceValue==="true"}) |
| [144](../../apps/web/src/features/catalog/config-override/view.tsx#L144) | Gửi biểu mẫu | Tìm cấu hình | Gửi qua onSubmit của biểu mẫu |
| [147](../../apps/web/src/features/catalog/config-override/view.tsx#L147) | Nút thao tác | Bố cục trang chủ theo vai trò | {setOpen(false);setDetail(undefined);setLayoutOpen(true)} |
| [149](../../apps/web/src/features/catalog/config-override/view.tsx#L149) | Nút thao tác | Thêm cấu hình | start() |
| [152](../../apps/web/src/features/catalog/config-override/view.tsx#L152) | Nút thao tác | Đọc hiệu lực | run(()=&gt;read(row.key)) |
| [153](../../apps/web/src/features/catalog/config-override/view.tsx#L153) | Nút thao tác | {row.scope===listing.scope?"Sửa":"Tạo bản riêng"} | start(row) |
| [155](../../apps/web/src/features/catalog/config-override/view.tsx#L155) | Nút thao tác | Trang trước | setQuery({...query,skip:Math.max(0,(query.skip??0)-10)}) |
| [156](../../apps/web/src/features/catalog/config-override/view.tsx#L156) | Nút thao tác | Trang sau | setQuery({...query,skip:(query.skip??0)+10}) |
| [162](../../apps/web/src/features/catalog/config-override/view.tsx#L162) | Danh sách chọn | Cách nhập | choiceValue =&gt; {setMode(choiceValue);setText("");setFile(undefined)} |
| [165](../../apps/web/src/features/catalog/config-override/view.tsx#L165) | Nút thao tác | Xem trước | run(()=&gt;save(true)) |
| [166](../../apps/web/src/features/catalog/config-override/view.tsx#L166) | Nút thao tác | Lưu cấu hình | event=&gt;{ if(editing &amp;&amp; listing.scope==="shared"){confirmOpener.current=event.currentTarget;setConfirm("save")… |
| [170](../../apps/web/src/features/catalog/config-override/view.tsx#L170) | Nút thao tác | Xóa cấu hình | event=&gt;{confirmOpener.current=event.currentTarget;setConfirm("delete")} |
| [171](../../apps/web/src/features/catalog/config-override/view.tsx#L171) | Nút thao tác | Đóng biểu mẫu | {setOpen(false);setConfirm(undefined)} |
| [179](../../apps/web/src/features/catalog/config-override/view.tsx#L179) | Hủy | Hủy | Đóng hộp xác nhận |
| [180](../../apps/web/src/features/catalog/config-override/view.tsx#L180) | Xác nhận | Xác nhận {form.key} | run(()=&gt;confirm==="delete"?remove():save()) |

## features/catalog/theme/Editor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [18](../../apps/web/src/features/catalog/theme/Editor.tsx#L18) | Nút hộp thoại | Xem thử hộp thoại | DialogTrigger |
| [56](../../apps/web/src/features/catalog/theme/Editor.tsx#L56) | Danh sách chọn | Chế độ xem trước | choiceValue =&gt; setMode(choiceValue==="dark"?"dark":"light") |
| [57](../../apps/web/src/features/catalog/theme/Editor.tsx#L57) | Danh sách chọn | Phông chữ | choiceValue =&gt; setTokens({...tokens,font:choiceValue as ThemeTokens["font"]}) |
| [58](../../apps/web/src/features/catalog/theme/Editor.tsx#L58) | Danh sách chọn | Bo góc | choiceValue =&gt; setTokens({...tokens,radius:choiceValue as ThemeTokens["radius"]}) |
| [65](../../apps/web/src/features/catalog/theme/Editor.tsx#L65) | Nút thao tác | Lưu nháp | change("save") |
| [66](../../apps/web/src/features/catalog/theme/Editor.tsx#L66) | Nút thao tác | Áp dụng | change("publish") |
| [67](../../apps/web/src/features/catalog/theme/Editor.tsx#L67) | Nút thao tác | Tải lại giao diện | change("reload") |
| [69](../../apps/web/src/features/catalog/theme/Editor.tsx#L69) | Danh sách chọn | Khôi phục về | choiceValue =&gt; setSource(Number(choiceValue)) |
| [70](../../apps/web/src/features/catalog/theme/Editor.tsx#L70) | Nút thao tác | Khôi phục phiên bản | change("rollback") |

## features/catalog/theme/Gallery.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [19](../../apps/web/src/features/catalog/theme/Gallery.tsx#L19) | Danh sách chọn | Đơn vị | setSchool |
| [24](../../apps/web/src/features/catalog/theme/Gallery.tsx#L24) | Danh sách chọn | Chế độ hiển thị | choiceValue =&gt; setMode(choiceValue==="dark"?"dark":"light") |
| [32](../../apps/web/src/features/catalog/theme/Gallery.tsx#L32) | Nút hộp thoại | Kiểm tra hồ sơ | DialogTrigger |
| [36](../../apps/web/src/features/catalog/theme/Gallery.tsx#L36) | Nút hộp thoại | Quay lại hồ sơ | DialogClose |

## features/execution/budget-page.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [67](../../apps/web/src/features/execution/budget-page.tsx#L67) | Mở / thu gọn | {open ? 'Bỏ gợi ý' : 'Đọc phiếu mẫu bằng OCR'} | setOpen(!open) |
| [74](../../apps/web/src/features/execution/budget-page.tsx#L74) | Nút thao tác | Dùng số liệu và kiểm tra | { patch({ amount: '3000000', date: '2026-11-20', title: 'Thuê máy đo lưu tốc', ocrSource: 'PHIEU-CHI-35.pdf ·… |

## features/execution/controls.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [97](../../apps/web/src/features/execution/controls.tsx#L97) | Danh sách chọn | value | onChange |
| [127](../../apps/web/src/features/execution/controls.tsx#L127) | Nút thao tác | Dùng tệp mẫu | onChange(spec.sample!) |
| [132](../../apps/web/src/features/execution/controls.tsx#L132) | Nút thao tác | Gỡ tệp | onChange('') |
| [215](../../apps/web/src/features/execution/controls.tsx#L215) | Nút hộp thoại | {label} | DialogTrigger |
| [266](../../apps/web/src/features/execution/controls.tsx#L266) | Nút thao tác | Hủy | setOpen(false) |
| [269](../../apps/web/src/features/execution/controls.tsx#L269) | Gửi biểu mẫu | {confirm &#124;&#124; 'Xác nhận'} | Gửi qua onSubmit của biểu mẫu |
| [364](../../apps/web/src/features/execution/controls.tsx#L364) | Liên kết | {children} | (e) =&gt; { if (!e.ctrlKey &amp;&amp; !e.metaKey &amp;&amp; !e.shiftKey) { e.preventDefault() p.go(feature, id) } } |

## features/execution/index.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [119](../../apps/web/src/features/execution/index.tsx#L119) | Danh sách chọn | Lọc trạng thái đề tài | setStatus |

## features/execution/product-page.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [106](../../apps/web/src/features/execution/product-page.tsx#L106) | Nút thao tác | Lập thẻ đọc từ DOI | setPreview(true) |
| [161](../../apps/web/src/features/execution/product-page.tsx#L161) | Nút thao tác | Bỏ bản nháp | setPreview(false) |
| [341](../../apps/web/src/features/execution/product-page.tsx#L341) | Danh sách chọn | Lọc trạng thái duyệt | setStatus |
| [353](../../apps/web/src/features/execution/product-page.tsx#L353) | Danh sách chọn | Lọc loại sản phẩm | setType |

## features/execution/profile-page.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [144](../../apps/web/src/features/execution/profile-page.tsx#L144) | Nút thao tác | Trích xuất lý lịch | download |
| [170](../../apps/web/src/features/execution/profile-page.tsx#L170) | Danh sách chọn | Hồ sơ đang xem | choiceValue =&gt; p.go('F08', choiceValue) |
| [224](../../apps/web/src/features/execution/profile-page.tsx#L224) | Tab | Hoạt động khoa học | Mở tab research |
| [225](../../apps/web/src/features/execution/profile-page.tsx#L225) | Tab | Học hàm và công tác | Mở tab career |

## features/extension/ConnectedModules.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [17](../../apps/web/src/features/extension/ConnectedModules.tsx#L17) | Mở / thu gọn | Thư viện DOI | setShow(show==="AI"?"":"AI") |
| [18](../../apps/web/src/features/extension/ConnectedModules.tsx#L18) | Mở / thu gọn | Định mức giờ giảng | setShow(show==="P03"?"":"P03") |
| [20](../../apps/web/src/features/extension/ConnectedModules.tsx#L20) | Mở / thu gọn | Nhiệm vụ cấp trên | setShow(show==="F09"?"":"F09") |
| [22](../../apps/web/src/features/extension/ConnectedModules.tsx#L22) | Mở / thu gọn | Hoạt động khoa học | setShow(show==="F12"?"":"F12") |
| [24](../../apps/web/src/features/extension/ConnectedModules.tsx#L24) | Mở / thu gọn | Đề tài sinh viên | setShow(show==="F10"?"":"F10") |
| [26](../../apps/web/src/features/extension/ConnectedModules.tsx#L26) | Mở / thu gọn | Dự án ứng dụng | setShow(show==="F11"?"":"F11") |

## features/extension/EvidenceEntries.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [53](../../apps/web/src/features/extension/EvidenceEntries.tsx#L53) | Danh sách chọn | {label} | change |
| [55](../../apps/web/src/features/extension/EvidenceEntries.tsx#L55) | Nút thao tác | Tải lại đầu mục | setRound(r=&gt;r+1) |
| [56](../../apps/web/src/features/extension/EvidenceEntries.tsx#L56) | Nút thao tác | {x.title} | open(x) |
| [57](../../apps/web/src/features/extension/EvidenceEntries.tsx#L57) | Nút thao tác | Thêm đầu mục | open() |
| [64](../../apps/web/src/features/extension/EvidenceEntries.tsx#L64) | Nút thao tác | Lưu nháp đầu mục | action("save") |
| [70](../../apps/web/src/features/extension/EvidenceEntries.tsx#L70) | Nút thao tác | {f.filename} | download(f.id).catch(()=&gt;setMessage("Không thể tải tệp.")) |
| [73](../../apps/web/src/features/extension/EvidenceEntries.tsx#L73) | Nút thao tác | Gửi duyệt đầu mục | action("submit") |
| [76](../../apps/web/src/features/extension/EvidenceEntries.tsx#L76) | Nút thao tác | Thu hồi đầu mục đã duyệt | action("revoke") |
| [79](../../apps/web/src/features/extension/EvidenceEntries.tsx#L79) | Nút thao tác | Duyệt đầu mục | action("approve") |
| [80](../../apps/web/src/features/extension/EvidenceEntries.tsx#L80) | Nút thao tác | Trả lại đầu mục | action("return") |
| [81](../../apps/web/src/features/extension/EvidenceEntries.tsx#L81) | Nút thao tác | Từ chối hoạt động | action("reject") |

## features/extension/MemberShares.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [17](../../apps/web/src/features/extension/MemberShares.tsx#L17) | Danh sách chọn | Vai trò người tham gia {i+1} | choiceValue =&gt; update(i,{role:choiceValue as Contributor["role"]}) |
| [20](../../apps/web/src/features/extension/MemberShares.tsx#L20) | Nút thao tác | "Bỏ thành viên "+(i+1) | onChange(members.filter((_,j)=&gt;j!==i)) |
| [22](../../apps/web/src/features/extension/MemberShares.tsx#L22) | Nút thao tác | Thêm thành viên | onChange([...members,{email:"",share:0}]) |

## features/extension/controls.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [33](../../apps/web/src/features/extension/controls.tsx#L33) | Danh sách chọn | {label} {required &amp;&amp; ' *'} | onChange |
| [55](../../apps/web/src/features/extension/controls.tsx#L55) | Nút thao tác | Quay lại | close |
| [55](../../apps/web/src/features/extension/controls.tsx#L55) | Gửi biểu mẫu | {label} | Gửi qua onSubmit của biểu mẫu |

## features/extension/detail.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [97](../../apps/web/src/features/extension/detail.tsx#L97) | Nút thao tác | ← {featureInfo[feature].title} | back |
| [100](../../apps/web/src/features/extension/detail.tsx#L100) | Nút thao tác | Chỉnh sửa hồ sơ | setEdit(true) |
| [101](../../apps/web/src/features/extension/detail.tsx#L101) | Nút thao tác | {a === 'submit' &amp;&amp; feature === 'F10' ? 'Nộp đăng ký' : actionNames[a]} | setDecision(a) |
| [115](../../apps/web/src/features/extension/detail.tsx#L115) | Liên kết | {r.fields.hours} giờ → | routeUrl('P03', r.id) |

## features/extension/editor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [21](../../apps/web/src/features/extension/editor.tsx#L21) | Danh sách chọn | mentoring ? 'Người hướng dẫn' : 'Người tham gia' | id =&gt; update(i,{id}) |
| [22](../../apps/web/src/features/extension/editor.tsx#L22) | Danh sách chọn | Vai trò | role =&gt; update(i,{role}) |
| [24](../../apps/web/src/features/extension/editor.tsx#L24) | Nút thao tác | 'Bỏ ' + names[p.id] | change(team.filter((_,n) =&gt; i !== n)) |
| [26](../../apps/web/src/features/extension/editor.tsx#L26) | Nút thao tác | Thêm thành viên | change([...team,{id:available[0],role:'Thành viên',share:0}]) |
| [61](../../apps/web/src/features/extension/editor.tsx#L61) | Danh sách chọn | Đơn vị chủ trì | setUnit |
| [64](../../apps/web/src/features/extension/editor.tsx#L64) | Danh sách chọn | Đợt đăng ký | v =&gt; set('callId',v) |
| [67](../../apps/web/src/features/extension/editor.tsx#L67) | Danh sách chọn | info.category | v =&gt; set('category',v) |
| [69](../../apps/web/src/features/extension/editor.tsx#L69) | Danh sách chọn | Cơ quan chủ trì cấp trên | v =&gt; set('agency',v) |
| [77](../../apps/web/src/features/extension/editor.tsx#L77) | Gợi ý + nhập tự do | f.partner ?? "" | value =&gt; set("partner", value) |
| [93](../../apps/web/src/features/extension/editor.tsx#L93) | Danh sách chọn | Trưởng nhóm | owner =&gt; setRow({...row,owner,fields:{...f,group:[...new Set([...group,owner])].join(',')}}) |

## features/extension/formulas.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [24](../../apps/web/src/features/extension/formulas.tsx#L24) | Danh sách chọn | Loại kỳ | v =&gt; set('periodType',v) |
| [47](../../apps/web/src/features/extension/formulas.tsx#L47) | Danh sách chọn | Kỳ dùng cho sự kiện mới | periodType =&gt; set({...f,periodType}) |
| [58](../../apps/web/src/features/extension/formulas.tsx#L58) | Nút thao tác | Cấu hình lịch kỳ | setCal(true) |
| [62](../../apps/web/src/features/extension/formulas.tsx#L62) | Nút thao tác | Tạo phiên bản | setEditing(r) |

## features/extension/index.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [38](../../apps/web/src/features/extension/index.tsx#L38) | Liên kết | {info.create} | routeUrl(feature, 'new') |
| [39](../../apps/web/src/features/extension/index.tsx#L39) | Nút thao tác | Quy tắc minh chứng | setPolicy(true) |
| [42](../../apps/web/src/features/extension/index.tsx#L42) | Tab | Hồ sơ ( {all.length} ) | Mở tab list |
| [43](../../apps/web/src/features/extension/index.tsx#L43) | Tab | Chờ xét ( {pending.length} ) | Mở tab queue |
| [44](../../apps/web/src/features/extension/index.tsx#L44) | Tab | Đợt đăng ký | Mở tab calls |
| [50](../../apps/web/src/features/extension/index.tsx#L50) | Danh sách chọn | k | v =&gt; setFilters({...filters,[k]:v}) |
| [53](../../apps/web/src/features/extension/index.tsx#L53) | Liên kết | {r.title} | routeUrl(feature, r.id) |
| [58](../../apps/web/src/features/extension/index.tsx#L58) | Nút thao tác | Xóa bộ lọc | { setFilters({}); setQuery('') } |
| [74](../../apps/web/src/features/extension/index.tsx#L74) | Liên kết | Về danh sách | routeUrl(feature) |
| [79](../../apps/web/src/features/extension/index.tsx#L79) | Liên kết | Về tổng quan | routeUrl('B06') |

## features/extension/ledger.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [39](../../apps/web/src/features/extension/ledger.tsx#L39) | Danh sách chọn | Cách điều chỉnh | setMode |
| [41](../../apps/web/src/features/extension/ledger.tsx#L41) | Danh sách chọn | Phiên bản dùng tính lại | setVersion |
| [59](../../apps/web/src/features/extension/ledger.tsx#L59) | Nút thao tác | Đóng | close |
| [66](../../apps/web/src/features/extension/ledger.tsx#L66) | Danh sách chọn | Sản phẩm đã duyệt | v =&gt; {setId(v);setCategory('');setShares({});setDate('');setNotice('');setError('')} |
| [67](../../apps/web/src/features/extension/ledger.tsx#L67) | Danh sách chọn | Phân loại theo minh chứng | setCategory |
| [85](../../apps/web/src/features/extension/ledger.tsx#L85) | Liên kết | ← Sổ giờ giảng | routeUrl('P03') |
| [88](../../apps/web/src/features/extension/ledger.tsx#L88) | Nút thao tác | Điều chỉnh giờ | setEditing(true) |
| [89](../../apps/web/src/features/extension/ledger.tsx#L89) | Liên kết | Mở hồ sơ nguồn {f.sourceFeature} | routeUrl(f.sourceFeature, source.id) |
| [90](../../apps/web/src/features/extension/ledger.tsx#L90) | Liên kết | Mở lý lịch F08 | routeUrl('F08', profile.id) |
| [91](../../apps/web/src/features/extension/ledger.tsx#L91) | Nút thao tác | Đối chiếu sự kiện | { try { const updates = postHours(ctx.rows,source) if (updates.length) ctx.commit('Ghi sổ sự kiện nguồn',upda… |
| [117](../../apps/web/src/features/extension/ledger.tsx#L117) | Liên kết | Về sổ giờ giảng | routeUrl('P03') |
| [126](../../apps/web/src/features/extension/ledger.tsx#L126) | Nút thao tác | Quy đổi sản phẩm F07 | setOutput(true) |
| [127](../../apps/web/src/features/extension/ledger.tsx#L127) | Tab | Sổ giờ giảng | Mở tab ledger |
| [127](../../apps/web/src/features/extension/ledger.tsx#L127) | Tab | Công thức và kỳ | Mở tab formulas |
| [133](../../apps/web/src/features/extension/ledger.tsx#L133) | Danh sách chọn | label | v =&gt; setFilters({...filters,[k]:v}) |
| [135](../../apps/web/src/features/extension/ledger.tsx#L135) | Liên kết | {r.title} | routeUrl('P03', r.id) |

## features/extension/management.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [34](../../apps/web/src/features/extension/management.tsx#L34) | Danh sách chọn | Khoa | unit =&gt; set({...r,unit}) |
| [35](../../apps/web/src/features/extension/management.tsx#L35) | Danh sách chọn | Quy trình của đề tài nộp mới | v =&gt; field('mode',v) |
| [37](../../apps/web/src/features/extension/management.tsx#L37) | Danh sách chọn | Trạng thái đợt | status =&gt; set({...r,status}) |
| [53](../../apps/web/src/features/extension/management.tsx#L53) | Nút thao tác | Mở đợt mới | create |
| [56](../../apps/web/src/features/extension/management.tsx#L56) | Nút thao tác | Chỉnh sửa đợt | setEditing(r) |
| [64](../../apps/web/src/features/extension/management.tsx#L64) | Nút thao tác | Đóng | close |
| [71](../../apps/web/src/features/extension/management.tsx#L71) | Danh sách chọn | Loại hồ sơ | id =&gt; setRow(items.find(r =&gt; r.id === id)!) |
| [74](../../apps/web/src/features/extension/management.tsx#L74) | Danh sách chọn | Thời điểm ghi nhận giờ | v =&gt; change('trigger',v) |

## features/home/Overview.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [30](../../apps/web/src/features/home/Overview.tsx#L30) | Nút thao tác | Bổ sung thông tin còn thiếu trong lý lịch | open("profile") |
| [32](../../apps/web/src/features/home/Overview.tsx#L32) | Liên kết | {n.title} · {timestamp.format(new Date(n.createdAt))} | "?inbox=all&amp;notice="+n.id |
| [33](../../apps/web/src/features/home/Overview.tsx#L33) | Liên kết | Xem tất cả thông báo | ?inbox=all |
| [37](../../apps/web/src/features/home/Overview.tsx#L37) | Liên kết | Mở báo cáo theo kỳ | ?report=home |
| [38](../../apps/web/src/features/home/Overview.tsx#L38) | Nút thao tác | Xem giờ trong lý lịch | open("profile") |
| [48](../../apps/web/src/features/home/Overview.tsx#L48) | Nút thao tác | Thử tải trang chủ | retry |
| [54](../../apps/web/src/features/home/Overview.tsx#L54) | Nút thao tác | {shortcuts[s]} | open(s) |

## features/home/open-work-item/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [36](../../apps/web/src/features/home/open-work-item/view.tsx#L36) | Liên kết | Về danh sách việc | location.pathname |
| [57](../../apps/web/src/features/home/open-work-item/view.tsx#L57) | Liên kết | {w.title} {w.projectCode} {w.dueDate?"Hạn "+localDate(w.dueDate):"Chưa có hạn"} | "?work="+w.id |
| [60](../../apps/web/src/features/home/open-work-item/view.tsx#L60) | Nút thao tác | Xem các kỳ đang nhận | onCalls |
| [61](../../apps/web/src/features/home/open-work-item/view.tsx#L61) | Nút thao tác | Trang trước | setSkip(skip-20) |
| [61](../../apps/web/src/features/home/open-work-item/view.tsx#L61) | Nút thao tác | Trang sau | setSkip(skip+20) |

## features/home/widget-load.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [34](../../apps/web/src/features/home/widget-load.tsx#L34) | Nút thao tác | Thử lại | retry |

## features/iam/author-request/AuthorRequests.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [55](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L55) | Gửi biểu mẫu | Gửi yêu cầu lên tác giả | Gửi qua onSubmit của biểu mẫu |
| [62](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L62) | Liên kết | {url} | url |
| [65](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L65) | Nút thao tác | Duyệt quyền tác giả | review(r.id,true) |
| [65](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L65) | Nút thao tác | Từ chối yêu cầu | review(r.id,false) |
| [66](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L66) | Nút thao tác | Thẩm định {r.email} | {setSelected(r.id);setNote("")} |
| [67](../../apps/web/src/features/iam/author-request/AuthorRequests.tsx#L67) | Nút thao tác | Tải lại yêu cầu | setRefresh(n=&gt;n+1) |

## features/iam/lock-account/CreateAccount.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [27](../../apps/web/src/features/iam/lock-account/CreateAccount.tsx#L27) | Danh sách chọn | Đơn vị công tác | choiceValue =&gt; setForm({...form,unitId:choiceValue}) |
| [28](../../apps/web/src/features/iam/lock-account/CreateAccount.tsx#L28) | Danh sách chọn | Vai trò tài khoản | choiceValue =&gt; setForm({...form,userType:choiceValue as Command["userType"]}) |
| [29](../../apps/web/src/features/iam/lock-account/CreateAccount.tsx#L29) | Gửi biểu mẫu | Tạo tài khoản | Gửi qua onSubmit của biểu mẫu |

## features/iam/lock-account/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [43](../../apps/web/src/features/iam/lock-account/view.tsx#L43) | Nút thao tác | Lưu hồ sơ cá nhân | submit(true) |
| [44](../../apps/web/src/features/iam/lock-account/view.tsx#L44) | Nút thao tác | Tải lại hồ sơ cá nhân | submit(false) |
| [45](../../apps/web/src/features/iam/lock-account/view.tsx#L45) | Mở / thu gọn | Yêu cầu quyền tác giả | setRequests(!requests) |
| [92](../../apps/web/src/features/iam/lock-account/view.tsx#L92) | Mở / thu gọn | Cấp tài khoản mới | Hiện hoặc ẩn nội dung |
| [93](../../apps/web/src/features/iam/lock-account/view.tsx#L93) | Mở / thu gọn | Xét yêu cầu quyền tác giả | setQueue(!queue) |
| [96](../../apps/web/src/features/iam/lock-account/view.tsx#L96) | Gửi biểu mẫu | Tìm người dùng | Gửi qua onSubmit của biểu mẫu |
| [98](../../apps/web/src/features/iam/lock-account/view.tsx#L98) | Nút thao tác | {row.email} | open(row.id) |
| [99](../../apps/web/src/features/iam/lock-account/view.tsx#L99) | Nút thao tác | Trang trước | setSkip(skip-20) |
| [99](../../apps/web/src/features/iam/lock-account/view.tsx#L99) | Nút thao tác | Trang sau | setSkip(skip+20) |
| [102](../../apps/web/src/features/iam/lock-account/view.tsx#L102) | Liên kết | Xem lý lịch khoa học | "?profile="+receipt.account.id |
| [104](../../apps/web/src/features/iam/lock-account/view.tsx#L104) | Danh sách chọn | Vai trò tài khoản | choiceValue =&gt; setRole(choiceValue as Profile["userType"]) |
| [105](../../apps/web/src/features/iam/lock-account/view.tsx#L105) | Nút thao tác | Lưu vai trò | administer(false) |
| [106](../../apps/web/src/features/iam/lock-account/view.tsx#L106) | Mở / thu gọn | Ngừng hoạt động | setEndAccess(!endAccess) |
| [107](../../apps/web/src/features/iam/lock-account/view.tsx#L107) | Nút thao tác | Xác nhận ngừng hoạt động | administer(true) |
| [110](../../apps/web/src/features/iam/lock-account/view.tsx#L110) | Nút thao tác | {receipt.account.isActive?"Khóa tài khoản":"Mở khóa tài khoản"} | setConfirm(true) |
| [112](../../apps/web/src/features/iam/lock-account/view.tsx#L112) | Nút thao tác | Xác nhận thay đổi | change() |
| [112](../../apps/web/src/features/iam/lock-account/view.tsx#L112) | Nút thao tác | Quay lại | setConfirm(false) |

## features/intake/CallScreen.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [106](../../apps/web/src/features/intake/CallScreen.tsx#L106) | Danh sách chọn | key === 'template' ? 'Biểu mẫu thuyết minh' : 'Bộ tiêu chí xét duyệt' | choiceValue =&gt; update(key, choiceValue) |
| [124](../../apps/web/src/features/intake/CallScreen.tsx#L124) | Gửi biểu mẫu | Lưu kỳ nháp | Gửi qua onSubmit của biểu mẫu |
| [125](../../apps/web/src/features/intake/CallScreen.tsx#L125) | Nút thao tác | Hủy chỉnh sửa | done(call?.id &#124;&#124; '') |
| [169](../../apps/web/src/features/intake/CallScreen.tsx#L169) | Liên kết | Lập kỳ mới | routeUrl('F02', 'new') |
| [231](../../apps/web/src/features/intake/CallScreen.tsx#L231) | Liên kết | Lập đề xuất cho kỳ này | routeUrl('F01', 'new~' + call.id) |
| [237](../../apps/web/src/features/intake/CallScreen.tsx#L237) | Nút thao tác | Sửa cấu hình | setEdit(true) |

## features/intake/CouncilScreen.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [38](../../apps/web/src/features/intake/CouncilScreen.tsx#L38) | Nút thao tác | Sửa phân công | setEditing(true) |
| [78](../../apps/web/src/features/intake/CouncilScreen.tsx#L78) | Danh sách chọn | 'Chức danh của ' + names[uid] | choiceValue =&gt; setSeats( seats.map((s) =&gt; s.user === uid ? { ...s, role: choiceValue as Seat['role'] } : s, )… |
| [99](../../apps/web/src/features/intake/CouncilScreen.tsx#L99) | Gửi biểu mẫu | Lưu hội đồng | Gửi qua onSubmit của biểu mẫu |
| [100](../../apps/web/src/features/intake/CouncilScreen.tsx#L100) | Liên kết | Quay lại | routeUrl('F03') |

## features/intake/EvidencePanel.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [31](../../apps/web/src/features/intake/EvidencePanel.tsx#L31) | Nút thao tác | Rà mục phương pháp | run(() =&gt; { const hint = suggest(app, project.id, consent) app.commit('Đối chiếu thuyết minh bằng trợ lý mô p… |
| [67](../../apps/web/src/features/intake/EvidencePanel.tsx#L67) | Nút thao tác | {opened === hint.id ? 'Thu gọn căn cứ' : 'Mở căn cứ'} | run(() =&gt; { openEvidence(app, hint.id) setOpened(opened === hint.id ? '' : hint.id) }) |

## features/intake/ProposalEditor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [80](../../apps/web/src/features/intake/ProposalEditor.tsx#L80) | Tab | {title} | Mở tab key |
| [87](../../apps/web/src/features/intake/ProposalEditor.tsx#L87) | Danh sách chọn | Kỳ nhận đề xuất | choiceValue =&gt; setForm({ ...form, callId: choiceValue, discipline: '' }) |
| [104](../../apps/web/src/features/intake/ProposalEditor.tsx#L104) | Danh sách chọn | Lĩnh vực nghiên cứu | choiceValue =&gt; update('discipline', choiceValue) |
| [217](../../apps/web/src/features/intake/ProposalEditor.tsx#L217) | Nút thao tác | Lưu nháp | run(save) |
| [218](../../apps/web/src/features/intake/ProposalEditor.tsx#L218) | Nút thao tác | Quay lại | done(id) |
| [222](../../apps/web/src/features/intake/ProposalEditor.tsx#L222) | Nút thao tác | Xem lại và nộp | setTab('submit') |

## features/intake/ProposalFiles.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [28](../../apps/web/src/features/intake/ProposalFiles.tsx#L28) | Danh sách chọn | Loại tài liệu | setCategory |
| [66](../../apps/web/src/features/intake/ProposalFiles.tsx#L66) | Nút thao tác | 'Gỡ ' + f.title | change(files.filter((item) =&gt; item.id !== f.id)) |

## features/intake/ProposalScreen.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [125](../../apps/web/src/features/intake/ProposalScreen.tsx#L125) | Liên kết | Lập đề xuất | routeUrl('F01', 'new') |
| [137](../../apps/web/src/features/intake/ProposalScreen.tsx#L137) | Danh sách chọn | Kỳ nhận đề xuất | setCall |
| [147](../../apps/web/src/features/intake/ProposalScreen.tsx#L147) | Danh sách chọn | Trạng thái | setStatus |
| [253](../../apps/web/src/features/intake/ProposalScreen.tsx#L253) | Nút thao tác | Chỉnh sửa đề xuất | setEdit(true) |

## features/intake/ProposalTeam.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [49](../../apps/web/src/features/intake/ProposalTeam.tsx#L49) | Danh sách chọn | 'Vai trò của ' + name | choiceValue =&gt; setMember(uid, { ...detail, role: choiceValue as Assignment['role'] }) |

## features/intake/ReportScreen.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [60](../../apps/web/src/features/intake/ReportScreen.tsx#L60) | Nút thao tác | Xuất đối chứng CSV | run(download) |
| [73](../../apps/web/src/features/intake/ReportScreen.tsx#L73) | Bộ lọc | Tất cả ( {lines.length} ) | Chọn * |
| [75](../../apps/web/src/features/intake/ReportScreen.tsx#L75) | Bộ lọc | {label(key)} ( {count} ) | Chọn key |
| [145](../../apps/web/src/features/intake/ReportScreen.tsx#L145) | Danh sách chọn | Kỳ báo cáo | setCall |
| [152](../../apps/web/src/features/intake/ReportScreen.tsx#L152) | Danh sách chọn | Phạm vi đơn vị | setUnit |
| [160](../../apps/web/src/features/intake/ReportScreen.tsx#L160) | Gửi biểu mẫu | Tạo báo cáo | Gửi qua onSubmit của biểu mẫu |

## features/intake/ReviewDetail.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [71](../../apps/web/src/features/intake/ReviewDetail.tsx#L71) | Nút thao tác | Lưu phiếu nháp | run(() =&gt; send('draft')) |
| [179](../../apps/web/src/features/intake/ReviewDetail.tsx#L179) | Danh sách chọn | Kết quả thẩm định | choiceValue =&gt; setEthics(choiceValue as typeof ethics) |
| [228](../../apps/web/src/features/intake/ReviewDetail.tsx#L228) | Danh sách chọn | Hội đồng được phân công | setCouncil |

## features/intake/ReviewScreen.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [83](../../apps/web/src/features/intake/ReviewScreen.tsx#L83) | Liên kết | Lập hội đồng | routeUrl('F03', 'new') |
| [88](../../apps/web/src/features/intake/ReviewScreen.tsx#L88) | Tab | Đợt xét duyệt | Mở tab rounds |
| [89](../../apps/web/src/features/intake/ReviewScreen.tsx#L89) | Tab | Hội đồng | Mở tab councils |

## features/intake/ui.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [103](../../apps/web/src/features/intake/ui.tsx#L103) | Danh sách chọn | {caption} | Chuyển props tới bộ chọn dùng chung |
| [126](../../apps/web/src/features/intake/ui.tsx#L126) | Liên kết | {children} | '#/' + feature + (id ? '/' + encodeURIComponent(id) : '') |
| [233](../../apps/web/src/features/intake/ui.tsx#L233) | Nút hộp thoại | {trigger} | DialogTrigger |
| [245](../../apps/web/src/features/intake/ui.tsx#L245) | Nút thao tác | Quay lại | setOpen(false) |
| [248](../../apps/web/src/features/intake/ui.tsx#L248) | Nút thao tác | {confirm &#124;&#124; trigger} | { try { onConfirm() setOpen(false) } catch (e) { setError(errorMessage(e)) } } |

## features/mobile/CallCards.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [23](../../apps/web/src/features/mobile/CallCards.tsx#L23) | Liên kết | {call.fields.code} {call.title} Hạn {dateLabel(call.fields.due)} | routeUrl("F02", call.id) |

## features/mobile/DeadlineQueue.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [41](../../apps/web/src/features/mobile/DeadlineQueue.tsx#L41) | Liên kết | {task.detail} {task.title} {late ? "Quá hạn · " : task.date ? "Hạn " : ""} {task.date ? vietna… | routeUrl(task.feature, task.target) |
| [61](../../apps/web/src/features/mobile/DeadlineQueue.tsx#L61) | Nút thao tác | Xem tất cả việc | setLateOnly(false) |
| [65](../../apps/web/src/features/mobile/DeadlineQueue.tsx#L65) | Liên kết | Xem hộp thư | routeUrl("B04") |

## features/mobile/FilterPair.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [14](../../apps/web/src/features/mobile/FilterPair.tsx#L14) | Bộ lọc | {options[0]} | Chọn first |
| [15](../../apps/web/src/features/mobile/FilterPair.tsx#L15) | Bộ lọc | {options[1]} | Chọn second |

## features/mobile/PhonePreview.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [31](../../apps/web/src/features/mobile/PhonePreview.tsx#L31) | Liên kết | Mở toàn màn hình | destination |

## features/notification/DeliveryLog.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [36](../../apps/web/src/features/notification/DeliveryLog.tsx#L36) | Danh sách chọn | Trạng thái gửi | choiceValue =&gt; {setFilter(choiceValue as Filter);setSkip(0);setMessage("");refresh()} |
| [47](../../apps/web/src/features/notification/DeliveryLog.tsx#L47) | Nút thao tác | Gửi lại | resend([row]) |
| [49](../../apps/web/src/features/notification/DeliveryLog.tsx#L49) | Nút thao tác | Gửi lại đã chọn ( {selected.length} ) | resend(page.items.filter(r=&gt;selected.includes(r.id))) |
| [50](../../apps/web/src/features/notification/DeliveryLog.tsx#L50) | Nút thao tác | Trang trước | {setSkip(skip-20);refresh()} |
| [51](../../apps/web/src/features/notification/DeliveryLog.tsx#L51) | Nút thao tác | Trang sau | {setSkip(skip+20);refresh()} |
| [53](../../apps/web/src/features/notification/DeliveryLog.tsx#L53) | Nút thao tác | Tải lại nhật ký | refresh |

## features/notification/Inbox.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [24](../../apps/web/src/features/notification/Inbox.tsx#L24) | Nút thao tác | Hộp thông báo | change("all") |
| [73](../../apps/web/src/features/notification/Inbox.tsx#L73) | Mở / thu gọn | Tùy chọn nhận thông báo | setSettings(!settings) |
| [75](../../apps/web/src/features/notification/Inbox.tsx#L75) | Mở / thu gọn | Nhật ký gửi thông báo | setLogOpen(!logOpen) |
| [77](../../apps/web/src/features/notification/Inbox.tsx#L77) | Nút thao tác | Về danh sách thông báo | change(filter) |
| [79](../../apps/web/src/features/notification/Inbox.tsx#L79) | Liên kết | Mở hồ sơ nguồn | "?project="+detail.targetId |
| [81](../../apps/web/src/features/notification/Inbox.tsx#L81) | Nút thao tác | {n.title} {n.readAt?"Đã đọc":"Chưa đọc"} · {date.format(new Date(n.createdAt))} | change(filter,n.id) |
| [84](../../apps/web/src/features/notification/Inbox.tsx#L84) | Nút thao tác | Đánh dấu tất cả đã đọc | markAll |
| [85](../../apps/web/src/features/notification/Inbox.tsx#L85) | Nút thao tác | Trang trước | setSkip(Math.max(0,skip-20)) |
| [86](../../apps/web/src/features/notification/Inbox.tsx#L86) | Nút thao tác | Trang sau | setSkip(skip+20) |
| [89](../../apps/web/src/features/notification/Inbox.tsx#L89) | Nút thao tác | Thử lại | {setError(undefined);refresh(n=&gt;n+1)} |

## features/notification/NoticeTemplate.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [26](../../apps/web/src/features/notification/NoticeTemplate.tsx#L26) | Danh sách chọn | Kênh của mẫu | choiceValue =&gt; setChannel(choiceValue as Template["channel"]) |
| [86](../../apps/web/src/features/notification/NoticeTemplate.tsx#L86) | Nút thao tác | Xem trước | submit("preview") |
| [87](../../apps/web/src/features/notification/NoticeTemplate.tsx#L87) | Nút thao tác | Lưu mẫu | submit("save") |
| [88](../../apps/web/src/features/notification/NoticeTemplate.tsx#L88) | Nút thao tác | Gỡ mẫu | setConfirm(true) |
| [91](../../apps/web/src/features/notification/NoticeTemplate.tsx#L91) | Nút thao tác | Xác nhận gỡ mẫu | submit("remove") |
| [92](../../apps/web/src/features/notification/NoticeTemplate.tsx#L92) | Nút thao tác | Giữ mẫu | setConfirm(false) |
| [100](../../apps/web/src/features/notification/NoticeTemplate.tsx#L100) | Nút thao tác | Tải bản hiện hành | reload |

## features/notification/Preferences.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [40](../../apps/web/src/features/notification/Preferences.tsx#L40) | Danh sách chọn | Nhóm sự kiện | choiceValue =&gt; {select(choiceValue);setMessage("")} |
| [50](../../apps/web/src/features/notification/Preferences.tsx#L50) | Gửi biểu mẫu | Lưu tùy chọn cá nhân | Gửi qua onSubmit của biểu mẫu |
| [56](../../apps/web/src/features/notification/Preferences.tsx#L56) | Gửi biểu mẫu | Lưu quy tắc của trường | Gửi qua onSubmit của biểu mẫu |
| [58](../../apps/web/src/features/notification/Preferences.tsx#L58) | Mở / thu gọn | Mẫu thông báo theo kênh | setShowTemplates(!showTemplates) |

## features/platform/Accounts.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [77](../../apps/web/src/features/platform/Accounts.tsx#L77) | Nút thao tác | Tạo tài khoản | setEdit("new") |
| [90](../../apps/web/src/features/platform/Accounts.tsx#L90) | Liên kết | {label} | routeUrl("B03", id) |
| [105](../../apps/web/src/features/platform/Accounts.tsx#L105) | Mở / thu gọn | {typeNames[k]} · {v.length} quyền | Hiện hoặc ẩn nội dung |
| [117](../../apps/web/src/features/platform/Accounts.tsx#L117) | Nút thao tác | Gửi yêu cầu | setEdit("apply") |
| [122](../../apps/web/src/features/platform/Accounts.tsx#L122) | Nút thao tác | {r.title} {r.unit} | setEdit(r.id) |
| [137](../../apps/web/src/features/platform/Accounts.tsx#L137) | Liên kết | Quay lại danh sách | routeUrl("B03") |
| [156](../../apps/web/src/features/platform/Accounts.tsx#L156) | Nút thao tác | Chỉnh sửa | setEdit(selected.id) |
| [157](../../apps/web/src/features/platform/Accounts.tsx#L157) | Nút thao tác | {selected.status === "ACTIVE" ? "Khóa tài khoản" : "Kích hoạt lại"} | setEdit("lock") |
| [165](../../apps/web/src/features/platform/Accounts.tsx#L165) | Nút thao tác | Ngừng hoạt động | setEdit("disable") |
| [170](../../apps/web/src/features/platform/Accounts.tsx#L170) | Liên kết | Mở lý lịch khoa học | routeUrl("F08", selected.owner) |
| [174](../../apps/web/src/features/platform/Accounts.tsx#L174) | Liên kết | Nhật ký | routeUrl("P02", selected.id) |
| [191](../../apps/web/src/features/platform/Accounts.tsx#L191) | Danh sách chọn | Trạng thái tài khoản | setFilter |
| [203](../../apps/web/src/features/platform/Accounts.tsx#L203) | Liên kết | {initials(r.title)} {r.title} {typeNames[r.fields.userType]} · {r.fields.email} | routeUrl("B03", r.id) |
| [233](../../apps/web/src/features/platform/Accounts.tsx#L233) | Nút thao tác | Xác nhận | { try { const status = edit === "disable" ? "DISABLED" : selected.status === "ACTIVE" ? "LOCKED" : "ACTIVE" i… |
| [285](../../apps/web/src/features/platform/Accounts.tsx#L285) | Nút thao tác | {status === "APPROVED" ? "Phê duyệt" : "Từ chối"} | { if (status === "REJECTED" &amp;&amp; !reason.trim()) { setError("Nhập lý do từ chối.") return } const user = accoun… |
| [393](../../apps/web/src/features/platform/Accounts.tsx#L393) | Danh sách chọn | Vai trò | setType |
| [401](../../apps/web/src/features/platform/Accounts.tsx#L401) | Danh sách chọn | Phạm vi phụ trách | setScope |
| [414](../../apps/web/src/features/platform/Accounts.tsx#L414) | Gửi biểu mẫu | Lưu tài khoản | Gửi qua onSubmit của biểu mẫu |
| [456](../../apps/web/src/features/platform/Accounts.tsx#L456) | Gửi biểu mẫu | Gửi yêu cầu | Gửi qua onSubmit của biểu mẫu |

## features/platform/Audit.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [40](../../apps/web/src/features/platform/Audit.tsx#L40) | Liên kết | Xem toàn bộ nhật ký | routeUrl("P02") |
| [47](../../apps/web/src/features/platform/Audit.tsx#L47) | Nút thao tác | {e.action} {e.title} · {e.actor} {vietnamDate(e.at, true)} | setEventId(e.id) |

## features/platform/Config.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [54](../../apps/web/src/features/platform/Config.tsx#L54) | Nút thao tác | Tải nội dung | download() |
| [93](../../apps/web/src/features/platform/Config.tsx#L93) | Nút thao tác | Tạo cấu hình | setEditor({}) |
| [95](../../apps/web/src/features/platform/Config.tsx#L95) | Liên kết | Danh mục cấu hình | routeUrl("B01") |
| [96](../../apps/web/src/features/platform/Config.tsx#L96) | Liên kết | Bố cục trang chủ | routeUrl("B01", "home") |
| [99](../../apps/web/src/features/platform/Config.tsx#L99) | Liên kết | Quay lại danh sách | routeUrl("B01") |
| [103](../../apps/web/src/features/platform/Config.tsx#L103) | Liên kết | Mở bản riêng của đơn vị | routeUrl("B01", tenantOverride.id) |
| [104](../../apps/web/src/features/platform/Config.tsx#L104) | Nút thao tác | {target.fields.scope === "shared" &amp;&amp; !platform ? "Ghi đè cho đơn vị" : "Chỉnh sửa"} | setEditor({ initial: target }) |
| [105](../../apps/web/src/features/platform/Config.tsx#L105) | Nút thao tác | Xóa cấu hình | { setError(""); setDeletion({ row: target, commit: p.commit }) } |
| [113](../../apps/web/src/features/platform/Config.tsx#L113) | Danh sách chọn | Phạm vi | setFilter |
| [117](../../apps/web/src/features/platform/Config.tsx#L117) | Mở / thu gọn | Danh mục kỳ nhận đề xuất | Hiện hoặc ẩn nội dung |
| [120](../../apps/web/src/features/platform/Config.tsx#L120) | Nút thao tác | {ref.title} {(applied?.fields.value ?? ref.status) === "ACTIVE" ? "Đang dùng" : "Ngừng dùng"} | setEditor({ initial: applied, catalogEntry: ref }) |
| [126](../../apps/web/src/features/platform/Config.tsx#L126) | Liên kết | {r.title} {r.fields.key} · {r.fields.group} · {r.fields.mime} {r.fields.scope === "tenant" ? "… | routeUrl("B01", r.id) |
| [135](../../apps/web/src/features/platform/Config.tsx#L135) | Nút thao tác | Xác nhận xóa | confirmDelete() |
| [146](../../apps/web/src/features/platform/Config.tsx#L146) | Danh sách chọn | Vai trò | v =&gt; setRole(v as Role) |
| [183](../../apps/web/src/features/platform/Config.tsx#L183) | Nút thao tác | "Đưa lên " + widgets[k] | { const ordered = [...keys]; [ordered[i-1], ordered[i]] = [ordered[i], ordered[i-1]]; change(ordered) } |
| [187](../../apps/web/src/features/platform/Config.tsx#L187) | Nút thao tác | Lưu bố cục | save() |

## features/platform/ConfigForm.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [103](../../apps/web/src/features/platform/ConfigForm.tsx#L103) | Danh sách chọn | Nguồn nội dung | setMode |
| [105](../../apps/web/src/features/platform/ConfigForm.tsx#L105) | Danh sách chọn | Định dạng | setMime |
| [106](../../apps/web/src/features/platform/ConfigForm.tsx#L106) | Danh sách chọn | Hiệu lực | setText |
| [114](../../apps/web/src/features/platform/ConfigForm.tsx#L114) | Danh sách chọn | Tệp mẫu | setSample |
| [115](../../apps/web/src/features/platform/ConfigForm.tsx#L115) | Nút thao tác | Dùng tệp mẫu | { if (fileInput.current) fileInput.current.value = "" chooseFile(sampleFile(sample)) if (!key) setKey(sample … |
| [131](../../apps/web/src/features/platform/ConfigForm.tsx#L131) | Nút thao tác | Xem trước | process(false) |
| [132](../../apps/web/src/features/platform/ConfigForm.tsx#L132) | Gửi biểu mẫu | Lưu cấu hình | Gửi qua onSubmit của biểu mẫu |

## features/platform/Notifications.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [76](../../apps/web/src/features/platform/Notifications.tsx#L76) | Liên kết | {label} | routeUrl("B04", id) |
| [124](../../apps/web/src/features/platform/Notifications.tsx#L124) | Danh sách chọn | Sự kiện | setEvent |
| [147](../../apps/web/src/features/platform/Notifications.tsx#L147) | Nút thao tác | Sửa mẫu thông báo | { setDraft(template?.fields.value ?? opts[event]) setEditing("template") } |
| [157](../../apps/web/src/features/platform/Notifications.tsx#L157) | Liên kết | Mở cấu hình nhắc hạn | routeUrl("B01") |
| [181](../../apps/web/src/features/platform/Notifications.tsx#L181) | Nút thao tác | Gửi lại | commit("Gửi lại thông báo", [ { ...r, status: "SENT", fields: { ...r.fields, attempts: String(Number(r.fields… |
| [205](../../apps/web/src/features/platform/Notifications.tsx#L205) | Liên kết | Quay lại danh sách | routeUrl("B04", fromUnread ? "unread" : undefined) |
| [210](../../apps/web/src/features/platform/Notifications.tsx#L210) | Nút thao tác | Đánh dấu đã đọc | commit("Đánh dấu đã đọc", [{ ...selected, status: "READ" }]) |
| [218](../../apps/web/src/features/platform/Notifications.tsx#L218) | Nút thao tác | Mở hồ sơ | { if (selected.status === "UNREAD") commit("Đánh dấu đã đọc", [{ ...selected, status: "READ" }]) const target… |
| [242](../../apps/web/src/features/platform/Notifications.tsx#L242) | Nút thao tác | Đọc tất cả | commit( "Đánh dấu tất cả đã đọc", unread.map((r) =&gt; ({ ...r, status: "READ" })), ) |
| [266](../../apps/web/src/features/platform/Notifications.tsx#L266) | Danh sách chọn | Hiển thị | (value) =&gt; showUnread(value === "unread") |
| [276](../../apps/web/src/features/platform/Notifications.tsx#L276) | Liên kết | {r.title} {r.fields.at ? vietnamDate(r.fields.at, true) : r.fields.text} | routeUrl("B04", fromUnread ? "unread~" + r.id : r.id) |
| [302](../../apps/web/src/features/platform/Notifications.tsx#L302) | Nút thao tác | Lưu mẫu | { commit("Lưu mẫu thông báo", [ demoRecord("template-" + event, "message-template", opts[event], { event, val… |

## features/platform/Workflow.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [50](../../apps/web/src/features/platform/Workflow.tsx#L50) | Danh sách chọn | Bước cần đổi tên | setStep |
| [58](../../apps/web/src/features/platform/Workflow.tsx#L58) | Danh sách chọn | Chuyển bước cần sửa | v =&gt; setIndex(Number(v)) |
| [61](../../apps/web/src/features/platform/Workflow.tsx#L61) | Danh sách chọn | Từ bước | from =&gt; update({ from }) |
| [62](../../apps/web/src/features/platform/Workflow.tsx#L62) | Danh sách chọn | Chuyển tới | to =&gt; update({ to }) |
| [75](../../apps/web/src/features/platform/Workflow.tsx#L75) | Nút thao tác | Thêm chuyển bước | { setEdges([...edges, { from: "", to: "", roles: [] }]); setIndex(edges.length) } |
| [78](../../apps/web/src/features/platform/Workflow.tsx#L78) | Nút thao tác | Bỏ chuyển bước | { setEdges(edges.filter((_, i) =&gt; i !== index)); setIndex(Math.max(0, index - 1)) } |
| [84](../../apps/web/src/features/platform/Workflow.tsx#L84) | Gửi biểu mẫu | Lưu bản nháp | Gửi qua onSubmit của biểu mẫu |
| [115](../../apps/web/src/features/platform/Workflow.tsx#L115) | Nút thao tác | Tạo phiên bản | create(selected) |
| [118](../../apps/web/src/features/platform/Workflow.tsx#L118) | Liên kết | {r.title} {r.fields.version} | routeUrl("P01", r.id) |
| [124](../../apps/web/src/features/platform/Workflow.tsx#L124) | Nút thao tác | Chỉnh sửa bản nháp | { setError(""); setDraft({ row: selected, commit: p.commit }) } |
| [125](../../apps/web/src/features/platform/Workflow.tsx#L125) | Nút thao tác | Kích hoạt phiên bản | activate(selected) |

## features/platform/shared.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [104](../../apps/web/src/features/platform/shared.tsx#L104) | Danh sách chọn | {label} | change |

## features/product/IndependentProducts.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [85](../../apps/web/src/features/product/IndependentProducts.tsx#L85) | Nút thao tác | Kê khai sản phẩm độc lập | edit() |
| [88](../../apps/web/src/features/product/IndependentProducts.tsx#L88) | Danh sách chọn | Loại sản phẩm | choiceValue =&gt; change("kind",choiceValue) |
| [96](../../apps/web/src/features/product/IndependentProducts.tsx#L96) | Nút thao tác | Thêm đồng tác giả theo email | addAuthor() |
| [103](../../apps/web/src/features/product/IndependentProducts.tsx#L103) | Nút thao tác | Lưu nháp sản phẩm | save() |
| [104](../../apps/web/src/features/product/IndependentProducts.tsx#L104) | Nút thao tác | Đóng bản kê khai | setEditor(undefined) |
| [109](../../apps/web/src/features/product/IndependentProducts.tsx#L109) | Nút thao tác | {f.label} | download(row.id,f.id) |
| [110](../../apps/web/src/features/product/IndependentProducts.tsx#L110) | Nút thao tác | Sửa bản kê khai | edit(row) |
| [112](../../apps/web/src/features/product/IndependentProducts.tsx#L112) | Nút thao tác | Gửi duyệt sản phẩm | act(row,"submit") |
| [116](../../apps/web/src/features/product/IndependentProducts.tsx#L116) | Nút thao tác | Từ chối sản phẩm | act(row,"reject") |
| [117](../../apps/web/src/features/product/IndependentProducts.tsx#L117) | Nút thao tác | Mở lại bản kê khai | act(row,"reopen") |
| [120](../../apps/web/src/features/product/IndependentProducts.tsx#L120) | Nút thao tác | Tải lại sản phẩm | reload(n=&gt;n+1) |

## features/product/ProductCreditApproval.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [33](../../apps/web/src/features/product/ProductCreditApproval.tsx#L33) | Danh sách chọn | Tác giả chính hoặc liên hệ | choiceValue =&gt; { const id=choiceValue;setLead(id) if(!total&amp;&amp;id)setShares({[id]:100}) } |
| [41](../../apps/web/src/features/product/ProductCreditApproval.tsx#L41) | Nút thao tác | Duyệt sản phẩm | submit |

## features/product/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [44](../../apps/web/src/features/product/view.tsx#L44) | Nút thao tác | Kê khai sản phẩm | setDraft(initial(me,choices?.[0]?.code??"")) |
| [47](../../apps/web/src/features/product/view.tsx#L47) | Danh sách chọn | Loại sản phẩm | choiceValue =&gt; change("kind",choiceValue) |
| [55](../../apps/web/src/features/product/view.tsx#L55) | Nút thao tác | Lưu nháp sản phẩm | run(()=&gt;session.api.PUT("/api/tenants/{slug}/projects/{id}/products/{productId}",{params:product(draft.id),bo… |
| [58](../../apps/web/src/features/product/view.tsx#L58) | Mở / thu gọn | Quyền sử dụng minh chứng sản phẩm | Hiện hoặc ẩn nội dung |
| [58](../../apps/web/src/features/product/view.tsx#L58) | Nút thao tác | Thu quyền · {f.label} | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/products/files/{fileId}/revoke",{params:{path:{..… |
| [63](../../apps/web/src/features/product/view.tsx#L63) | Nút thao tác | Sửa bản kê khai | setDraft({...o,files:o.files.filter(k=&gt;page.files.some(f=&gt;f.id===k))}) |
| [65](../../apps/web/src/features/product/view.tsx#L65) | Nút thao tác | Gửi duyệt sản phẩm | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/products/{productId}/submit",{params:product(o.id… |
| [70](../../apps/web/src/features/product/view.tsx#L70) | Nút thao tác | {o.status==="APPROVED"?"Mở lại bản kê khai":"Từ chối sản phẩm"} | run(()=&gt;session.api.POST("/api/tenants/{slug}/projects/{id}/products/{productId}/decision",{params:product(o.… |

## features/profile/export-profile/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [34](../../apps/web/src/features/profile/export-profile/view.tsx#L34) | Liên kết | {row.title} | "?project="+row.projectId |
| [36](../../apps/web/src/features/profile/export-profile/view.tsx#L36) | Mở / thu gọn | Thông tin công tác và học vị | setEditing(!editing) |
| [38](../../apps/web/src/features/profile/export-profile/view.tsx#L38) | Mở / thu gọn | Xem sổ giờ giảng | setShowLedger(!showLedger) |
| [38](../../apps/web/src/features/profile/export-profile/view.tsx#L38) | Nút thao tác | Xuất lý lịch PDF | download() |

## features/profile/professional/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [34](../../apps/web/src/features/profile/professional/view.tsx#L34) | Danh sách chọn | {label} {required(key)?" *":""} | choiceValue =&gt; put(key,choiceValue) |
| [46](../../apps/web/src/features/profile/professional/view.tsx#L46) | Danh sách chọn | Loại {title.toLowerCase()} | choiceValue =&gt; put("qualifications",qualifications.map((v,j)=&gt;j===i?{...v,name:choiceValue}:v)) |
| [48](../../apps/web/src/features/profile/professional/view.tsx#L48) | Nút thao tác | Xóa dòng {title.toLowerCase()} | put("qualifications",qualifications.filter((_,j)=&gt;i!==j)) |
| [49](../../apps/web/src/features/profile/professional/view.tsx#L49) | Nút thao tác | Thêm {title.toLowerCase()} | put("qualifications",[...qualifications,{kind,name:options[0],year:new Date().getFullYear()}]) |
| [53](../../apps/web/src/features/profile/professional/view.tsx#L53) | Nút thao tác | Xóa quá trình | put("jobs",jobs.filter((_,n)=&gt;i!==n)) |
| [54](../../apps/web/src/features/profile/professional/view.tsx#L54) | Nút thao tác | Thêm quá trình công tác | put("jobs",[...jobs,{place:"",from:"",to:null}]) |
| [55](../../apps/web/src/features/profile/professional/view.tsx#L55) | Gửi biểu mẫu | Lưu hồ sơ công tác | Gửi qua onSubmit của biểu mẫu |

## features/progress/CommitmentFields.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [8](../../apps/web/src/features/progress/CommitmentFields.tsx#L8) | Mở / thu gọn | Sản phẩm cam kết | Hiện hoặc ẩn nội dung |

## features/progress/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [43](../../apps/web/src/features/progress/view.tsx#L43) | Danh sách chọn | Tệp đã xác nhận | select |
| [61](../../apps/web/src/features/progress/view.tsx#L61) | Nút thao tác | Xác nhận giao đề tài | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/assignment",{params,body:ass… |
| [69](../../apps/web/src/features/progress/view.tsx#L69) | Nút thao tác | Tạo kỳ báo cáo | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods",{params,body:{perio… |
| [73](../../apps/web/src/features/progress/view.tsx#L73) | Nút thao tác | Kỳ {p.period} · {localDate(p.dueDate)} · {phaseNames[p.status]} {p.late?" · Trễ hạn":""} | choose(p) |
| [83](../../apps/web/src/features/progress/view.tsx#L83) | Nút thao tác | Nộp báo cáo kỳ | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods/{periodId}/submissio… |
| [89](../../apps/web/src/features/progress/view.tsx#L89) | Nút thao tác | {({pass:"Duyệt đạt",return:"Yêu cầu chỉnh sửa",reopen:"Mở lại báo cáo"})[action]} | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods/{periodId}/review",{… |
| [93](../../apps/web/src/features/progress/view.tsx#L93) | Mở / thu gọn | Điều chỉnh trạng thái thực hiện | Hiện hoặc ẩn nội dung |
| [95](../../apps/web/src/features/progress/view.tsx#L95) | Nút thao tác | {executing?"Tạm dừng thực hiện":"Tiếp tục thực hiện"} | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/activity",{params,body:{acti… |

## features/proposal/Editor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [94](../../apps/web/src/features/proposal/Editor.tsx#L94) | Danh sách chọn | Lĩnh vực đề tài | choiceValue =&gt; setDraft({...draft,fieldId:choiceValue&#124;&#124;null}) |
| [101](../../apps/web/src/features/proposal/Editor.tsx#L101) | Nút thao tác | Bỏ thành viên | setDraft({...draft,memberIds:draft.memberIds.filter(x=&gt;x!==id)}) |
| [103](../../apps/web/src/features/proposal/Editor.tsx#L103) | Nút thao tác | Thêm thành viên | {if(draft.memberIds.includes(member.trim())&#124;&#124;record?.members.some(m=&gt;m.principal&amp;&amp;m.id===member.trim())){setM… |
| [105](../../apps/web/src/features/proposal/Editor.tsx#L105) | Nút thao tác | Lưu nháp đề xuất | save("draft") |
| [106](../../apps/web/src/features/proposal/Editor.tsx#L106) | Nút thao tác | Nộp đề xuất | save("submit") |
| [109](../../apps/web/src/features/proposal/Editor.tsx#L109) | Nút thao tác | Trả hồ sơ bổ sung | save("return") |
| [116](../../apps/web/src/features/proposal/Editor.tsx#L116) | Mở / thu gọn | Hủy đề xuất | Hiện hoặc ẩn nội dung |
| [121](../../apps/web/src/features/proposal/Editor.tsx#L121) | Nút thao tác | Xác nhận hủy đề xuất | onConfirm(value) |

## features/report/call-report/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [98](../../apps/web/src/features/report/call-report/view.tsx#L98) | Danh sách chọn | Kỳ báo cáo | choiceValue =&gt; {setCall(choiceValue);clearSnapshot()} |
| [100](../../apps/web/src/features/report/call-report/view.tsx#L100) | Danh sách chọn | Đơn vị báo cáo | choiceValue =&gt; {setUnit(choiceValue);clearSnapshot()} |
| [103](../../apps/web/src/features/report/call-report/view.tsx#L103) | Nút thao tác | Tạo bản chụp | load("generate") |
| [105](../../apps/web/src/features/report/call-report/view.tsx#L105) | Liên kết | {snapshot.id} | "?"+reportLocation(snapshot.id,!!unit,group) |
| [109](../../apps/web/src/features/report/call-report/view.tsx#L109) | Bộ lọc | Tất cả mã đã cấp | Chọn * |
| [111](../../apps/web/src/features/report/call-report/view.tsx#L111) | Bộ lọc | {labels[status] ?? status} ( {count} ) | Chọn status |
| [114](../../apps/web/src/features/report/call-report/view.tsx#L114) | Liên kết | {r.title} | openProject |
| [115](../../apps/web/src/features/report/call-report/view.tsx#L115) | Nút thao tác | Xuất CSV đối chứng | load("export") |

## features/review/amendment.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [43](../../apps/web/src/features/review/amendment.tsx#L43) | Danh sách chọn | Chủ quy trình nhận yêu cầu | setRecipient |
| [46](../../apps/web/src/features/review/amendment.tsx#L46) | Nút thao tác | {state.action==="REOPEN"?"Mở lại vòng":"Gửi yêu cầu đính chính"} | submit() |
| [52](../../apps/web/src/features/review/amendment.tsx#L52) | Nút thao tác | Tải lại lịch sử kết luận | setReload(v=&gt;v+1) |

## features/review/meetings/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [26](../../apps/web/src/features/review/meetings/view.tsx#L26) | Mở / thu gọn | Biên bản cuộc họp | {show(v=&gt;!v);setRounds(undefined);setSelected("");setFailed(false)} |
| [28](../../apps/web/src/features/review/meetings/view.tsx#L28) | Danh sách chọn | Vòng hội đồng | setSelected |
| [60](../../apps/web/src/features/review/meetings/view.tsx#L60) | Gửi biểu mẫu | Ghi cuộc họp | Gửi qua onSubmit của biểu mẫu |
| [64](../../apps/web/src/features/review/meetings/view.tsx#L64) | Nút thao tác | {f.filename} · bản {f.revision} | download(m.id,f.id).catch(()=&gt;setMessage("Không thể tải biên bản.")) |

## features/review/open-review/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [45](../../apps/web/src/features/review/open-review/view.tsx#L45) | Mở / thu gọn | Lập hội đồng xét duyệt | Hiện hoặc ẩn nội dung |
| [47](../../apps/web/src/features/review/open-review/view.tsx#L47) | Danh sách chọn | "Chức danh "+a.label | choiceValue =&gt; setSeats([...seats.filter(s=&gt;s.accountId!==a.id),...(choiceValue?[{accountId:a.id,role:choiceV… |
| [50](../../apps/web/src/features/review/open-review/view.tsx#L50) | Nút thao tác | Lưu hội đồng | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/review/committees",{params:session.params,… |
| [55](../../apps/web/src/features/review/open-review/view.tsx#L55) | Danh sách chọn | Hồ sơ của kỳ đã đóng | setProject |
| [57](../../apps/web/src/features/review/open-review/view.tsx#L57) | Nút thao tác | Chốt hồ sơ hợp lệ | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/finalize",{params:params(pro… |
| [61](../../apps/web/src/features/review/open-review/view.tsx#L61) | Danh sách chọn | Hội đồng phụ trách | setCommittee |
| [64](../../apps/web/src/features/review/open-review/view.tsx#L64) | Nút thao tác | Mở đợt chấm | run(async()=&gt;{ const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/reviews",{params:params(proj… |
| [68](../../apps/web/src/features/review/open-review/view.tsx#L68) | Danh sách chọn | Đợt xét duyệt | choiceValue =&gt; {const id=choiceValue;setRound(undefined);if(id)void run(async()=&gt;{ const r=await session.api.… |
| [78](../../apps/web/src/features/review/open-review/view.tsx#L78) | Nút thao tác | Tải lại xét duyệt | run(async()=&gt;{}) |

## features/review/review-decision/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [32](../../apps/web/src/features/review/review-decision/view.tsx#L32) | Nút thao tác | Chốt kết luận khoa học | save(false) |
| [35](../../apps/web/src/features/review/review-decision/view.tsx#L35) | Danh sách chọn | Kết quả của hội đồng đạo đức | choiceValue =&gt; setResult(choiceValue as Ethics["result"]) |
| [38](../../apps/web/src/features/review/review-decision/view.tsx#L38) | Nút thao tác | Ghi kết quả đạo đức | save(true) |
| [57](../../apps/web/src/features/review/review-decision/view.tsx#L57) | Nút thao tác | Xem kết quả xét duyệt | load() |

## features/review/submit-score/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [34](../../apps/web/src/features/review/submit-score/view.tsx#L34) | Nút thao tác | Lưu nháp phiếu | save(false) |
| [35](../../apps/web/src/features/review/submit-score/view.tsx#L35) | Nút thao tác | Gửi phiếu chấm | save(true) |

## features/student-project/StudentAmendment.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [35](../../apps/web/src/features/student-project/StudentAmendment.tsx#L35) | Nút thao tác | Điều chỉnh hồ sơ đã duyệt | edit() |
| [40](../../apps/web/src/features/student-project/StudentAmendment.tsx#L40) | Danh sách chọn | Giảng viên phụ trách bản điều chỉnh | setMentor |
| [50](../../apps/web/src/features/student-project/StudentAmendment.tsx#L50) | Nút thao tác | Gửi bản điều chỉnh cho GVHD | save() |
| [51](../../apps/web/src/features/student-project/StudentAmendment.tsx#L51) | Nút thao tác | Đóng biểu mẫu | setPeople(undefined) |

## features/student-project/StudentProgress.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [27](../../apps/web/src/features/student-project/StudentProgress.tsx#L27) | Nút thao tác | Ghi nhận tiến độ | save() |

## features/student-project/StudentResultPanel.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [43](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L43) | Nút thao tác | {f.filename} | download(f.id) |
| [45](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L45) | Danh sách chọn | Loại minh chứng cuối | setCode |
| [48](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L48) | Nút thao tác | Nộp kết quả cuối | decide("submit") |
| [51](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L51) | Nút thao tác | Xác nhận kết quả đủ điều kiện | decide("endorse") |
| [54](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L54) | Nút thao tác | Yêu cầu nộp lại kết quả | decide("revise") |
| [57](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L57) | Nút thao tác | Ghi nhận đạt | decide("pass") |
| [58](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L58) | Nút thao tác | Ghi nhận không đạt | decide("fail") |
| [63](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L63) | Nút thao tác | Cho nhóm làm lại | decide("reopen") |
| [66](../../apps/web/src/features/student-project/StudentResultPanel.tsx#L66) | Nút thao tác | Đóng đề tài | decide("close") |

## features/student-project/confirm-mentor/FacultyDecision.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [23](../../apps/web/src/features/student-project/confirm-mentor/FacultyDecision.tsx#L23) | Nút thao tác | Phê duyệt triển khai | decide("approve") |
| [25](../../apps/web/src/features/student-project/confirm-mentor/FacultyDecision.tsx#L25) | Nút thao tác | Trả đăng ký bổ sung | decide("return") |
| [26](../../apps/web/src/features/student-project/confirm-mentor/FacultyDecision.tsx#L26) | Nút thao tác | Bắt đầu thực hiện | decide("start") |

## features/student-project/confirm-mentor/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [38](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L38) | Nút thao tác | Tạo đăng ký | edit() |
| [42](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L42) | Danh sách chọn | Đợt đăng ký | setCall |
| [43](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L43) | Danh sách chọn | Giảng viên hướng dẫn | setMentor |
| [45](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L45) | Nút thao tác | Mời giảng viên xác nhận | action(editing,"register") |
| [55](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L55) | Nút thao tác | Nộp đăng ký | action(r.id,"submit") |
| [56](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L56) | Nút thao tác | Sửa đăng ký | edit(r) |
| [57](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L57) | Nút thao tác | Xác nhận hướng dẫn | action(r.id,"accept") |
| [59](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L59) | Nút thao tác | Yêu cầu sửa | action(r.id,"return") |
| [59](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L59) | Nút thao tác | Từ chối hướng dẫn | action(r.id,"decline") |
| [60](../../apps/web/src/features/student-project/confirm-mentor/view.tsx#L60) | Nút thao tác | Tải lại đăng ký | setRound(r=&gt;r+1) |

## features/teaching-hour/FormulaEditor.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [27](../../apps/web/src/features/teaching-hour/FormulaEditor.tsx#L27) | Danh sách chọn | Nguồn nghiệp vụ | choiceValue =&gt; setForm({...form,minVnd:undefined,maxVnd:undefined,kind:choiceValue as Formula["kind"],role:ch… |
| [28](../../apps/web/src/features/teaching-hour/FormulaEditor.tsx#L28) | Danh sách chọn | Loại kỳ | choiceValue =&gt; setForm({...form,periodType:choiceValue as Formula["periodType"]}) |
| [34](../../apps/web/src/features/teaching-hour/FormulaEditor.tsx#L34) | Nút thao tác | Lưu định mức | publish() |

## features/teaching-hour/TeachingLedger.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [26](../../apps/web/src/features/teaching-hour/TeachingLedger.tsx#L26) | Nút thao tác | Điều chỉnh giờ | {setRecord(r.id);setDelta("");setReason("");setCommand(crypto.randomUUID())} |
| [27](../../apps/web/src/features/teaching-hour/TeachingLedger.tsx#L27) | Nút thao tác | Ghi điều chỉnh | adjust() |

## features/workflow/workflow-version/view.tsx

| Dòng | Loại | Nhãn hoặc giá trị | Xử lý |
|---:|---|---|---|
| [47](../../apps/web/src/features/workflow/workflow-version/view.tsx#L47) | Danh sách chọn | Chọn bước | choiceValue =&gt; setSi(+choiceValue) |
| [49](../../apps/web/src/features/workflow/workflow-version/view.tsx#L49) | Danh sách chọn | Trạng thái chuẩn | choiceValue =&gt; updateStep({semantic:choiceValue as Step["semantic"]}) |
| [52](../../apps/web/src/features/workflow/workflow-version/view.tsx#L52) | Nút thao tác | Thêm bước | {setSi(g.steps.length);setGraph({...g,steps:[...g.steps,{code:"",semantic:"DRAFT",initial:false,final:false}]… |
| [53](../../apps/web/src/features/workflow/workflow-version/view.tsx#L53) | Nút thao tác | Bỏ bước | {setSi(0);setGraph({...g,steps:g.steps.filter((_,i)=&gt;i!==si)})} |
| [56](../../apps/web/src/features/workflow/workflow-version/view.tsx#L56) | Danh sách chọn | Chọn thao tác | choiceValue =&gt; setEi(+choiceValue) |
| [58](../../apps/web/src/features/workflow/workflow-version/view.tsx#L58) | Danh sách chọn | {k==="from"?"Bước nguồn":"Bước đích"} | choiceValue =&gt; updateEdge({[k]:choiceValue}) |
| [63](../../apps/web/src/features/workflow/workflow-version/view.tsx#L63) | Nút thao tác | Thêm thao tác | {setEi(g.transitions.length);setGraph({...g,transitions:[...g.transitions,{code:"",from:g.steps[0]?.code??"",… |
| [64](../../apps/web/src/features/workflow/workflow-version/view.tsx#L64) | Nút thao tác | Bỏ thao tác | {setEi(0);setGraph({...g,transitions:g.transitions.filter((_,i)=&gt;i!==ei)})} |
| [65](../../apps/web/src/features/workflow/workflow-version/view.tsx#L65) | Nút thao tác | Kích hoạt phiên bản {version+1} | activate() |
| [66](../../apps/web/src/features/workflow/workflow-version/view.tsx#L66) | Nút thao tác | Tải lại mẫu | load().then(x=&gt;{setGraph(x.graph);setVersion(x.version);setSi(0);setEi(0);setMessage("")}).catch(e=&gt;setMessag… |
