import { createRequire } from "node:module"
import type { Profile } from "./data.js"
const require=createRequire(import.meta.url)
const fonts=require("pdfmake/fonts/Roboto.js") as {Roboto:Record<string,string>}
const printer=require("pdfmake") as {
  addFonts(fonts:unknown):void
  setLocalAccessPolicy(policy:(path:string)=>boolean):void
  setUrlAccessPolicy(policy:()=>boolean):void
  createPdf(document:unknown):{getBuffer():Promise<Buffer>}
}
const allowed=new Set(Object.values(fonts.Roboto))
printer.addFonts(fonts)
printer.setLocalAccessPolicy(path=>allowed.has(path))
printer.setUrlAccessPolicy(()=>false)

export interface Template {code:string;version:string;title:string}
export function renderProfile(profile:Profile,template:Template,now=new Date(),professional:string[]=[]){
  const heading=(text:string)=>({text,fontSize:14,bold:true,color:"#1b4552",margin:[0,16,0,5],headlineLevel:1})
  const section=(rows:Profile["projects"])=>rows.length?rows.map(row=>({text:row.title+" · "+row.label,margin:[0,1,0,4]})):[{text:"Chưa có dữ liệu."}]
  return printer.createPdf({pageSize:"A4",pageMargins:[48,50,48,52],defaultStyle:{font:"Roboto",fontSize:11,lineHeight:1.18},
    info:{title:template.title},content:[{text:template.title,bold:true,fontSize:21,color:"#153943"},
      {text:template.code+" · "+template.version+"   |   "+new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric"}).format(now),color:"#44555a",margin:[0,4,0,10]},
      heading("Thông tin cá nhân"),{text:profile.name,bold:true},profile.email,profile.unit,...professional,
      heading("Đề tài tham gia"),...section(profile.projects),heading("Sản phẩm khoa học đã duyệt"),...section(profile.outputs),
      ...(profile.hours?[heading("Giờ giảng quy đổi"),...(profile.hours.length?profile.hours.map(p=>p.code+" · "+p.total+" giờ"):["Chưa ghi nhận giờ."])]:[])],
    footer:(current:number,total:number)=>({text:current+" / "+total,alignment:"right",margin:[0,12,48,0],fontSize:9})}).getBuffer()
}
