import {expect,test,type Page} from "@playwright/test"
import {execFile,execFileSync} from "node:child_process"
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from "node:fs"
import {tmpdir} from "node:os"
import {join} from "node:path"
import {fileURLToPath} from "node:url"
import {promisify} from "node:util"
import {signIn} from "../integration/session-fixture"

const exec=promisify(execFile)
const local=(path:string)=>fileURLToPath(new URL(path,import.meta.url))
type Seed={call:string;field:string;project:string;unit:string}
type Run={errors:number;milliseconds:Record<string,{p95:number}>}
const sql=(query:string)=>execFileSync("psql",["-XAt","-v","ON_ERROR_STOP=1","-c",query],{encoding:"utf8"}).trim()

async function currentToken(page:Page){
  const ready=page.waitForResponse(r=>r.url().endsWith("/auth/me")&&r.status()===200)
  await page.reload()
  const header=(await (await ready).request().allHeaders()).authorization
  expect(JSON.parse(Buffer.from(header.split(".")[1],"base64url").toString()).exp-Date.now()/1000).toBeGreaterThan(155)
  return header
}

test("three deadline bursts start from the same private seed and recover within two minutes",async({browser})=>{
  test.skip(process.env.RMS_PERF!=="deadline")
  test.setTimeout(12*60*1000)
  expect(process.env.PGHOST).toMatch(/^\/tmp\/rms-pg\.[A-Za-z0-9]+$/)
  expect(sql("SELECT current_database()||'/'||current_user")).toBe("rms_test/rms_test_owner")
  const dir=mkdtempSync(join(tmpdir(),"rms-burst-")),dump=join(dir,"seed.dump")
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const observations=[]
  try{
    const users=await Promise.all(pages.map((p,i)=>signIn(p,"school-"+(i<2?1:2),"n13-deadline-"+i+"@example.invalid")))
    const seeds:Seed[]=JSON.parse(execFileSync(process.execPath,[local("../../apps/backend/test/db/seed-load.mjs"),...users.map(u=>u.account.id)],{encoding:"utf8"}))
    execFileSync("pg_dump",["--format=custom","--file",dump,"rms_test"])
    const fingerprint=()=>sql("SELECT md5(string_agg(tenant_id::text||id::text||row_version::text||coalesce(project_code,''),',' ORDER BY tenant_id,id)) FROM rms.research_project")
    const initial=fingerprint()
    for(let i=0;i<3;i++){
      // The test harness owns this disposable cluster. Restore every RMS table and its sequences.
      if(i>0)execFileSync("pg_restore",["--clean","--if-exists","--single-transaction","--exit-on-error","--dbname=rms_test",dump])
      expect(fingerprint()).toBe(initial)
      const tokens=await Promise.all(pages.map(currentToken))
      const actors=seeds.map((s,index)=>({...s,officer:tokens[index*2],author:tokens[index*2+1]}))
      async function load(label:string,profile:string,seconds:number){
        const start=Date.now()
        await exec(process.env.RMS_K6_BIN??"k6",["run","--quiet","--no-color","--no-usage-report","--out","json="+join(dir,label+".ndjson"),local("./workload.js")],{
          env:{...process.env,RMS_LOAD_ACTORS:JSON.stringify(actors),RMS_LOAD_PROFILE:profile,RMS_LOAD_DURATION:seconds+"s"},maxBuffer:4000000
        }).catch(e=>{throw Error("k6 "+label+" exit "+e.code)})
        writeFileSync(join(dir,label+".time"),start+","+Date.now())
      }
      const endpoint="/api/tenants/school-1"
      const headers={authorization:tokens[1]}
      const draft=await pages[1].request.post(endpoint+"/calls/"+seeds[0].call+"/proposals",{headers,data:{title:"Cùng nháp sát hạn",fieldId:seeds[0].field,months:6,budget:1000000,document:{},memberIds:[]}})
      expect(draft.status()).toBe(200)
      const {id,revision}=await draft.json()
      expect(id).toMatch(/^[a-f0-9-]{36}$/)
      const submit=async()=>{
        const res=await pages[1].request.post(endpoint+"/projects/"+id+"/proposal/actions",{headers,data:{action:"submit",revision}})
        expect(res.status()).toBe(200)
        return (await res.json()).projectCode
      }
      const duplicate=async()=>{
        await new Promise(r=>setTimeout(r,2000))
        const codes=await Promise.all([submit(),submit()])
        expect(codes[0]).toBeTruthy();expect(codes[1]).toBe(codes[0])
        expect(sql("SELECT count(*) FROM rms.workflow_history WHERE project_id='"+id+"'")).toBe("1")
        const foreign=await pages[3].request.get("/api/tenants/school-2/projects/"+id+"/proposal",{headers:{authorization:tokens[3]}})
        expect(foreign.status()).toBe(404)
      }
      const settled=await Promise.allSettled([load("burst-"+i,"burst",120),duplicate()])
      for(const result of settled)if(result.status==="rejected")throw result.reason
      const end=Date.now()
      await load("recovery-"+i,"warm",20)
      const recoverySeconds=(Date.now()-end)/1000
      expect(recoverySeconds).toBeLessThan(120)
      const anomalies=sql(`SELECT count(*) FROM (SELECT p.tenant_id,p.project_code FROM rms.research_project p JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(p.tenant_id,p.call_id)
        WHERE c.code LIKE 'N13-%' AND p.status_semantic='SUBMITTED' GROUP BY p.tenant_id,p.project_code HAVING p.project_code IS NULL OR count(*)<>1) x`)
      expect(anomalies).toBe("0")
      execFileSync(process.execPath,[local("./summarize.mjs"),dir,join(dir,"metrics.json")])
      const runs:Record<string,Run>=JSON.parse(readFileSync(join(dir,"metrics.json"),"utf8"))
      const burst=runs["burst-"+i],recovery=runs["recovery-"+i]
      for(const phase of [burst,recovery])expect(phase.errors).toBe(0)
      for(const [group,limit] of [["list",500],["write",1000],["submit",1000],["report",2000]] as const)expect(recovery.milliseconds[group].p95).toBeLessThanOrEqual(limit)
      observations.push({trial:i+1,seedFingerprint:initial,sameDraftRequests:2,historyRows:1,foreignSchoolStatus:404,codeAnomalies:Number(anomalies),recoverySeconds,burst,recovery})
      writeFileSync(local("./deadline-result.json"),JSON.stringify({at:new Date().toISOString(),observations},null,2)+"\n")
    }
  }finally{
    await Promise.all(pages.map(p=>p.close()))
    rmSync(dir,{recursive:true,force:true})
  }
})
