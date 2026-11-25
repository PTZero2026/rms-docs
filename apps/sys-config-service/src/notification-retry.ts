import {BadRequestException,NotFoundException} from "@nestjs/common"
import {defaultRetryPolicy,validRetryPolicy} from "@rms/api-contracts/notification-retry"
import {authorizeInternal} from "./internal.js"
import type {ConfigurationStore} from "./store.js"

export function parseRetrySetting(key:string,bytes:Buffer):number|undefined{
  const canonical=key.toLowerCase()
  if(canonical!=="notification.maxretry"&&canonical!=="notification.retrybaseseconds")return
  const text=bytes.toString().trim()
  const value=Number(text),field=canonical==="notification.maxretry"?"maxAttempts":"baseSeconds"
  if(!/^\d+$/.test(text)||!validRetryPolicy({...defaultRetryPolicy,[field]:value}))
    throw new BadRequestException(field==="maxAttempts"?"Tổng số lần thử phải từ 1 đến 20.":"Thời gian chờ lần đầu phải từ 1 đến 900 giây.")
  return value
}

export async function notificationRetryPolicy(store:ConfigurationStore,tenantId:string,token?:string){
  authorizeInternal(tenantId,process.env.RMS_REMINDER_SERVICE_SECRET,token)
  async function numberSetting(key:string,fallback:number){
    try{
      const {meta,bytes}=await store.read({scope:"tenant",tenantId,canWrite:false},key)
      if(!meta.active)return fallback
      return parseRetrySetting(key,bytes)??fallback
    }catch(e){if(e instanceof NotFoundException)return fallback;throw e}
  }
  const [maxAttempts,baseSeconds]=await Promise.all([
    numberSetting("notification.maxRetry",defaultRetryPolicy.maxAttempts),
    numberSetting("notification.retryBaseSeconds",defaultRetryPolicy.baseSeconds)
  ])
  return {maxAttempts,baseSeconds}
}
