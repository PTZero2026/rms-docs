import { expect, test, type Page } from "@playwright/test"

const nav = (page: Page) => page.getByRole("navigation", { name: "Điều hướng nhanh" })
const queue = (page: Page) => page.getByRole("region", { name: "Việc cần xử lý" })

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const links = nav(page).getByRole("link")
  for (const link of await links.all()) {
    const box = await link.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
    expect(box?.width).toBeGreaterThanOrEqual(44)
  }
}

for (const width of [320, 360, 390]) {
  test.describe("Điện thoại " + width, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true })

    test("US-33 · lọc quá hạn rồi mở kỳ báo cáo ở F04", async ({ page }) => {
      await page.goto("/")
      const work = queue(page)
      await work.getByRole("button", { name: "Quá hạn", exact: true }).click()
      await expect(work).toContainText("18/11/2026")
      await expect(work).not.toContainText("28/11/2026")
      await fits(page)
      await work.getByRole("link", { name: /Đo kiểm thiết bị/ }).click()
      await expect(page).toHaveURL(/#\/F04\//)
      await expect(page.locator("main")).toContainText("Đo kiểm thiết bị")
      await page.goBack()
      await work.getByRole("button", { name: "Tất cả", exact: true }).click()
      await expect(work.getByRole("link", { name: /Đối chiếu số liệu/ })).toBeVisible()
      expect(
        await page.evaluate(() => localStorage.getItem("rms.frontend.demo.2026-11.v1")),
      ).toBeNull()
    })

    test("US-34 · đọc từng tin, quay lại và tải lại bộ lọc", async ({ page }) => {
      await page.goto("/")
      await nav(page).getByRole("link", { name: "Hộp thư" }).click()
      await page.getByRole("button", { name: "Chưa đọc", exact: true }).click()
      await page.getByRole("button", { name: /Kỳ nhận đề xuất đã mở/ }).click()
      await expect(page.getByRole("heading", { name: "Kỳ nhận đề xuất đã mở" })).toBeVisible()
      await page.goBack()
      await page.reload()
      await expect(page.getByRole("button", { name: "Chưa đọc", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      )
      await expect(page.locator("main")).not.toContainText("Kỳ nhận đề xuất đã mở")
      await page.getByRole("button", { name: /Đến kỳ cập nhật tiến độ/ }).click()
      await page.getByRole("button", { name: "Quay lại danh sách" }).click()
      await expect(page.locator("main")).toContainText("Không có thông báo trong mục này")
      await page.getByRole("button", { name: "Tất cả", exact: true }).click()
      await expect(page.getByRole("button", { name: /Kỳ nhận đề xuất đã mở/ })).toContainText(
        "Đã đọc",
      )
      await fits(page)
    })

    test("US-35 · tra mã kỳ, xem hạn và mở đúng điều kiện", async ({ page }) => {
      await page.goto("/")
      await nav(page).getByRole("link", { name: "Kỳ đề xuất" }).click()
      await expect(page.getByRole("button", { name: "Đang nhận", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      )
      const search = page.getByLabel("Tìm theo tên hoặc mã kỳ")
      await search.fill("ngoài danh mục")
      await expect(page.locator("main")).toContainText("Chưa có kỳ phù hợp")
      await search.fill("kg-2027-01")
      const call = page.getByRole("link", { name: /Đề tài cấp cơ sở năm 2027/ })
      await expect(call).toContainText("30/11/2026")
      await fits(page)
      await call.click()
      await expect(page).toHaveURL(/#\/F02\/call-01$/)
      await expect(page.locator("main")).toContainText("Mẫu thuyết minh đề tài cấp cơ sở")
      await expect(page.getByRole("button", { name: "Lập đề xuất cho kỳ này" })).toBeVisible()
    })
  })
}

async function switchPerson(page: Page, name: string, tenant = "tlu") {
  await page.getByRole("button", { name: "Phiên mô phỏng" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Đơn vị", { exact: true }).selectOption(tenant)
  await dialog.getByRole("button", { name: new RegExp(name) }).click()
  await expect(dialog).toBeHidden()
}

for (const width of [360, 390]) {
  test.describe("Biên dữ liệu " + width, () => {
    test.use({ viewport: { width, height: 800 } })
    test("US-33 · hôm nay, thiếu hạn và widget bị tắt", async ({ page }) => {
      // Open a sample notice once to materialize the tenant fixture.
      await page.goto("/#/B04/home-notice-call-01")
      await expect(page.getByRole("button", { name: "Thông báo, 1 chưa đọc" })).toBeVisible()
      await page.evaluate(() => {
        const key = "rms.frontend.demo.2026-11.v1"
        const world = JSON.parse(localStorage.getItem(key)!)
        for (const r of world.tlu.rows) {
          if (r.id === "exec-report-late") r.fields.dueDate = "2026-11-21"
          if (r.id === "exec-report-next") delete r.fields.dueDate
        }
        localStorage.setItem(key, JSON.stringify(world))
      })
      await page.goto("/#/B06")
      await page.reload()
      const work = queue(page)
      await expect(work).toContainText("Hạn 21/11/2026")
      await expect(work).toContainText("Chưa có hạn")
      await work.getByRole("button", { name: "Quá hạn" }).click()
      await expect(work).toContainText("Không có việc quá hạn")
      await work.getByRole("button", { name: "Xem tất cả việc" }).click()
      await expect(work.getByRole("link")).toHaveCount(4)
      await page.evaluate(() => {
        const key = "rms.frontend.demo.2026-11.v1"
        const world = JSON.parse(localStorage.getItem(key)!)
        world.tlu.rows.find(
          (r: { id: string }) => r.id === "cfg-base-HOME.RESEARCHER",
        ).fields.value = "activity"
        localStorage.setItem(key, JSON.stringify(world))
      })
      await page.reload()
      await expect(page.getByRole("heading", { name: "Thông báo gần đây" })).toBeVisible()
      await expect(work).toHaveCount(0)
      await switchPerson(page, "Lê Thanh Mai", "hmu")
      await expect(work).toBeVisible()
      await expect(work).not.toContainText("Quan trắc thấm qua thân đập")
    })

    test("US-34 · đọc lặp, người nhận và hai đơn vị", async ({ page }) => {
      const id = "home-notice-call-01"
      await page.goto("/#/B04/" + id)
      await expect(page.getByRole("button", { name: "Thông báo, 1 chưa đọc" })).toBeVisible()
      const snapshot = await page.evaluate(() =>
        localStorage.getItem("rms.frontend.demo.2026-11.v1"),
      )
      await page.reload()
      await expect(page.getByRole("heading", { name: "Kỳ nhận đề xuất đã mở" })).toBeVisible()
      await switchPerson(page, "Nguyễn Hoài An")
      await page.goto("/#/B04/" + id)
      await expect(page.locator("main")).toContainText(
        "Không tìm thấy thông báo trong phạm vi của bạn",
      )
      await expect(page.locator("main")).not.toContainText("Kỳ nhận đề xuất đã mở")
      expect(
        await page.evaluate(() => localStorage.getItem("rms.frontend.demo.2026-11.v1")),
      ).toEqual(snapshot)
      await switchPerson(page, "Lê Thanh Mai", "hmu")
      await page.goto("/#/B04/unread")
      await expect(page.getByRole("button", { name: /Kỳ nhận đề xuất đã mở/ })).toContainText(
        "Chưa đọc",
      )
    })

    test("US-35 · kỳ tương lai, kỳ hết hạn và phạm vi chuyên viên", async ({ page }) => {
      await page.goto("/#/B04/home-notice-call-01")
      await expect(page.getByRole("button", { name: "Thông báo, 1 chưa đọc" })).toBeVisible()
      await page.evaluate(() => {
        const key = "rms.frontend.demo.2026-11.v1"
        const world = JSON.parse(localStorage.getItem(key)!)
        const rows = world.tlu.rows
        const call = rows.find((r: { id: string }) => r.id === "call-01")
        rows.push({
          ...call,
          id: "future-test",
          title: "Kỳ tháng sau",
          fields: { ...call.fields, code: "THANG-SAU", start: "2026-12-01", due: "2026-12-31" },
        })
        call.fields.due = "2026-11-21"
        rows.find((r: { id: string }) => r.id === "intake-call-autumn").status = "OPEN"
        localStorage.setItem(key, JSON.stringify(world))
      })
      await page.goto("/#/F02")
      await page.reload()
      const main = page.locator("main")
      await expect(main).toContainText("21/11/2026")
      await expect(main).not.toContainText("Kỳ tháng sau")
      await expect(main).not.toContainText("Nghiên cứu ứng dụng đợt thu")
      await main.getByRole("button", { name: "Tất cả" }).click()
      await expect(main).toContainText("Kỳ tháng sau")
      await expect(main).not.toContainText("Sáng kiến liên ngành đợt xuân")
      await switchPerson(page, "Nguyễn Hoài An")
      await page.goto("/#/F02")
      await main.getByRole("button", { name: "Tất cả" }).click()
      await expect(main).toContainText("Sáng kiến liên ngành đợt xuân")
      await expect(main).toContainText("Nghiên cứu ứng dụng đợt thu")
    })
  })
}

test("Bản xem v0-mobile trên desktop hiển thị cùng ứng dụng ở 390 px", async ({ page }) => {
  await page.goto("/v0-mobile/")
  const preview = page.frameLocator("iframe")
  await expect(preview.getByRole("region", { name: "Việc cần xử lý" })).toBeVisible()
  const frame = await page.locator("iframe").elementHandle()
  expect(await (await frame!.contentFrame())!.evaluate(() => innerWidth)).toBe(390)
  await preview.getByRole("link", { name: "Hộp thư" }).click()
  await expect(preview.getByRole("heading", { name: "Thông báo", exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Mở toàn màn hình" }).click()
  await expect(page).toHaveURL(/#\/B04$/)
  await expect(page.locator("iframe")).toHaveCount(0)
  await expect(nav(page)).toHaveCount(0)
})
