import { sourceAllowed } from '../../demo/source-rights.ts'
import {
  change,
  check,
  evidence,
  ids,
  live,
  member,
  now,
  officer,
  related,
  row,
  scoped,
  today,
  typeNames,
  unitAllowed,
} from './model.ts'
import type { Context, Data, Row } from './model.ts'

export function viewOutput(c: Context, r: Row) {
  if (r.kind !== 'output') return false
  if (c.session.role === 'officer') return officer(c, r)
  if (c.session.role === 'admin') return unitAllowed(c, r)
  const p = c.rows.find((x) => x.id === r.fields.projectId && x.kind === 'project' && x.unit === r.unit)
  return (
    r.owner === c.session.userId ||
    ids(r.fields.authors).includes(c.session.userId) ||
    Boolean(p && scoped(c, p))
  )
}
export function hasFullText(r: Row) {
  return r.fields.access === 'FULL' && (!r.fields.expires || r.fields.expires >= today)
}
export function author(c: Context, r: Row) {
  return r.owner === c.session.userId || ids(r.fields.authors).includes(c.session.userId)
}
const norm = (s: string) => s.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi')
export function saveOutput(c: Context, d: Data, submit: boolean, previous?: Row) {
  if (previous) {
    live(c, previous)
    check(
      viewOutput(c, previous) &&
        (author(c, previous) || officer(c, previous)) &&
        ['DRAFT', 'REJECTED'].includes(previous.status),
      'Sản phẩm đã khóa hoặc ngoài phạm vi.',
    )
  }
  const p = d.projectId ? c.rows.find((r) => r.kind === 'project' && r.id === d.projectId) : undefined
  check(
    !d.projectId || (p && scoped(c, p) && p.status !== 'COMPLETED'),
    'Không thể kê khai vào đề tài đã đóng hoặc ngoài phạm vi.',
  )
  const authors = ids(d.authors)
  check(
    !authors.some(
      (id) =>
        !c.rows.some(
          (r) =>
            r.kind === 'profile' &&
            r.owner === id &&
            (r.unit === (p?.unit || c.session.unit) ||
              officer(c, r) ||
              (p && (member(p, id) || p.owner === id)) ||
              id === c.session.userId),
        ),
    ),
    'Tác giả ngoài danh sách được phép.',
  )
  check(
    c.session.role === 'officer' || authors.includes(c.session.userId) || (p && p.owner === c.session.userId),
    'Chỉ kê khai cho bản thân hoặc đề tài chủ trì.',
  )
  check(d.title?.trim(), 'Nhập tên sản phẩm.')
  const replaced = previous && previous.fields.evidence !== d.evidence
  if (previous && !replaced && d.access === 'FULL') {
    check(hasFullText(previous), 'Thay tệp đã hết quyền để khôi phục quyền sử dụng.')
  }
  if (submit) {
    check(typeNames[d.type], 'Chọn loại sản phẩm đang áp dụng.')
    const start = p && related(c, p, 'assignment')[0]?.fields.start
    check(
      /^\d{4}$/.test(d.year) && d.year <= today.slice(0, 4) && d.year >= (start?.slice(0, 4) || '1900'),
      'Năm công bố ngoài thời gian hợp lệ.',
    )
    check(authors.length && d.publication?.trim(), 'Cần tác giả và thông tin công bố.')
    evidence(d.evidence)
    const sameEvidence = previous && previous.fields.evidence === d.evidence
    check(!sameEvidence || hasFullText(previous), 'Hãy thay tệp đã hết quyền trước khi gửi.')
    check(d.access === 'FULL', 'Quyền sử dụng minh chứng đã hết. Hãy thay minh chứng.')
    const same = c.rows.filter(
      (r) =>
        r.kind === 'output' &&
        r.id !== previous?.id &&
        norm(r.title) === norm(d.title) &&
        r.fields.year === d.year,
    )
    check(
      !same.some((r) => p && r.fields.projectId === p.id && r.fields.type === d.type),
      'Sản phẩm đã có cùng đề tài, loại, tên và năm.',
    )
    check(
      d.distinct === 'yes' || !same.some((r) => ids(r.fields.authors).some((id) => authors.includes(id))),
      'Trùng tên, năm và tác giả. Xác nhận đây là sản phẩm khác trước khi gửi.',
    )
  }
  const fields = {
    ...previous?.fields,
    ...d,
    authors: [...new Set(authors)].join(','),
    expires: previous?.fields.evidence === d.evidence ? previous?.fields.expires || '' : '',
    sourceVersion: previous?.fields.sourceVersion || '1',
  }
  // A replaced attachment cannot inherit page references from its predecessor.
  if (previous && (previous.fields.evidence !== d.evidence || previous.fields.doi !== d.doi)) {
    Object.assign(fields, {
      method: '',
      methodPage: '',
      result: '',
      resultPage: '',
      sourceVersion: String(Number(previous.fields.sourceVersion || 1) + 1),
    })
  }
  const owner =
    previous?.owner ||
    (c.session.role === 'officer' ? authors[0] || p?.owner || c.session.userId : c.session.userId)
  return [
    row(
      'output',
      d.title.trim(),
      submit ? 'PENDING_APPROVAL' : 'DRAFT',
      owner,
      p?.unit || previous?.unit || c.session.unit,
      fields,
      previous?.id,
    ),
  ]
}
export function decideOutput(c: Context, r: Row, status: 'APPROVED' | 'REJECTED' | 'DRAFT', reason: string) {
  live(c, r)
  check(
    r.kind === 'output' && officer(c, r) && !author(c, r),
    'Cần chuyên viên trong phạm vi, độc lập với tác giả.',
  )
  check(
    status === 'DRAFT' ? r.status === 'APPROVED' : r.status === 'PENDING_APPROVAL',
    'Sản phẩm chưa thể chuyển bước.',
  )
  const p = c.rows.find((x) => x.kind === 'project' && x.id === r.fields.projectId)
  check(!p || p.status !== 'COMPLETED', 'Đề tài đã đóng.')
  if (status === 'APPROVED') {
    evidence(r.fields.evidence)
    check(hasFullText(r), 'Minh chứng không còn quyền sử dụng.')
  } else check(reason.trim(), 'Nhập lý do từ chối hoặc đính chính.')
  return [change(r, status, { reason, reviewer: c.session.userId, reviewedAt: now })]
}
export function readCard(c: Context, r: Row) {
  live(c, r)
  check(c.aiEnabled && sourceAllowed(c.rows, r) && viewOutput(c, r), 'Thẻ đọc nằm ngoài phạm vi được phép.')
  check(/^10\.\d{4,9}\/\S+$/i.test(r.fields.doi || ''), 'Chưa có DOI để lập thẻ.')
  const full = hasFullText(r)
  const cited = (text: string, page: string) =>
    full && text && page ? text + ' (trang ' + page + ')' : 'Chưa đủ căn cứ'
  return {
    title: r.title,
    authors: r.fields.authors,
    year: r.fields.year,
    doi: r.fields.doi,
    version: r.fields.sourceVersion || '1',
    method: cited(r.fields.method, r.fields.methodPage),
    result: cited(r.fields.result, r.fields.resultPage),
  }
}
export function keepCard(c: Context, r: Row, manual: string, useAI: boolean) {
  live(c, r)
  check(viewOutput(c, r), 'Nguồn ngoài phạm vi.')
  if (useAI) readCard(c, r)
  else check(manual.trim(), 'Nhập ghi chú thủ công.')
  // Store a reference only. Rendering must check current source rights every time.
  const id = 'exec-card-' + c.session.userId + '-' + r.id
  return [
    row(
      'readingCard',
      'Thẻ đọc · ' + r.title,
      'ACTIVE',
      c.session.userId,
      r.unit,
      {
        sourceId: r.id,
        projectId: r.fields.projectId || '',
        version: r.fields.sourceVersion || '1',
        mode: useAI ? 'AI' : 'MANUAL',
        manual: useAI ? '' : manual,
      },
      id,
    ),
  ]
}
