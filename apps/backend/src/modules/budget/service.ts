import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../iam/account.js"
import { projectAccess } from "../proposal/access.js"
import { appendAudit } from "../audit/append.js"
import { moveTo } from "../workflow/move-to.js"
import {money} from "./money.js"

type Detail=operations["getProjectBudget"]["responses"][200]["content"]["application/json"]
type Op="confirmAllocation"|"saveExpense"|"voidExpense"|"reconcileExpense"|"settleBudget"
type Input<K extends Op>=operations[K]["requestBody"]["content"]["application/json"]
export type FeePolicy={rate:string;cap:string|null}
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
const words=(s:unknown):s is string=>typeof s==="string"&&s.trim().length>0&&s.length<=2000
function validDate(s:unknown):s is string{
  if(typeof s!=="string"||!/^\d{4}-\d\d-\d\d$/.test(s))return false
  const d=new Date(s+"T00:00:00Z")
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s
}
async function source(db:PoolClient,a:SessionAccount,id:string,mode:"read"|"officer"|"principal"){
  if(mode==="officer"&&a.userType!=="staff"||mode==="principal"&&a.userType!=="author")throw new ForbiddenException()
  const p=await projectAccess(db,a,id,mode!=="read")
  const officer=a.userType==="staff"&&a.unitId===p.unit_id&&a.id!==p.owner_id,principal=a.userType==="author"&&a.id===p.owner_id
  if(!officer&&!principal)throw new NotFoundException()
  return {...p,officer,principal}
}
function executing(value:string){if(value!=="IN_PROGRESS")throw new ConflictException("Sổ chỉ nhận thay đổi khi đề tài đang thực hiện.")}
export async function budgetDetail(db:PoolClient,a:SessionAccount,id:string):Promise<Detail>{
  const p=await source(db,a,id,"read")
  const {rows:[decision]}=await db.query("SELECT budget::text FROM rms.project_assignment WHERE project_id=$1",[id])
  const {rows:[allocation]}=await db.query("SELECT amount::text,rate::text,cap::text,fee::text,note,revision,settlement_mode AS \"settlementMode\" FROM rms.budget_allocation WHERE project_id=$1",[id])
  const {rows:items}=await db.query<Detail["items"][number]>(`SELECT e.id,e.amount::text,e.spent::text AS date,e.description,e.revision,
    e.reconciliation,e.reference,e.transferred::text,ARRAY(SELECT r.file_id FROM rms.expense_receipt r
    WHERE (r.tenant_id,r.project_id,r.expense_id)=(e.tenant_id,e.project_id,e.id) ORDER BY r.file_id) AS files
    FROM rms.budget_expense e WHERE e.project_id=$1 AND e.deleted_at IS NULL ORDER BY e.spent DESC,e.id`,[id])
  const {rows:files}=await db.query("SELECT id,filename FROM rms.attachment_intent WHERE project_id=$1 AND attached_at IS NOT NULL ORDER BY filename,id",[id])
  const available=allocation?BigInt(allocation.amount)-BigInt(allocation.fee):0n,spent=items.reduce((total,row)=>total+BigInt(row.amount),0n)
  return {id,title:p.title,projectRevision:p.row_version,status:p.status_semantic,officer:p.officer,principal:p.principal,approvedBudget:decision?.budget??null,
    allocation:allocation??null,available:String(available),spent:String(spent),balance:String(available-spent),items,files}
}
export async function allocate(db:PoolClient,a:SessionAccount,id:string,cmd:Input<"confirmAllocation">,policy:FeePolicy|null,adjust=false){
  const p=await source(db,a,id,"officer");executing(p.status_semantic)
  const detail=await budgetDetail(db,a,id),prior=detail.allocation
  if(!detail.approvedBudget)throw new ConflictException("Cần quyết định giao hiệu lực.")
  if(adjust?(!prior||prior.revision!==cmd?.revision):!!prior)throw new ConflictException("Kinh phí đã thay đổi.")
  const amount=money(cmd?.amount)
  if(amount>BigInt(detail.approvedBudget))throw new BadRequestException("Tổng cấp vượt quyết định giao.")
  const rule=adjust?prior:policy
  if(!rule||!/^\d{1,3}(\.\d{1,2})?$/.test(rule.rate)||Number(rule.rate)>100)throw new ConflictException("Cần cấu hình tỷ lệ phí hợp lệ.")
  const [whole,decimal=""]=rule.rate.split("."),basis=BigInt(whole)*100n+BigInt(decimal.padEnd(2,"0"))
  const computed=amount*basis/10000n,cap=rule.cap===null?null:money(rule.cap,true)
  let fee=prior?BigInt(prior.fee):cap!==null&&computed>cap?cap:computed
  if(cmd.override!==null)fee=money(cmd.override,true)
  if(fee>amount||typeof cmd.note!=="string"||cmd.note.length>2000||(cmd.override!==null||adjust)&&!words(cmd.note))throw new BadRequestException("Kiểm tra phí và lý do điều chỉnh.")
  if(adjust)await db.query("UPDATE rms.budget_allocation SET amount=$2,fee=$3,note=$4,revision=revision+1 WHERE project_id=$1",[id,amount,fee,cmd.note.trim()])
  else await db.query("INSERT INTO rms.budget_allocation(tenant_id,project_id,confirmed_by,amount,rate,cap,fee,note) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7)",[id,a.id,amount,rule.rate,cap,fee,cmd.note.trim()])
  const action=adjust?"BUDGET_ADJUSTED":"BUDGET_ALLOCATED"
  const audit=await appendAudit(db,a,"project",id,action,{amount:String(amount),rate:rule.rate,cap:rule.cap,fee:String(fee),reason:cmd.note,previous:prior})
  await db.query("INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload) VALUES(rms.current_tenant(),$1,$2,$3,ARRAY['notify'],$4,$5)",[randomUUID(),id,action,audit,{ownerId:p.owner_id}])
  return budgetDetail(db,a,id)
}
async function expense(db:PoolClient,id:string,expenseId:string){
  const {rows:[e]}=await db.query("SELECT * FROM rms.budget_expense WHERE project_id=$1 AND id=$2 AND deleted_at IS NULL",[id,expenseId])
  if(!e)throw new NotFoundException()
  return e
}
export async function saveExpense(db:PoolClient,a:SessionAccount,id:string,expenseId:string,cmd:Input<"saveExpense">){
  const p=await source(db,a,id,"principal");executing(p.status_semantic)
  const amount=money(cmd?.amount)
  if(!validDate(cmd.date)||!words(cmd.description)||!Number.isSafeInteger(cmd.revision)||cmd.revision<0||!Array.isArray(cmd.files)||
    cmd.files.length>100||cmd.files.some(f=>!uuid.test(f))||new Set(cmd.files).size!==cmd.files.length)throw new BadRequestException("Kiểm tra ngày chi, nội dung và chứng từ.")
  if(!(await db.query("SELECT 1 FROM rms.budget_allocation WHERE project_id=$1",[id])).rowCount)throw new ConflictException("Chưa xác nhận kinh phí.")
  const receipts=await db.query("SELECT id FROM rms.attachment_intent WHERE project_id=$1 AND attached_at IS NOT NULL AND id=ANY($2::uuid[])",[id,cmd.files])
  if(receipts.rowCount!==cmd.files.length)throw new BadRequestException("Chứng từ chưa xác nhận trong đề tài.")
  if(cmd.revision){
    const current=await expense(db,id,expenseId)
    if(current.owner_id!==a.id)throw new NotFoundException()
    if(current.revision!==cmd.revision)throw new ConflictException("Khoản chi đã thay đổi.")
    await db.query("UPDATE rms.budget_expense SET amount=$3,spent=$4,description=$5,revision=revision+1,reconciliation='UNRECONCILED',reference=NULL,transferred=NULL WHERE project_id=$1 AND id=$2",[id,expenseId,amount,cmd.date,cmd.description.trim()])
    await db.query("DELETE FROM rms.expense_receipt WHERE project_id=$1 AND expense_id=$2",[id,expenseId])
  }else{
    const row=await db.query("INSERT INTO rms.budget_expense(tenant_id,project_id,id,owner_id,amount,spent,description) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",[id,expenseId,a.id,amount,cmd.date,cmd.description.trim()])
    if(!row.rowCount)throw new ConflictException("Khoản chi đã được ghi.")
  }
  await db.query("INSERT INTO rms.expense_receipt SELECT rms.current_tenant(),$1,$2,f FROM unnest($3::uuid[]) f",[id,expenseId,cmd.files])
  await appendAudit(db,a,"project",id,cmd.revision?"EXPENSE_UPDATED":"EXPENSE_ADDED",{expenseId,amount:cmd.amount,files:cmd.files,revision:cmd.revision+1})
  return budgetDetail(db,a,id)
}
export async function voidExpense(db:PoolClient,a:SessionAccount,id:string,expenseId:string,cmd:Input<"voidExpense">){
  const p=await source(db,a,id,"principal");executing(p.status_semantic)
  if(!words(cmd?.reason))throw new BadRequestException("Cần lý do hủy khoản chi.")
  const current=await expense(db,id,expenseId)
  if(current.owner_id!==a.id)throw new NotFoundException()
  if(current.revision!==cmd.revision)throw new ConflictException("Khoản chi đã thay đổi.")
  await db.query("UPDATE rms.budget_expense SET revision=revision+1,deleted_at=now() WHERE project_id=$1 AND id=$2",[id,expenseId])
  await appendAudit(db,a,"project",id,"EXPENSE_VOIDED",{expenseId,amount:current.amount,reason:cmd.reason})
  return budgetDetail(db,a,id)
}
export async function reconcile(db:PoolClient,a:SessionAccount,id:string,expenseId:string,cmd:Input<"reconcileExpense">,enabled:boolean){
  const p=await source(db,a,id,"officer")
  if(!enabled||!["IN_PROGRESS","PASSED"].includes(p.status_semantic))throw new ConflictException("Sổ chưa cho phép đối soát.")
  const current=await expense(db,id,expenseId),amount=money(cmd?.amount)
  if(!words(cmd.reference))throw new BadRequestException("Cần mã giao dịch đối soát.")
  if(cmd.revision!==current.revision)throw new ConflictException("Khoản chi đã thay đổi.")
  const matched=BigInt(current.amount)===amount?"MATCHED":"MISMATCHED"
  const ref=cmd.reference.trim()
  if((await db.query("SELECT 1 FROM rms.budget_expense WHERE project_id=$1 AND id<>$2 AND reference=$3 AND deleted_at IS NULL",[id,expenseId,ref])).rowCount)throw new ConflictException("Mã đối soát đã dùng.")
  await db.query("UPDATE rms.budget_expense SET reference=$3,transferred=$4,reconciliation=$5,revision=revision+1 WHERE project_id=$1 AND id=$2",[id,expenseId,ref,amount,matched])
  await appendAudit(db,a,"project",id,"EXPENSE_RECONCILED",{expenseId,reference:ref,amount:cmd.amount,result:matched})
  return budgetDetail(db,a,id)
}
export async function settle(db:PoolClient,a:SessionAccount,id:string,cmd:Input<"settleBudget">,enabled:boolean){
  const p=await source(db,a,id,"officer")
  if(p.status_semantic!=="PASSED")throw new ConflictException("Chỉ quyết toán sau khi nghiệm thu đạt.")
  const detail=await budgetDetail(db,a,id)
  if(!detail.allocation)throw new ConflictException("Chưa xác nhận kinh phí.")
  const blockers=detail.items.filter(e=>e.reconciliation!=="MATCHED")
  if(enabled&&blockers.length)throw new ConflictException("Cần đối soát "+blockers.map(e=>e.id+" ("+e.reconciliation+")").join(", "))
  if(!enabled&&cmd?.manualReviewed!==true)throw new BadRequestException("Cần xác nhận đã rà thủ công.")
  const mode=enabled?"MATCHED":"MANUAL"
  await db.query("UPDATE rms.budget_allocation SET settled_at=now(),settled_by=$2,settlement_mode=$3,revision=revision+1 WHERE project_id=$1",[id,a.id,mode])
  await moveTo(db,a,id,"COMPLETED",p.row_version)
  await appendAudit(db,a,"project",id,"BUDGET_SETTLED",{mode,spent:detail.spent,balance:detail.balance})
  return budgetDetail(db,a,id)
}
