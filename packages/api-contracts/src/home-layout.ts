import type { operations } from "./schema.d.ts"

export type HomeRole = operations["getHomeLayoutSettings"]["parameters"]["path"]["role"]
export type HomeWidget = operations["getHomeLayout"]["responses"][200]["content"]["application/json"]["widgets"][number]
export const layoutKeys: Record<HomeRole,string> = {
  user:"HOME.USER", author:"HOME.RESEARCHER", staff:"HOME.OFFICER", admin:"HOME.ADMIN",
}
export function layoutKey(role:HomeRole){return layoutKeys[role]}

export function allowedWidgets(role:HomeRole,teaching:boolean):HomeWidget[]{
  const result:HomeWidget[]=["tasks"]
  if(role!=="user")result.push("projects")
  result.push("activity","shortcuts")
  if(teaching)result.push("teaching")
  return result
}

export function widgetsFor(role:HomeRole,configured:string|null,teaching:boolean):HomeWidget[]{
  if(configured===null)return allowedWidgets(role,false)
  const allowed=allowedWidgets(role,teaching)
  const tokens=configured.split(",").map(key=>key.trim())
  return [...new Set(tokens.filter((key):key is HomeWidget=>allowed.some(widget=>widget===key)))]
}
