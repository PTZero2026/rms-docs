import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import type { Pool, PoolClient } from "pg"
import type { Access } from "./access.js"
import {layoutKey} from "@rms/api-contracts/home-layout"
import {adminRole,beforeLayoutWrite,effectiveLayout,layoutSettings,layoutUpdate} from "./home-layout.js"
import { textMime,validKey,type Input,type Metadata } from "./content.js"

type Scope=Pick<Access,"scope"|"tenantId"|"canWrite">
const dateFilters = {
  createdFrom: "created_at", createdTo: "created_at",
  modifiedFrom: "updated_at", modifiedTo: "updated_at",
}

function dateFilter(name: keyof typeof dateFilters, value: string, parameter: string) {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) throw new BadRequestException("Ngày lọc không hợp lệ.")
  const column = dateFilters[name]
  const from = name.endsWith("From")
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (new Date(time).toISOString().slice(0, 10) !== value) throw new BadRequestException("Ngày lọc không hợp lệ.")
    const midnight = from ? parameter + "::date" : "(" + parameter + "::date + 1)"
    return column + (from ? " >= " : " < ") + "(" + midnight + "::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')"
  }
  return column + (from ? " >= " : " <= ") + parameter + "::timestamptz"
}
export interface Cache {
  get(key:string):Promise<string|null>
  setEx(key:string,seconds:number,value:string):Promise<unknown>
  del(key:string):Promise<unknown>
}
const columns = `key,CASE WHEN tenant_id IS NULL THEN 'shared' ELSE 'tenant' END AS scope,revision,
  mime, encoding,octet_length(content) AS size,description,refer,group_name AS "group",active,public,created_at AS created,updated_at AS modified`
export class ConfigurationStore {
  constructor(private pool:Pool, private cache?:Cache){}
  private async transaction<T>(access:Scope,read:boolean,work:(db:PoolClient)=>Promise<T>) {
    if (!read && !access.canWrite) throw new ForbiddenException()
    const db=await this.pool.connect()
    let discard=false
    try {
      await db.query(read?"BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY":"BEGIN")
      await db.query("SELECT set_config('rms.tenant_id',$1::uuid::text,true),set_config('rms.catalog_scope',$2,true)",[access.tenantId,access.scope])
      const result=await work(db)
      await db.query("COMMIT")
      return result
    } catch(error) {
      try {await db.query("ROLLBACK")} catch {discard=true}
      if ((error as {code?:string}).code==="23505") throw new ConflictException("Mã đã tồn tại trong phạm vi này.")
      throw error
    } finally {db.release(discard)}
  }
  private cacheKey(access:Scope,key:string) {
    return "rms:catalog:"+(access.scope==="shared"?"__shared__":access.tenantId)+":"+validKey(key)
  }
  async read(access:Scope,key:string) {
    const canonical=validKey(key), ck=this.cacheKey(access,key)
    return this.transaction(access,true,async db=>{
      const {rows:[meta]}=await db.query<Metadata>(`SELECT ${columns} FROM catalog.configuration WHERE canonical_key=$1 ORDER BY tenant_id NULLS LAST LIMIT 1`,[canonical])
      if (!meta) throw new NotFoundException()
      const cacheable=meta.size<=1024*1024 && (meta.mime.startsWith("text/") || /(?:\+|\/)json$/.test(meta.mime))
      if (cacheable) {
        const cached=await this.cache?.get(ck).catch(()=>null)
        if (cached && cached.startsWith(meta.revision+":")) return {meta,bytes:Buffer.from(cached.slice(37),"base64"),cache:"HIT"}
      }
      const {rows:[row]}=await db.query("SELECT content FROM catalog.configuration WHERE canonical_key=$1 AND revision=$2",[canonical,meta.revision])
      const bytes:Buffer=row.content
      if (cacheable) await this.cache?.setEx(ck,300,meta.revision+":"+bytes.toString("base64")).catch(()=>undefined)
      return {meta,bytes,cache:"MISS"}
    })
  }
  async save(access:Access,key:string,input:Input,create:boolean,detect=false) {
    const canonical=validKey(key)
    if (!access.canWrite) throw new ForbiddenException()
    const preview={key,scope:access.scope,mime:input.mime??"application/octet-stream",encoding:input.encoding??"utf-8",
      size:input.bytes?.length??0,description:input.description??"",refer:input.refer??"GEOHUB",group:input.group??"",public:input.public??false,active:input.active??true}
    if (detect) return preview
    return this.change(access,canonical,db=>this.write(db,access,key,input,create))
  }

  private async change<T>(access:Access,key:string,work:(db:PoolClient)=>Promise<T>){
    const result=await this.transaction(access,false,work)
    await this.cache?.del(this.cacheKey(access,key)).catch(()=>undefined)
    return result
  }

