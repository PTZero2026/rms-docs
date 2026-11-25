import { NotFoundException } from "@nestjs/common"
import type { CatalogAdapter } from "./config-override/service.js"

export async function requireExtension(catalog:CatalogAdapter,slug:string,auth:string,feature:string){
  if(await catalog.optionalText(slug,"FEATURE.E4",auth)!=="true")throw new NotFoundException()
  const flag=await catalog.optionalText(slug,"FEATURE."+feature,auth)
  if((flag!==null||feature==="P03")&&flag!=="true")throw new NotFoundException()
}

export async function teachingEnabled(catalog:CatalogAdapter,slug:string,auth:string){
  return await catalog.optionalText(slug,"FEATURE.E4",auth)==="true"&&await catalog.optionalText(slug,"FEATURE.P03",auth)==="true"
}
