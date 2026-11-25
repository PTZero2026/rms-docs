import {createHash,timingSafeEqual} from "node:crypto"
import {NotFoundException,ServiceUnavailableException,UnauthorizedException} from "@nestjs/common"
export function authorizeInternal(tenant:string,secret:string|undefined,token:string|undefined){
  if(!secret||secret.length<32)throw new ServiceUnavailableException()
  const hash=(s:string)=>createHash("sha256").update(s).digest()
  if(!token||!timingSafeEqual(hash(secret),hash(token)))throw new UnauthorizedException()
  if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(tenant))throw new NotFoundException()
}
