import { fileURLToPath } from "node:url"
import { test,expect,type Page } from "@playwright/test"

async function persona(page:Page,name:string){
  await page.getByRole("button",{name:"Phiên mô phỏng",exact:true}).click()
  await page.getByRole("dialog").getByRole("button",{name:new RegExp(name)}).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
}
const shot=(name:string)=>fileURLToPath(new URL("../../docs/reviews/screenshots/roles/"+name+".png",import.meta.url))
test("student, invited mentor and base user see their own role's actions in the prototype",async({page})=>{
  await page.goto("/")
  await persona(page,"Nguyễn Khánh Linh")
  const link="/#/F10/ext-student-invite"
  await page.goto(link)
  const main=page.locator("main")
  await expect(main.getByText("Chưa xác nhận",{exact:true})).toBeVisible()
  await expect(main.getByRole("button",{name:"Đồng ý hướng dẫn"})).toHaveCount(0)
  await main.screenshot({path:shot("sinh-vien-cho-gv")})
  await persona(page,"Lê Thanh Mai")
  await page.goto(link)
  await main.getByRole("button",{name:"Đồng ý hướng dẫn",exact:true}).click()
  await page.getByRole("dialog").getByRole("button",{name:"Đồng ý hướng dẫn",exact:true}).click()
  await expect(main.getByText("Lê Thanh Mai đã xác nhận",{exact:true})).toBeVisible()
  await main.screenshot({path:shot("giang-vien-xac-nhan")})
  await persona(page,"Nguyễn Khánh Linh")
  await page.goto(link)
  await expect(main.getByText("Lê Thanh Mai đã xác nhận",{exact:true})).toBeVisible()
  await persona(page,"Đỗ Bảo Ngọc")
  await page.goto("/#/B03")
  await expect(main.getByRole("heading",{name:"Tài khoản của tôi"})).toBeVisible()
  await main.screenshot({path:shot("nguoi-dung-co-ban")})
  await page.goto("/#/F05")
  await expect(main.getByText("Chức năng không khả dụng")).toBeVisible()
})
