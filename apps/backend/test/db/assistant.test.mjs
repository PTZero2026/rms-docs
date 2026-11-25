import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {generateSuggestion,readSuggestion,decideSuggestion} from "../../dist/modules/assistant/service.js"
const pool=new Pool({user:"rms_test_client"}),ops=new Pool(),tenant="00000000-0000-4000-8000-000000000034"
after(()=>Promise.all([pool.end(),ops.end()]))
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("two permitted proposals at the same revision and form keep distinct source identities",async()=>{
  const subject="sc003-author",unit=randomUUID(),sources=[randomUUID(),randomUUID()]
  const template={definition:{fields:[{key:"method",label:"Phương pháp",required:true}]}}
  await run(subject,async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Đơn vị đối chiếu')",[unit])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit])
    for(const id of sources){
      await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,title,status_semantic) VALUES(rms.current_tenant(),$1,$2,$3,'Mẫu đối chiếu','DRAFT')",[id,unit,a.id])
      await db.query("INSERT INTO rms.proposal_document(tenant_id,project_id,form_snapshot,document) VALUES(rms.current_tenant(),$1,$2,$3)",[id,template,{method:"Phương pháp thử."}])
    }
  })
  await ops.query("INSERT INTO rms.proposal_ai_policy(tenant_id,project_id,permitted) SELECT $1,id,true FROM unnest($2::uuid[]) AS src(id)",[tenant,sources])
  const model={version:"test-selector",select:async rows=>rows.map(row=>row.id)}
  const cards=[]
  for(const id of sources){
    const card=await run(subject,(db,a)=>generateSuggestion(db,a,"proposal",id,model))
    assert.equal(card.tenantId,tenant)
    assert.equal(card.sourceKind,"proposal")
    assert.equal(card.sourceId,id)
    assert.equal(card.fields[0].text,"Phương pháp thử.")
    cards.push(card)
  }
  assert.equal(cards[0].sourceVersion,cards[1].sourceVersion)
  assert.equal(cards[0].templateVersion,cards[1].templateVersion)
  await assert.rejects(run(subject,(db,a)=>readSuggestion(db,a,"proposal",sources[0],cards[1].id)),e=>e.getStatus()===404)
})
test("reading rights and AI rights are both checked before retrieval and when reopening a stored citation",async()=>{
  const source=randomUUID(),reader=await run("reader",async(db,a)=>a.id)
  await ops.query("INSERT INTO rms.reading_source(tenant_id,id,doi,title,authors,year,version,verified_url,ai_metadata,ai_fulltext) VALUES($1,$2,'10.18637/jss.v059.i10','Tidy Data','Hadley Wickham',2014,'v1','https://doi.org/10.18637/jss.v059.i10',true,true)",[tenant,source])
  await ops.query("INSERT INTO rms.reading_access VALUES($1,$2,$3,true,true)",[tenant,source,reader])
  await ops.query("INSERT INTO rms.reading_passage VALUES($1,$2,'v1','method','page-1','Page 1','each variable is a column')",[tenant,source])
  const inputs=[]
  const model={version:"test-ranker",select:async(rows)=>{inputs.push(rows);return rows.map(r=>r.id)}}
  const card=await run("reader",(db,a)=>generateSuggestion(db,a,"product",source,model))
  assert.equal(card.tenantId,tenant)
  assert.equal(card.sourceKind,"product")
  assert.equal(card.sourceId,source)
  assert.equal(card.fields.find(x=>x.key==="method").text,"each variable is a column")
  await run("reader",(db,a)=>decideSuggestion(db,a,"product",source,card.id,{field:"method",choice:"discard"}))
  await ops.query("UPDATE rms.reading_source SET full_until=now()-interval '1 second' WHERE id=$1",[source])
  const old=await run("reader",(db,a)=>readSuggestion(db,a,"product",source,card.id))
  assert.equal(old.sourceId,source)
  assert.equal(old.fields.find(x=>x.key==="method").text,null);assert.equal(old.metadata.doi,"10.18637/jss.v059.i10")
  const next=await run("reader",(db,a)=>generateSuggestion(db,a,"product",source,model))
  assert.equal(next.fields.find(x=>x.key==="result").text,null);assert.equal(inputs.length,1)
  await ops.query("UPDATE rms.reading_access SET read_metadata=false,read_full=false WHERE source_id=$1",[source])
  await assert.rejects(run("reader",(db,a)=>readSuggestion(db,a,"product",source,card.id)),e=>e.getStatus()===404)
})
