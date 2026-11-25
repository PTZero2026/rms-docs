import { ForbiddenException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { verifyIdentity } from "@rms/backend/verify-token"

export type Access = operations["authorizeCatalog"]["responses"][200]["content"]["application/json"]
export async function authorize(slug: string, token: string | undefined, write: boolean): Promise<Access> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new NotFoundException()
  if (!token) throw new UnauthorizedException()
  const origin = process.env.RMS_IAM_ORIGIN
  const secret = process.env.RMS_CATALOG_SERVICE_SECRET
  if (!origin || !secret || secret.length < 32) throw new ServiceUnavailableException()
  const url = new URL("/api/tenants/"+slug+"/internal/catalog/authorize",origin)
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost","127.0.0.1","[::1]"].includes(url.hostname))) throw new ServiceUnavailableException()
  const registry=await fetch(new URL("/api/tenants/"+slug+"/auth/config",url),{redirect:"error",signal:AbortSignal.timeout(5000)}).catch(()=>{throw new ServiceUnavailableException()})
  if (registry.status===404) throw new NotFoundException()
  if (!registry.ok) throw new ServiceUnavailableException()
  const {issuer}=await registry.json()
  const identity=await verifyIdentity(issuer,token,undefined,"rms-config")
  url.searchParams.set("action",write ? "write" : "read")
  const result = await fetch(url,{method:"POST", headers:{authorization:token,"x-rms-service":secret}, redirect:"error",signal:AbortSignal.timeout(5000)}).catch(() => {throw new ServiceUnavailableException()})
  if (result.status === 401) throw new UnauthorizedException()
  if (result.status === 403) throw new ForbiddenException()
  if (result.status === 404) throw new NotFoundException()
  if (!result.ok) throw new ServiceUnavailableException()
  const access: Access = await result.json()
  if (access.slug !== slug || !["tenant","shared"].includes(access.scope) || typeof access.canWrite!=="boolean" || (write && !access.canWrite)) throw new ForbiddenException()
  if (access.issuer!==issuer || identity.subject !== access.subject) throw new UnauthorizedException()
  return access
}
