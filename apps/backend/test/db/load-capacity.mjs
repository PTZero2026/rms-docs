import assert from "node:assert/strict"
import {randomUUID,createHash} from "node:crypto"
import {writeFile} from "node:fs/promises"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {listProjects} from "../../dist/modules/proposal/access.js"
import {createReport,exportReport} from "../../dist/modules/report/call-report/service.js"

if(!/^\/tmp\/rms-pg\.[a-zA-Z0-9]+$/.test(process.env.PGHOST??""))throw Error("Requires private test cluster")
const owner=new Pool(),pool=new Pool({user:"rms_test_client",max:8})
const schools=[]
const stats=values=>{
  const sorted=values.slice().sort((a,b)=>a-b)
  const pct=p=>+sorted[Math.ceil(sorted.length*p)-1].toFixed(3)
  return {n:values.length,p50:pct(.50),p95:pct(.95),p99:pct(.99)}
}
async function addSchool(letter){
  const tenant=randomUUID(),unit=randomUUID(),second=randomUUID(),calls=Array.from({length:10},()=>randomUUID())
  await owner.query("INSERT INTO rms.tenant(id,slug,issuer) VALUES($1,$2,$3)",[tenant,"capacity-"+letter,"https://example.invalid/"+letter])
  const actor=await withTenant(pool,tenant,async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa 1'),(rms.current_tenant(),$2,'Khoa 2')",[unit,second])
    const identity={subject:"capacity-staff",email:"staff@example.invalid"}
    const user=await resolveAccount(db,identity)
    await db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[user.id,unit])
    await db.query(`INSERT INTO rms.proposal_call(tenant_id,id,code,name,start_date,end_date)
      SELECT rms.current_tenant(),id,$2||i,'Kỳ '||i,'2026-01-01','2026-12-31' FROM unnest($1::uuid[]) WITH ORDINALITY q(id,i)`,[calls,"CAP-"+letter])
    return resolveAccount(db,identity)
  })
  return {tenant,unit,second,actor,calls,letter}
}
async function expand(s,from,to){
  await withTenant(pool,s.tenant,async db=>{
    await db.query(`WITH inserted AS (
        INSERT INTO rms.research_project(tenant_id,id,unit_id,title,call_id,project_code,submitted_at,owner_id)
        SELECT rms.current_tenant(),gen_random_uuid(),CASE WHEN i%5<4 THEN $1::uuid ELSE $2::uuid END,
          $3||' hồ sơ '||i,($4::uuid[])[1+(i%10)],$3||'-'||i,now(),$7 FROM generate_series($5::int,$6::int) i RETURNING id)
        INSERT INTO rms.audit_log(tenant_id,actor_id,target_id,target_type,action)
        SELECT rms.current_tenant(),$7,id,'project','PERF_FIXTURE' FROM inserted CROSS JOIN generate_series(1,5)`,
        [s.unit,s.second,s.letter,s.calls,from,to,s.actor.id])
  })
  await owner.query("ANALYZE rms.research_project")
}
async function measure(){
  const latency={list:[],export:[]},wait={list:[],export:[]},queries={list:[],export:[]},trace=new Map()
  async function request(kind){
    const s=kind==="list"?schools[1]:schools[0],start=performance.now(),db=await pool.connect()
    wait[kind].push(performance.now()-start)
    let count=0
    const spy={query:async(sql,args)=>{
      const t=performance.now(),result=await db.query(sql,args)
      const key=createHash("sha256").update(sql).digest("hex").slice(0,12)
      const item=trace.get(key)??{key,sql,args,tenant:s.tenant,timings:[]}
      item.timings.push(performance.now()-t);trace.set(key,item);count++
      return result
    }}
    try{
      await db.query("BEGIN")
      await db.query("SELECT set_config('rms.tenant_id',$1,true)",[s.tenant])
      if(kind==="list"){
        const r=await listProjects(spy,s.actor,"",0)
        assert.equal(r.total,800);assert.equal(r.items.length,20);assert.ok(r.items.every(p=>p.title.startsWith("b ")))
      }else{
        const r=await createReport(spy,s.actor,{callId:s.calls[0],unitId:s.unit})
        assert.ok(r.total===100||r.total===1000)
        const csv=await exportReport(spy,s.actor,r.id)
        assert.equal(csv.split("\r\n").length,r.total+6)
      }
      await db.query("COMMIT");latency[kind].push(performance.now()-start);queries[kind].push(count)
    }catch(e){await db.query("ROLLBACK");throw e}finally{db.release()}
  }
  await Promise.all(Array.from({length:12},async(_,i)=>{for(let n=0;n<10;n++)await request(i%3===0?"export":"list")}))
  const leaders=[...trace.values()].sort((a,b)=>stats(b.timings).p95-stats(a.timings).p95).slice(0,3)
  const plans=[]
  for(const t of leaders){
    const result=await withTenant(pool,t.tenant,async db=>{
      await db.query("SAVEPOINT measure")
      const plan=await db.query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) "+t.sql,t.args)
      await db.query("ROLLBACK TO SAVEPOINT measure")
      return plan.rows[0]["QUERY PLAN"][0]
    })
    function node(n){return {node:n["Node Type"],relation:n["Relation Name"],index:n["Index Name"],rows:n["Actual Rows"],loops:n["Actual Loops"],sharedHits:n["Shared Hit Blocks"],reads:n["Shared Read Blocks"],children:(n.Plans??[]).map(node)}}
    plans.push({statement:t.key,sql:t.sql,measuredMs:stats(t.timings),executionMs:result["Execution Time"],plan:node(result.Plan)})
  }
  return {list:{ms:stats(latency.list),poolWaitMs:stats(wait.list),domainQueries:stats(queries.list),rows:20},
    export:{ms:stats(latency.export),poolWaitMs:stats(wait.export),domainQueries:stats(queries.export)},plans}
}
try{
  for(const letter of ["a","b"]){const school=await addSchool(letter);schools.push(school);await expand(school,1,1000)}
  const baseline=await measure()
  await expand(schools[0],1001,10000)
  const grown=await measure()
  await owner.query("CREATE INDEX perf_trial_unit_title ON rms.research_project(tenant_id,unit_id,title,id)")
  const trial=await measure()
  await writeFile(new URL("../../../../e2e/perf/capacity-result.json",import.meta.url),JSON.stringify({at:new Date().toISOString(),connections:8,clients:12,requestsPerCase:120,baseline,grown,trial},null,2)+"\n")
}finally{await Promise.all([owner.end(),pool.end()])}
