import { UnauthorizedException } from "@nestjs/common"
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose"
import type { Identity } from "./account.js"

const keys = new Map<string, JWTVerifyGetKey>()

export async function verifyIdentity(issuer: string, authorization?: string, getKey?: JWTVerifyGetKey, audience: "rms-api" | "rms-config" = "rms-api"): Promise<Identity> {
  const bearer = /^Bearer ([^\s]+)$/i.exec(authorization ?? "")?.[1]
  if (!bearer) throw new UnauthorizedException()
  try {
    const url = new URL(issuer)
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1","localhost","[::1]"].includes(url.hostname))) {
      throw Error("Invalid issuer transport")
    }
    let key = getKey ?? keys.get(issuer)
    if (!key) {
      key = createRemoteJWKSet(new URL(issuer + "/protocol/openid-connect/certs"), { timeoutDuration: 4000 })
      keys.set(issuer,key)
    }
    const { payload } = await jwtVerify(bearer, key, {
      issuer, audience, algorithms: ["RS256"], requiredClaims: ["exp","sub","iat"],
    })
    if (payload.typ !== "Bearer" || typeof payload.sub !== "string" || !payload.sub ||
        typeof payload.email !== "string" || !payload.email.trim() || payload.email_verified !== true) throw Error("Invalid identity")
    return { subject: payload.sub, email: payload.email }
  } catch {
    throw new UnauthorizedException()
  }
}
