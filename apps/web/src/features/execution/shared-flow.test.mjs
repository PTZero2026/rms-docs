import test from 'node:test'
import assert from 'node:assert/strict'
import { applyTransaction } from '../../demo/workflow.ts'
import { seed } from './seed.ts'
import { assign, schedule, submitReport, reviewReport } from './progress.ts'
import { allocate, saveExpense, reconcile, settle } from './budget.ts'
import { saveOutput, decideOutput } from './products.ts'
import { takeIntoAcceptance, committee, openRound, submitBallot, conclude } from './acceptance.ts'

test('one approved F01 record reaches completion using the shared commit, retaining project, call and pinned workflow IDs', () => {
  const projectId = 'dt-incoming'
  const project = {
    id: projectId,
    kind: 'project',
    title: 'Hiệu chuẩn máy đo biến dạng trong thử tải',
    status: 'APPROVED',
    owner: 'mai',
    unit: 'Khoa Công trình',
    fields: {
      code: 'TLU-NC-26',
      callId: 'call-01',
      workflowVersion: 'v1',
      requestedBudget: '100000000',
      durationMonths: '12',
      outcome: 'Báo cáo kỹ thuật và số liệu kiểm chứng',
      memberIds: 'linh',
    },
  }
  let snapshot = { rows: [...seed('tlu'), project], audit: [] }
  const staff = { userId: 'an', role: 'officer' },
    pi = { userId: 'mai', role: 'researcher' },
    reviewer = { userId: 'minh', role: 'reviewer' }
  const get = (id) => snapshot.rows.find((row) => row.id === id)
  function perform(actor, action, command) {
    const session = { ...actor, unit: project.unit, tenant: 'tlu', name: actor.userId }
    const context = { rows: snapshot.rows, session, aiEnabled: true, e4Enabled: true }
    const updates = command(context, get(projectId))
    assert.deepEqual(
      updates.map((x) => x.id),
      [...new Set(updates.map((x) => x.id))],
    )
    snapshot = applyTransaction(snapshot, session, action, updates, updates[0])
    return get(updates[0].id)
  }
  perform(staff, 'Giao đề tài', (c, p) =>
    assign(c, p, {
      decision: 'QĐ-26',
      signed: '2026-11-20',
      effective: '2026-11-21',
      start: '2026-11-21',
      end: '2027-11-20',
      amount: '100000000',
      evidence: 'Quyet-dinh.pdf',
      countREPORT: '1',
    }),
  )
  assert.equal(get(projectId).status, 'IN_PROGRESS')
  const report = perform(staff, 'Lập kỳ', (c, p) => schedule(c, p, { period: '1', dueDate: '2026-11-21' }))
  perform(pi, 'Nộp báo cáo', (c, p) =>
    submitReport(c, p, get(report.id), { content: 'Đã kiểm định thiết bị.', evidence: 'Bao-cao.pdf' }),
  )
  assert.equal(get(report.id).fields.late, 'false')
  perform(staff, 'Duyệt báo cáo', (c, p) => reviewReport(c, p, get(report.id), 'PASSED', ''))
  perform(staff, 'Cấp kinh phí', (c, p) => allocate(c, p, { amount: '100000000' }))
  const exp = perform(pi, 'Ghi chi', (c, p) =>
    saveExpense(c, p, {
      title: 'Thử tải thiết bị',
      amount: '3000000',
      date: '2026-11-20',
      evidence: 'PC-23.pdf',
    }),
  )
  const output = perform(pi, 'Gửi sản phẩm', (c, p) =>
    saveOutput(
      c,
      {
        title: 'Quy trình thử tải mẫu',
        type: 'REPORT',
        authors: 'mai',
        projectId: p.id,
        year: '2026',
        publication: 'Bộ môn kết cấu',
        access: 'FULL',
        evidence: 'Thu-tai.pdf',
      },
      true,
    ),
  )
  perform(staff, 'Duyệt sản phẩm', (c) => decideOutput(c, get(output.id), 'APPROVED', ''))
  perform(pi, 'Đăng ký nghiệm thu', (c, p) => takeIntoAcceptance(c, p, 'Ho-so-cuoi.pdf'))
  perform(staff, 'Lập hội đồng', (c, p) => committee(c, p, { members: 'minh', decision: 'QĐ-HĐ-17' }))
  perform(staff, 'Mở đợt nghiệm thu', (c, p) => openRound(c, p, { date: '2026-11-26' }))
  perform(reviewer, 'Gửi phiếu', (c, p) =>
    submitBallot(c, p, { science: '88', impact: '82', comment: 'Đủ số liệu' }),
  )
  perform(staff, 'Kết luận', (c, p) => conclude(c, p))
  assert.equal(get(projectId).status, 'PASSED')
  assert.throws(() => perform(staff, 'Đóng sổ', (c, p) => settle(c, p, true)))
  perform(staff, 'Đối chiếu', (c, p) => reconcile(c, p, get(exp.id), '3000000', 'MB-231'))
  perform(staff, 'Đóng sổ', (c, p) => settle(c, p, false))
  assert.equal(get(projectId).status, 'COMPLETED')
  assert.deepEqual(
    [get(projectId).fields.code, get(projectId).fields.callId, get(projectId).fields.workflowVersion],
    ['TLU-NC-26', 'call-01', 'v1'],
  )
  assert.equal(snapshot.rows.filter((r) => r.id === projectId).length, 1)
  assert.equal(snapshot.audit.filter((x) => x.recordId === projectId).at(-1).to, 'COMPLETED')
  assert.throws(() => perform(pi, 'Sửa sau đóng', (c, p) => saveExpense(c, p, { amount: '100' }, get(exp.id))))
})
