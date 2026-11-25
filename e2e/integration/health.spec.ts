import { expect, test } from "@playwright/test"

test("session dialog reads the real API and recovers from a lost connection", async ({ page }) => {
  await page.goto("/")
  const health = page.waitForResponse(r => r.url().endsWith("/api/health") && r.ok())
  await page.getByRole("button", { name: "Phiên mô phỏng", exact: true }).click()
  expect(await (await health).json()).toEqual({ status: "ok" })
  await expect(page.getByText("Đã kết nối API RMS.")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.route("**/api/health", r => r.abort())
  await page.getByRole("button", { name: "Phiên mô phỏng", exact: true }).click()
  await expect(page.getByText("Chưa kết nối được API RMS.")).toBeVisible()
  await page.unroute("**/api/health")
  await page.getByRole("button", { name: "Kiểm tra lại" }).click()
  await expect(page.getByText("Đã kết nối API RMS.")).toBeVisible()
})
