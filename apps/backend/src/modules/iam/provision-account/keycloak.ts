import {ConflictException,ServiceUnavailableException} from "@nestjs/common"
import type {Command} from "./service.js"

export async function provisionIdentity(issuer:string,slug:string,cmd:Command){
  let credentials:Record<string,{clientId:string;secret:string}>
  try{credentials=JSON.parse(process.env.RMS_IDP_PROVISION_CLIENTS??"{}")}catch{throw new ServiceUnavailableException("Cấu hình IdP chưa hợp lệ.")}
  const client=credentials?.[slug]
  const realm=new URL(issuer)
  if(!client?.clientId||!client.secret||realm.pathname.split("/").pop()!==slug||realm.protocol!=="https:"&&!(realm.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(realm.hostname)))throw new ServiceUnavailableException("Chưa cấu hình dịch vụ cấp tài khoản của trường.")
  const base=issuer.slice(0,issuer.lastIndexOf("/realms/"))+"/admin/realms/"+encodeURIComponent(slug)+"/users"
  const options={redirect:"error" as const,signal:AbortSignal.timeout(8000)}
  const token=await fetch(issuer+"/protocol/openid-connect/token",{...options,method:"POST",body:new URLSearchParams({grant_type:"client_credentials",client_id:client.clientId,client_secret:client.secret})})
  if(!token.ok)throw new ServiceUnavailableException("IdP chưa cấp phiên quản trị.")
  const access=(await token.json()).access_token
  if(typeof access!=="string")throw new ServiceUnavailableException()
  const headers={authorization:"Bearer "+access,"content-type":"application/json"}
  const email=cmd.email.trim().toLowerCase()
  const response=await fetch(base,{...options,method:"POST",headers,body:JSON.stringify({username:email,email,enabled:true,emailVerified:false,attributes:{rmsProvisioningId:[cmd.commandId]}})})
  if(response.status===201){
    const location=response.headers.get("location"),id=location&&new URL(location,base).pathname.split("/").pop()
    if(id&&/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id))return id
    throw new ServiceUnavailableException("IdP chưa xác nhận mã tài khoản.")
  }
  if(response.status!==409)throw new ServiceUnavailableException("IdP chưa tiếp nhận yêu cầu.")
  const find=await fetch(base+"?"+new URLSearchParams({email,exact:"true",briefRepresentation:"false"}),{...options,headers})
  if(!find.ok)throw new ServiceUnavailableException()
  const users=await find.json()
  if(Array.isArray(users)&&users.length===1&&users[0].email?.toLowerCase()===email&&users[0].attributes?.rmsProvisioningId?.[0]===cmd.commandId)return String(users[0].id)
  throw new ConflictException("Email đã có danh tính khác tại IdP của trường.")
}
