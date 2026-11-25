import { choose } from "../lib/choice.mjs"
import { expect, test, type Page } from "@playwright/test"
import { readFile } from "node:fs/promises"

async function switchUser(page: Page, name: string, tenant = "tlu") {
  await page.getByRole("button", { name: "Phiên mô phỏng", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await choose(dialog.getByLabel("Đơn vị", { exact: true }), tenant)
  await dialog.getByRole("button", { name: new RegExp(name) }).click()
  await expect(dialog).toBeHidden()
}
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true })

test("Chủ nhiệm mở kỳ, lưu nháp và tìm lại đề xuất sau khi tải lại", async ({ page }) => {
  await page.goto("/#/F02/call-01")
  await page.getByRole("link", {name: "Lập đề xuất cho kỳ này"}).click()
  const title = "Đo cao trình mực nước trong mô hình thủy lực"
  await page.getByLabel("Tên đề tài", { exact: true }).fill(title)
  await button(page, "Lưu nháp").click()
  await page.reload()
  await button(page, "Tìm kiếm").click()
  const search = page.getByRole("dialog")
  await search.getByLabel("Từ khóa tìm kiếm").fill(title)
  await search.getByRole("link", { name: new RegExp(title) }).click()
  await expect(page.locator("main")).toContainText(title)
  await expect(page).toHaveURL(/#\/F01\//)
})

test("Chuyên viên giao đề tài, chủ nhiệm nộp báo cáo, chuyên viên duyệt", async ({ page }) => {
  await page.goto("/")
  await switchUser(page, "Nguyễn Hoài An")
  await page.goto("/#/F04/intake-dt-approved")
  await button(page, "Giao đề tài").click()
  const form = page.getByRole("dialog")
  await form.getByLabel("Số quyết định hoặc hợp đồng").fill("QĐ-V0-18")
  await form.getByLabel("Kết thúc thực hiện").fill("2027-11-20")
  await form.getByLabel("Số báo cáo kỹ thuật cam kết").fill("1")
  await form.getByRole("button", { name: "Xác nhận giao đề tài" }).click()
  await expect(form.getByRole("alert")).toBeVisible()
  await form.getByRole("button", { name: "Dùng tệp mẫu" }).click()
  await form.getByRole("button", { name: "Xác nhận giao đề tài" }).click()
  await expect(form).toBeHidden()
  await button(page, "Lập kỳ báo cáo").click()
  await form.getByLabel("Hạn nộp").fill("2026-11-20")
  await form.getByRole("button", { name: "Xác nhận", exact: true }).click()
  await switchUser(page, "Lê Thanh Mai")
  await page.goto("/#/F04/intake-dt-approved")
  await button(page, "Nộp báo cáo").click()
  await form.getByLabel("Kết quả thực hiện").fill("Đã đối chiếu số liệu mùa kiệt.")
  await form.getByRole("button", { name: "Dùng tệp mẫu" }).click()
  await form.getByRole("button", { name: "Xác nhận", exact: true }).click()
  await switchUser(page, "Nguyễn Hoài An")
  await page.goto("/#/F04/intake-dt-approved")
  await button(page, "Duyệt đạt").click()
  await form.getByRole("button", { name: "Xác nhận", exact: true }).click()
  await expect(form).toBeHidden()
  await page.goto("/#/P02/intake-dt-approved")
  await expect(page.locator("main")).toContainText("Nguyễn Hoài An")
})

test("Khóa và mở lại tài khoản có hiệu lực ở tab đang dùng", async ({ page, context }) => {
  await page.goto("/#/F08")
  const admin = await context.newPage()
  await admin.goto("/")
  await switchUser(admin, "Trần Thu Hà")
  await admin.goto("/#/B03/account-mai")
  await button(admin, "Khóa tài khoản").click()
  await admin.getByRole("dialog").getByRole("button", { name: "Xác nhận", exact: true }).click()
  await expect(page.locator("main")).toContainText("Tài khoản đang bị khóa")
  await admin.reload()
  await button(admin, "Kích hoạt lại").click()
  await admin.getByRole("dialog").getByRole("button", { name: "Xác nhận", exact: true }).click()
  await expect(page.locator("main")).toContainText("Thông tin nhà nghiên cứu")
})

test("Giữ quyền theo đơn vị, mở CV trên điện thoại và đánh dấu thông báo", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/")
  await switchUser(page, "Lê Thanh Mai", "hmu")
  await page.goto("/#/F10")
  await expect(page.locator("main")).toContainText("Chức năng không khả dụng")
  await switchUser(page, "Lê Thanh Mai")
  await page.goto("/#/B04")
  await button(page, "Đọc tất cả").click()
  await page.reload()
  await expect(button(page, "Đọc tất cả")).toBeDisabled()
  await page.goto("/#/F08")
  const downloaded = page.waitForEvent("download")
  await button(page, "Trích xuất lý lịch").click()
  const path = await (await downloaded).path()
  expect(await readFile(path!, "utf8")).toContain("Lê Thanh Mai")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test("Email mẫu được tạo đúng một lần và giữ vai trò người dùng", async ({ page }) => {
  await page.goto("/")
  async function login() {
    await button(page, "Phiên mô phỏng").click()
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Đăng nhập bằng email mẫu" }).click()
    await dialog.getByLabel("Email mẫu").fill("v0@example.invalid")
    await dialog.getByRole("button", { name: "Nhận mã mô phỏng" }).click()
    await dialog.getByLabel("Mã xác nhận").fill("210926")
    await dialog.getByRole("button", { name: "Đăng nhập", exact: true }).click()
    await expect(dialog).toBeHidden()
  }
  await login()
  await login()
  await page.goto("/#/B03")
  await expect(page.locator("main")).toContainText("v0@example.invalid")
  await expect(page.locator("main")).toContainText("Đồng bộ lần đầu")
  await page.goto("/#/P02")
  await expect(page.locator("main").getByText("Tạo tài khoản ở lần đăng nhập đầu")).toHaveCount(1)
})

test("Hai tab sửa cùng đề xuất giữ bản đã lưu và bản người thứ hai đang soạn", async ({
  page,
  context,
}) => {
  const other = await context.newPage()
  for (const tab of [page, other]) {
    await tab.goto("/#/F01/dt-01")
    await button(tab, "Chỉnh sửa đề xuất").click()
  }
  await other.getByLabel("Tên đề tài", { exact: true }).fill("Văn bản đang soạn tại tab thứ hai")
  await page.getByLabel("Tên đề tài", { exact: true }).fill("Bản đã xác nhận tại tab thứ nhất")
  await button(page, "Lưu nháp").click()
  await expect(page.locator("main")).toContainText("Bản đã xác nhận tại tab thứ nhất")
  await button(other, "Lưu nháp").click()
  await expect(other.locator("main").getByRole("alert")).toContainText("Đề xuất đã thay đổi")
  await expect(other.getByLabel("Tên đề tài", { exact: true })).toHaveValue(
    "Văn bản đang soạn tại tab thứ hai",
  )
  await page.reload()
  await expect(page.locator("main")).toContainText("Bản đã xác nhận tại tab thứ nhất")
})
