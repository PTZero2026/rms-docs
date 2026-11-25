import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useState } from 'react'
import type { FeatureProps } from '../../demo/types'
import { Button } from '@rms/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rms/ui/components/tabs'
import { Action, Grid, Heading, NoData, Panel, RecordLink, choice } from './controls'
import {
  activateTemplate,
  addCareer,
  buildCV,
  exportCV,
  removeCareer,
  updateProfile,
  profileRecords,
} from './profiles'
import { fmtDate, typeNames } from './model'
import type { Row } from './model'

function ProfileEdit({ p, r }: { p: FeatureProps; r: Row }) {
  const f = r.fields
  return (
    <Action
      p={p}
      label={r.owner === p.session.userId ? 'Sửa hồ sơ' : 'Sửa hộ hồ sơ'}
      subject={r}
      action={r.owner === p.session.userId ? 'UPDATE_PROFILE · tự cập nhật' : 'UPDATE_PROFILE · sửa hộ'}
      fields={[
        { name: 'name', label: 'Họ tên hiển thị (dữ liệu mẫu)', value: r.title, required: true },
        choice('gender', 'Giới tính', { '': 'Chưa khai báo', Nữ: 'Nữ', Nam: 'Nam', Khác: 'Khác' }, f.gender),
        { name: 'birth', label: 'Ngày sinh minh họa', type: 'date', value: f.birth },
        choice(
          'department',
          'Đơn vị công tác',
          { 'Khoa Công trình': 'Khoa Công trình', 'Khoa Môi trường': 'Khoa Môi trường' },
          f.department || r.unit,
        ),
        { name: 'position', label: 'Chức vụ', value: f.position, required: p.session.tenant === 'tlu' },
        { name: 'discipline', label: 'Lĩnh vực nghiên cứu', value: f.discipline },
        choice(
          'phone',
          'Liên hệ minh họa',
          { '': 'Để trống', sample: '09•• ••• ••00' },
          f.phone ? 'sample' : '',
        ),
        ...(p.session.tenant === 'hmu'
          ? [
              choice(
                'address',
                'Địa chỉ minh họa',
                { '': 'Để trống', sample: 'Địa chỉ mẫu tại Hà Nội' },
                f.address ? 'sample' : '',
              ),
            ]
          : []),
      ]}
      description="Dùng thông tin giả lập. Email và định danh được đồng bộ từ tài khoản."
      save={(d) => updateProfile(p, r, d)}
    />
  )
}
function CareerPanel({
  p,
  r,
  type,
  items,
}: {
  p: FeatureProps
  r: Row
  type: 'RANK' | 'DEGREE' | 'WORK'
  items: Row[]
}) {
  const work = type === 'WORK',
    title = work ? 'Quá trình công tác' : type === 'RANK' ? 'Học hàm' : 'Học vị'
  const group = work ? items : items.filter((x) => x.fields.type === type)
  const choices = type === 'RANK' ? ['Phó giáo sư', 'Giáo sư'] : ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ']
  return (
    <Panel
      title={title}
      tools={
        <Action
          p={p}
          subject={r}
          label={'Thêm ' + title.toLocaleLowerCase('vi')}
          fields={
            work
              ? [
                  { name: 'title', label: 'Tổ chức hoặc đơn vị', required: true },
                  { name: 'position', label: 'Chức vụ', required: true },
                  { name: 'start', label: 'Từ ngày', type: 'date', required: true },
                  { name: 'end', label: 'Đến ngày (bỏ trống nếu đang công tác)', type: 'date' },
                ]
              : [
                  choice('title', title, Object.fromEntries(choices.map((s) => [s, s]))),
                  { name: 'year', label: 'Năm nhận', type: 'number', required: true },
                ]
          }
          save={(d) => addCareer(p, r, work ? 'employment' : 'qualification', { ...d, type })}
        />
      }
    >
      <Grid
        caption={title}
        columns={work ? ['Đơn vị, chức vụ', 'Thời gian', 'Thao tác'] : [title, 'Năm nhận', 'Thao tác']}
        rows={group.map((x) => ({
          id: x.id,
          cells: [
            work ? x.title + ' · ' + x.fields.position : x.title,
            work
              ? fmtDate(x.fields.start) + ' – ' + (x.fields.end ? fmtDate(x.fields.end) : 'Đang công tác')
              : x.fields.year,
            <Action
              p={p}
              subject={r}
              label="Gỡ dòng"
              title={'Gỡ ' + x.title}
              save={() => removeCareer(p, r, x)}
            />,
          ],
        }))}
      />
    </Panel>
  )
}
function ExportButton({ p, r }: { p: FeatureProps; r: Row }) {
  const [message, setMessage] = useState('')
  function download() {
    try {
      const file = exportCV(p, r),
        blob = new Blob([file.html], { type: 'text/html;charset=utf-8' })
      p.commit('EXPORT_CV · ' + file.code + ' · v' + file.version, [], r)
      const url = URL.createObjectURL(blob),
        a = document.createElement('a')
      a.download = file.filename
      a.href = url
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 5000)
      setMessage('Đã xuất ' + file.filename)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Không thể xuất lý lịch.')
    }
  }
  return (
    <div>
      <Button type="button" onClick={download}>
        Trích xuất lý lịch
      </Button>
      {message && <p role="status">{message}</p>}
    </div>
  )
}
export function ProfilePage(p: FeatureProps) {
  const profiles = profileRecords(p),
    id = p.route.id
  const r =
    id && id !== 'new'
      ? profiles.find((x) => x.id === id || x.owner === id || 'account-' + x.owner === id)
      : profiles.find((x) => x.owner === p.session.userId)
  if (!r)
    return (
      <NoData title="Không thể mở hồ sơ cá nhân" detail="Hồ sơ chưa có hoặc nằm ngoài phạm vi được phân." />
    )
  const cv = buildCV(p, r)
  const switching = profiles.length > 1
  return (
    <>
      <Heading title="Lý lịch khoa học" sub={cv.school} tools={<ExportButton p={p} r={r} />} />
      {switching && (
        <div className="toolbar">
          <label htmlFor="exec-profile-switch">Hồ sơ đang xem</label>
          <ChoiceSelect id="exec-profile-switch" value={r.id} onValueChange={choiceValue => p.go('F08', choiceValue)}>
            {profiles.map((x) => (
              <ChoiceOption value={x.id} key={x.id}>
                {x.title} · {x.unit}
              </ChoiceOption>
            ))}
          </ChoiceSelect>
        </div>
      )}
      <Panel title="Thông tin nhà nghiên cứu" tools={<ProfileEdit p={p} r={r} />}>
        <div className="exec-profile">
          <span className="exec-avatar" aria-hidden="true">
            {r.title
              .split(' ')
              .slice(-2)
              .map((s) => s[0])
              .join('')}
          </span>
          <div>
            <strong>{r.title}</strong>
            <p>
              {r.fields.position} · {r.fields.department || r.unit}
            </p>
          </div>
        </div>
        <dl className="exec-facts mt-4">
          <div>
            <dt>Email đồng bộ</dt>
            <dd>{r.fields.email}</dd>
          </div>
          <div>
            <dt>Lĩnh vực</dt>
            <dd>{r.fields.discipline || 'Chưa khai báo'}</dd>
          </div>
          <div>
            <dt>Giới tính · Ngày sinh</dt>
            <dd>
              {r.fields.gender || '—'} · {fmtDate(r.fields.birth)}
            </dd>
          </div>
          <div>
            <dt>Liên hệ mẫu</dt>
            <dd>{r.fields.phone || '—'}</dd>
          </div>
          {p.session.tenant === 'hmu' && (
            <div>
              <dt>Địa chỉ mẫu</dt>
              <dd>{r.fields.address || '—'}</dd>
            </div>
          )}
        </dl>
      </Panel>
      <Tabs defaultValue="research">
        <TabsList>
          <TabsTrigger value="research">Hoạt động khoa học</TabsTrigger>
          <TabsTrigger value="career">Học hàm và công tác</TabsTrigger>
        </TabsList>
        <TabsContent value="research" className="exec-workspace">
          <Panel title={'Sản phẩm đã duyệt (' + cv.outputs.length + ')'}>
            <Grid
              caption="Công bố đã duyệt"
              columns={['Tên công bố', 'Loại', 'Năm']}
              rows={cv.outputs.map((x) => ({
                id: x.id,
                cells: [
                  <RecordLink p={p} feature="F07" id={x.id}>
                    {x.title}
                  </RecordLink>,
                  typeNames[x.fields.type],
                  x.fields.year,
                ],
              }))}
            />
          </Panel>
          <Panel title={'Vai trò đề tài (' + cv.projects.length + ')'}>
            <Grid
              caption="Đề tài tham gia"
              columns={['Mã hồ sơ', 'Tên đề tài', 'Vai trò']}
              rows={cv.projects.map((x) => ({
                id: x.id,
                cells: [
                  x.fields.code || 'Chưa cấp mã',
                  x.title,
                  x.owner === r.owner ? 'Chủ nhiệm' : 'Thành viên',
                ],
              }))}
            />
          </Panel>
          {p.e4Enabled && (
            <Panel
              title={
                'Giờ giảng quy đổi · ' +
                cv.hours.reduce((s, x) => s + Number(x.fields.hours), 0).toLocaleString('vi-VN') +
                ' giờ'
              }
            >
              <Grid
                caption="Dòng giờ giảng"
                columns={['Hoạt động nguồn', 'Giờ', 'Phiên bản công thức']}
                rows={cv.hours.map((x) => ({
                  id: x.id,
                  cells: [
                    <div>
                      {x.title}
                      <small className="block">{x.fields.sourceId}</small>
                    </div>,
                    x.fields.hours,
                    x.fields.formulaVersion,
                  ],
                }))}
              />
            </Panel>
          )}
        </TabsContent>
        <TabsContent value="career" className="exec-workspace">
          <CareerPanel p={p} r={r} type="RANK" items={cv.qualifications} />
          <CareerPanel p={p} r={r} type="DEGREE" items={cv.qualifications} />
          <CareerPanel p={p} r={r} type="WORK" items={cv.employment} />
        </TabsContent>
      </Tabs>
      <Panel
        title="Mẫu trích xuất"
        tools={
          p.session.role === 'admin' && (
            <Action
              p={p}
              label="Chọn phiên bản mẫu"
              fields={[
                choice(
                  'template',
                  'Mẫu áp dụng',
                  Object.fromEntries(
                    p.rows
                      .filter((x) => x.kind === 'cvTemplate')
                      .map((x) => [x.id, x.title + ' · v' + x.fields.version]),
                  ),
                  cv.template.id,
                ),
              ]}
              save={(d) => activateTemplate(p, d.template)}
            />
          )
        }
      >
        {!cv.templateReady && (
          <p className="exec-alert">
            Cấu hình mẫu của đơn vị chưa khớp phiên bản có trong thư viện. Cần chọn lại mẫu trước khi xuất.
          </p>
        )}
        <p>
          {cv.template.title} · {cv.template.fields.code} · Phiên bản {cv.template.fields.version}
        </p>
        <small className="muted">Tệp HTML định dạng A4 để in và ký xác nhận.</small>
      </Panel>
    </>
  )
}
