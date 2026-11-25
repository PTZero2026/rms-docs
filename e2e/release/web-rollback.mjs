import assert from "node:assert/strict"
import {createHash} from "node:crypto"
import {createServer} from "node:http"
import {readFile,writeFile} from "node:fs/promises"
import {resolve,sep,extname} from "node:path"
import {once} from "node:events"
import {chromium,expect} from "@playwright/test"

const [oldDist,newDist,oldRevision]=process.argv.slice(2)
if(!oldDist||!newDist||!oldRevision)throw Error("Pass previous dist, candidate dist and previous revision")
let active=resolve(oldDist)
const lines=[]
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,"http://localhost").pathname
    const file=resolve(active,"."+decodeURIComponent(path==="/"?"/index.html":path))
    if(!file.startsWith(active+sep))throw Error()
    const bytes=await readFile(file)
    res.writeHead(200,{"Content-Type":({".html":"text/html",".js":"text/javascript",".css":"text/css",".woff2":"font/woff2"})[extname(file)]??"application/octet-stream","Cache-Control":"no-store"});res.end(bytes)
  }catch{res.writeHead(404);res.end()}
})
let browser
try{
  server.listen(0,"127.0.0.1");await once(server,"listening")
  const origin="http://127.0.0.1:"+server.address().port
  browser=await chromium.launch({channel:process.env.RMS_BROWSER_CHANNEL||undefined})
  const page=await browser.newPage()
  const title="Đối chứng hồi lui bản web"
  await page.goto(origin+"/#/F02/call-01")
  await page.getByRole("button",{name:"Lập đề xuất cho kỳ này",exact:true}).click()
  await page.getByLabel("Tên đề tài",{exact:true}).fill(title)
  await page.getByRole("button",{name:"Lưu nháp",exact:true}).click()
  await expect(page).toHaveURL(/#\/F01\//)
  const draft=page.url()
  for(const [kind,dist] of [["previous",oldDist],["candidate",newDist],["rollback",oldDist]]){
    const started=performance.now()
    active=resolve(dist)
    await page.goto(draft)
    await page.reload()
    await expect(page.locator("main")).toContainText(title)
    const index=await readFile(resolve(dist,"index.html"))
    lines.push({kind,indexSha256:createHash("sha256").update(index).digest("hex"),milliseconds:Math.round(performance.now()-started),draftVisible:true})
  }
  assert.equal(lines[0].indexSha256,lines[2].indexSha256)
  assert.notEqual(lines[0].indexSha256,lines[1].indexSha256)
  await writeFile(new URL("./web-rollback-result.json",import.meta.url),JSON.stringify({at:new Date().toISOString(),oldRevision,scope:"static web and browser prototype draft",observations:lines},null,2)+"\n")
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r))}
