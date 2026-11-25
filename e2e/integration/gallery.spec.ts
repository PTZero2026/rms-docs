import { expect, test } from "@playwright/test"
import { fileURLToPath } from "node:url"

for (const width of [390,1280]) {
  test("tenant theme and keyboard focus at "+width+"px",async ({page})=>{
    await page.setViewportSize({width,height:844})
    await page.goto("/theme-gallery/")
    for (const [school,font,color] of [["a","Geist","rgb(18, 96, 84)"],["b","Georgia","rgb(113, 52, 80)"]]) {
      await page.getByLabel("Đơn vị").selectOption(school)
      const trigger = page.getByRole("button",{name:"Kiểm tra hồ sơ"})
      await expect(trigger).toHaveCSS("background-color",color)
      await expect(page.locator("body")).toHaveCSS("font-family",new RegExp(font))
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.screenshot({path:fileURLToPath(new URL("../../docs/reviews/screenshots/theme/"+school+"-"+width+".png",import.meta.url))})
      await trigger.focus()
      await page.keyboard.press("Enter")
      const dialog = page.getByRole("dialog")
      await expect(dialog).toContainText("Thiếu tên đề tài")
      await expect(dialog).toHaveCSS("font-family",new RegExp(font))
      await expect(dialog).toHaveCSS("background-color",school==="a"?"rgb(255, 255, 255)":"rgb(255, 250, 246)")
      for (const key of ["Tab","Tab","Shift+Tab"]) {
        await page.keyboard.press(key)
        expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true)
      }
      await page.keyboard.press("Escape")
      await expect(trigger).toBeFocused()
    }
    await page.getByLabel("Chế độ hiển thị").selectOption("dark")
    await expect(page.getByRole("button",{name:"Kiểm tra hồ sơ"})).toHaveCSS("background-color","rgb(235, 174, 212)")
  })
}
