import type {operations} from "./schema.d.ts"

export type RetryPolicy=operations["getNotificationRetryPolicy"]["responses"][200]["content"]["application/json"]
export const defaultRetryPolicy:Readonly<RetryPolicy>=Object.freeze({maxAttempts:5,baseSeconds:10})

export function validRetryPolicy(value:unknown):value is RetryPolicy{
  if(!value||typeof value!=="object")return false
  const v=value as Partial<RetryPolicy>
  return typeof v.maxAttempts==="number"&&Number.isInteger(v.maxAttempts)&&v.maxAttempts>=1&&v.maxAttempts<=20&&
    typeof v.baseSeconds==="number"&&Number.isInteger(v.baseSeconds)&&v.baseSeconds>=1&&v.baseSeconds<=900
}
