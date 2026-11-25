import type {Browser,Page} from "@playwright/test"
import {expect} from "@playwright/test"
import {writeFileSync} from "node:fs"
import {fileURLToPath} from "node:url"
import {signIn} from "../integration/session-fixture"

export async function timeLogins(browser:Browser,staff:Page) {
  const fresh:{callbackToHeadingMs:number;mailObservedMs:number}[]=[],warm:number[]=[],lists:number[]=[]
  const baseURL="http://127.0.0.1:4191",slug="school-1"
  // Navigation timings belong to the final app document after the IdP callback.
  async function renderTime(page:Page){
    return Math.round(await page.evaluate(()=>performance.now()))
  }
  for(let i=0;i<5;i++){
    const page=await browser.newPage({baseURL})
    try{
      const timing={mailMs:0}
      await signIn(page,slug,"n13-login-"+i+"@example.invalid",timing)
      fresh.push({callbackToHeadingMs:await renderTime(page),mailObservedMs:timing.mailMs})
    }finally{await page.close()}
  }
  for(let i=0;i<30;i++){
    const me=staff.waitForResponse(r=>r.url().endsWith("/auth/me")&&r.status()===200)
    await staff.reload();await me;await expect(staff.getByRole("heading",{name:"n13-0@example.invalid"})).toBeVisible()
    warm.push(await renderTime(staff))
    const start=performance.now()
    await staff.getByRole("button",{name:"Hồ sơ nghiên cứu",exact:true}).click()
    await expect(staff.getByRole("link",{name:/N13 hồ sơ/}).first()).toBeVisible()
    lists.push(Math.round(performance.now()-start))
  }
  writeFileSync(fileURLToPath(new URL("./login-result.json",import.meta.url)),JSON.stringify({at:new Date().toISOString(),browser:browser.version(),environment:process.platform+" "+process.arch,transport:"loopback",coldBrowser:fresh,warmBrowserMs:warm,firstPageMs:lists},null,2)+"\n")
}
