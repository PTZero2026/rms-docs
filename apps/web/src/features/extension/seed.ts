import type { DemoRow, Tenant } from '../../demo/types'
import type { Source } from './model.ts'
import { policySeed, settingRow } from './catalogue.ts'
import { codes, featureInfo, units } from './model.ts'
import { postHours } from './hours.ts'

type Fields = DemoRow['fields']
function config(id: string, kind: string, title: string, fields: Fields, status = 'ACTIVE'): DemoRow {
  return { id: 'ext-' + id, kind, title, status, owner: 'ha', unit: '', fields }
}
function policy(feature: Source, code: string, title: string, declaration: string, result: string, formula: string, trigger = 'approval') {
  return policySeed(feature,code,title,codes(declaration),codes(result),formula,trigger)
}
export const contractBands = [[0,20],[100000000,40],[300000000,60],[500000000,80],[1000000000,100]]
function formula(activity: string, title: string, base: number, more: Fields = {}, status = 'ACTIVE') {
  const fields = { activity, version: 'v1', base: String(base), multiplier: '1', validFrom: '2025-01-01',
    validTo: '2026-12-31', periodType: 'ACADEMIC_YEAR', ...more }
  return config('formula-' + activity + '-' + fields.version,'ext-formula',title,fields,status)
}
export function seed(tenant: Tenant): DemoRow[] {
  const rows = [
    settingRow('MANAGING_BODY','Cơ quan quản lý cấp trên',['Bộ Nông nghiệp và Môi trường','Bộ Khoa học và Công nghệ','UBND tỉnh Hưng Yên','UBND tỉnh Phú Thọ']),
    config('calendar','ext-calendar','Lịch quy đổi', { periodType: 'ACADEMIC_YEAR', academicMonth: '9', fiscalMonth: '1' }),
    policy('F09','MINISTRY','Cấp Bộ','DECISION','ACCEPTANCE_MINUTES','MINISTRY'),
    policy('F09','PROVINCE','Cấp tỉnh','DECISION','ACCEPTANCE_MINUTES','PROVINCE'),
    policy('F09','STATE','Cấp Nhà nước','DECISION,CONTRACT','ACCEPTANCE_MINUTES','STATE'),
    policy('F11','TRANSFER','Chuyển giao công nghệ','CONTRACT','ACCEPTANCE_MINUTES','APPLIED','result'),
    policy('F11','TECHNICAL','Dịch vụ kỹ thuật','CONTRACT','ACCEPTANCE_MINUTES','APPLIED','result'),
    policy('F12','CONFERENCE','Hội nghị, hội thảo',tenant === 'tlu' ? 'ASSIGNMENT,PROGRAM' : 'PARTICIPATION','','CONFERENCE'),
    policy('F12','COMMUNITY','Phục vụ cộng đồng','PARTICIPATION','','COMMUNITY'),
    policy('F12','IP','Sở hữu trí tuệ','PATENT','','PATENT'),
    formula('MINISTRY','Đề tài cấp Bộ',80), formula('PROVINCE','Đề tài cấp tỉnh',50), formula('STATE','Đề tài cấp Nhà nước',120),
    formula('STUDENT_MENTOR','Hướng dẫn sinh viên',24), formula('APPLIED','Dự án phục vụ sản xuất',20,{ bands: JSON.stringify(contractBands) }),
    formula('CONFERENCE','Báo cáo tại hội nghị',6,{ validTo: '2026-09-30' }),
    formula('CONFERENCE','Báo cáo tại hội nghị',8,{ validFrom: '2026-10-01', version: 'v2' }),
    formula('COMMUNITY','Hoạt động cộng đồng',12),
    formula('PATENT','Bằng độc quyền sáng chế',100,{ multiplier: '2' }),
    formula('UTILITY_SOLUTION','Giải pháp hữu ích',100), formula('SCIE_Q1','Bài báo SCIE Q1',100),
    formula('SCIE_Q2','Bài báo SCIE Q2',100,{ multiplier: '0.5' },'NEEDS_PO_VALIDATION'),
  ]
  const call: DemoRow = { id: 'ext-call-autumn', kind: 'ext-student-call', title: 'NCKH sinh viên 2026–2027', status: 'OPEN', unit: units[0], owner: 'an',
    fields: { start: '2026-10-01', end: '2026-12-15', finalDue: '2027-05-15', min: '1', max: '5', declaration: '', result: 'FINAL_REPORT,PRODUCT' } }
  rows.push(call, { ...call, id: 'ext-call-spring', title: 'NCKH sinh viên học kỳ II 2025–2026', status: 'CLOSED',
    fields: { ...call.fields, start: '2026-01-04', end: '2026-03-20', finalDue: '2026-12-01' } })
  rows.push({ ...call, id: 'ext-call-environment', title: 'NCKH sinh viên môi trường 2026–2027', unit: units[1], fields: {...call.fields} })
  if (tenant !== 'tlu') return rows
  const team = JSON.stringify([{ id: 'mai', role: 'Chủ nhiệm', share: 60 },{ id: 'minh', role: 'Thành viên', share: 40 }])
  const sole = JSON.stringify([{ id: 'mai', role: 'Chủ nhiệm', share: 100 }])
  const mentor = JSON.stringify([{ id: 'mai', role: 'GV hướng dẫn', share: 100 }])
  function add(id: string, source: Source, title: string, status: string, fields: Fields, unit = units[0], owner = 'mai') {
    const row = { id: 'ext-' + id, kind: featureInfo[source].kind, title, status, unit, owner, fields: {
      scopeUnit: unit, cycle: '1', start: '2026-03-01', end: '2026-11-30', contributors: sole, evidence: '{}', ...fields,
      memberIds: [...(fields.group || '').split(','), ...JSON.parse(fields.contributors || sole).map((p: {id:string}) => p.id)].filter(Boolean).join(','),
      statusSemantic: ({ MENTOR_PENDING: 'DRAFT', PENDING_APPROVAL: 'SUBMITTED' } as Fields)[status] || status,
    } }
    rows.push(row)
    return row
  }
  add('upper-pending','F09','Dự báo bồi lắng hồ chứa vùng trung du Bắc Bộ','PENDING_APPROVAL',{
    category: 'MINISTRY', code: 'B2026-TL-08', agency: 'Bộ Nông nghiệp và Môi trường', budget: '1250000000', contributors: team,
    evidence: JSON.stringify({ DECISION: 'QĐ-128-giao-nhiệm-vụ.pdf' }) })
  add('upper-draft','F09','Đánh giá xói lở bờ sông trên địa bàn Hưng Yên','DRAFT',{
    category: 'PROVINCE', code: 'HY-26-14', agency: 'UBND tỉnh Hưng Yên', budget: '480000000' })
  add('applied-draft','F11','Chuyển giao bộ cảm biến rò rỉ cho tuyến đê thử nghiệm','DRAFT',{
    category: 'TRANSFER', code: 'CG-26-17', partner: '', contributors: team, budget: '350000000',
    evidence: JSON.stringify({ CONTRACT: 'HĐ-17-bản-ghi.pdf' }) })
  const applied = add('applied-complete','F11','Kiểm định trạm bơm tiêu cụm Yên Sở','COMPLETED',{
    category: 'TECHNICAL', code: 'DVKT-2026-09', partner: 'Công ty Khai thác công trình thủy lợi Sông Nhuệ', contributors: team,
    end: '2026-11-06', budget: '350000000', sourceOccurredAt: '2026-11-12', resultSummary: 'Bàn giao bộ đường đặc tính và báo cáo chạy tải ba tổ máy.',
    evidence: JSON.stringify({ CONTRACT: 'HĐ-DVKT-09.pdf', ACCEPTANCE_MINUTES: 'BB-nghiệm-thu-12-11.pdf' }) })
  const studentFields = { category: 'STUDENT', callId: call.id, group: 'linh,phuc,yen', contributors: mentor, product: 'Bản đồ các vị trí có nguy cơ ngập',
    objective: 'Đối chiếu cao độ thực địa với mực nước sau mưa để xác định điểm ngập.', code: 'SV-CT-26-12' }
  add('student-invite','F10','Lập bản đồ điểm ngập quanh khuôn viên trường','MENTOR_PENDING',studentFields,units[0],'linh')
  add('student-field','F10','Khảo sát thấm qua lớp lọc bằng cát tái chế','IN_PROGRESS',{
    ...studentFields, code: 'SV-CT-26-03', group: 'linh,yen', callId: 'ext-call-spring', product: 'Mô hình cột thấm và bộ số liệu thực nghiệm',
    objective: 'Đo hệ số thấm dưới ba cấp tải trọng.', mentorConfirmation: 'ext-student-field', confirmedMentor: 'mai' },units[0],'linh')
  const conference = add('activity-conference','F12','Báo cáo về quan trắc biến dạng đập đất tại hội nghị thủy lợi','APPROVED',{
    category: 'CONFERENCE', start: '2026-09-23', sourceOccurredAt: '2026-09-30', description: 'Báo cáo chuyên đề tại phiên an toàn hồ đập.',
    support: '1800000', evidence: JSON.stringify({ ASSIGNMENT: 'Tờ-trình-cử-đi.pdf', PROGRAM: 'Chương-trình-phiên-B.pdf' }) })
  add('activity-community','F12','Tập huấn đọc bản đồ ngập cho tổ phòng chống thiên tai','PENDING_APPROVAL',{
    category: 'COMMUNITY', start: '2026-11-14', description: 'Hướng dẫn sử dụng bản đồ ngập trong diễn tập tại xã ven sông.',
    evidence: JSON.stringify({ PARTICIPATION: 'Xác-nhận-của-xã.pdf' }) })
  add('activity-patent','F12','Cụm lấy mẫu nước tự động tại cửa xả','DRAFT',{ category: 'IP', start: '2026-11-05',
    description: 'Văn bằng cho cụm van lấy mẫu theo chu kỳ.', contributors: JSON.stringify([{ id: 'minh', role: 'Chủ nhiệm', share: 100 }]) },units[1],'minh')
  rows.push(...postHours(rows,applied), ...postHours(rows,conference))
  return rows
}

