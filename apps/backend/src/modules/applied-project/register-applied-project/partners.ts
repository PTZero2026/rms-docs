import {BadRequestException,ConflictException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"

type Directory=operations["listAppliedProjects"]["responses"][200]["content"]["application/json"]["partnerDirectory"]
const clean=(name:string)=>name.trim().normalize("NFC").replace(/\s+/gu," ")
const key=(name:string)=>clean(name).toLocaleLowerCase("vi")

export function readPartnerDirectory(content:string|null):Directory{
  if(content===null)return []
  let rows:unknown
  try{rows=JSON.parse(content)}catch{throw new ConflictException("Danh mục đối tác cần JSON hợp lệ.")}
  if(!Array.isArray(rows)||rows.length>500||rows.some(p=>!p||typeof p.code!=="string"||!/^[-A-Za-z0-9_.]{1,80}$/.test(p.code)||
    typeof p.label!=="string"||!p.label.trim()||p.label.length>240)||
    new Set(rows.map(p=>p.code)).size!==rows.length||new Set(rows.map(p=>key(p.label))).size!==rows.length)
    throw new ConflictException("Kiểm tra mã và tên trùng trong danh mục đối tác.")
  return rows.map(p=>({code:p.code,label:clean(p.label)}))
}

export function selectPartners(names:string[],codes:string[]|undefined,directory:Directory,previous:Directory){
  const supplied=new Set(names.map(key))
  let selected=previous.filter(p=>supplied.has(key(p.label)))
  if(codes!==undefined){
    if(!Array.isArray(codes)||codes.length>50||codes.some(code=>typeof code!=="string")||new Set(codes).size!==codes.length)
      throw new BadRequestException("Danh sách mã đối tác chưa hợp lệ.")
    const available=new Map([...directory,...previous].map(p=>[p.code,p]))
    selected=codes.map(code=>{
      const partner=available.get(code)
      if(!partner)throw new BadRequestException("Đối tác đã chọn ngoài danh mục hiện hành.")
      return partner
    })
  }
  const distinct=new Map<string,string>()
  for(const name of [...selected.map(p=>p.label),...names]){
    if(!distinct.has(key(name)))distinct.set(key(name),clean(name))
  }
  if(distinct.size>50)throw new BadRequestException("Mỗi dự án tối đa 50 đối tác.")
  return {names:[...distinct.values()],selected}
}
