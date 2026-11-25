import { ConflictException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../iam/account.js"
import { transition } from "./kernel.js"

export async function moveTo(db:PoolClient,actor:SessionAccount,id:string,semantic:string,revision:number,reason?:string,guard?:()=>Promise<void>) {
  const {rows}=await db.query(`SELECT e.code FROM rms.workflow_instance i JOIN rms.workflow_edge e
    ON (e.tenant_id,e.version,e.from_step)=(i.tenant_id,i.version,i.current_step)
    JOIN rms.workflow_step s ON (s.tenant_id,s.version,s.code)=(e.tenant_id,e.version,e.to_step)
    WHERE i.project_id=$1 AND s.semantic=$2 AND $3=ANY(e.roles)`,[id,semantic,actor.userType])
  if(rows.length!==1)throw new ConflictException("Mẫu đã ghim cần một cạnh phù hợp cho thao tác này.")
  return transition(db,actor,{projectId:id,expectedVersion:revision,code:rows[0].code,reason},guard)
}
