import {test,expect} from "@playwright/test"
import {execFile,execFileSync} from "node:child_process"
import {promisify} from "node:util"
import {mkdtempSync,writeFileSync} from "node:fs"
import {tmpdir} from "node:os"
import {join} from "node:path"
import {fileURLToPath} from "node:url"
import {signIn} from "../integration/session-fixture"
import {timeLogins} from "./login-timings"
const exec=promisify(execFile)
const local=(s:string)=>fileURLToPath(new URL(s,import.meta.url))
test("load profile uses two schools, signed sessions, PostgreSQL and frozen reports",async({browser})=>{
  test.skip(!process.env.RMS_PERF)
  test.setTimeout(30*60*1000)
  const full=process.env.RMS_PERF==="full",dir=mkdtempSync(join(tmpdir(),"rms-load-"))
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  try{
    const users=await Promise.all(pages.map((p,i)=>signIn(p,"school-"+(i<2?1:2),"n13-"+i+"@example.invalid")))
    const info=JSON.parse(execFileSync(process.execPath,[local("../../apps/backend/test/db/seed-load.mjs"),...users.map(u=>u.account.id)],{encoding:"utf8"}))
    if(full)await timeLogins(browser,pages[0])
    const runs=full?[["baseline","baseline","30s"],["ramp","ramp","120s"],...[0,1,2,3,4].map(i=>["warm-"+i,"warm","120s"]),...[0,1,2].map(i=>["burst-"+i,"burst","120s"])]:[["baseline","baseline","10s"],["warm","warm","25s"],["burst","burst","20s"]]
    for(const [label,profile,duration] of runs){
      const tokens=await Promise.all(pages.map(async p=>{
        const me=p.waitForResponse(r=>r.url().endsWith("/auth/me"))
        // A new authorization-code exchange uses the existing school SSO session.
        // A normal profile refresh can reuse a token with only 31 seconds left.
        await p.reload()
        const response=await me
        expect(response.status()).toBe(200)
        const token=(await response.request().allHeaders()).authorization
        const expires=JSON.parse(Buffer.from(token.split(".")[1],"base64url").toString()).exp
        expect(expires-Date.now()/1000).toBeGreaterThan(parseInt(duration)+15)
        return token
      }))
      const actors=info.map((s:object,i:number)=>({...s,officer:tokens[i*2],author:tokens[i*2+1]}))
      const started=Date.now()
      const args=["run","--quiet","--no-color","--no-usage-report","--out","json="+join(dir,label+".ndjson"),local("./workload.js")]
      // Capture only the exit status and timing. Request credentials never enter artifacts.
      const failure=await exec(process.env.RMS_K6_BIN??"k6",args,{env:{...process.env,RMS_LOAD_ACTORS:JSON.stringify(actors),RMS_LOAD_PROFILE:profile,RMS_LOAD_DURATION:duration},maxBuffer:4*1024*1024})
        .then(()=>null,e=>new Error("k6 "+label+" exit "+e.code+" "+String(e.stderr).slice(-300)))
      writeFileSync(join(dir,label+".time"),started+","+Date.now())
      execFileSync(process.execPath,[local("./summarize.mjs"),dir,local("./results-"+(full?"full":"smoke")+".json")])
      if(failure)throw failure
    }
    const invalid=execFileSync("psql",["-XAt","-c","SELECT count(*) FROM (SELECT tenant_id,project_code FROM rms.research_project WHERE project_code IS NOT NULL GROUP BY tenant_id,project_code HAVING count(*)>1) d"],{encoding:"utf8"}).trim()
    expect(invalid).toBe("0")
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
