import test from 'node:test'
import assert from 'node:assert/strict'
import { seed } from './seed.ts'
import { actions, canRead, saveDraft, transition } from './workflow.ts'
import { adjustHours, balance, canReadHours, periodCode, postHours, postOutput, saveFormula } from './hours.ts'
import { person } from '../../demo/identity.ts'

function scenario(tenant = 'tlu') {
  const records = new Map(seed(tenant).map(r => [r.id,r]))
  const ctx = role => ({ rows:[...records.values()], e4Enabled:true, session:person(tenant,role) })
  const put = (...rows) => rows.forEach(r => records.set(r.id,r))
  const run = (role,id,action,input) => {
    const batch = transition(ctx(role),records.get(id),action,input)
    put(...batch)
    return batch
  }
  const hours = id => [...records.values()].filter(r => r.kind === 'hours' && r.fields.sourceId === id)
  return {ctx,put,run,hours,get:id => records.get(id)}
}
const evidence = JSON.stringify({FINAL_REPORT:'BC-11.pdf',PRODUCT:'Sản phẩm 01'})
test('student final review belongs to the confirmed mentor; only passage followed by closure pays them', () => {
  const db = scenario()
  const id = 'ext-student-field'
  assert.throws(() => db.run('student',id,'sendResult',{result:'Bộ mẫu',evidence:'{}'}),/FINAL_REPORT.*PRODUCT/)
  db.run('student',id,'sendResult',{result:'Đã đo hệ số thấm.',evidence})
  assert.throws(() => db.run('officer',id,'pass'),/quyền/)
  assert.throws(() => db.run('reviewer',id,'mentorFinal'),/quyền/)
  db.run('researcher',id,'mentorFinal')
  db.run('officer',id,'fail',{reason:'Thiếu phép đo đối chứng'})
  assert.deepEqual(db.hours(id),[])
  assert.throws(() => db.run('officer',id,'reopen',{reason:'Bổ sung'}),/hạn/)
  db.run('officer',id,'reopen',{deadline:'2026-12-20',reason:'Bổ sung phép đo'})
  db.run('student',id,'sendResult',{result:'Đã bổ sung phép đo.',evidence})
  db.run('researcher',id,'mentorFinal')
  db.run('officer',id,'pass')
  assert.deepEqual(db.hours(id),[])
  db.run('officer',id,'close')
  assert.deepEqual(db.hours(id).map(r => [r.owner,r.fields.hours]),[['mai','24']])
  assert.deepEqual(postHours(db.ctx('officer').rows,db.get(id)),[])
})
test('checked student roster, reasoned amendments and revocable mentorship', () => {
  const db = scenario()
  const id = 'ext-student-invite'
  assert.throws(() => db.run('researcher',id,'mentorDecline'),/lý do/)
  db.run('researcher',id,'mentorDecline',{reason:'Đề nghị điều chỉnh mục tiêu'})
  const r = db.get(id)
  assert.equal(r.status,'DRAFT')
  const group = g => ({...r,fields:{...r.fields,group:g}})
  assert.throws(() => saveDraft(db.ctx('student'),group('linh,phuc,yen,sv-nam,sv-lan,vu')),/5 sinh viên/)
  assert.throws(() => saveDraft(db.ctx('student'),group('linh,unknown')),/đồng bộ/)
  assert.throws(() => saveDraft(db.ctx('student'),group('linh,ngoc')),/đồng bộ/)
  const ongoing = db.get('ext-student-field')
  assert.throws(() => saveDraft(db.ctx('student'),ongoing,'Chỉnh nhóm'),/quyền/)
  assert.throws(() => saveDraft(db.ctx('officer'),ongoing,''),/lý do/)
  const updated = saveDraft(db.ctx('officer'),{...ongoing,title:'Đo thấm qua cát lọc'},'Điều chỉnh theo thí nghiệm')
  db.put(updated)
  db.run('researcher',ongoing.id,'mentorAccept')
  assert.equal(db.get(ongoing.id).status,'IN_PROGRESS')
})
test('F11 result-triggered bands, stage-specific evidence, reversal and reapproval with new inputs', () => {
  const db = scenario()
  const id = 'ext-applied-draft'
  const initial = db.get(id)
  assert.throws(() => saveDraft(db.ctx('researcher'),{...initial,unit:''}),/đơn vị/)
  db.put(saveDraft(db.ctx('researcher'),{...initial,fields:{...initial.fields,partner:'Công ty Hạ tầng'}}))
  db.run('researcher',id,'submit')
  db.run('officer',id,'approve')
  assert.deepEqual(db.hours(id),[])
  assert.throws(() => db.run('researcher',id,'sendResult',{result:'Đã bàn giao'}),/ACCEPTANCE_MINUTES/)
  const result = {result:'Đã bàn giao bộ cảm biến.',evidence:JSON.stringify({ACCEPTANCE_MINUTES:'BB-15'})}
  db.run('researcher',id,'sendResult',result)
  db.run('officer',id,'approveResult')
  assert.deepEqual(db.hours(id).map(r => [r.owner,r.fields.hours]),[['mai','36'],['minh','24']])
  const original = db.hours(id)[0]
  db.put(adjustHours(db.ctx('officer'),original,'2','Đính chính định mức hỗ trợ'))
  db.run('officer',id,'revoke',{reason:'Đối tác điều chỉnh giá trị hợp đồng'})
  assert.equal(balance(db.ctx('officer').rows,original),0)
  assert.throws(() => adjustHours(db.ctx('officer'),original,'1','Hiệu chỉnh'),/thu hồi/)
  const draft = db.get(id)
  db.put(saveDraft(db.ctx('researcher'),{...draft,fields:{...draft.fields,budget:'500000000'}}))
  db.run('researcher',id,'submit'); db.run('officer',id,'approve')
  db.run('researcher',id,'sendResult',result); db.run('officer',id,'approveResult')
  assert.equal(db.hours(id).reduce((n,r) => n+Number(r.fields.hours),0),80)
  assert.equal(original.fields.hours,'36')
})
test('tenant-specific F12 evidence at submission and approval, zero support on rejection', () => {
  const a = scenario(), b = scenario('hmu')
  const from = a.get('ext-activity-conference')
  const draft = {...from,id:'ext-other-conference',status:'DRAFT',fields:{...from.fields,support:'',evidence:JSON.stringify({PARTICIPATION:'GXN-08'})}}
  a.put(draft); b.put(draft)
  assert.throws(() => a.run('researcher',draft.id,'submit'),/ASSIGNMENT.*PROGRAM/)
  b.run('researcher',draft.id,'submit')
  b.run('officer',draft.id,'reject',{reason:'Không thuộc chương trình được cử đi'})
  assert.equal(b.get(draft.id).fields.support,'')
  assert.deepEqual(b.hours(draft.id),[])
  const pending = a.get('ext-activity-community')
  const cat = a.get('cfg-ACTIVITY_TYPE.COMMUNITY')
  const item = JSON.parse(cat.fields.value)
  item.extra.requiredEvidence.khai_bao.push('DECISION')
  a.put({...cat,fields:{...cat.fields,value:JSON.stringify(item)}})
  assert.throws(() => a.run('officer',pending.id,'approve'),/DECISION/)
})
test('F09 partial evidence, optional host, review reason, and scoped direct access', () => {
  const db = scenario(), r = db.get('ext-upper-draft')
  assert.doesNotThrow(() => saveDraft(db.ctx('researcher'),{...r,unit:''}))
  assert.throws(() => db.run('researcher',r.id,'submit'),/DECISION/)
  const pending = db.get('ext-upper-pending')
  assert.throws(() => db.run('officer',pending.id,'return'),/lý do/)
  db.run('officer',pending.id,'return',{reason:'Kiểm tra số văn bản'})
  const s = {...db.ctx('officer').session,unit:'Khoa Môi trường'}
  assert.equal(canRead(s,pending),false)
  assert.deepEqual(actions(db.ctx('admin').session,pending),[])
  const acct = { id:'account-an',kind:'account',owner:'an',unit:'',title:'',status:'ACTIVE',fields:{scopeUnit:'Khoa Môi trường'} }
  db.put(acct)
  assert.throws(() => db.run('officer',pending.id,'submit'),/quyền/)
})
test('F12 approval grants only approved VND and earns the applicable date-specific formula', () => {
  const db = scenario()
  const id = 'ext-activity-community'
  assert.throws(() => db.run('officer',id,'approve',{support:'-30'}),/kinh phí/)
  db.run('officer',id,'approve',{support:'250000'})
  assert.equal(db.get(id).fields.support,'250000')
  assert.equal(db.hours(id)[0].fields.hours,'12')
})
test('fiscal calendar, historical boundary, Q2 governance and F07 patent split', () => {
  const db = scenario()
  assert.equal(periodCode('2026-08-31','ACADEMIC_YEAR',9),'2025-2026')
  assert.equal(periodCode('2026-09-01','ACADEMIC_YEAR',9),'2026-2027')
  const rule = db.get('ext-formula-PATENT-v1')
  db.put(saveFormula(db.ctx('admin'),{...rule,id:'ext-patent-fiscal',fields:{...rule.fields,periodType:'FISCAL_YEAR'}}))
  const cal = db.get('ext-calendar')
  db.put({...cal,fields:{...cal.fields,periodType:'FISCAL_YEAR'}})
  const q2 = db.get('ext-formula-SCIE_Q2-v1')
  assert.throws(() => saveFormula(db.ctx('admin'),{...q2,id:'ext-q2-new',status:'ACTIVE',fields:{...q2.fields,version:'v2'}}),/PO/)
  const patent = {id:'exec-accepted-patent',kind:'output',title:'Van lấy mẫu',unit:'Khoa Công trình',owner:'mai',status:'APPROVED',
    fields:{authors:'mai,minh',type:'PATENT',access:'FULL',evidence:'Văn bằng',reviewedAt:'2026-06-01T03:00:00Z'}}
  db.put(patent)
  const allocate = (date,shares) => postOutput(db.ctx('officer'),patent.id,'PATENT',date,shares)
  assert.throws(() => allocate('2026-06-02',{mai:'75',minh:'25'}),/ngày nghiệp vụ/)
  assert.throws(() => allocate('2026-06-01',{mai:'70',minh:'25'}),/100%/)
  db.put(...allocate('2026-06-01',{mai:'75',minh:'25'}))
  const ledger = db.hours(patent.id)
  assert.deepEqual(ledger.map(r => [r.owner,r.fields.hours,r.fields.recognitionPeriodCode]),[['mai','150','2026'],['minh','50','2026']])
  assert.deepEqual(allocate('2026-11-21',{}),[])
  assert.equal(canReadHours(db.ctx('researcher').session,ledger[1]),false)
  assert.throws(() => adjustHours(db.ctx('researcher'),ledger[0],'1','Sai số'),/quyền/)
})
test('seed has deterministic tenant-unique IDs and only string fields', () => {
  for(const t of ['tlu','hmu']) {
    const rows = seed(t)
    assert.equal(new Set(rows.map(r => r.id)).size,rows.length)
    assert.ok(rows.every(r => Object.values(r.fields).every(v => typeof v === 'string')))
    assert.deepEqual(seed(t),rows)
    assert.equal(rows.some(r => r.kind === 'hours'),t === 'tlu')
  }
})


