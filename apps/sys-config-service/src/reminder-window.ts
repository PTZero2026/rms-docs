import { authorizeInternal } from "./internal.js"
import { BadRequestException,NotFoundException } from "@nestjs/common"
import type { ConfigurationStore } from "./store.js"
import type { operations } from "@rms/api-contracts"

type Window=operations["getProgressReminderWindow"]["responses"][200]["content"]["application/json"]
export async function reminderWindow(store:ConfigurationStore,tenantId:string,credential?:string):Promise<Window> {
  authorizeInternal(tenantId,process.env.RMS_REMINDER_SERVICE_SECRET,credential)
  const {meta,bytes}=await store.read({scope:"tenant",tenantId,canWrite:false},"PROGRESS.REMINDER_DAYS_BEFORE_DUE")
  if(!meta.active)throw new NotFoundException()
  const value=bytes.toString().trim()
  if(!/^\d{1,3}$/.test(value)||Number(value)>365)throw new BadRequestException("Mốc nhắc cần nằm trong khoảng 0 đến 365 ngày.")
  return {daysBefore:Number(value)}
}
