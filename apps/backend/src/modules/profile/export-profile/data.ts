import { NotFoundException } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../../iam/account.js"
export type Profile = operations["getScientificProfile"]["responses"][200]["content"]["application/json"]

export async function visiblePerson(db:PoolClient,actor:SessionAccount,id:string) {
  const {rows:[person]}=await db.query<Pick<Profile,"id"|"name"|"email"|"unit">>(
    `SELECT a.id,coalesce(nullif(a.full_name,''),a.email) AS name,a.email,coalesce(u.name,'') AS unit
     FROM rms.account a LEFT JOIN rms.unit u ON (u.tenant_id,u.id)=(a.tenant_id,a.unit_id)
     WHERE a.id=$1 AND a.is_active AND a.deleted_at IS NULL AND (a.id=$2 OR $3='admin' OR $3='staff' AND a.unit_id=$4)
     FOR SHARE OF a`,[id,actor.id,actor.userType,actor.unitId])
  if(!person)throw new NotFoundException()
  return person
}

export async function profileView(db:PoolClient,actor:SessionAccount,id:string):Promise<Profile>{
  const person=await visiblePerson(db,actor,id)
  const values=[id,id===actor.id||actor.userType==="admin",actor.unitId]
  const projects=await db.query<Profile["projects"][number]>(
    `SELECT p.id,p.title,p.id AS "projectId",CASE WHEN p.owner_id=$1 THEN 'Chủ nhiệm' ELSE 'Thành viên' END AS label
     FROM rms.research_project p WHERE ($2 OR p.unit_id=$3) AND (p.owner_id=$1 OR EXISTS
       (SELECT FROM rms.project_member m WHERE (m.tenant_id,m.project_id,m.account_id)=(p.tenant_id,p.id,$1)))
     ORDER BY p.title,p.id`,values)
  const outputs=await db.query<Profile["outputs"][number]>(
    `SELECT id,title,project_id AS "projectId",concat_ws(' · ',publication,publication_year) AS label
     FROM rms.research_output WHERE status='APPROVED' AND ($2 OR unit_id=$3) AND ($1=ANY(authors) OR cardinality(authors)=0 AND owner_id=$1) ORDER BY publication_year DESC,title,id`,values)
  return {...person,projects:projects.rows,outputs:outputs.rows}
}
