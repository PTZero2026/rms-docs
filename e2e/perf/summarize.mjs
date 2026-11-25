import {readFileSync,readdirSync,writeFileSync} from "node:fs"
const [dir,output]=process.argv.slice(2),runs={}
for(const file of readdirSync(dir).filter(n=>n.endsWith(".ndjson"))){
  const groups={},failed=[]
  for(const line of readFileSync(dir+"/"+file,"utf8").split("\n")){
    if(!line)continue
    const r=JSON.parse(line)
    if(r.type!=="Point")continue
    if(r.metric==="http_req_duration"){
      const key=r.data.tags.group
      ;(groups[key]??=[]).push(r.data.value)
    }
    if(r.metric==="http_req_failed")failed.push(r.data.value)
  }
  const summary={}
  for(const [key,values] of Object.entries(groups)){
    values.sort((a,b)=>a-b)
    const pct=q=>Number(values[Math.max(0,Math.ceil(q*values.length)-1)].toFixed(2))
    summary[key]={n:values.length,p50:pct(.5),p95:pct(.95),p99:pct(.99)}
  }
  const times=readFileSync(dir+"/"+file.replace(".ndjson",".time"),"utf8").trim().split(",").map(Number)
  runs[file.split(".")[0]]={seconds:(times[1]-times[0])/1000,requests:failed.length,errors:failed.reduce((a,b)=>a+b,0),rps:+(failed.length*1000/(times[1]-times[0])).toFixed(2),milliseconds:summary}
}
writeFileSync(output,JSON.stringify(runs,null,2)+"\n")
