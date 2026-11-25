import http from "k6/http"
import {check,sleep} from "k6"
const actors=JSON.parse(__ENV.RMS_LOAD_ACTORS)
const profile=__ENV.RMS_LOAD_PROFILE
const vus=profile==="burst"?50:profile==="baseline"?1:20
export const options={scenarios:{load:profile==="ramp"?{executor:"ramping-vus",startVUs:1,stages:[{target:20,duration:"120s"}],gracefulRampDown:"3s"}:{executor:"constant-vus",vus,duration:__ENV.RMS_LOAD_DURATION,gracefulStop:"5s"}},thresholds:{checks:["rate>0.99"]},discardResponseBodies:false}
export default function(){
  const school=(__VU+__ITER)%2,a=actors[school],base="http://127.0.0.1:3191/api/tenants/school-"+(school+1)
  const draw=(__VU*7+__ITER)%10
  const request=(method,path,body,token,group)=>{
    const r=http.request(method,base+path,body?JSON.stringify(body):null,{headers:{authorization:token,"Content-Type":"application/json"},tags:{group,school:String(school+1),name:group},timeout:"10s"})
    check(r,{"domain response is 200":v=>v.status===200});return r
  }
  if(draw<4)request("GET","/projects?skip=0",null,a.officer,"list")
  else if(draw<6)request("GET","/projects/"+a.project+"/proposal",null,a.author,"detail")
  else if(draw<8)request("GET","/home/work?group=all&skip=0",null,a.author,"home")
  else if(draw===8){
    const draft=request("POST","/calls/"+a.call+"/proposals",{title:"N13 thử tải "+__VU+"-"+__ITER,fieldId:a.field,months:6,budget:1000000,document:{},memberIds:[]},a.author,"write")
    if(draft.status===200){const d=draft.json();request("POST","/projects/"+d.id+"/proposal/actions",{action:"submit",revision:d.revision},a.author,"submit")}
  }else request("POST","/reports/calls/snapshots",{callId:a.call,unitId:a.unit},a.officer,"report")
  sleep(1+Math.random()*2)
}