test('B01 catalogue changes apply at approval and only UPPER categories are selectable', async () => {
  const { catalog } = await import('./model.ts')
  const db = scenario()
  const entry = db.get('cfg-RESEARCH_TOPIC_CATEGORY.MINISTRY')
  assert.equal(entry.kind,'config')
  const item = JSON.parse(entry.fields.value)
  item.extra.requiredEvidence.khai_bao.push('CONTRACT')
  db.put({...entry,fields:{...entry.fields,value:JSON.stringify(item)}})
  assert.throws(() => db.run('officer','ext-upper-pending','approve'),/CONTRACT/)
  item.extra.tier = 'INTERNAL'
  db.put({...entry,fields:{...entry.fields,value:JSON.stringify(item)}})
  assert.equal(catalog(db.ctx('officer').rows,'F09').some(r => r.fields.code === 'MINISTRY'),false)
})

test('configured council route pins its mode, requires progress and both council minutes', () => {
  const db = scenario(), id = 'ext-student-invite'
  const call = db.get('ext-call-autumn')
  db.put({...call,fields:{...call.fields,mode:'FULL_LIFECYCLE'}})
  db.run('researcher',id,'mentorAccept')
  db.run('student',id,'submit')
  db.put(call)
  assert.throws(() => db.run('officer',id,'approve'),/quyền/)
  db.run('officer',id,'councilReview')
  assert.throws(() => db.run('officer',id,'approve'),/biên bản/i)
  db.run('officer',id,'approve',{minutes:'BB-SD-11'})
  db.run('student',id,'start')
  assert.throws(() => db.run('student',id,'sendResult',{result:'Đã đo',evidence}),/tiến độ/)
  db.run('student',id,'checkpoint',{result:'Hoàn thành khảo sát ba mặt cắt'})
  db.run('student',id,'sendResult',{result:'Đã đo',evidence})
  db.run('researcher',id,'mentorFinal')
  assert.throws(() => db.run('officer',id,'pass'),/quyền/)
  db.run('officer',id,'councilFinal')
  assert.equal(db.get(id).fields.statusSemantic,'UNDER_ACCEPTANCE')
  assert.throws(() => db.run('officer',id,'pass'),/biên bản/i)
  db.run('officer',id,'pass',{minutes:'BB-NT-21'})
  db.run('officer',id,'close')
  assert.equal(db.hours(id).length,1)
})

test('small allocations conserve the total without a negative remainder; retries ignore retired catalogues', () => {
  const db = scenario()
  const source = db.get('ext-activity-conference')
  const active = db.get('ext-formula-CONFERENCE-v1')
  db.put({...active,fields:{...active.fields,base:'0.01'}})
  const tiny = {...source,id:'ext-small-event',fields:{...source.fields,contributors:JSON.stringify([
    {id:'mai',role:'Chủ nhiệm',share:50},{id:'minh',role:'Thành viên',share:49.99},{id:'thao',role:'Thành viên',share:0.01}
  ])}}
  const allocations = postHours(db.ctx('officer').rows,tiny)
  assert.deepEqual(allocations.map(r => r.fields.hours),['0.01','0','0'])
  const cfg = db.get('cfg-ACTIVITY_TYPE.CONFERENCE')
  db.put({...cfg,fields:{...cfg.fields,active:'false'}})
  assert.deepEqual(postHours(db.ctx('officer').rows,source),[])
})
