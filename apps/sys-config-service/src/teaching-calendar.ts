import {BadRequestException,NotFoundException} from "@nestjs/common"
import {validCalendar} from "@rms/api-contracts/teaching-calendar"
import {authorizeInternal} from "./internal.js"
import type {ConfigurationStore} from "./store.js"
export async function teachingCalendar(store:ConfigurationStore,tenant:string,token?:string){
  authorizeInternal(tenant,process.env.RMS_TEACHING_SERVICE_SECRET,token)
  async function read(key:string){
    const {meta,bytes}=await store.read({scope:"tenant",tenantId:tenant,canWrite:false},key)
    if(!meta.active)throw new NotFoundException()
    return bytes.toString().trim()
  }
  if(await read("FEATURE.E4")!=="true"||await read("FEATURE.P03")!=="true")throw new NotFoundException()
  const bytes=await read("P03.CALENDAR")
  let calendar:unknown
  try{calendar=JSON.parse(bytes)}catch{throw new BadRequestException("Lịch kỳ chưa hợp lệ.")}
  if(!validCalendar(calendar))throw new BadRequestException("Kiểm tra ngày và mã kỳ quy đổi.")
  return calendar
}
