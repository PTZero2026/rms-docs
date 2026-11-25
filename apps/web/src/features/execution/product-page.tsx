import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { sourceAllowed } from '../../demo/source-rights.ts'
import { useState } from 'react'
import { promisedOutputs } from './acceptance'
import type { FeatureProps } from '../../demo/types'
import { Button } from '@rms/ui/components/button'
import {
  Action,
  Grid,
  Heading,
  NoData,
  Panel,
  RecordLink,
  Search,
  Status,
  choice,
  fileField,
} from './controls'
import { author, decideOutput, hasFullText, keepCard, readCard, saveOutput, viewOutput } from './products'
import { change, check, fmtDate, ids, member, officer, people, scoped, states, typeNames } from './model'
import type { Row } from './model'

function OutputForm({ p, r, project, open }: { p: FeatureProps; r?: Row; project?: Row; open?: boolean }) {
  const projects = p.rows.filter((x) => x.kind === 'project' && scoped(p, x) && x.status !== 'COMPLETED')
  const f = r?.fields
  return (
    <Action
      p={p}
      subject={r}
      label={r ? 'Sửa kê khai' : 'Kê khai sản phẩm'}
      primary
      initiallyOpen={open}
      fields={[
        { name: 'title', label: 'Tên sản phẩm', value: r?.title, required: true },
        choice('type', 'Loại sản phẩm', typeNames, f?.type),
        choice(
          'projectId',
          'Đề tài nguồn',
          {
            '': 'Sản phẩm độc lập',
            ...Object.fromEntries(
              projects.map((x) => [x.id, (x.fields.code || 'Dự thảo') + ' · ' + x.title]),
            ),
          },
          project?.id || f?.projectId,
        ),
        { name: 'year', label: 'Năm công bố', type: 'number', value: f?.year || '2026' },
        {
          name: 'authors',
          label: 'Tác giả',
          type: 'multi',
          value: f?.authors || p.session.userId,
          options: p.rows
            .filter(
              (x) =>
                x.kind === 'profile' &&
                (x.unit === p.session.unit ||
                  officer(p, x) ||
                  projects.some((y) => member(y, x.owner) || y.owner === x.owner) ||
                  x.owner === p.session.userId),
            )
            .map((x) => [x.owner, x.title]),
        },
        {
          name: 'publication',
          label: 'Nơi công bố hoặc mô tả tương đương',
          type: 'long',
          value: f?.publication,
        },
        { name: 'doi', label: 'DOI (nếu có)', value: f?.doi },
        fileField('Minh chứng công bố', 'Minh-chung-cong-bo.pdf', f?.evidence),
        choice(
          'access',
          'Quyền minh chứng',
          { FULL: 'Được sử dụng', METADATA: 'Chỉ được đọc thư mục', REVOKED: 'Đã thu hồi' },
          f?.access,
        ),
        { name: 'distinct', label: 'Xác nhận khác sản phẩm trùng tên, năm và tác giả', type: 'check' },
        choice('mode', 'Lưu kê khai', { submit: 'Gửi duyệt', draft: 'Lưu bản nháp' }),
      ]}
      action={(d) => (d.mode === 'draft' ? 'Lưu nháp sản phẩm' : 'Gửi duyệt sản phẩm')}
      save={(d) => saveOutput(p, d, d.mode === 'submit', r)}
      after={(rows) => p.go('F07', rows[0].id)}
    />
  )
}
function Reading({ p, r }: { p: FeatureProps; r: Row }) {
  const [preview, setPreview] = useState(false)
  const saved = p.rows.find(
    (x) =>
      x.kind === 'readingCard' &&
      x.owner === p.session.userId &&
      x.fields.sourceId === r.id &&
      x.status === 'ACTIVE',
  )
  const available = p.aiEnabled && sourceAllowed(p.rows, r) && /^10\.\d{4,9}\/\S+$/i.test(r.fields.doi || '')
  const changed = saved && saved.fields.version !== (r.fields.sourceVersion || '1')
  const show = available && (preview || (saved?.fields.mode === 'AI' && !changed))
  const card = show ? readCard(p, r) : undefined
  return (
    <Panel
      title="Thẻ đọc tài liệu"
      tools={
        <>
          {available && (
            <Button size="sm" variant="outline" onClick={() => setPreview(true)}>
              Lập thẻ đọc từ DOI
            </Button>
          )}
          <Action
            p={p}
            label="Ghi chú thủ công"
            subject={r}
            fields={[
              {
                name: 'manual',
                label: 'Ghi chú đọc tài liệu',
                type: 'long',
                value: saved?.fields.manual,
                required: true,
              },
            ]}
            save={(d) => keepCard(p, r, d.manual, false)}
            after={() => setPreview(false)}
          />
        </>
      }
    >
      {card && (
        <div className="exec-reading">
          <p>
            <strong>{card.title}</strong> ·{' '}
            {ids(card.authors)
              .map((id) => people[id] || id)
              .join(', ')}{' '}
            · {card.year}
          </p>
          <p>
            DOI mô phỏng {card.doi} · Metadata phiên bản {card.version}
          </p>
          <p>
            <b>Phương pháp</b> · {card.method}
          </p>
          <p>
            <b>Kết quả</b> · {card.result}
          </p>
          {hasFullText(r) && (
            <small>
              Nguồn minh chứng {r.fields.evidence} · Bản {card.version}
            </small>
          )}
          {preview && (
            <div className="page-actions">
              <Action
                p={p}
                label="Dùng thẻ"
                subject={r}
                save={() => keepCard(p, r, '', true)}
                after={() => setPreview(false)}
              />
              <Button size="sm" variant="ghost" onClick={() => setPreview(false)}>
                Bỏ bản nháp
              </Button>
            </div>
          )}
        </div>
      )}
      {changed && (
        <p className="exec-alert">Nguồn đã đổi phiên bản. Hãy lập lại thẻ để kiểm tra căn cứ mới.</p>
      )}
      {saved?.fields.mode === 'MANUAL' && <p>{saved.fields.manual}</p>}
      {!card && !saved && (
        <p className="muted">
          {available
            ? 'Có thể lập bản nháp từ tài liệu mẫu và kiểm lại từng dẫn chứng.'
            : 'Có thể ghi chú thủ công dựa trên nguồn được phép.'}
        </p>
      )}
      {saved && (
        <div className="page-actions">
          <span>Đã lưu thẻ cá nhân</span>
          <Action p={p} label="Bỏ thẻ đã lưu" subject={saved} save={() => [change(saved, 'DELETED')]} />
        </div>
      )}
    </Panel>
  )
}
export function ProductPage(p: FeatureProps) {
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [type, setType] = useState('')
  const id = p.route.id,
    records = p.rows.filter((r) => viewOutput(p, r))
  const item = records.find((r) => r.id === id)
  const project = p.rows.find((r) => r.id === id && r.kind === 'project' && scoped(p, r))
  if (id && id !== 'new' && !item && !project)
    return <NoData title="Không thể mở sản phẩm" detail="Bản ghi không thuộc phạm vi truy cập hiện tại." />
  if (item) {
    const f = item.fields,
      staff = officer(p, item) && !author(p, item)
    const src = p.rows.find((x) => x.id === f.projectId && x.kind === 'project' && scoped(p, x))
    return (
      <>
        <RecordLink p={p} feature="F07">
          ← Danh sách sản phẩm
        </RecordLink>
        <Heading
          title={item.title}
          sub={[typeNames[f.type], f.year].join(' · ')}
          tools={<Status value={item.status} />}
        />
        <Panel
          title="Thông tin công bố"
          tools={
            <>
              {(author(p, item) || officer(p, item)) && ['DRAFT', 'REJECTED'].includes(item.status) && (
                <OutputForm p={p} r={item} />
              )}
              {staff && item.status === 'PENDING_APPROVAL' && (
                <>
                  <Action
                    p={p}
                    label="Duyệt sản phẩm"
                    primary
                    subject={item}
                    save={() => decideOutput(p, item, 'APPROVED', '')}
                  />
                  <Action
                    p={p}
                    label="Từ chối"
                    subject={item}
                    fields={[{ name: 'reason', label: 'Lý do từ chối', type: 'long', required: true }]}
                    save={(d) => decideOutput(p, item, 'REJECTED', d.reason)}
                  />
                </>
              )}
              {staff && item.status === 'APPROVED' && (
                <Action
                  p={p}
                  label="Mở lại để đính chính"
                  subject={item}
                  fields={[{ name: 'reason', label: 'Căn cứ đính chính', required: true }]}
                  save={(d) => decideOutput(p, item, 'DRAFT', d.reason)}
                />
              )}
            </>
          }
        >
          <dl className="exec-facts">
            <div>
              <dt>Tác giả</dt>
              <dd>
                {ids(f.authors)
                  .map((x) => people[x] || x)
                  .join(', ')}
              </dd>
            </div>
            <div>
              <dt>Nơi công bố</dt>
              <dd>{f.publication || '—'}</dd>
            </div>
            <div>
              <dt>Đề tài nguồn</dt>
              <dd>
                {src ? (
                  <RecordLink p={p} feature="F07" id={src.id}>
                    {src.title}
                  </RecordLink>
                ) : f.projectId ? (
                  'Có liên kết'
                ) : (
                  'Độc lập'
                )}
              </dd>
            </div>
            <div>
              <dt>Minh chứng</dt>
              <dd>{hasFullText(item) ? f.evidence || 'Chưa có' : 'Chỉ có dữ liệu thư mục'}</dd>
            </div>
          </dl>
          {f.reason && <p className="exec-alert">{f.reason}</p>}
          {f.reviewedAt && (
            <p className="muted">
              Xử lý ngày {fmtDate(f.reviewedAt)} · {people[f.reviewer] || f.reviewer}
            </p>
          )}
          {author(p, item) && f.access === 'FULL' && (
            <Action
              p={p}
              subject={item}
              label="Thu hồi quyền toàn văn"
              description="Các thẻ đọc đã lưu sẽ chỉ còn hiển thị thông tin thư mục."
              save={() => {
                check(author(p, item), 'Ngoài phạm vi.')
                return [change(item, item.status, { access: 'METADATA' })]
              }}
            />
          )}
        </Panel>
        <Reading p={p} r={item} />
      </>
    )
  }
  const subset = records.filter((r) => !project || r.fields.projectId === project.id)
  const filtered = subset.filter(
    (r) =>
      (!status || r.status === status) &&
      (!type || r.fields.type === type) &&
      (r.title + ' ' + r.fields.publication).toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')),
  )
  return (
    <>
      {project && (
        <RecordLink p={p} feature="F07">
          ← Tất cả sản phẩm
        </RecordLink>
      )}
      <Heading
        title={project ? 'Sản phẩm của đề tài' : 'Sản phẩm khoa học'}
        sub={project?.title}
        tools={<OutputForm p={p} project={project} open={id === 'new'} />}
      />
      {project && (
        <Panel title="Sản phẩm đã duyệt theo cam kết">
          <dl className="exec-facts">
            {promisedOutputs(p, project).map((entry) => (
              <div key={entry.type}>
                <dt>{entry.label}</dt>
                <dd>
                  {entry.count} / {entry.valid ? entry.target : '—'}
                </dd>
              </div>
            ))}
          </dl>
          {!project.fields.commitments && <p>Chưa có số lượng cam kết theo loại trong quyết định giao.</p>}
        </Panel>
      )}
      <Panel title={'Danh mục sản phẩm (' + filtered.length + ')'}>
        <div className="toolbar">
          <Search label="Tìm tên sản phẩm, nơi công bố" value={query} set={setQuery} />
          <ChoiceSelect
            aria-label="Lọc trạng thái duyệt"
            value={status}
            onValueChange={setStatus}
          >
            <ChoiceOption value="">Mọi trạng thái</ChoiceOption>
            {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((s) => (
              <ChoiceOption key={s} value={s}>
                {states[s]}
              </ChoiceOption>
            ))}
          </ChoiceSelect>
          <ChoiceSelect aria-label="Lọc loại sản phẩm" value={type} onValueChange={setType}>
            <ChoiceOption value="">Mọi loại sản phẩm</ChoiceOption>
            {Object.entries(typeNames).map(([k, v]) => (
              <ChoiceOption key={k} value={k}>
                {v}
              </ChoiceOption>
            ))}
          </ChoiceSelect>
        </div>
        <Grid
          caption="Sản phẩm khoa học"
          columns={['Sản phẩm và nơi công bố', 'Loại', 'Năm', 'Trạng thái']}
          rows={filtered.map((r) => ({
            id: r.id,
            cells: [
              <div>
                <RecordLink p={p} feature="F07" id={r.id}>
                  {r.title}
                </RecordLink>
                <p className="exec-meta">{r.fields.publication}</p>
              </div>,
              typeNames[r.fields.type],
              r.fields.year,
              <Status value={r.status} />,
            ],
          }))}
        />
      </Panel>
    </>
  )
}
