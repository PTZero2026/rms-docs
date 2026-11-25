import { choose } from "../../../../../e2e/lib/choice.mjs"
// Run against a local V0 server with RMS_TEST_URL=http://127.0.0.1:5173 node --test platform.browser.mjs
import { after, before, test } from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import { applyTransaction } from "../../demo/workflow.ts"

const require = createRequire(new URL("../../../../../e2e/package.json", import.meta.url))
const { chromium, expect } = require("@playwright/test")
const base = process.env.RMS_TEST_URL || "http://127.0.0.1:5187"
let browser
before(async () => { browser = await chromium.launch({ channel: "chrome" }) })
after(async () => { await browser?.close() })

async function workspace(context, route, tenant = "tlu", userId = "ha") {
  const page = await context.newPage()
  await page.addInitScript(({ tenant, userId }) => {
    sessionStorage.setItem("rms.persona", JSON.stringify({ tenant, role: "admin", userId }))
  }, { tenant, userId })
  await page.goto(base + "/#/" + route)
  return page
}
const button = (scope, name) => scope.getByRole("button", { name, exact: true })
async function downloadBytes(page) {
  const [file] = await Promise.all([page.waitForEvent("download"), button(page, "Tải nội dung").click()])
  return readFile(await file.path())
}

test("B01 previews a valid 3 KiB fixture without saving, then downloads its original bytes after reload", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await workspace(context, "B01")
  await button(page, "Tạo cấu hình").click()
  const dialog = page.getByRole("dialog")
  await button(dialog, "Dùng tệp mẫu").click({ timeout: 3000 })
  await button(dialog, "Xem trước").click()
  await expect(dialog.getByRole("status")).toContainText("image/png")
  const img = dialog.getByRole("img")
  await expect(img).toBeVisible()
  const before = await img.evaluate(async element => {
    await element.decode()
    return [...new Uint8Array(await (await fetch(element.src)).arrayBuffer())]
  })
  assert.equal(before.length, 3072)
  assert.equal(await page.evaluate(() => localStorage.length), 0)
  assert.equal(await page.evaluate(async () => (await indexedDB.databases()).length), 0)
  await button(dialog, "Lưu cấu hình").click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  assert.deepEqual(await downloadBytes(page), Buffer.from(before))
})

test("P01 saves and edits an incomplete draft, validates at activation and keeps version 1 intact", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await workspace(context, "P01")
  await button(page, "Tạo phiên bản").click()
  const dialog = page.getByRole("dialog")
  await button(dialog, "Thêm chuyển bước").click({ timeout: 3000 })
  await button(dialog, "Lưu bản nháp").click()
  await expect(dialog).toHaveCount(0)
  await button(page, "Kích hoạt phiên bản").click()
  await expect(page.getByRole("alert")).toBeVisible()
  await button(page, "Chỉnh sửa bản nháp").click()
  await button(dialog, "Bỏ chuyển bước").click()
  await choose(dialog.getByLabel("Chuyển bước cần sửa"), "0")
  await dialog.getByLabel("Bắt buộc nhập lý do").check()
  await dialog.getByLabel("Thành viên hội đồng", { exact: true }).check()
  await choose(dialog.getByLabel("Bước cần đổi tên"), "DRAFT")
  await dialog.getByLabel("Tên bước hiển thị").fill("Đang soạn")
  await button(dialog, "Lưu bản nháp").click()
  await button(page, "Kích hoạt phiên bản").click()
  await expect(page.getByRole("heading", { name: "Quy trình cơ sở 2" })).toBeVisible()
  await expect(button(page, "Chỉnh sửa bản nháp")).toHaveCount(0)
  const templates = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rms.frontend.demo.2026-11.v1")).tlu.rows.filter(row => row.kind === "workflow"))
  const [v1, v2] = templates
  assert.equal(v1.status, "ARCHIVED")
  assert.equal(v2.status, "ACTIVE")
  assert.deepEqual(JSON.parse(v1.fields.edges)[0], { from: "DRAFT", to: "SUBMITTED", roles: ["researcher"] })
  const edge = JSON.parse(v2.fields.edges)[0]
  assert.ok(edge.reason)
  assert.ok(edge.roles.includes("reviewer"))
  // Exercise the configured graph through the same kernel that handles project changes.
  const actor = { userId: "mai", tenant: "tlu", role: "researcher", name: "Mai", unit: "Khoa mẫu" }
  const old = { id: "old", kind: "project", status: "DRAFT", title: "Mẫu cũ", owner: "mai", unit: actor.unit, fields: { workflowVersion: "v1" } }
  const fresh = { ...old, id: "new", fields: {} }
  const state = applyTransaction({ rows: [...templates, old], audit: [] }, actor, "Tạo nháp", [fresh])
  const pinned = state.rows.find(r => r.id === fresh.id)
  assert.equal(pinned.fields.workflowVersion, "v2")
  assert.equal(applyTransaction(state, actor, "Nộp", [{ ...old, status: "SUBMITTED" }]).rows.find(r => r.id === old.id).fields.workflowVersion, "v1")
  const submit = { ...pinned, status: "SUBMITTED" }
  assert.throws(() => applyTransaction(state, actor, "Nộp", [submit]), /lý do/)
  const commented = { ...submit, fields: { ...submit.fields, comment: "Đề xuất thử" } }
  assert.throws(() => applyTransaction(state, { ...actor, role: "student" }, "Nộp", [commented]))
  assert.equal(applyTransaction(state, { ...actor, role: "reviewer" }, "Nộp", [commented]).rows.find(r => r.id === fresh.id).status, "SUBMITTED")
  await expect(page.getByText("Đang soạn", { exact: true }).first()).toBeVisible()
})

