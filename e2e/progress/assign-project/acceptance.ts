import { verifyProducts } from "../../product/submit-output/acceptance"
import { fileURLToPath } from "node:url"
import { expect,type Page } from "@playwright/test"

export async function followExecution(officer:Page,pi:Page,project:string){
  const link="/app/school-1?project="+project
  const shot=(s:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/progress/"+s+".png",import.meta.url))
  const open=async(p:Page)=>{
    await p.goto(link)
    await p.getByRole("button",{name:"Giao đề tài và tiến độ",exact:true}).click()
    return p.getByRole("region",{name:"Giao đề tài và tiến độ"})
  }
  const panel=await open(officer)
  await panel.getByLabel("Số quyết định hoặc hợp đồng").fill("QĐ-12/KHCN")
  await panel.getByLabel("Ngày ký",{exact:true}).fill("2026-11-01")
  await panel.getByLabel("Ngày hiệu lực").fill("2026-11-01")
  await panel.getByLabel("Bắt đầu thực hiện").fill("2026-12-01")
  await panel.getByLabel("Kết thúc thực hiện").fill("2027-11-30")
  await panel.getByLabel("Kinh phí giao (VND)").fill("50000000")
  await panel.getByText("Sản phẩm cam kết",{exact:true}).click()
  await panel.getByLabel("Bài báo (số lượng)").fill("1")
  await panel.getByRole("button",{name:"Xác nhận giao đề tài"}).click()
  await expect(panel.getByRole("alert")).toContainText("Tệp căn cứ còn thiếu")
  const file={name:"Quyet-dinh-12.pdf",mimeType:"application/pdf",buffer:Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n")}
  await panel.getByLabel("Tải tệp căn cứ").setInputFiles(file)
  await panel.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
  await expect(panel.getByText("Đã xác nhận tệp Quyet-dinh-12.pdf",{exact:true})).toBeVisible()
  await panel.getByRole("button",{name:"Xác nhận giao đề tài"}).click()
  await expect(panel.getByText("Đã giao thực hiện.")).toBeVisible()
  await panel.getByLabel("Số kỳ",{exact:true}).fill("1")
  await panel.getByLabel("Ngày đến hạn").fill("2026-11-15")
  await panel.getByRole("button",{name:"Tạo kỳ báo cáo"}).click()
  await expect(panel.getByText("Đã tạo kỳ báo cáo.")).toBeVisible()
  await panel.getByRole("button",{name:"Tạo kỳ báo cáo"}).click()
  await expect(panel.getByRole("alert")).toContainText("Số kỳ đã tồn tại")
  await panel.screenshot({path:shot("chuyen-vien-lap-ky")})
  const author=await open(pi)
  await author.getByRole("button",{name:/Kỳ 1 ·/}).click()
  await author.getByLabel("Nội dung thực hiện").fill("Đã đối chiếu dữ liệu trạm đo.")
  await author.getByLabel("Tải tệp căn cứ").setInputFiles({...file,name:"Bao-cao-ky-1.pdf"})
  await author.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
  await expect(author.getByText("Đã xác nhận tệp Bao-cao-ky-1.pdf")).toBeVisible()
  await author.getByRole("button",{name:"Nộp báo cáo kỳ",exact:true}).click()
  await expect(author.getByText("Đã nộp báo cáo kỳ.",{exact:true})).toBeVisible()
  await expect(author.getByRole("button",{name:/Kỳ 1 ·.*Chờ duyệt · Trễ hạn/})).toBeVisible()
  await author.screenshot({path:shot("chu-nhiem-nop-tien-do")})
  const decision=await open(officer)
  await decision.getByRole("button",{name:/Kỳ 1 ·/}).click()
  await decision.getByRole("button",{name:"Duyệt đạt"}).click()
  await expect(decision.getByText("Đã cập nhật kết quả kỳ.")).toBeVisible()
  await expect(decision.getByRole("button",{name:/Kỳ 1 ·.*Đạt/})).toBeVisible()
  await verifyProducts(officer,pi,project)
}
