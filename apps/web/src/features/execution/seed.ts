import type { DemoRow, Tenant } from '../../demo/types.ts'
import { linked, people, row } from './model.ts'

const ct = 'Khoa Công trình'
const mt = 'Khoa Môi trường'
export function seed(tenant: Tenant): DemoRow[] {
  const prefix = tenant.toUpperCase()
  const project = (id: string, title: string, status: string, n: string, unit = ct, owner = 'mai') =>
    row(
      'project',
      title,
      status,
      owner,
      unit,
      {
        code: prefix + '-26-' + n,
        callId: 'call-01',
        workflowVersion: 'v1',
        memberIds: 'linh',
        commitments: '{"ARTICLE":1,"PATENT":1}',
        requestedBudget: '100000000',
        durationMonths: '12',
      },
      'exec-' + id,
    )
  const river = project('river', 'Quan trắc xói lở bờ sông bằng cảm biến mực nước', 'IN_PROGRESS', '014')
  const drain = project('drain', 'Mô hình tiêu thoát nước cho lưu vực đô thị', 'PENDING_ACCEPTANCE', '009')
  const dam = project('dam', 'Đánh giá thấm qua thân đập đất bằng điện trở suất', 'PASSED', '005')
  const reed = project(
    'reed',
    'Lọc nước thải phân tán bằng bãi lọc trồng sậy',
    'IN_PROGRESS',
    '021',
    mt,
    'thao',
  )
  const bridge = project(
    'bridge',
    'Thử tải dầm cầu bê tông cốt sợi bằng cảm biến quang',
    'UNDER_ACCEPTANCE',
    '012',
  )
  bridge.fields.roundId = 'exec-bridge-round'
  bridge.fields.commitments = '{"REPORT":1}'
  bridge.fields.finalEvidence = 'Ho-so-thu-tai.pdf'
  const rows = [river, drain, dam, reed, bridge]
  for (const p of [...rows]) {
    rows.push(
      linked(
        p,
        'assignment',
        'Quyết định giao thực hiện ' + p.fields.code,
        'EFFECTIVE',
        {
          decision: 'QĐ-' + p.fields.code,
          signed: '2026-01-05',
          effective: '2026-01-06',
          start: '2026-01-06',
          end: '2027-01-05',
          amount: '100000000',
          evidence: 'Quyet-dinh-giao.pdf',
        },
        p.owner,
        p.id + '-assignment',
      ),
    )
    rows.push(
      linked(
        p,
        'report',
        'Kỳ 1 · Khảo sát hiện trường',
        'PASSED',
        {
          period: '1',
          dueDate: '2026-06-30',
          submittedAt: '2026-06-29T02:00:00Z',
          content: 'Hoàn thành bộ số liệu khảo sát thực địa.',
          evidence: 'Bao-cao-khao-sat.pdf',
        },
        p.owner,
        p.id + '-r1',
      ),
    )
  }
  rows.push(
    linked(
      river,
      'report',
      'Kỳ 2 · Đo kiểm thiết bị',
      'PENDING_SUBMISSION',
      { period: '2', dueDate: '2026-11-18' },
      'mai',
      'exec-report-late',
    ),
  )
  rows.push(
    linked(
      river,
      'report',
      'Kỳ 3 · Đối chiếu số liệu',
      'PENDING_SUBMISSION',
      { period: '3', dueDate: '2026-11-28' },
      'mai',
      'exec-report-next',
    ),
  )
  for (const p of [river, dam, drain, bridge]) {
    rows.push(
      linked(
        p,
        'allocation',
        'Quyết định cấp kinh phí',
        'CONFIRMED',
        { amount: '100000000', fee: '5000000', rate: '5', cap: '10000000', research: '95000000' },
        p.owner,
        p.id + '-allocation',
      ),
    )
  }
  rows.push(
    linked(
      river,
      'expense',
      'Lắp đặt cụm quan trắc và hiệu chuẩn thiết bị',
      'MATCHED',
      { amount: '93000000', date: '2026-09-15', code: 'PC-12', evidence: 'PC-12.pdf' },
      'mai',
      'exec-exp-river',
    ),
  )
  for (const [n, status] of [
    ['19', 'UNRECONCILED'],
    ['20', 'MISMATCHED'],
  ]) {
    rows.push(
      linked(
        dam,
        'expense',
        n === '19' ? 'Đo điện trở suất tuyến đập' : 'Xử lý số liệu địa vật lý',
        status,
        {
          amount: n === '19' ? '45000000' : '12000000',
          date: '2026-09-20',
          code: 'PC-' + n,
          evidence: 'PC-' + n + '.pdf',
        },
        'mai',
        'exec-exp-' + n,
      ),
    )
  }
  for (const [p, id, type, title, status] of [
    [river, 'paper', 'ARTICLE', 'Hiệu chỉnh tín hiệu cảm biến mực nước vùng bãi bồi', 'APPROVED'],
    [river, 'patent', 'PATENT', 'Cụm gá cảm biến chống bồi lắng', 'PENDING_APPROVAL'],
    [drain, 'drain-paper', 'ARTICLE', 'Đường quá trình dòng chảy tại lưu vực thử nghiệm', 'APPROVED'],
    [drain, 'drain-patent', 'PATENT', 'Cửa thu nước tự điều tiết', 'APPROVED'],
    [dam, 'dam-paper', 'ARTICLE', 'Phân vùng dị thường thấm trong đập đất', 'APPROVED'],
    [dam, 'dam-patent', 'PATENT', 'Điện cực đo thấm đa hướng', 'APPROVED'],
  ] as const) {
    rows.push(
      linked(
        p,
        'output',
        title,
        status,
        {
          type,
          year: '2026',
          authors: 'mai,linh',
          publication:
            type === 'ARTICLE'
              ? 'Tập san nghiên cứu thủy công, số 3 (mô phỏng)'
              : 'Hồ sơ giải pháp kỹ thuật (mô phỏng)',
          evidence: id + '.pdf',
          access: 'FULL',
          ...(type === 'ARTICLE'
            ? {
                doi: '10.0000/demo.' + id,
                aiAllowed: tenant === 'tlu' ? 'true' : 'false',
                aiGrantVersion: id === 'dam-paper' ? '2' : '1',
              }
            : {}),
          ...(id === 'dam-paper' ? { expires: '2026-11-01', sourceVersion: '2' } : {}),
          ...(id === 'drain-paper' ? { access: 'METADATA', sourceVersion: '1' } : {}),
          ...(id === 'paper'
            ? {
                sourceVersion: '1',
                method: 'Hiệu chuẩn cảm biến tại ba mặt cắt ở cùng cao trình.',
                methodPage: '3, đoạn 2',
                result: 'Sai số tuyệt đối giảm sau hiệu chuẩn.',
                resultPage: '5, bảng 1',
              }
            : {}),
        },
        'mai',
        'exec-' + id,
      ),
    )
  }
  dam.fields.roundId = 'exec-old-round'
  for (const p of [drain, dam, bridge]) {
    rows.push(
      linked(
        p,
        'committee',
        'Hội đồng thủy công',
        'ACTIVE',
        { members: 'minh', type: 'ACCEPTANCE', decision: 'QĐ-HĐ-26' },
        'an',
        p.id + '-committee',
      ),
    )
  }
  rows.push(
    linked(
      bridge,
      'output',
      'Báo cáo thử tải tĩnh dầm cầu nhịp 12 m',
      'APPROVED',
      {
        type: 'REPORT',
        year: '2026',
        authors: 'mai',
        publication: 'Phòng thí nghiệm kết cấu công trình',
        evidence: 'Thi-nghiem-dam.pdf',
        access: 'FULL',
      },
      'mai',
      'exec-bridge-report',
    ),
  )
  rows.push(
    linked(
      bridge,
      'round',
      'Đánh giá kết quả thử tải',
      'COLLECTING_SCORES',
      {
        type: 'ACCEPTANCE',
        members: 'minh',
        criteria: 'NT-2026-v1',
        date: '2026-11-24',
        minimum: '1',
        threshold: '70',
      },
      'an',
      'exec-bridge-round',
    ),
  )
  rows.push(
    linked(
      bridge,
      'ballot',
      'Phiếu nhận xét thử tải',
      'DRAFT',
      {
        roundId: 'exec-bridge-round',
        type: 'ACCEPTANCE',
        science: '82',
        impact: '',
        comment: 'Đã kiểm tra số liệu tải trọng.',
      },
      'minh',
      'exec-bridge-round-minh',
    ),
  )
  rows.push(
    linked(
      dam,
      'round',
      'Đợt nghiệm thu tháng 10',
      'CONCLUDED',
      {
        type: 'ACCEPTANCE',
        members: 'minh',
        date: '2026-10-21',
        minimum: '1',
        threshold: '70',
        aggregate: '84',
        conclusion: 'PASSED',
      },
      'an',
      'exec-old-round',
    ),
  )
  rows.push(
    linked(
      dam,
      'ballot',
      'Phiếu đánh giá kết quả đo thấm',
      'SUBMITTED',
      { roundId: 'exec-old-round', type: 'ACCEPTANCE', science: '80', impact: '90', total: '84' },
      'minh',
      'exec-old-ballot',
    ),
  )
  rows.push(
    linked(
      drain,
      'ballot',
      'Phiếu xét duyệt đầu vào',
      'SUBMITTED',
      { roundId: 'proposal-round', type: 'PROPOSAL', total: '99' },
      'minh',
      'exec-admission-ballot',
    ),
  )
  for (const id of Object.keys(people)) {
    rows.push(
      row(
        'profile',
        people[id],
        'ACTIVE',
        id,
        ['thao', 'minh'].includes(id) ? mt : ct,
        {
          position: id === 'mai' ? 'Giảng viên' : id === 'linh' ? 'Sinh viên' : 'Cán bộ',
          email: id + '@example.invalid',
          gender: '',
          discipline: id === 'mai' ? 'Kỹ thuật tài nguyên nước' : '',
        },
        'exec-profile-' + id,
      ),
    )
  }
  rows.push(
    row('qualification', 'Tiến sĩ', 'ACTIVE', 'mai', ct, { type: 'DEGREE', year: '2015' }, 'exec-degree'),
  )
  rows.push(
    row(
      'employment',
      'Bộ môn Thủy công',
      'ACTIVE',
      'mai',
      ct,
      { position: 'Giảng viên', start: '2018-09-01', end: '' },
      'exec-job',
    ),
  )
  for (const v of ['1', '2'])
    rows.push(
      row(
        'cvTemplate',
        v === '1' ? 'Lý lịch khoa học' : 'Lý lịch nghiên cứu và giảng dạy',
        v === '1' ? 'ACTIVE' : 'INACTIVE',
        'ha',
        '',
        { code: 'CV-01', tenant, version: v },
        'exec-template-' + v,
      ),
    )
  rows.push(
    row(
      'executionPolicy',
      'Cấu hình kinh phí',
      'ACTIVE',
      'ha',
      '',
      { rate: '5', cap: '10000000', reconcile: tenant === 'tlu' ? 'true' : 'false' },
      'exec-policy',
    ),
  )
  return rows
}
