import {BadRequestException} from "@nestjs/common"
import type {PoolClient} from "pg"

export async function resolveContributions<T extends {email:string;share:number}>(db:PoolClient,owner:string,members:T[]){
  if(!Array.isArray(members)||members.length>99||
    members.some(m=>!m||typeof m.email!=="string"||!m.email.trim()||m.email.length>254||
      !Number.isInteger(m.share)||m.share<1||m.share>99))
    throw new BadRequestException("Nhập email tài khoản và tỷ lệ nguyên từ 1 đến 99 cho mỗi thành viên.")
  const emails=members.map(m=>m.email.trim().toLowerCase())
  if(new Set(emails).size!==emails.length||members.reduce((sum,m)=>sum+m.share,0)>=100)
    throw new BadRequestException("Mỗi thành viên chỉ xuất hiện một lần. Chủ nhiệm phải còn ít nhất 1% đóng góp.")
  const active=await db.query<{id:string;email:string}>("SELECT id,email FROM rms.account WHERE email=ANY($1::text[]) AND id<>$2 AND is_active AND deleted_at IS NULL ORDER BY id FOR SHARE",[emails,owner])
  if(active.rowCount!==emails.length)throw new BadRequestException("Kiểm tra tài khoản thành viên tại trường và bỏ chủ nhiệm khỏi danh sách thành viên.")
  const accounts=new Map(active.rows.map(row=>[row.email,row.id]))
  return members.map((m,i)=>({...m,accountId:accounts.get(emails[i])!}))
}
