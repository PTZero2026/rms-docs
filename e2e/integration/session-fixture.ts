import { randomUUID } from "node:crypto"
import { spawnSync } from "node:child_process"
import { expect, type Page } from "@playwright/test"

export async function signIn(page:Page,slug:string,email=randomUUID()+"@example.invalid",timing?:{mailMs:number}) {
  const previous = await (await page.request.get("http://127.0.0.1:8026/api/v1/messages")).json()
  const seen = new Set(previous.messages.map((m:{ID:string})=>m.ID))
  await page.goto("/app/"+slug)
  await page.locator("input[name=username]").fill(email)
  const mailStart=Date.now()
  await page.locator("form input[type=submit], form button[type=submit]").first().click()
  await expect(page.locator("#otp")).toBeVisible()
  let otp = ""
  await expect.poll(async () => {
    const { messages } = await (await page.request.get("http://127.0.0.1:8026/api/v1/messages")).json()
    const hit = messages.find((m: { ID:string; To: {Address:string}[] }) => !seen.has(m.ID) && m.To.some(t=>t.Address===email))
    if (!hit) return false
    const mail = await (await page.request.get("http://127.0.0.1:8026/api/v1/message/"+hit.ID)).json()
    otp = mail.Text.match(/\b\d{6}\b/)?.[0] ?? ""
    return !!otp
  }).toBeTruthy()
  if(timing)timing.mailMs=Date.now()-mailStart
  await page.locator("#otp").fill(otp)
  const me = page.waitForResponse(r => r.url().endsWith("/auth/me"))
  await page.locator("#kc-submit").click()
  const res = await me
  expect(res.status()).toBe(200)
  const account = await res.json()
  await expect(page.getByRole("heading",{name:email})).toBeVisible()
  return {email,account,res}
}

export function provision(sql:string,vars:Record<string,string>) {
  expect(process.env.PGHOST).toMatch(/^\/tmp\/rms-pg\./)
  const args=["-X","-v","ON_ERROR_STOP=1",...Object.entries(vars).flatMap(([k,v])=>["-v",k+"="+v])]
  const r=spawnSync("psql",args,{input:sql+"\n",encoding:"utf8"})
  expect(r.status,r.stderr).toBe(0)
}
