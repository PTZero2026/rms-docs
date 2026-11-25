import { schoolUnits } from '../../demo/datasets.ts'
import {
  change,
  check,
  date,
  fmtDate,
  ids,
  live,
  member,
  officer,
  row,
  setting,
  today,
  unitAllowed,
  typeNames,
} from './model.ts'
import type { Context, Data, Row } from './model.ts'

export function viewProfile(c: Context, r: Row) {
  return (
    r.kind === 'profile' &&
    (r.owner === c.session.userId || officer(c, r) || (c.session.role === 'admin' && unitAllowed(c, r)))
  )
}
// Accounts created after the demo was seeded also have a self-service profile.
// Materialize its editable fields on the first save, without duplicating the account.
function accountProfile(account: Row): Row {
  return row(
    'profile',
    account.title,
    'ACTIVE',
    account.owner,
    account.unit,
    { position: '', email: account.fields.email || '', department: account.unit },
    'exec-profile-' + account.owner,
  )
}
export function profileRecords(c: Context) {
  const stored = c.rows.filter((r) => r.kind === 'profile')
  const owners = new Set(stored.map((r) => r.owner))
  const incoming = c.rows.filter((r) => r.kind === 'account' && !owners.has(r.owner)).map(accountProfile)
  return [...stored, ...incoming].filter((r) => viewProfile(c, r))
}
function verifyProfile(c: Context, r: Row) {
  if (c.rows.some((x) => x.id === r.id)) live(c, r)
  else {
    const account = c.rows.find((x) => x.kind === 'account' && x.owner === r.owner)
    check(
      account && JSON.stringify(accountProfile(account)) === JSON.stringify(r),
      'Hồ sơ không khớp tài khoản hiện tại.',
    )
  }
  check(viewProfile(c, r), 'Hồ sơ nằm ngoài phạm vi truy cập.')
}
export function school(c: Context) {
  return c.session.tenant === 'tlu' ? 'Trường Đại học Thủy lợi' : 'Trường Đại học Y Hà Nội'
}
export function buildCV(c: Context, r: Row) {
  verifyProfile(c, r)
  const inScope = (x: Row) =>
    r.owner === c.session.userId || (c.session.role === 'admin' && unitAllowed(c, x)) || officer(c, x)
  const own = (kind: string) =>
    c.rows.filter((x) => x.kind === kind && x.owner === r.owner && x.status !== 'DELETED' && inScope(x))
  const unique = (list: Row[]) => [...new Map(list.map((x) => [x.id, x])).values()]
  const outputs = unique(
    c.rows.filter(
      (x) =>
        x.kind === 'output' &&
        x.status === 'APPROVED' &&
        (ids(x.fields.authors).includes(r.owner) || x.owner === r.owner) &&
        inScope(x),
    ),
  )
  const projects = unique(
    c.rows.filter((x) => x.kind === 'project' && (x.owner === r.owner || member(x, r.owner)) && inScope(x)),
  )
  const hours = c.e4Enabled
    ? own('hours').filter(
        (x) =>
          !['DRAFT', 'REJECTED', 'CANCELLED', 'SUPERSEDED', 'REVOKED'].includes(x.status) &&
          Number.isFinite(Number(x.fields.hours)),
      )
    : []
  const configured = setting(c, 'PROFILE.TEMPLATE', '')
  const selected = c.rows.find(
    (x) => x.kind === 'cvTemplate' && configured === x.fields.code + '.v' + x.fields.version,
  )
  const template = selected ?? c.rows.find((x) => x.kind === 'cvTemplate' && x.status === 'ACTIVE')
  check(template, 'Đơn vị chưa có mẫu lý lịch hiệu lực.')
  return {
    profile: r,
    school: school(c),
    outputs,
    projects,
    hours,
    template,
    templateReady: !configured || Boolean(selected),
    qualifications: own('qualification'),
    employment: own('employment'),
  }
}
export function updateProfile(c: Context, r: Row, d: Data) {
  verifyProfile(c, r)
  check(d.name?.trim(), 'Họ tên là trường bắt buộc.')
  if (c.session.tenant === 'tlu') check(d.position?.trim(), 'Trường yêu cầu nhập chức vụ.')
  check(
    !d.department || d.department === r.unit || schoolUnits(c.session.tenant, c.rows).includes(d.department),
    'Đơn vị công tác ngoài danh mục.',
  )
  if (d.birth) {
    date(d.birth, 'sinh')
    check(d.birth <= today, 'Ngày sinh không thể ở tương lai.')
  }
  const years = c.rows.filter((x) => x.kind === 'qualification' && x.status === 'ACTIVE' && x.owner === r.owner)
  check(
    !d.birth || years.every((x) => x.fields.year >= d.birth.slice(0, 4)),
    'Ngày sinh sau năm nhận học hàm hoặc học vị.',
  )
  return [
    {
      ...r,
      title: d.name.trim(),
      fields: {
        ...r.fields,
        department: d.department || r.fields.department || r.unit,
        position: d.position,
        discipline: d.discipline || '',
        gender: d.gender || '',
        birth: d.birth || '',
        phone: d.phone === 'sample' ? '09•• ••• ••00' : '',
        address: c.session.tenant === 'hmu' && d.address === 'sample' ? 'Địa chỉ mẫu tại Hà Nội' : '',
      },
    },
  ]
}
export function addCareer(c: Context, r: Row, kind: 'qualification' | 'employment', d: Data) {
  verifyProfile(c, r)
  if (kind === 'qualification') {
    const choices =
      d.type === 'RANK'
        ? ['Giáo sư', 'Phó giáo sư']
        : d.type === 'DEGREE'
          ? ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân']
          : []
    check(choices.includes(d.title), 'Chọn loại học hàm hoặc học vị hợp lệ.')
    check(
      /^\d{4}$/.test(d.year) && d.year <= '2026' && d.year >= (r.fields.birth?.slice(0, 4) || '1900'),
      'Năm nhận không hợp lệ.',
    )
  } else {
    check(d.title?.trim() && d.position?.trim(), 'Nhập đơn vị và chức vụ.')
    date(d.start, 'bắt đầu')
    if (d.end) date(d.end, 'kết thúc')
    check(!d.end || d.start <= d.end, 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.')
  }
  return [row(kind, d.title, 'ACTIVE', r.owner, r.unit, { ...d })]
}
export function removeCareer(c: Context, r: Row, item: Row) {
  verifyProfile(c, r)
  live(c, item)
  check(
    viewProfile(c, r) &&
      ['employment', 'qualification'].includes(item.kind) &&
      item.owner === r.owner &&
      item.unit === r.unit,
    'Dòng lý lịch ngoài phạm vi.',
  )
  return [change(item, 'DELETED')]
}
export function activateTemplate(c: Context, id: string) {
  check(c.session.role === 'admin', 'Chỉ quản trị được kích hoạt mẫu.')
  const next = c.rows.find((x) => x.kind === 'cvTemplate' && x.id === id)
  check(next, 'Không tìm thấy mẫu.')
  const updates = c.rows
    .filter((x) => x.kind === 'cvTemplate' && (x.id === id) !== (x.status === 'ACTIVE'))
    .map((x) => change(x, x.id === id ? 'ACTIVE' : 'INACTIVE'))
  const config = c.rows.find(
    (x) => x.kind === 'config' && x.fields.key === 'PROFILE.TEMPLATE' && x.fields.scope === 'tenant',
  )
  if (c.rows.some((x) => x.kind === 'config' && x.fields.key === 'PROFILE.TEMPLATE')) {
    const value = next.fields.code + '.v' + next.fields.version
    if (config?.fields.value !== value || config.fields.active === 'false')
      updates.push(
        row(
          'config',
          'Mẫu lý lịch khoa học',
          'ACTIVE',
          c.session.userId,
          c.session.unit,
          {
            ...config?.fields,
            key: 'PROFILE.TEMPLATE',
            value,
            scope: 'tenant',
            active: 'true',
            group: 'Biểu mẫu',
            mime: 'text/plain',
          },
          config?.id || 'exec-cv-template-setting',
        ),
      )
  }
  return updates
}
function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  )
}
export function exportCV(c: Context, r: Row) {
  const cv = buildCV(c, r)
  check(cv.templateReady, 'Phiên bản mẫu cấu hình của đơn vị chưa có trong thư viện mẫu.')
  const section = (title: string, lines: string[]) =>
    '<h2>' + escape(title) + '</h2><ul>' + lines.map((s) => '<li>' + escape(s) + '</li>').join('') + '</ul>'
  const head = cv.template.title
  const version = cv.template.fields.version
  const code = cv.template.fields.code
  const html =
    '<!doctype html><html lang="vi"><meta charset="utf-8"><title>' +
    escape(head) +
    '</title><style>body{font:12pt Georgia,serif;max-width:175mm;margin:16mm auto;color:#162c37}h1,h2{break-after:avoid}li{margin:.35em 0}footer{margin-top:3em;text-align:right}@page{size:A4;margin:16mm}</style><body><p>' +
    escape(cv.school) +
    '</p><h1>' +
    escape(head) +
    '</h1><p>' +
    escape(code + ' · Phiên bản ' + version + ' · ' + fmtDate(today)) +
    '</p><h2>' +
    escape(r.title) +
    '</h2><p>' +
    escape(
      [r.fields.department || r.unit, r.fields.position, r.fields.discipline].filter(Boolean).join(' · '),
    ) +
    '</p>' +
    section(
      'Học hàm và học vị',
      cv.qualifications.map((x) => x.title + ' · ' + x.fields.year),
    ) +
    section(
      'Quá trình công tác',
      cv.employment.map((x) =>
        [
          x.title,
          x.fields.position,
          fmtDate(x.fields.start),
          x.fields.end ? fmtDate(x.fields.end) : 'Đang công tác',
        ].join(' · '),
      ),
    ) +
    section(
      'Tham gia đề tài',
      cv.projects.map((x) =>
        [x.fields.code, x.title, x.owner === r.owner ? 'Chủ nhiệm' : 'Thành viên'].join(' · '),
      ),
    ) +
    section(
      'Sản phẩm khoa học đã duyệt',
      cv.outputs.map((x) =>
        [x.title, typeNames[x.fields.type], x.fields.year, x.fields.publication].join(' · '),
      ),
    ) +
    (c.e4Enabled
      ? section(
          'Giờ giảng quy đổi · ' +
            cv.hours.reduce((s, x) => s + Number(x.fields.hours), 0).toLocaleString('vi-VN') +
            ' giờ',
          cv.hours.map((x) =>
            [x.title, x.fields.hours + ' giờ', x.fields.sourceId, 'Công thức ' + x.fields.formulaVersion].join(
              ' · ',
            ),
          ),
        )
      : '') +
    '<footer>Người lập lý lịch<br>(Ký và ghi rõ họ tên)</footer></body></html>'
  return { html, code, version, filename: code + '-v' + version + '-' + r.owner + '.html' }
}
