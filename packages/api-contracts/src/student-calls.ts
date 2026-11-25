import type {operations} from "./schema.d.ts"
import {calendarDay} from "@rms/api-contracts/teaching-calendar"

type Page=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]
type Call=Page["calls"][number]
const uuid=/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i
const validCode=(v:unknown)=>typeof v==="string"&&/^[-A-Za-z0-9_.]{1,80}$/.test(v)

export function readStudentCalls(text:string):Call[]{
  let rows:Call[]
  try{rows=JSON.parse(text)}catch{throw Error("Danh sách đợt sinh viên cần JSON hợp lệ.")}
  if(!Array.isArray(rows)||rows.length>300)throw Error("Danh sách đợt sinh viên có tối đa 300 đợt.")
  const seen=new Set<string>()
  return rows.map((r,i)=>{
    const where="Đợt thứ "+(i+1)+". "
    if(!r||typeof r.code!=="string"||!r.code.trim()||r.code.length>80||typeof r.unitId!=="string"||!uuid.test(r.unitId))throw Error(where+"Kiểm tra mã đợt và mã đơn vị.")
    if(!calendarDay(r.starts)||!calendarDay(r.ends)||r.ends<r.starts||
       r.finalDue!==undefined&&(!calendarDay(r.finalDue)||r.finalDue<r.starts))throw Error(where+"Kiểm tra ngày mở, ngày đóng và hạn nộp kết quả.")
    if(!Number.isInteger(r.min)||!Number.isInteger(r.max)||r.min<1||r.min>r.max||r.max>100)throw Error(where+"Quy mô nhóm phải từ 1 đến 100 sinh viên và tối đa phải bằng hoặc lớn hơn tối thiểu.")
    if(r.onApproval!==undefined&&!["APPROVED","IN_PROGRESS"].includes(r.onApproval)||
       r.requireMentorFinal!==undefined&&typeof r.requireMentorFinal!=="boolean"||
       r.requireProgress!==undefined&&typeof r.requireProgress!=="boolean"||
       r.hourCategory!==undefined&&!validCode(r.hourCategory))throw Error(where+"Kiểm tra bước phê duyệt, tiến độ, xác nhận cuối kỳ và mã định mức.")
    const list=r.finalEvidence
    if(list!==undefined&&(!Array.isArray(list)||list.length>40||list.some(e=>!e||!validCode(e.code)||typeof e.label!=="string"||!e.label.trim()||e.label.length>180)||
        new Set(list.map(e=>e.code)).size!==list.length))throw Error(where+"Kiểm tra mã và nhãn của từng loại minh chứng cuối kỳ.")
    const unitId=r.unitId.toLowerCase(),identity=unitId+"/"+r.code
    if(seen.has(identity))throw Error(where+"Mã đợt trùng trong cùng đơn vị.")
    seen.add(identity)
    return {...r,unitId}
  })
}
