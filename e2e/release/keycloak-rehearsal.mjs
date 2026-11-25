import {createServer} from "node:http"
import {chromium} from "@playwright/test"
import {spawn,execFileSync} from "node:child_process"
import {createHash,randomBytes,randomUUID} from "node:crypto"
import {once} from "node:events"
import {mkdtemp,mkdir,writeFile,readFile,copyFile,readdir,rm,open} from "node:fs/promises"
import {join} from "node:path"
import {tmpdir} from "node:os"
import {setTimeout as delay} from "node:timers/promises"
import {fileURLToPath} from "node:url"
import assert from "node:assert/strict"
import {localRealm} from "../../infra/keycloak/seed-realms.mjs"
import {verifyIdentity} from "../../apps/backend/dist/modules/iam/token.js"
import {provisionIdentity} from "../../apps/backend/dist/modules/iam/provision-account/keycloak.js"

const archive=process.env.RMS_KC_ZIP,plugin=process.env.RMS_KC_OTP_JAR
if(!archive||!plugin||!process.env.JAVA_HOME)throw Error("Set RMS_KC_ZIP, RMS_KC_OTP_JAR and JAVA_HOME for the isolated rehearsal")
const tmp=await mkdtemp(join(tmpdir(),"rms-idp-rehearsal-"))
const realms=["school-1","school-2"],origin="http://127.0.0.1:8185",app="http://127.0.0.1:4196"
const folder=join(tmp,"backup"),log=await open(join(tmp,"keycloak.log"),"a",0o600)
const unique=randomUUID().slice(0,8),users=[],clients={},started=Date.now()
let active,browser,kc,callbackServer
function env(db){return {...process.env,KC_DB:"dev-file",KC_DB_URL:"jdbc:h2:file:"+join(tmp,db)+";NON_KEYWORDS=VALUE",KC_HTTP_MANAGEMENT_PORT:"9195",
  KC_HOSTNAME:origin,JAVA_OPTS_KC_HEAP:"-Xms96m -Xmx512m"}}
