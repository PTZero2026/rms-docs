export interface SmsMessage {
  to: string
  text: string
  deliveryId: string
}
export type SendSms = (message:SmsMessage)=>Promise<"accepted"|"busy"|"rejected"|"unknown">

/** Contract for the school's SMS relay. A 202 acknowledges acceptance for delivery. */
export function smsGateway(endpoint:string,token:string):SendSms {
  const url=new URL(endpoint)
  const loopback=["localhost","127.0.0.1","[::1]"].includes(url.hostname)
  if ((url.protocol!=="https:" && !(loopback&&url.protocol==="http:")) || url.username || url.password || url.search || url.hash)
    throw Error("Invalid SMS relay URL")
  if (!token.trim() || /[\r\n]/.test(token)) throw Error("Missing or invalid SMS relay credential")
  return async({to,text,deliveryId})=>{
    const response=await fetch(url,{method:"POST",redirect:"error",signal:AbortSignal.timeout(10000),
      headers:{Authorization:"Bearer "+token,"Content-Type":"application/json","Idempotency-Key":deliveryId},
      body:JSON.stringify({to,text})})
    const status=response.status
    await response.body?.cancel()
    if (status===202)return "accepted"
    if (status===429)return "busy"
    if ([400,401,403,404,413,415,422].includes(status))return "rejected"
    return "unknown"
  }
}
