import { expect, test } from "@playwright/test"

for (const width of [320, 390, 1280]) {
  test(`F11 · tìm, bỏ lọc và mở đúng dự án ở ${width}px`, async ({ page }) => {
    await page.setViewportSize({width, height: 844})
    await page.goto("/#/F11")
    const main = page.getByRole("main")
    const search = main.getByRole("searchbox")
    const table = main.getByRole("table")
    await expect(table.getByRole("columnheader", {name: "Trạng thái"})).toHaveCount(1)
    const amount = await table.locator("tbody tr").count()
    expect(amount).toBeGreaterThan(0)
    const select = main.getByRole("combobox", {name: "Loại dự án"})
    if (width < 600) {
      await expect(select).toHaveCount(0)
      await main.getByRole("button", {name: "Bộ lọc", exact: true}).click()
    }
    await select.click()
    await page.getByRole("option").nth(1).click()
    await search.fill("mã-không-có-trong-danh-sách")
    await expect(main.getByText("Không có hồ sơ phù hợp")).toBeVisible()
    await main.getByRole("button", {name: "Xóa bộ lọc"}).click()
    await expect(search).toBeFocused()
    await expect(search).toHaveValue("")
    await expect(table.locator("tbody tr")).toHaveCount(amount)
    const pan = await table.locator("..").evaluate(el => el.scrollWidth - el.clientWidth)
    expect(pan).toBeLessThanOrEqual(1)
    const record = table.getByRole("link").first()
    const title = await record.innerText()
    await record.click()
    await expect(main.getByRole("heading", {name: title, exact: true})).toBeVisible()
    if (width < 600) await page.getByRole("button", {name: "Mở điều hướng"}).click()
    const nav = page.getByRole("navigation", {name:"Chức năng"})
    const current = nav.locator('[aria-current="page"]')
    await expect(current).toHaveAttribute("href", "#/F11")
    const group = nav.getByRole("button", {name:"Hoạt động mở rộng"})
    await group.click()
    await expect(current).toHaveCount(0)
    await group.click()
    await expect(current).toHaveAttribute("href", "#/F11")
  })
}

test("Liên kết cũ cho phép quay lại danh sách đề xuất bằng bàn phím", async ({page}) => {
  await page.goto("/#/F01/khong-co-ho-so")
  const back = page.getByRole("main").getByRole("link", {name: "Về danh sách"})
  await back.focus()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/#\/F01$/)
  await expect(page.getByRole("heading", {name: "Danh sách đề xuất"})).toBeVisible()
})

for (const [scenario, feature, label] of [["TLU-24","B01","Tạo cấu hình"], ["TLU-31","P03","Quy đổi sản phẩm F07"]]) {
  test(`${feature} · Escape trả tiêu điểm về nút mở ${label}`, async ({page}) => {
    await page.goto("/?cas=" + scenario)
    await page.waitForURL("**/#/**")
    await page.goto("/#/" + feature)
    const opener = page.getByRole("button", {name:label, exact:true})
    await opener.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(opener).toBeFocused()
  })
}
