import {ConflictException} from "@nestjs/common"
import {outputTypes} from "@rms/api-contracts/products"
import type {operations} from "@rms/api-contracts"
import type {CatalogAdapter} from "../catalog/config-override/service.js"

type Choices=operations["listProductTypes"]["responses"][200]["content"]["application/json"]
const invalid=()=>new ConflictException("Kiểm tra mã, tên và các mục trùng trong danh mục loại sản phẩm.")
export function parseProductTypes(raw:string|null):Choices{
  if(raw===null)return Object.entries(outputTypes).map(([code,label])=>({code,label}))
  let items:unknown
  try{items=JSON.parse(raw)}catch{throw invalid()}
  if(!Array.isArray(items)||items.length>300)throw invalid()
  const choices:Choices=[],codes=new Set<string>()
  for(const item of items){
    const choice=typeof item==="string"&&Object.hasOwn(outputTypes,item)?{code:item,label:outputTypes[item as keyof typeof outputTypes]}:item
    if(!choice||typeof choice.code!=="string"||!/^[A-Z][A-Z0-9_.-]{0,63}$/.test(choice.code)||codes.has(choice.code)||
      typeof choice.label!=="string"||!choice.label.trim()||choice.label.length>180)throw invalid()
    codes.add(choice.code)
    choices.push({code:choice.code,label:choice.label.trim()})
  }
  return choices
}
export async function productTypes(catalog:CatalogAdapter,slug:string,auth:string){
  return parseProductTypes(await catalog.optionalText(slug,"PRODUCT.ACTIVE_TYPES",auth))
}
