import type { Dispatch, SetStateAction } from 'react'
import { names, ids } from './model'
import type { ProposalForm } from './proposals'
import { Choice, FieldText } from './ui'

type Assignment = { role: 'MEMBER' | 'SECRETARY'; responsibility: string }
export function assignments(encoded?: string): Record<string, Assignment> {
  return JSON.parse(encoded || '{}')
}
export function ProposalTeam({
  owner,
  form,
  setForm,
}: {
  owner: string
  form: ProposalForm
  setForm: Dispatch<SetStateAction<ProposalForm>>
}) {
  const team = assignments(form.assignments)
  const members = ids(form.memberIds)
  function setMember(uid: string, detail?: Assignment) {
    const next = { ...team }
    if (detail) next[uid] = detail
    else delete next[uid]
    const nextIds = members.filter((id) => id !== uid)
    if (detail) nextIds.push(uid)
    setForm({ ...form, memberIds: nextIds.join(','), assignments: JSON.stringify(next) })
  }
  return (
    <>
      {Object.entries(names)
        .filter(([uid]) => uid !== owner && !['ha', 'an'].includes(uid))
        .map(([uid, name]) => {
          const selected = members.includes(uid)
          const detail = team[uid] ?? { role: 'MEMBER', responsibility: '' }
          return (
            <div key={uid}>
              <label className="intake-check">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => setMember(uid, e.target.checked ? detail : undefined)}
                />
                {name}
              </label>
              {selected && (
                <div className="form-grid">
                  <Choice
                    label={'Vai trò của ' + name}
                    value={detail.role}
                    onChange={(e) =>
                      setMember(uid, { ...detail, role: e.target.value as Assignment['role'] })
                    }
                  >
                    <option value="MEMBER">Thành viên</option>
                    <option value="SECRETARY">Thư ký</option>
                  </Choice>
                  <FieldText
                    label={'Nhiệm vụ của ' + name}
                    value={detail.responsibility}
                    onChange={(e) => setMember(uid, { ...detail, responsibility: e.target.value })}
                  />
                </div>
              )}
            </div>
          )
        })}
    </>
  )
}
