import {semanticCodes} from "@rms/api-contracts/workflow"

const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
const groups=new Set<string>(["*",...semanticCodes])

export function reportLocation(id:string,singleUnit:boolean,group:string){
  const query=new URLSearchParams({report:"home",snapshot:id})
  if(singleUnit)query.set("scope","unit")
  if(groups.has(group))query.set("group",group)
  return query
}

export function reportBookmark(query:URLSearchParams){
  const id=query.get("snapshot")
  if(query.get("report")!=="home"||!id||!uuid.test(id))return null
  const group=query.get("group")??""
  return {id,singleUnit:query.get("scope")==="unit",group:groups.has(group)?group:""}
}
