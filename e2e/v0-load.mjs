import { chromium } from "playwright"

const browser = await chromium.launch({
  headless: true,
  channel: process.env.RMS_BROWSER_CHANNEL || undefined,
})
const root = "http://127.0.0.1:4187"
try {
  const samples = []
  for (const extra of [0, 1000, 3000]) {
    for (let run = 1; run <= 5; run++) {
      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        await page.goto(root + "/#/B04")
        await page.getByRole("button", { name: "Đọc tất cả", exact: true }).click()
        const recordCount = await page.evaluate((extra) => {
          const key = "rms.frontend.demo.2026-11.v1"
          const world = JSON.parse(localStorage.getItem(key))
          const rows = world.tlu.rows
          const draft = rows.find(
            (r) => r.kind === "project" && r.status === "DRAFT" && r.owner === "mai",
          )
          for (let i = 0; i < extra; i++) {
            rows.push({ ...draft, id: "load-" + i, title: "Đề tài đo tải " + i })
          }
          localStorage.setItem(key, JSON.stringify(world))
          return rows.length
        }, extra)
        await page.addInitScript(() => {
          const observer = new MutationObserver(() => {
            if (!document.querySelector("main h1")?.textContent?.includes("Xin chào")) return
            observer.disconnect()
            requestAnimationFrame(() => requestAnimationFrame(() => performance.mark("home-ready")))
          })
          observer.observe(document, { subtree: true, childList: true })
        })
        await page.goto(root)
        await page.reload()
        await page.waitForFunction(() => performance.getEntriesByName("home-ready").length > 0)
        const homeMs = await page.evaluate(
          () => performance.getEntriesByName("home-ready")[0].startTime,
        )
        const searchMs = await page.evaluate(async (extra) => {
          document.querySelector('button[aria-label="Tìm kiếm"]').click()
          const input = await new Promise((resolve) => {
            const find = () => {
              const field = document.querySelector('input[aria-label="Từ khóa tìm kiếm"]')
              field ? resolve(field) : requestAnimationFrame(find)
            }
            find()
          })
          const start = performance.now()
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
            input,
            extra ? "Đề tài đo tải " + (extra - 1) : "F01",
          )
          input.dispatchEvent(new Event("input", { bubbles: true }))
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          )
          if (!document.querySelector(".search-results button"))
            throw Error("Tìm kiếm không có kết quả")
          return performance.now() - start
        }, extra)
        samples.push({ extra, run, recordCount, homeMs, searchMs })
      } finally {
        await context.close()
      }
    }
  }
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  const groups = [0, 1000, 3000].map((extra) => {
    const subset = samples.filter((s) => s.extra === extra)
    return {
      rows: subset[0].recordCount,
      extra,
      runs: subset.length,
      homeMs: median(subset.map((s) => s.homeMs)),
      searchMs: median(subset.map((s) => s.searchMs)),
    }
  })
  console.log(JSON.stringify({ browser: browser.version(), groups, samples }, null, 2))
} finally {
  await browser.close()
}