  private async write(db:PoolClient,access:Access,key:string,input:Input,mode:boolean|{revision:string|null}){
    const canonical=validKey(key)
    const layout=await beforeLayoutWrite(db,canonical)
    if(typeof mode!=="boolean" && (!layout||layout.current.revision!==mode.revision))
      throw new ConflictException("Bố cục đã thay đổi. Tải bản hiện hành để chỉnh sửa.")
    const create=typeof mode==="boolean"?mode:layout?.current.source!=="tenant"
    const owner=access.scope==="shared"?null:access.tenantId
    const values=[owner,key,input.bytes,input.mime,input.encoding,input.description,input.refer,input.group,input.public,input.active]
    const command=create
      ? `INSERT INTO catalog.configuration(tenant_id,key,content,mime,encoding,description,refer,group_name,public,active)
         VALUES($1,$2,$3,$4,$5,coalesce($6,''),coalesce($7,'GEOHUB'),coalesce($8,''),coalesce($9,false),coalesce($10,true))`
      : `UPDATE catalog.configuration SET content=coalesce($3,content),mime=coalesce($4,mime),encoding=coalesce($5,encoding),
         description=coalesce($6,description),refer=coalesce($7,refer),group_name=coalesce($8,group_name),public=coalesce($9,public),
         active=coalesce($10,active),revision=gen_random_uuid(),updated_at=clock_timestamp()
         WHERE tenant_id IS NOT DISTINCT FROM $1 AND canonical_key=lower($2 COLLATE "C")`
    const {rows:[row]}=await db.query<Metadata>(command+" RETURNING "+columns,values)
    if (!row) throw new NotFoundException()
    await this.audit(db,access,canonical,row.revision!,create?"CREATE":"UPDATE",layout)
    return row
  }

  async homeLayout(access:Access,roleName:string,skip:number){
    const role=adminRole(access,roleName)
    if(!Number.isSafeInteger(skip)||skip<0)throw new BadRequestException()
    return this.transaction(access,true,db=>layoutSettings(db,role,skip))
  }

  async saveHomeLayout(access:Access,roleName:string,body:unknown){
    const role=adminRole(access,roleName)
    const {revision,widgets}=layoutUpdate(role,body)
    const key=layoutKey(role)
    // An empty array is an explicit empty layout. B01 also accepts existing comma-separated layouts.
    const bytes=Buffer.from(widgets.length?widgets.join(","):"[]")
    return this.change(access,key,async db=>{
      await this.write(db,access,key,{bytes,mime:"text/plain",encoding:"utf-8",description:undefined,refer:undefined,
        group:undefined,active:undefined,public:undefined},{revision})
      return layoutSettings(db,role,0)
    })
  }

  private async audit(db:PoolClient,a:Access,key:string,revision:string,action:string,layout:Awaited<ReturnType<typeof beforeLayoutWrite>>) {
    const after=layout?await effectiveLayout(db,layout.role):undefined
    await db.query(`INSERT INTO catalog.audit(tenant_id,actor_id,action,key,revision,layout_before,layout_after,actor_email)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[a.scope==="shared"?null:a.tenantId,a.actorId,action,key,revision,
      layout?.current.widgets??null,after?.widgets??null,layout?a.actorEmail??null:null])
  }

  async remove(access:Access,key:string) {
    const canonical=validKey(key)
    await this.change(access,key,async db=>{
      const layout=await beforeLayoutWrite(db,canonical)
      const {rows:[row]}=await db.query("DELETE FROM catalog.configuration WHERE tenant_id IS NOT DISTINCT FROM $1 AND canonical_key=$2 RETURNING revision",[access.scope==="shared"?null:access.tenantId,canonical])
      if (!row) throw new NotFoundException()
      await this.audit(db,access,canonical,row.revision,"DELETE",layout)
    })
  }
  async list(access:Access,query:Record<string,unknown>) {
    const values:unknown[]=[], clauses:string[]=[]
    const filters:Record<string,string>={refer:"refer =",group:"group_name =",public:"public =",active:"active ="}
    for (const [k,v] of Object.entries(query)) {
      if (typeof v!=="string" || v.length>1024) throw new BadRequestException()
      if (k==="skip" || k==="limit") continue
      values.push(v)
      const param="$"+values.length
      if (k==="keyword") clauses.push("(strpos(lower(key),lower("+param+"))>0 OR strpos(lower(description),lower("+param+"))>0)")
      else if (Object.hasOwn(dateFilters,k)) clauses.push(dateFilter(k as keyof typeof dateFilters,v,param))
      else {
        if (!Object.hasOwn(filters,k) || (["active","public"].includes(k) && !["true","false"].includes(v))) throw new BadRequestException()
        clauses.push(filters[k]+" "+param)
      }
    }
    const skip=Number(query.skip??0),limit=Number(query.limit??25)
    if (!Number.isSafeInteger(skip)||skip<0||!Number.isSafeInteger(limit)||limit<1||limit>100) throw new BadRequestException()
    const where=clauses.length?" WHERE "+clauses.join(" AND "):""
    return this.transaction(access,true,async db=>{
      const {rows:[{total}]}=await db.query("SELECT count(*)::int AS total FROM catalog.configuration"+where,values)
      const {rows:items}=await db.query<Metadata>(`SELECT ${columns} FROM catalog.configuration${where} ORDER BY canonical_key, tenant_id NULLS LAST OFFSET $${values.length+1} LIMIT $${values.length+2}`,[...values,skip,limit])
      return {items,total,scope:access.scope,canWrite:access.canWrite}
    })
  }
}
export function contentType(meta:Metadata) {return meta.mime+(textMime(meta.mime)?"; charset="+meta.encoding:"")}
