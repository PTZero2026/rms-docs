import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import { Action, Grid, Metrics, Panel, fileField } from './controls'
import {
  allocate,
  balance,
  fee,
  policy,
  reconcile,
  saveExpense,
  settle,
  updateFees,
  voidExpense,
} from './budget'
import { fmtDate, officer, principal, related, states, today, vnd } from './model'
import type { Data, Row } from './model'
import type { FeatureProps } from '../../demo/types'

export function FeePolicy({ p }: { p: FeatureProps }) {
  const config = policy(p)
  return (
    <Panel
      title="Phí quản lý của đơn vị"
      tools={
        <Action
          p={p}
          label="Đổi mức phí"
          fields={[
            {
              name: 'rate',
              label: 'Tỷ lệ (%)',
              type: 'number',
              step: '0.01',
              min: 0,
              max: 100,
              value: config.rate,
            },
            {
              name: 'cap',
              label: 'Trần phí (VND, bỏ trống nếu không áp trần)',
              type: 'number',
              min: 0,
              value: config.cap,
            },
          ]}
          save={(d) => updateFees(p, d)}
        />
      }
    >
      <p>
        Tỷ lệ {config.rate}% · {config.cap ? 'Trần ' + vnd(config.cap) : 'Không áp trần'}. Áp dụng từ lần xác
        nhận cấp tiếp theo.
      </p>
    </Panel>
  )
}
function SuggestReceipt({ data, patch }: { data: Data; patch: (d: Data) => void }) {
  const [open, setOpen] = useState(false)
  if (data.evidence !== 'PHIEU-CHI-35.pdf')
    return (
      <p className="muted">
        Phiếu mẫu PHIEU-CHI-35.pdf có dữ liệu OCR mô phỏng. Với chứng từ khác, nhập số liệu thủ công.
      </p>
    )
  return (
    <div className="exec-reading">
      <Button type="button" size="sm" variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Bỏ gợi ý' : 'Đọc phiếu mẫu bằng OCR'}
      </Button>
      {open && (
        <>
          <p>Trang 1, dòng tổng tiền · 3.000.000 ₫ · Thuê máy đo lưu tốc · 20/11/2026</p>
          <small>Nguồn PHIEU-CHI-35.pdf · OCR mẫu v1</small>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              patch({
                amount: '3000000',
                date: '2026-11-20',
                title: 'Thuê máy đo lưu tốc',
                ocrSource: 'PHIEU-CHI-35.pdf · trang 1 · v1',
              })
              setOpen(false)
            }}
          >
            Dùng số liệu và kiểm tra
          </Button>
        </>
      )}
    </div>
  )
}
function ExpenseForm({ p, project, r }: { p: FeatureProps; project: Row; r?: Row }) {
  return (
    <Action
      p={p}
      subject={r || project}
      label={r ? 'Sửa khoản chi' : 'Ghi khoản chi'}
      primary={!r}
      fields={[
        { name: 'title', label: 'Nội dung chi', value: r?.title, required: true },
        { name: 'date', label: 'Ngày chi', type: 'date', value: r?.fields.date || today, required: true },
        {
          name: 'amount',
          label: 'Số tiền (VND)',
          type: 'number',
          min: 1,
          value: r?.fields.amount,
          required: true,
        },
        { ...fileField('Chứng từ', 'PHIEU-CHI-35.pdf', r?.fields.evidence), type: 'files' },
      ]}
      extra={(d, patch) => (
        <>
          {p.aiEnabled && <SuggestReceipt data={d} patch={patch} />}
          {/^\d+$/.test(d.amount || '') && (
            <p>
              Số dư sau khoản chi: {vnd(balance(p, project) + BigInt(r?.fields.amount || 0) - BigInt(d.amount))}
            </p>
          )}
        </>
      )}
      save={(d) =>
        saveExpense(
          p,
          project,
          { ...d, ocrSource: d.evidence === 'PHIEU-CHI-35.pdf' ? d.ocrSource || '' : '' },
          r,
        )
      }
    />
  )
}
export function BudgetPage({ p, project }: { p: FeatureProps; project: Row }) {
  const config = policy(p),
    staff = officer(p, project),
    running = project.status === 'IN_PROGRESS'
  const allocation = related(p, project, 'allocation')[0],
    assignment = related(p, project, 'assignment')[0]
  const expenses = related(p, project, 'expense'),
    remaining = balance(p, project)
  const maySpend = principal(p, project) && running && !!allocation
  return (
    <>
      <Metrics
        values={[
          ['Kinh phí đã cấp', vnd(allocation?.fields.amount || '0')],
          ['Phí quản lý', vnd(allocation?.fields.fee || '0')],
          ['Đã chi', vnd(expenses.reduce((s, r) => s + BigInt(r.fields.amount), 0n))],
          ['Còn lại', vnd(remaining)],
        ]}
      />
      {remaining < 0n && (
        <p role="status" className="exec-alert">
          Vượt kinh phí thực hiện {vnd(-remaining)}. Khoản chi đã được ghi nhận.
        </p>
      )}
      <Panel
        title="Căn cứ cấp kinh phí"
        tools={
          staff &&
          running &&
          !allocation && (
            <Action
              p={p}
              subject={project}
              label="Xác nhận cấp kinh phí"
              primary
              fields={[
                {
                  name: 'amount',
                  label: 'Tổng cấp (VND)',
                  value: assignment?.fields.amount,
                  type: 'number',
                  min: 1,
                  required: true,
                },
                { name: 'override', label: 'Phí điều chỉnh riêng (VND, tùy chọn)', type: 'number', min: 0 },
                { name: 'note', label: 'Căn cứ điều chỉnh phí', type: 'long' },
              ]}
              extra={(d) => (
                <p>
                  Phí theo cấu hình:{' '}
                  {/^\d+$/.test(d.amount || '') && BigInt(d.amount) > 0n
                    ? vnd(fee(d.amount, config.rate, config.cap))
                    : '—'}
                </p>
              )}
              save={(d) => allocate(p, project, d)}
            />
          )
        }
      >
        <p>
          {assignment?.fields.decision || 'Chưa có quyết định giao'} · Phê duyệt{' '}
          {vnd(assignment?.fields.amount || '0')}
        </p>
        {allocation && (
          <p className="muted">
            Tỷ lệ tại thời điểm cấp {allocation.fields.rate}% · Trần{' '}
            {allocation.fields.cap ? vnd(allocation.fields.cap) : 'không giới hạn'} · Kinh phí thực hiện{' '}
            {vnd(allocation.fields.research)}
          </p>
        )}
      </Panel>
      <Panel title="Sổ khoản chi" tools={maySpend && <ExpenseForm p={p} project={project} />}>
        <Grid
          caption="Khoản chi"
          columns={['Nội dung và chứng từ', 'Ngày chi', 'Số tiền', 'Đối soát', 'Xử lý']}
          rows={expenses.map((r) => ({
            id: r.id,
            cells: [
              <div>
                <strong>{r.title}</strong>
                <p className="exec-meta">
                  {r.fields.code} · {r.fields.evidence || 'Chưa có chứng từ'}
                </p>
                {r.fields.ocrSource && <small>{r.fields.ocrSource}</small>}
              </div>,
              fmtDate(r.fields.date),
              <span className="exec-ledger">{vnd(r.fields.amount)}</span>,
              <div>
                {config.reconcile === 'true' ? states[r.status] : 'Rà thủ công'}
                {r.fields.reference && (
                  <p className="exec-meta">
                    {r.fields.reference} · {vnd(r.fields.transferAmount)}
                  </p>
                )}
              </div>,
              <div className="exec-row-tools">
                {maySpend && (
                  <>
                    <ExpenseForm p={p} project={project} r={r} />
                    <Action
                      p={p}
                      subject={r}
                      label="Hủy khoản"
                      fields={[{ name: 'reason', label: 'Lý do hủy', required: true }]}
                      save={(d) => voidExpense(p, project, r, d.reason)}
                    />
                  </>
                )}
                {config.reconcile === 'true' && staff && ['PASSED', 'IN_PROGRESS'].includes(project.status) && (
                  <Action
                    p={p}
                    subject={r}
                    label="Đối chiếu giao dịch"
                    fields={[
                      {
                        name: 'reference',
                        label: 'Mã chuyển khoản mô phỏng',
                        value: r.fields.reference,
                        required: true,
                      },
                      {
                        name: 'amount',
                        label: 'Số tiền ghi trên giao dịch (VND)',
                        value: r.fields.transferAmount,
                        type: 'number',
                        min: 1,
                        required: true,
                      },
                    ]}
                    save={(d) => reconcile(p, project, r, d.amount, d.reference)}
                  />
                )}
              </div>,
            ],
          }))}
        />
      </Panel>
      {project.status === 'PASSED' && (
        <Panel
          title="Quyết toán đề tài"
          tools={
            staff && (
              <Action
                p={p}
                subject={project}
                label="Quyết toán và đóng"
                primary
                fields={
                  config.reconcile === 'true'
                    ? []
                    : [{ type: 'check', name: 'manual', label: 'Tôi đã rà soát toàn bộ khoản chi và chứng từ' }]
                }
                save={(d) => settle(p, project, d.manual === 'yes')}
              />
            )
          }
        >
          <p>
            {config.reconcile === 'true'
              ? 'Mọi khoản chi phải khớp với giao dịch trước khi đóng sổ.'
              : 'Đơn vị áp dụng rà soát thủ công trước khi đóng sổ.'}
          </p>
          {config.reconcile === 'true' &&
            expenses
              .filter((r) => r.status !== 'MATCHED')
              .map((r) => (
                <p key={r.id}>
                  {r.fields.code} · {states[r.status]}
                </p>
              ))}
        </Panel>
      )}
      {project.status === 'COMPLETED' && <p>Đã khóa sổ kinh phí ngày {fmtDate(project.fields.settledOn)}.</p>}
    </>
  )
}
