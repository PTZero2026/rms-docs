import {BadRequestException,ConflictException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import {calendarDay} from "@rms/api-contracts/teaching-calendar"
import type {SessionAccount} from "../../iam/account.js"
import {visiblePerson} from "../export-profile/data.js"
import {appendAudit} from "../../audit/append.js"

type Profile=operations["readProfessionalProfile"]["responses"][200]["content"]["application/json"]
export type Update=operations["saveProfessionalProfile"]["requestBody"]["content"]["application/json"]
type Data=Update["data"]
const fields=["gender","birthDate","phone","address","affiliation","position","qualifications","jobs"] as const
export function profileSettings(raw:string|null){
  let c:{fields?:Record<string,string>;institution?:string;positions?:string[];ranks?:string[];degrees?:string[]}
  try{c=raw===null?{}:JSON.parse(raw)}catch{throw new ConflictException("Cấu hình hồ sơ không hợp lệ.")}
  const fail=()=>{throw new ConflictException("Cấu hình hồ sơ không hợp lệ.")}
  if(!c||typeof c!=="object"||Array.isArray(c)||c.institution!==undefined&&(typeof c.institution!=="string"||c.institution.length>240)||
    c.fields!==undefined&&(!c.fields||typeof c.fields!=="object"||Array.isArray(c.fields)||Object.entries(c.fields).some(([k,v])=>!fields.some(f=>f===k)||!["hidden","optional","required"].includes(v))))fail()
  for(const list of [c.positions,c.ranks,c.degrees])if(list!==undefined&&(!Array.isArray(list)||list.length>200||list.some(s=>typeof s!=="string"||!s.trim()||s.length>200)))fail()
  return {visible:fields.filter(k=>c.fields?.[k]!=="hidden"),required:fields.filter(k=>c.fields?.[k]==="required"),institution:c.institution??"",
    positions:c.positions??[],ranks:c.ranks??["Giáo sư","Phó giáo sư"],degrees:c.degrees??["Tiến sĩ","Thạc sĩ","Cử nhân"]}
}
type Settings=ReturnType<typeof profileSettings>
export async function readProfessional(db:PoolClient,a:SessionAccount,id:string,c:Settings):Promise<Profile>{
  const who=await visiblePerson(db,a,id)
  const {rows:[r]}=await db.query(`SELECT a.full_name,a.phone,a.profile_revision,t.slug,coalesce(p.data,'{}') AS data
    FROM rms.account a JOIN rms.tenant t ON t.id=a.tenant_id LEFT JOIN rms.professional_profile p ON (p.tenant_id,p.account_id)=(a.tenant_id,a.id) WHERE a.id=$1`,[id])
  const raw={...r.data,phone:r.phone}
  const data=Object.fromEntries(c.visible.filter(k=>raw[k]!==undefined).map(k=>[k,raw[k]]))
  const units=await db.query("SELECT id,name FROM rms.unit ORDER BY name,id")
  return {...c,email:who.email,fullName:r.full_name,institution:c.institution||r.slug,revision:r.profile_revision,data,units:units.rows}
}
function checkData(input:Data,c:Settings,units:Profile["units"],stored:Data,now=new Date()){
  const today=new Date(now.getTime()+7*3600000).toISOString().slice(0,10)
  if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).some(k=>!c.visible.some(v=>v===k)))throw new BadRequestException("Trường bị ẩn hoặc không được phép sửa.")
  if(c.required.some(k=>{const value=input[k];return value===undefined||value===null||(Array.isArray(value)?!value.length:typeof value!=="string"||!value.trim())}))throw new BadRequestException("Chưa nhập đủ trường bắt buộc.")
  for(const k of fields.filter(k=>k!=="qualifications"&&k!=="jobs")){
    const value=input[k]
    if(value!==undefined&&(typeof value!=="string"||value.length>(k==="address"?1000:200)))throw new BadRequestException("Giá trị hồ sơ không hợp lệ.")
  }
  if(input.birthDate&&(!calendarDay(input.birthDate)||input.birthDate>today)||input.gender&&!["Nam","Nữ","Khác"].includes(input.gender)||
    input.phone&&!/^[+0-9() .-]{1,32}$/.test(input.phone)||input.affiliation&&!units.some(u=>u.id===input.affiliation)||input.position&&!c.positions.includes(input.position))throw new BadRequestException("Kiểm tra ngày sinh, liên hệ, đơn vị hoặc chức vụ.")
  const birth=input.birthDate??stored.birthDate
  const qualifications=input.qualifications??(input.birthDate!==undefined?stored.qualifications:undefined)
  if(qualifications!==undefined&&(!Array.isArray(qualifications)||qualifications.length>100||qualifications.some(q=>!q||Object.keys(q).some(k=>!["name","kind","year"].includes(k))||!["DEGREE","RANK"].includes(q.kind)||
    !(q.kind==="RANK"?c.ranks:c.degrees).includes(q.name)||!Number.isInteger(q.year)||q.year>Number(today.slice(0,4))||q.year<Number(birth?.slice(0,4)||1))))throw new BadRequestException("Năm nhận không hợp lệ hoặc sai nhóm học hàm/học vị.")
  if(input.jobs!==undefined&&(!Array.isArray(input.jobs)||input.jobs.length>100||input.jobs.some(j=>!j||Object.keys(j).some(k=>!["place","from","to"].includes(k))||typeof j.place!=="string"||!j.place.trim()||j.place.length>240||
    !calendarDay(j.from)||j.to!==null&&(!calendarDay(j.to)||j.to<j.from))))throw new BadRequestException("Kiểm tra nơi công tác và khoảng từ ngày đến ngày.")
}
export async function saveProfessional(db:PoolClient,a:SessionAccount,id:string,cmd:Update,c:Settings){
  const current=await readProfessional(db,a,id,c)
  if(!cmd||Object.keys(cmd).some(k=>!["fullName","revision","data"].includes(k))||typeof cmd.fullName!=="string"||!cmd.fullName.trim()||cmd.fullName.length>160||!Number.isSafeInteger(cmd.revision))throw new BadRequestException("Cần họ tên và phiên bản hồ sơ.")
  if(current.revision!==cmd.revision)throw new ConflictException("Hồ sơ đã thay đổi. Tải lại trước khi sửa.")
  const stored=await db.query<{data:Data}>("SELECT data FROM rms.professional_profile WHERE account_id=$1",[id])
  checkData(cmd.data,c,current.units,stored.rows[0]?.data??{})
  const {phone,...rest}=cmd.data
  const changed=await db.query("UPDATE rms.account SET full_name=$2,phone=coalesce($3,phone),profile_revision=profile_revision+1 WHERE id=$1 AND profile_revision=$4",
    [id,cmd.fullName.trim(),phone??null,cmd.revision])
  if(!changed.rowCount)throw new ConflictException("Hồ sơ đã thay đổi.")
  await db.query(`INSERT INTO rms.professional_profile VALUES(rms.current_tenant(),$1,$2) ON CONFLICT(tenant_id,account_id)
    DO UPDATE SET data=rms.professional_profile.data||EXCLUDED.data`,[id,rest])
  await appendAudit(db,a,"profile",id,"PROFESSIONAL_PROFILE_UPDATED",{onBehalf:a.id!==id,revision:cmd.revision+1,fields:Object.keys(cmd.data)})
  return readProfessional(db,a,id,c)
}
