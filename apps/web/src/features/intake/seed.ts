import type { DemoRow, Tenant } from '../../demo/types.ts'
import { construction, environment } from './model.ts'

export function seed(tenant: Tenant): DemoRow[] {
  const medical = tenant === 'hmu'
  const prefix = tenant.toUpperCase()
  const ref = (
    id: string,
    title: string,
    category: string,
    status = 'ACTIVE',
    extra: Record<string, string> = {},
  ): DemoRow => ({
    id,
    kind: 'intake-reference',
    title,
    status,
    owner: 'an',
    unit: construction,
    fields: { category, version: '2026.2', ...extra },
  })
  const refs = [
    ref('intake-field-applied', medical ? 'Y học ứng dụng' : 'Công trình thủy', 'discipline'),
    ref('intake-field-env', 'Môi trường và sức khỏe cộng đồng', 'discipline'),
    ref('intake-form-26', 'Mẫu thuyết minh đề tài cấp cơ sở', 'template'),
    ref('intake-rubric-26', 'Tiêu chí xét đề xuất cấp cơ sở 2026', 'criteria', 'ACTIVE', {
      type: 'PROPOSAL_REVIEW',
      min: '1',
      passing: '7',
      publicComments: 'false',
      publicScore: 'false',
    }),
    ref('intake-rubric-old', 'Tiêu chí xét đề xuất năm 2024', 'criteria', 'INACTIVE', {
      type: 'PROPOSAL_REVIEW',
    }),
  ]
  const common = {
    start: '2026-11-01',
    due: '2026-11-30',
    disciplines: 'intake-field-applied,intake-field-env',
    template: 'intake-form-26',
    criteria: 'intake-rubric-26',
  }
  const calls: DemoRow[] = [
    {
      id: 'call-01',
      kind: 'call',
      title: 'Đề tài cấp cơ sở năm 2027',
      status: 'OPEN',
      owner: 'an',
      unit: construction,
      fields: { ...common, code: 'KG-2027-01' },
    },
    {
      id: 'intake-call-autumn',
      kind: 'call',
      title: 'Nghiên cứu ứng dụng đợt thu 2026',
      status: 'CLOSED',
      owner: 'an',
      unit: construction,
      fields: { ...common, code: 'KG-2026-02', start: '2026-09-01', due: '2026-10-31' },
    },
    {
      id: 'intake-call-draft',
      kind: 'call',
      title: 'Sáng kiến liên ngành đợt xuân 2027',
      status: 'DRAFT',
      owner: 'an',
      unit: construction,
      fields: {
        ...common,
        code: 'KG-2027-02',
        start: '2026-12-01',
        due: '2027-01-15',
        criteria: 'intake-rubric-old',
      },
    },
  ]
  const titles = medical
    ? [
        'Đánh giá độ tin cậy của bảng tự theo dõi phục hồi chức năng',
        'Thử nghiệm bảng kiểm bàn giao tại phòng mô phỏng',
        'Khảo sát thời gian chờ khám ở cơ sở thực hành',
        'Đánh giá khả năng tiếp cận tài liệu giáo dục sức khỏe',
        'Đối chiếu số liệu chất lượng nước tại giảng đường',
        'Thiết kế bộ học liệu về an toàn phòng thực hành',
        'Khảo sát khả năng sử dụng tài liệu hướng dẫn phục hồi chức năng',
        'Đánh giá quy trình phân loại vật tư tại phòng thực hành',
      ]
    : [
        'Quan trắc thấm qua thân đập đất bằng cảm biến áp lực',
        'Đánh giá bồi lắng tại cửa lấy nước hệ thống Bắc Hưng Hải',
        'Dự báo lún nền đường ven đê từ số liệu quan trắc',
        'Khảo sát khả năng tiếp nhận cảnh báo ngập của hộ ven sông',
        'Đo tải lượng chất rắn lơ lửng trên kênh nội đồng',
        'Hiệu chỉnh đường quan hệ mực nước và lưu lượng sông Đáy',
        'Đánh giá hiệu quả thu gom nước mưa tại khu giảng đường',
        'Kiểm định độ ổn định mái kè từ chuỗi ảnh quan trắc',
      ]
  const project = (
    id: string,
    i: number,
    status: string,
    call: DemoRow,
    extra: Record<string, string> = {},
  ): DemoRow => ({
    id,
    kind: 'project',
    title: titles[i],
    status,
    owner: i === 4 ? 'hue' : 'mai',
    unit: i === 4 ? environment : construction,
    fields: {
      code: status === 'DRAFT' ? '' : prefix + '-26-NC0' + (i + 1),
      callId: call.id,
      workflowVersion: 'v1',
      revision: '1',
      aiAllowed: medical ? 'false' : 'true',
      aiGrantVersion: '1',
      due: call.fields.due,
      discipline: i === 4 ? 'intake-field-env' : 'intake-field-applied',
      durationMonths: '12',
      requestedBudget: String(85000000 + i * 5000000),
      objective: medical
        ? 'Đánh giá độ phù hợp của công cụ với điều kiện tại cơ sở thực hành.'
        : 'Xác định sai số quan trắc và đề xuất phương án hiệu chỉnh cho địa bàn khảo sát.',
      method: medical
        ? 'Đối chiếu bảng kiểm mô phỏng với hai lượt đánh giá độc lập.'
        : 'So sánh hai chuỗi số liệu tại ba điểm đo trong mùa kiệt và mùa lũ.',
      outcome: medical
        ? 'Một bảng kiểm chuẩn hóa và báo cáo thử nghiệm.'
        : 'Bộ dữ liệu đã hiệu chỉnh và một hướng dẫn kỹ thuật cho đơn vị vận hành.',
      memberIds: i === 3 ? '' : 'linh',
      submittedAt:
        status === 'DRAFT' ? '' : (call.status === 'OPEN' ? '2026-11-15' : '2026-10-18') + 'T02:20:00Z',
      ...extra,
    },
  })
  const projects = [
    project('dt-01', 0, 'DRAFT', calls[0]),
    project('intake-dt-silt', 1, 'SUBMITTED', calls[0]),
    project('intake-dt-road', 2, 'SUBMITTED', calls[1], { checked: 'true', finalized: 'true' }),
    project('intake-dt-flood', 3, 'UNDER_REVIEW', calls[1], { checked: 'true', finalized: 'true' }),
    project('intake-dt-water', 4, 'SUBMITTED', calls[0]),
    project('intake-dt-approved', 5, 'APPROVED', calls[1], { checked: 'true', finalized: 'true' }),
    project('intake-dt-returned', 6, 'DRAFT', calls[0], {
      code: prefix + '-26-NC07',
      submittedAt: '2026-11-16T03:15:00Z',
      reason: 'Bổ sung cách lựa chọn địa điểm khảo sát và số mẫu đối chứng.',
    }),
    project('intake-dt-coi', 7, 'UNDER_REVIEW', calls[1], {
      checked: 'true',
      finalized: 'true',
      memberIds: 'minh',
    }),
  ]
  const council: DemoRow = {
    id: 'intake-council-26',
    kind: 'council',
    title: 'Hội đồng xét duyệt nghiên cứu ứng dụng',
    status: 'ACTIVE',
    owner: 'an',
    unit: construction,
    fields: {
      code: 'HĐ-XD-06',
      type: 'PROPOSAL_REVIEW',
      memberIds: 'minh,hue,son',
      seats: JSON.stringify([
        { user: 'son', role: 'CHAIR' },
        { user: 'minh', role: 'REVIEWER' },
        { user: 'hue', role: 'SECRETARY' },
      ]),
    },
  }
  const round: DemoRow = {
    id: 'intake-round-flood',
    kind: 'review-round',
    title: council.title,
    status: 'COLLECTING_SCORES',
    owner: 'an',
    unit: construction,
    fields: {
      projectId: projects[3].id,
      councilId: council.id,
      memberIds: council.fields.memberIds,
      criteria: common.criteria,
      reviewerIds: 'minh,hue,son',
      min: '3',
      passing: '7',
      publicComments: 'false',
      publicScore: 'false',
      ethics: 'PENDING',
      openedAt: '2026-11-12T02:00:00Z',
    },
  }
  const conflictRound: DemoRow = {
    ...round,
    id: 'intake-round-coi',
    fields: {
      ...round.fields,
      projectId: 'intake-dt-coi',
      reviewerIds: 'son,hue',
      min: '2',
      ethics: 'EXEMPT',
    },
  }
  const done: DemoRow = {
    ...round,
    id: 'intake-round-approved',
    status: 'CONCLUDED',
    fields: {
      ...round.fields,
      projectId: projects[5].id,
      reviewerIds: '',
      min: '1',
      ethics: 'EXEMPT',
      conclusion: 'PASSED',
      aggregate: '8',
      concludedAt: '2026-11-16T02:00:00Z',
    },
  }
  const sheet = (r: DemoRow, owner: string, n: number): DemoRow => ({
    kind: 'score',
    id: 'intake-score-' + r.id + '-' + owner,
    title: 'Phiếu chấm khoa học',
    status: 'SUBMITTED',
    owner,
    unit: r.unit,
    fields: {
      roundId: r.id,
      projectId: r.fields.projectId,
      points: JSON.stringify([n, n, n].map(String)),
      total: String(n),
      comment: 'Phương pháp phù hợp với mục tiêu đã nêu.',
    },
  })
  return [
    ...refs,
    ...calls,
    ...projects,
    council,
    round,
    done,
    conflictRound,
    sheet(conflictRound, 'son', 6),
    sheet(conflictRound, 'hue', 7),
    sheet(round, 'son', 8),
    sheet(round, 'hue', 7),
    sheet(done, 'son', 8),
  ]
}
