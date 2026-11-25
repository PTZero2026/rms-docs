// Exercise the visible Radix trigger and its portalled listbox like a user.
export async function choose(trigger, value) {
  await trigger.click()
  const list = trigger.page().getByRole("listbox")
  const option = typeof value === "object"
    ? list.getByRole("option", { name: value.label, exact: true })
    : list.locator('[role="option"][data-value=' + JSON.stringify(String(value)) + ']')
  await option.click()
}