async function newSample(page, kind = "png") {
  await button(page, "Tạo cấu hình").click()
  const dialog = page.getByRole("dialog")
  await choose(dialog.getByLabel("Tệp mẫu", { exact: true }), kind)
  await button(dialog, "Dùng tệp mẫu").click()
  return dialog
}
async function submitConfig(dialog) {
  await button(dialog, "Lưu cấu hình").click()
  await expect(dialog).toHaveCount(0)
}
async function countBlobs(page) {
  return page.evaluate(async () => {
    const [db] = await indexedDB.databases()
    if (!db) return 0
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(db.name)
      request.onsuccess = () => {
        const connection = request.result
        const count = connection.transaction("blobs").objectStore("blobs").count()
        count.onsuccess = () => { connection.close(); resolve(count.result) }
        count.onerror = () => reject(count.error)
      }
    })
  })
}

test("B01 refuses 20 MiB + 1, handles IndexedDB quota, then retries the same 20 MiB file", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await workspace(context, "B01")
  const dialog = await newSample(page, "oversized")
  await button(dialog, "Lưu cấu hình").click()
  await expect(dialog.getByRole("alert")).toContainText("vượt 20 MB")
  await expect(dialog.getByLabel("Tên hiển thị")).toHaveValue("Kiểm tra dung lượng")
  assert.equal(await countBlobs(page), 0)
  const client = await context.newCDPSession(page)
  await client.send("Storage.overrideQuotaForOrigin", { origin: base, quotaSize: 1024 * 1024 })
  await choose(dialog.getByLabel("Tệp mẫu", { exact: true }), "limit")
  await button(dialog, "Dùng tệp mẫu").click()
  await button(dialog, "Lưu cấu hình").click()
  await expect(dialog.getByRole("alert")).toContainText("dung lượng")
  assert.equal(await countBlobs(page), 0)
  assert.equal(await page.evaluate(() => localStorage.length), 0)
  await client.send("Storage.overrideQuotaForOrigin", { origin: base, quotaSize: 96 * 1024 * 1024 })
  await submitConfig(dialog)
  await page.reload()
  assert.deepEqual(await downloadBytes(page), Buffer.alloc(20 * 1024 * 1024))
  assert.equal(await countBlobs(page), 1)
})

