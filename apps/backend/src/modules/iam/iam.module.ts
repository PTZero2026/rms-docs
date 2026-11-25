import { createHash, timingSafeEqual } from "node:crypto"
import { BadRequestException, Controller, ForbiddenException, Get, Header, Headers, Injectable, HttpCode, Logger, Module, NotFoundException, Param, Post, Query, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common"
import { Pool, type PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { withTenant } from "../../db/tenant-transaction.js"
import { managementLock } from "./lock-account/service.js"
import { resolveAccount, type SessionAccount } from "./account.js"
import { verifyIdentity } from "./token.js"

@Injectable()
export class IamService {
  private pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, max: 8, connectionTimeoutMillis: 4000 }) : undefined
  private readonly log = new Logger("IAM")

  async onModuleDestroy() { await this.pool?.end() }
  private connection() {
    if (!this.pool) throw new ServiceUnavailableException("Chưa cấu hình kết nối dữ liệu.")
    return this.pool
  }
  async realm(slug: string): Promise<{ id: string; issuer: string }> {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new NotFoundException()
    const { rows: [realm] } = await this.connection().query("SELECT * FROM rms.active_realm($1)", [slug])
    if (!realm) throw new NotFoundException()
    return realm
  }
  async authorized<T>(slug: string, authorization: string | undefined, work: (db: PoolClient, account: SessionAccount, realm: {id:string;issuer:string}, subject:string) => Promise<T>, options: {audience?: "rms-api" | "rms-config"; manageAccounts?: boolean} = {}) {
    const realm = await this.realm(slug)
    try {
      const identity = await verifyIdentity(realm.issuer, authorization, undefined, options.audience)
      return await withTenant(this.connection(), realm.id, async db => {
        if(options.manageAccounts)await managementLock(db)
        const account = await resolveAccount(db,identity)
        return work(db,account,realm,identity.subject)
      })
    } catch (err) {
      this.log.warn({ tenant: slug, decision: "denied", reason: err instanceof Error ? err.name : "unknown" })
      throw err
    }
  }
}

@Controller("tenants/:slug/auth")
class AuthController {
  constructor(private readonly iam: IamService) {}
  @Get("config")
  async config(@Param("slug") slug: string): Promise<operations["getLoginConfiguration"]["responses"][200]["content"]["application/json"]> {
    const realm = await this.iam.realm(slug)
    return { issuer: realm.issuer, clientId: "rms-web" }
  }
  @Get("me")
  @Header("Cache-Control","no-store")
  me(@Param("slug") slug: string, @Headers("authorization") token?: string) {
    return this.iam.authorized(slug,token,async (_db,account) => account)
  }
}

@Controller("tenants/:slug/internal/catalog")
class CatalogAccessController {
  constructor(private readonly iam: IamService) {}

  @Post("authorize")
  @HttpCode(200)
  @Header("Cache-Control","no-store")
  async authorize(@Param("slug") slug: string, @Query("action") action: unknown,
    @Headers("x-rms-service") credential?: string, @Headers("authorization") token?: string
  ): Promise<operations["authorizeCatalog"]["responses"][200]["content"]["application/json"]> {
    const expected = process.env.RMS_CATALOG_SERVICE_SECRET
    if (!expected || expected.length < 32) throw new ServiceUnavailableException()
    const digest = (value: string) => createHash("sha256").update(value).digest()
    if (!credential || !timingSafeEqual(digest(expected), digest(credential))) throw new UnauthorizedException()
    if (action !== "read" && action !== "write") throw new BadRequestException()
    return this.iam.authorized(slug,token,async (db,account,realm,subject) => {
      const shared = await db.query("SELECT 1 FROM rms.catalog_operator WHERE account_id=$1",[account.id])
      const scope = shared.rowCount ? "shared" : "tenant"
      const canWrite = scope === "shared" || account.permissions.includes("catalog.manage")
      if (action === "write" && !canWrite) throw new ForbiddenException()
      return { tenantId:realm.id, actorId:account.id, actorEmail:account.email, issuer:realm.issuer, subject, slug, scope, canWrite }
    },{audience:"rms-config"})
  }
}

@Module({ providers: [IamService], controllers: [AuthController, CatalogAccessController], exports: [IamService] })
export class IamModule {}
