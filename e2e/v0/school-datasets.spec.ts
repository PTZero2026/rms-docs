import { test, expect, type Page } from "@playwright/test"
import { choose } from "../lib/choice.mjs"

async function switchSchool(page: Page, tenant: string, name: string) {
  await page.getByRole("button", { name: "Phiên mô phỏng", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await choose(dialog.getByLabel("Đơn vị", { exact: true }), tenant)
  await dialog.getByRole("button", { name: new RegExp(name) }).click()
  await expect(dialog).toBeHidden()
}

test("Hai trường có hồ sơ chuyên ngành và số liệu báo cáo đối chứng riêng", async ({ page }) => {
  await page.goto("/")
  for (const [tenant, title, faculty] of [
    ["tlu", "Quan trắc xói lở bờ sông", "Khoa Công trình"],
    ["hmu", "Đánh giá bảng kiểm bàn giao ca", "Khoa Điều dưỡng"],
  ]) {
    await switchSchool(page, tenant, "Nguyễn Hoài An")
    await page.goto("/#/F04/exec-river")
    await expect(page.locator("main")).toContainText(title)
    await page.goto("/#/B02/report-open-baseline")
    await expect(page.locator("main")).toContainText(faculty)
    await expect(page.locator("main")).toContainText(tenant.toUpperCase() + "-26-NC07")
    await expect(page.locator("main")).toContainText("Tất cả (3)")
  }
})

test("Bật E4 riêng của Y Hà Nội rồi duyệt kết quả hợp đồng và đối chiếu sổ giờ", async ({ page }) => {
  await page.goto("/")
  await switchSchool(page, "hmu", "Trần Thu Hà")
  await page.goto("/#/F11")
  await expect(page.locator("main")).toContainText("Chức năng không khả dụng")
  await page.goto("/#/B01/cfg-base-FEATURE.E4")
  await page.getByRole("button", { name: "Ghi đè cho đơn vị" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Giá trị", { exact: true }).fill("true")
  await dialog.locator('button[type="submit"]').click()
  await expect(dialog).toBeHidden()
  await switchSchool(page, "hmu", "Nguyễn Hoài An")
  await page.goto("/#/F11/ext-applied-complete")
  await expect(page.locator("main")).toContainText("Bàn giao công cụ lập lịch trạm thực hành")
  await page.getByRole("button", { name: "Xác nhận kết quả", exact: true }).click()
  await page.getByRole("dialog").locator('button[type="submit"]').click()
  await page.goto("/#/P03")
  const entries = page.getByRole("row").filter({ hasText: "Bàn giao công cụ lập lịch trạm thực hành" })
  await expect(entries).toHaveCount(2)
  await expect(entries.filter({ hasText: "Lê Thanh Mai" })).toContainText("24")
  await expect(entries.filter({ hasText: "Phạm Quang Minh" })).toContainText("16")
})

test("Liên kết sổ tay chọn đúng người, tenant và hồ sơ sau khi tải lại", async ({ page }) => {
  await page.goto("/?cas=HMU-07")
  await expect(page).toHaveURL(/#\/F03\/intake-dt-flood$/)
  await expect(page.getByRole("heading", { name: /Đánh giá khả năng tiếp cận tài liệu giáo dục sức khỏe/ })).toBeVisible()
  await expect(page.locator(".account-button")).toContainText("Phạm Quang Minh")
  await page.reload()
  await expect(page.locator(".tenant-button")).toContainText("Đại học Y Hà Nội")
  await page.goto("/?cas=TLU-16")
  await expect(page).toHaveURL(/#\/F05\/exec-dam$/)
  await expect(page.locator(".account-button")).toContainText("Nguyễn Hoài An")
  await expect(page.locator("main")).toContainText("TLU-26-005")
})