test("B01 preserves winner bytes and losing inputs across index quota failure and conflicting tabs", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const a = await workspace(context, "B01")
  const b = await workspace(context, "B01")
  const first = await newSample(a)
  const stale = await newSample(b)
  await stale.getByLabel("Tên hiển thị").fill("Tên chưa lưu")
  await a.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (...args) {
      Storage.prototype.setItem = setItem
      throw new DOMException("quota " + args[0], "QuotaExceededError")
    }
  })
  await button(first, "Lưu cấu hình").click()
  await expect(first.getByRole("alert")).toContainText("dung lượng")
  assert.equal(await countBlobs(a), 0)
  await submitConfig(first)
  const winner = await downloadBytes(a)
  await button(stale, "Lưu cấu hình").click()
  await expect(stale.getByRole("alert")).toContainText("phiên khác")
  await expect(stale.getByLabel("Tên hiển thị")).toHaveValue("Tên chưa lưu")
  assert.deepEqual(await downloadBytes(a), winner)
  assert.equal(await countBlobs(a), 1)
})

test("B01 isolates tenant blobs and falls back to the updated shared bytes on deletion", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const shared = await workspace(context, "B01", "tlu", "lan")
  await submitConfig(await newSample(shared))
  const original = await downloadBytes(shared)
  const route = "B01/cfg-base-DEMO.PNG"
  const tlu = await workspace(context, route)
  const hmu = await workspace(context, route, "hmu")
  await button(tlu, "Ghi đè cho đơn vị").click()
  await submitConfig(tlu.getByRole("dialog"))
  await button(hmu, "Ghi đè cho đơn vị").click()
  const outdated = hmu.getByRole("dialog")
  await outdated.getByLabel("Tên hiển thị").fill("Bản riêng đang soạn")
  await button(shared, "Chỉnh sửa").click()
  const dialog = shared.getByRole("dialog")
  const changed = Buffer.from("Du lieu mau")
  await dialog.locator('input[type="file"]').setInputFiles({ name: "du-lieu.png", mimeType: "image/png", buffer: changed })
  await button(dialog, "Xem trước").click()
  await expect(dialog.getByRole("status")).toContainText("text/plain")
  await submitConfig(dialog)
  await button(outdated, "Lưu cấu hình").click()
  await expect(outdated.getByRole("alert")).toContainText("phiên khác")
  await expect(outdated.getByLabel("Tên hiển thị")).toHaveValue("Bản riêng đang soạn")
  await expect(button(outdated, "Lưu cấu hình")).toBeEnabled()
  await hmu.reload()
  assert.deepEqual(await downloadBytes(hmu), changed)
  assert.deepEqual(await downloadBytes(tlu), original)
  await button(tlu, "Xóa cấu hình").click()
  await button(tlu.getByRole("dialog"), "Xác nhận xóa").click()
  await expect(tlu.getByRole("dialog")).toHaveCount(0)
  await tlu.goto(base + "/#/" + route)
  assert.deepEqual(await downloadBytes(tlu), changed)
  assert.equal(await countBlobs(tlu), 1)
})

test("catalog status and role layout apply in the existing F02 and B06 screens", async t => {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await workspace(context, "B01")
  await page.getByText("Danh mục kỳ nhận đề xuất", { exact: true }).click()
  await page.getByRole("button", { name: /Mẫu thuyết minh đề tài cấp cơ sở/ }).click()
  const dialog = page.getByRole("dialog")
  await choose(dialog.getByLabel("Hiệu lực"), "INACTIVE")
  await submitConfig(dialog)
  const officer = await workspace(context, "F02/new", "tlu", "an")
  await officer.getByRole("combobox", {name: /Biểu mẫu/}).click()
  await expect(officer.getByRole("option", { name: /Mẫu thuyết minh đề tài cấp cơ sở/ })).toBeDisabled()
  await page.getByRole("link", { name: "Bố cục trang chủ" }).click()
  await page.getByRole("checkbox", { name: "Thông báo gần đây" }).uncheck()
  await button(page, "Lưu bố cục").click()
  await expect(page.getByRole("status")).toContainText("Đã áp dụng")
  const home = await workspace(context, "B06", "tlu", "mai")
  await expect(home.getByRole("heading", { name: "Hồ sơ nghiên cứu" })).toBeVisible()
  await expect(home.getByRole("heading", { name: "Thông báo gần đây" })).toHaveCount(0)
  const other = await workspace(context, "B06", "hmu", "mai")
  await expect(other.getByRole("heading", { name: "Thông báo gần đây" })).toBeVisible()
})
