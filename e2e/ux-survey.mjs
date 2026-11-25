import { chromium } from "playwright"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const base = new URL(process.argv[2] || "http://127.0.0.1:4187")
const output = process.argv[3] || "e2e/test-results/ux"
const dataset = JSON.parse(await readFile(new URL("../apps/web/src/demo/datasets/tlu.json", import.meta.url), "utf8"))
// A case link selects the same persona as the facilitator's guide.
const lists = {
  B01:24, B02:10, B03:23, B04:13, B06:1,
  F01:4, F02:3, F03:8, F04:12, F05:16, F06:19, F07:18, F08:21,
  F09:25, F10:27, F11:28, F12:30, P01:32, P02:6, P03:31,
}
const extra = {
  "F01/new":4, "F02/new":3, "F03/new":8, "F04/new":11, "F05/new":16, "F06/new":19,
  "F07/new":18, "F09/new":1, "F10/new":27, "F11/new":1, "F12/new":1,
  "B01/home":24, "B02/new":10, "B03/roles":23, "B03/requests":23, "B04/preferences":13,
  "B04/policy":23, "B04/unread":13, "F03/intake-council-26":8, "F07/exec-river":12,
  "P03/ext-hour-ext-applied-complete%3A1-mai":31, "F01/absent":4, "F05/absent":16, "F10/absent":27,
}
const screens = [
  ...[["P03",24],["F09",24],["F10",8],["F11",24],["F12",24],["B03/requests",22]].map(([route,id]) => ({
    key:route+"@TLU-"+String(id).padStart(2,"0"), persona:"TLU-"+String(id).padStart(2,"0"), hash:"#/"+route
  })),
  ...dataset.cases.map(c => ({ key:c.id, persona:c.id, hash:c.route })),
  ...Object.entries({...lists,...extra}).map(([key, number]) => ({
    key, persona:"TLU-" + String(number).padStart(2,"0"), hash:"#/" + key,
  })),
]
const rows = [], errors = []
await mkdir(output, { recursive:true })
const browser = await chromium.launch()
async function inspect(page, width, key, state) {
  const geometry = await page.evaluate(() => {
    const root = document.querySelector('[role="dialog"],[role="alertdialog"]') || document.querySelector("main")
    const tables = Array.from(root.querySelectorAll('[data-slot="table-container"]')).filter(el => el.clientWidth)
    return {
      heading:root.querySelector("h1,h2,h3,[data-slot=empty-title]")?.textContent?.trim() || root.getAttribute("aria-label"),
      unavailable:root.innerText.includes("Không thể mở không gian làm việc"),
      cardPan:Math.max(0, ...tables.filter(el => el.querySelector(".mobile-record-table")).map(el => el.scrollWidth - el.clientWidth)),
      overflow:document.documentElement.scrollWidth - innerWidth,
      tablePan:Math.max(0, ...tables.map(el => el.scrollWidth - el.clientWidth)),
    }
  })
  rows.push({width,key,state,...geometry})
}
async function sweep(width) {
  const page = await browser.newPage({viewport:{width,height:844}, reducedMotion:"reduce"})
  page.on("pageerror", e => errors.push({width, route:page.url(), message:e.message}))
  try {
    for (const screen of screens) {
      await page.goto(new URL("/?cas=" + screen.persona, base).href)
      await page.waitForURL("**/#/**")
      if (!screen.key.startsWith("TLU-")) await page.goto(new URL("/?survey=" + encodeURIComponent(screen.key) + screen.hash,base).href)
      const main = page.getByRole("main")
      await page.waitForFunction(() => {
        const text = document.querySelector("main")?.innerText.trim()
        return text && !text.includes("Đang mở hồ sơ…")
      })
      await inspect(page,width,screen.key,"page")
      if (await page.getByRole("dialog").isVisible()) continue
      async function inspectDialogs() {
        const triggers = main.locator('button[aria-haspopup="dialog"]:visible')
        const labels = await triggers.allTextContents()
        for (let i = 0; i < labels.length; i++) {
          const trigger = triggers.nth(i)
          if (!await trigger.isVisible() || !await trigger.isEnabled()) continue
          await trigger.click()
          const dialog = page.getByRole("dialog").or(page.getByRole("alertdialog")).first()
          if (!await dialog.isVisible()) continue
          await inspect(page,width,screen.key,"dialog · " + (labels[i].trim() || await trigger.getAttribute("aria-label")))
          await page.keyboard.press("Escape")
          await dialog.waitFor({state:"hidden"})
        }
      }
      await inspectDialogs()
      const tabs = main.getByRole("tab")
      const count = await tabs.count()
      for (let i = 0; i < count; i++) {
        const tab = tabs.nth(i)
        if (!await tab.isVisible() || !await tab.isEnabled()) continue
        const label = await tab.innerText()
        await tab.click()
        await inspect(page,width,screen.key,"tab · " + label)
        await inspectDialogs()
      }
    }
  } finally { await page.close() }
}
try {
  for (const width of [320,390,768,1280]) await sweep(width)
} finally {
  await browser.close()
  await writeFile(join(output,"screens.json"),JSON.stringify({rows,errors},null,2))
}
const overflow = rows.filter(r => r.overflow > 1)
console.log(rows.length + " lượt, " + overflow.length + " tràn trang, " + errors.length + " lỗi trình duyệt")
const failed = rows.filter(r => r.unavailable || (r.width <= 600 && r.cardPan > 1))
if (failed.length) console.error(failed)
if (overflow.length || failed.length || errors.length) process.exitCode = 1