async function command(args,db){
  const p=spawn(kc,args,{env:env(db),stdio:["ignore",log.fd,log.fd]})
  const [exit]=await once(p,"exit")
  if(exit!==0)throw Error("Keycloak "+args[0]+" failed; see private rehearsal log "+tmp)
}
async function start(db,seed){
  active=spawn(kc,["start-dev","--http-host=127.0.0.1","--http-port=8185",...(seed?["--import-realm"]:[])],{env:{...env(db),...(seed?{KC_BOOTSTRAP_ADMIN_USERNAME:"restore-admin",KC_BOOTSTRAP_ADMIN_PASSWORD:randomBytes(24).toString("hex")}:{})},stdio:["ignore",log.fd,log.fd]})
  for(let i=0;i<100;i++){
    if(active.exitCode!==null)throw Error("Keycloak exited; see "+tmp)
    if((await fetch(origin+"/realms/school-2/.well-known/openid-configuration").catch(()=>null))?.ok)return
    await delay(1000)
  }
  throw Error("Keycloak startup timeout; see "+tmp)
}
async function stop(){
  if(active&&active.exitCode===null){const done=once(active,"exit");active.kill("SIGTERM");await done}
  active=undefined
}
async function signIn(slug,email){
  const page=await browser.newPage()
  try{
    const issuer=origin+"/realms/"+slug,callback=app+"/app/"+slug,verifier=randomBytes(40).toString("base64url"),state=randomUUID()
    const challenge=createHash("sha256").update(verifier).digest("base64url")
    const seen=new Set((await (await fetch("http://127.0.0.1:8026/api/v1/messages")).json()).messages.map(m=>m.ID))

    await page.goto(issuer+"/protocol/openid-connect/auth?"+new URLSearchParams({client_id:"rms-web",redirect_uri:callback,response_type:"code",response_mode:"query",scope:"openid email",state,code_challenge:challenge,code_challenge_method:"S256"}))
    await page.locator("input[name=username]").fill(email);await page.locator("form input[type=submit],form button[type=submit]").first().click()
    await page.locator("#otp").waitFor()
    let otp
    for(let i=0;i<40&&!otp;i++){
      const {messages}=await (await fetch("http://127.0.0.1:8026/api/v1/messages")).json()
      const hit=messages.find(m=>!seen.has(m.ID)&&m.To.some(t=>t.Address===email))
      if(hit)otp=(await (await fetch("http://127.0.0.1:8026/api/v1/message/"+hit.ID)).json()).Text.match(/\b\d{6}\b/)?.[0]
      if(!otp)await delay(200)
    }
    assert.ok(otp);await page.locator("#otp").fill(otp);await page.locator("#kc-submit").click();await page.waitForURL(url=>url.origin+url.pathname===callback&&url.searchParams.has("code"))
    const params=new URL(page.url()).searchParams;assert.equal(params.get("state"),state)
    const response=await fetch(issuer+"/protocol/openid-connect/token",{method:"POST",body:new URLSearchParams({client_id:"rms-web",grant_type:"authorization_code",redirect_uri:callback,code:params.get("code"),code_verifier:verifier})})
    assert.equal(response.status,200)
    const identity=await verifyIdentity(issuer,"Bearer "+(await response.json()).access_token)
    assert.equal(identity.email,email);return identity.subject
  }finally{await page.close()}
}
let success=false
try{
  if((await fetch(origin+"/realms/master",{signal:AbortSignal.timeout(1500)}).catch(()=>null)))throw Error("Port 8185 is already in use")
  callbackServer=createServer((req,res)=>{res.writeHead(200,{"Content-Type":"text/plain","Cache-Control":"no-store"});res.end("RMS callback")})
  callbackServer.listen(4196,"127.0.0.1");await once(callbackServer,"listening")
  execFileSync("unzip",["-q",archive,"-d",tmp])
  const home=join(tmp,(await readdir(tmp)).find(n=>n.startsWith("keycloak-")))
  kc=join(home,"bin/kc.sh");await copyFile(plugin,join(home,"providers","rms-otp.jar"))
  const imports=join(home,"data","import");await mkdir(imports,{recursive:true});await mkdir(folder)
  for(const slug of realms){
    const config=localRealm(slug,{origin:app,smtpHost:"127.0.0.1",smtpPort:1026})
    if(process.env.RMS_PROVISION_UI==="1"){
      const spa=config.clients.find(c=>c.clientId==="rms-web")
      spa.redirectUris.push("http://127.0.0.1:4197/app/"+slug);spa.webOrigins.push("http://127.0.0.1:4197")
    }
    const clientId="rms-provision",secret=randomBytes(32).toString("hex")
    clients[slug]={clientId,secret}
    config.clients.push({clientId,secret,enabled:true,protocol:"openid-connect",publicClient:false,serviceAccountsEnabled:true,standardFlowEnabled:false,directAccessGrantsEnabled:false})
    config.users=[{username:"service-account-"+clientId,enabled:true,serviceAccountClientId:clientId,clientRoles:{"realm-management":["manage-users","view-users"]}}]
    await writeFile(join(imports,slug+"-realm.json"),JSON.stringify(config),{mode:0o600})
  }
  process.env.RMS_IDP_PROVISION_CLIENTS=JSON.stringify(clients)
  await start("source",true)
  browser=await chromium.launch({channel:process.env.RMS_BROWSER_CHANNEL||undefined})
  for(const slug of realms){
    const email="restore-"+unique+"-"+slug+"@example.invalid",cmd={commandId:randomUUID(),email}
    const id=await provisionIdentity(origin+"/realms/"+slug,slug,cmd)
    assert.equal(await signIn(slug,email),id)
    users.push({slug,email,id})
  }
  if(process.env.RMS_PROVISION_UI==="1"){
    const {checkAdminProvision}=await import("./provision-ui.mjs")
    await checkAdminProvision(browser)
  }
  await stop()
  const recoveryStart=Date.now()
  await command(["export","--dir",folder,"--users","realm_file"],"source")
  const backups=[]
  for(const slug of realms){
    const bytes=await readFile(join(folder,slug+"-realm.json"))
    backups.push({realm:slug,bytes:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex")})
  }
  await command(["import","--dir",folder],"restored")
  await start("restored",false)
  for(const u of users)assert.equal(await signIn(u.slug,u.email),u.id)
  const result={recordedAt:new Date().toISOString(),realmBackups:backups,subjectsPreserved:users.length,beforeAndAfterOtpLogins:4,validSignatureAndAudience:true,
    recoverySeconds:(Date.now()-recoveryStart)/1000,totalSeconds:(Date.now()-started)/1000}
  await writeFile(fileURLToPath(new URL("./idp-result.json",import.meta.url)),JSON.stringify(result,null,2)+"\n")
  success=true
}finally{
  callbackServer?.close();await browser?.close();await stop();await log.close()
  // Realm exports contain private keys. Retain only diagnostic logs on a failed isolated run.
  if(!success)await copyFile(join(tmp,"keycloak.log"),join(tmpdir(),"rms-idp-rehearsal-failure.log")).catch(()=>{})
  await rm(tmp,{recursive:true,force:true})
}
