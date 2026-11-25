import {BadRequestException} from "@nestjs/common"

export function money(value:unknown,allowZero=false){
  if(typeof value!=="string"||!/^\d{1,16}$/.test(value)||BigInt(value)>BigInt(Number.MAX_SAFE_INTEGER)||!allowZero&&BigInt(value)===0n)
    throw new BadRequestException("Số tiền phải là số nguyên VND trong giới hạn cho phép.")
  return BigInt(value)
}
