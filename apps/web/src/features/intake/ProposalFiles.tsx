import { ChoiceOption } from "@rms/ui/components/choice-select"
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import { Choice, FieldText, Grid, Problem } from './ui'

export type Attachment = { id: string; title: string; format: string; size: number }
export function attachments(encoded?: string, legacy?: string): Attachment[] {
  if (encoded) return JSON.parse(encoded)
  return legacy ? [{ id: 'legacy', title: legacy, format: '', size: 0 }] : []
}
const categories = [
  'Đề cương nghiên cứu',
  'Kế hoạch khảo sát',
  'Bảng dự toán',
  'Phụ lục thuyết minh',
]
export function ProposalFiles({
  files,
  change,
}: {
  files: Attachment[]
  change: (files: Attachment[]) => void
}) {
  const [category, setCategory] = useState(categories[0])
  const [error, setError] = useState('')
  return (
    <>
      <Choice label="Loại tài liệu" value={category} onValueChange={setCategory}>
        {categories.map((c) => (
          <ChoiceOption value={c} key={c}>{c}</ChoiceOption>
        ))}
      </Choice>
      <FieldText
        label="Chọn tệp đính kèm"
        type="file"
        accept=".pdf,.docx,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          e.target.value = ''
          const format = file.name.split('.').pop()?.toUpperCase() || ''
          if (!['PDF', 'DOCX', 'XLSX'].includes(format)) {
            setError('Chọn tài liệu PDF, DOCX hoặc XLSX.')
            return
          }
          if (file.size > 20 * 1024 * 1024) {
            setError('Tài liệu vượt quá 20 MB.')
            return
          }
          change([...files, { id: crypto.randomUUID(), title: category, format, size: file.size }])
          setError('')
        }}
      />
      <p className="muted">
        Bản demo giữ loại tài liệu, định dạng và dung lượng. Giới hạn 20 MB mỗi tài liệu.
      </p>
      <Problem text={error} />
      <Grid
        heads={['Tài liệu', 'Định dạng', 'Dung lượng', 'Thao tác']}
        lines={files.map((f) => ({
          id: f.id,
          cells: [
            f.title,
            f.format || '—',
            Math.ceil(f.size / 1024) + ' KB',
            <Button
              variant="outline"
              aria-label={'Gỡ ' + f.title}
              onClick={() => change(files.filter((item) => item.id !== f.id))}
            >
              Gỡ
            </Button>,
          ],
        }))}
        empty="Chưa đính kèm tài liệu."
      />
    </>
  )
}
