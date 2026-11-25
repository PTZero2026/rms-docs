import { createHash, randomBytes, randomUUID } from "node:crypto"
import { expect, test, type Browser } from "@playwright/test"

const idp = "http://127.0.0.1:8180"
const inbox = "http://127.0.0.1:8026"
const origin = process.env.RMS_WEB_ORIGIN ?? "http://127.0.0.1:5173"
const seconds = Number(process.env.RMS_LOGIN_SECONDS ?? 300)

async function start(browser: Browser, slug: string, email = randomUUID() + "@example.invalid") {
  const context = await browser.newContext()
  const page = await context.newPage()
  const verifier = randomBytes(48).toString("base64url")
  const redirect = origin + "/app/" + slug
  const issuer = idp + "/realms/" + slug
  await page.route(redirect + "*", route => route.fulfill({body:"Signed in."}))
  const query = new URLSearchParams({
    client_id: "rms-web", response_type: "code", redirect_uri: redirect,
    scope: "openid email", state: randomUUID(), code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
  })
  const previous = await (await page.request.get(inbox + "/api/v1/messages")).json()
  const seen = new Set(previous.messages.map((m: {ID:string}) => m.ID))
  await page.goto(issuer + "/protocol/openid-connect/auth?" + query)
  await page.locator("[name=username]").fill(email)
  await page.locator("form input[type=submit], form button[type=submit]").first().click()
  await expect(page.locator("#otp")).toBeVisible()
  let otp = ""
  await expect.poll(async () => {
    const list = await (await page.request.get(inbox + "/api/v1/messages")).json()
    const hit = list.messages.find((m: { ID: string; To: {Address: string}[] }) => !seen.has(m.ID) && m.To.some(to => to.Address === email))
    if (!hit) return false
    const mail = await (await page.request.get(inbox + "/api/v1/message/" + hit.ID)).json()
    otp = mail.Text.match(/\b\d{6}\b/)?.[0] ?? ""
    return otp.length === 6
  }).toBe(true)
  async function submit(code: string) {
    await page.locator("#otp").fill(code)
    await page.locator("#kc-submit").click()
  }
  return { context, page, email, issuer, redirect, verifier, otp, submit }
}

test("a one-time code authenticates only its own realm and session", async ({ browser }) => {
  const a = await start(browser, "school-1")
  const b = await start(browser, "school-2", a.email)
  try {
    await b.submit(a.otp)
    await expect(b.page.locator("#otp")).toBeVisible()
    expect(b.page.url().startsWith(b.issuer)).toBeTruthy()
    await a.submit(a.otp)
    await a.page.waitForURL(a.redirect + "*")
    const code = new URL(a.page.url()).searchParams.get("code")
    expect(code).toBeTruthy()
    const token = await a.page.request.post(a.issuer + "/protocol/openid-connect/token", { form:{
      grant_type:"authorization_code", client_id:"rms-web", redirect_uri:a.redirect,
      code:code!, code_verifier:a.verifier,
    } })
    expect(token.ok()).toBe(true)
    const claims = JSON.parse(Buffer.from((await token.json()).access_token.split(".")[1],"base64url").toString())
    expect(claims.iss).toBe(a.issuer)
    expect([claims.aud].flat()).toContain("rms-api")
    await b.submit(b.otp)
    await b.page.waitForURL(b.redirect + "*")
    const next = await start(browser, "school-1", a.email)
    try {
      await next.submit(a.otp)
      await expect(next.page.locator("#otp")).toBeVisible()
      expect(next.page.url().startsWith(next.issuer)).toBeTruthy()
    } finally { await next.context.close() }
  } finally { await a.context.close(); await b.context.close() }
})

test("the realm rejects an expired challenge", async ({browser}) => {
  test.setTimeout((seconds + 45) * 1000)
  const a = await start(browser,"school-1")
  try {
    await new Promise(resolve => setTimeout(resolve, (seconds + 3) * 1000))
    await a.submit(a.otp)
    expect(a.page.url().startsWith(a.issuer)).toBe(true)
    await expect(a.page.getByText(/expired|timed out|took too long|restart the login/i).first()).toBeVisible()
  } finally { await a.context.close() }
})
