import type { DemoRow, Tenant } from '../../demo/types'
import type { Source } from './model.ts'
import { policySeed, settingRow } from './catalogue.ts'
import { codes } from './model.ts'
import { schoolRows } from '../../demo/datasets.ts'
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
    settingRow('MANAGING_BODY','Cơ quan quản lý cấp trên',tenant === 'hmu' ? ['Bộ Y tế','Bộ Khoa học và Công nghệ','UBND thành phố Hà Nội'] : ['Bộ Nông nghiệp và Môi trường','Bộ Khoa học và Công nghệ','UBND tỉnh Hưng Yên','UBND tỉnh Phú Thọ']),
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
  const records = schoolRows(tenant, 'extension')
  rows.push(...records)
  for (const source of records.filter(row => row.fields.sourceOccurredAt)) {
    rows.push(...postHours(rows, source))
  }
  return rows
}
