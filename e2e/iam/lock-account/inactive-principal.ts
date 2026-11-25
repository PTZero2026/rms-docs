import { expect, type Page } from "@playwright/test"
import { fileURLToPath } from "node:url"

/** B03/TC-05 uses the F01 author and proposal just submitted in the call scenario. */
export async function checkInactivePrincipal(
  manager: Page, officer: Page, author: Page, projectId: string,
  principal: { id: string; email: string }, staffToken: string, authorToken: string,
) {
  const project = "/api/tenants/school-1/projects/" + projectId
  const readAsOfficer = async (suffix: string) => {
    const response = await officer.request.get(project + suffix, { headers: { authorization: staffToken } })
    expect(response.status()).toBe(200)
    return response.json()
  }
  const proposal = await readAsOfficer("/proposal")
  const audit = await readAsOfficer("/audit")
  expect(proposal.semantic).toBe("SUBMITTED")
  expect(proposal.members).toContainEqual({ ...principal, principal: true })
  expect(audit.total).toBeGreaterThan(1)

  await manager.goto("/app/school-1?project="+projectId)
  await manager.getByRole("button",{name:"Mở thuyết minh"}).click()
  await expect(manager.getByLabel("Tên đề xuất")).toHaveValue(proposal.title)
  await expect(manager.getByRole("button",{name:"Trả hồ sơ bổ sung"})).toHaveCount(0)
  await expect(manager.getByRole("button",{name:"Hủy đề xuất",exact:true})).toHaveCount(0)
  await manager.getByRole("button", { name: "Quản lý người dùng" }).click()
  await manager.getByLabel("Tên hoặc email").fill(principal.email)
  await manager.getByRole("button", { name: "Tìm người dùng" }).click()
  await manager.getByRole("button", { name: principal.email, exact: true }).click()
  await manager.getByRole("button", { name: "Ngừng hoạt động", exact: true }).click()
  const confirm = manager.waitForResponse(response => response.request().method() === "DELETE"
    && response.url().endsWith("/admin/users/" + principal.id))
  await manager.getByRole("button", { name: "Xác nhận ngừng hoạt động" }).click()
  const response = await confirm
  expect(response.status()).toBe(200)
  const receipt = await response.json()
  expect(receipt.account).toMatchObject({ ...principal, isActive: false })
  expect(Number.isFinite(Date.parse(receipt.account.deletedAt))).toBe(true)
  const event = manager.getByText(/Sự kiện ADMIN_DELETE_USER/)
  await expect(event).toContainText(/\b\d{2}\/\d{2}\/\d{4}\b/)
  await event.locator("..").screenshot({
    path: fileURLToPath(new URL("../../../docs/reviews/screenshots/iam/ngung-hoat-dong-chu-nhiem.png", import.meta.url)),
  })
  const previousSession = await author.request.get(project + "/proposal", { headers: { authorization: authorToken } })
  expect(previousSession.status()).toBe(403)
  expect(await readAsOfficer("/proposal")).toEqual(proposal)
  expect(await readAsOfficer("/audit")).toEqual(audit)
}
