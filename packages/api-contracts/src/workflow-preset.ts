import type { components } from "./schema.d.ts"
type Graph=components["schemas"]["WorkflowGraph"]
type Edge=Graph["transitions"][number]
type Semantic=Graph["steps"][number]["semantic"]
const main: [string,Semantic,Semantic,Edge["roles"],boolean?][]=[
  ["submit","DRAFT","SUBMITTED",["author"]],
  ["return","SUBMITTED","DRAFT",["staff"],true],
  ["open-review","SUBMITTED","UNDER_REVIEW",["staff","admin"]],
  ["approve","UNDER_REVIEW","APPROVED",["staff","admin"]],
  ["reject","UNDER_REVIEW","REJECTED",["staff","admin"],true],
  ["reopen-approved-review","APPROVED","UNDER_REVIEW",["staff"],true],
  ["reopen-rejected-review","REJECTED","UNDER_REVIEW",["staff"],true],
  ["assign","APPROVED","IN_PROGRESS",["staff","admin"]],
  ["suspend","IN_PROGRESS","SUSPENDED",["staff","admin"],true],
  ["resume","SUSPENDED","IN_PROGRESS",["staff","admin"]],
  ["request-acceptance","IN_PROGRESS","PENDING_ACCEPTANCE",["author"]],
  ["open-acceptance","PENDING_ACCEPTANCE","UNDER_ACCEPTANCE",["staff","admin"]],
  ["pass","UNDER_ACCEPTANCE","PASSED",["staff","admin"]],
  ["fail","UNDER_ACCEPTANCE","FAILED",["staff","admin"],true],
  ["reopen-passed-acceptance","PASSED","UNDER_ACCEPTANCE",["staff"],true],
  ["reopen-failed-acceptance","FAILED","UNDER_ACCEPTANCE",["staff"],true],
  ["redo","FAILED","IN_PROGRESS",["staff","admin"],true],
  ["complete","PASSED","COMPLETED",["staff","admin"]],
  ["cancel-draft","DRAFT","CANCELLED",["author","staff"],true],
  ["cancel-submitted","SUBMITTED","CANCELLED",["author","staff"],true],
]
export const semanticCodes=[...new Set(main.flatMap(([,from,to])=>[from,to]))]
export function defaultWorkflow():Graph {
  return {
    steps:semanticCodes.map(semantic=>({code:semantic,semantic,initial:semantic==="DRAFT",final:["COMPLETED","CANCELLED"].includes(semantic)})),
    transitions:main.map(([code,from,to,roles,reason])=>({code,from,to,roles:[...roles],requiresComment:!!reason,
      guards:code==="submit"?["validateProposalContent"]:code.startsWith("cancel-")?["authorCancellableOnly"]:[],
      effects:code==="return"?["syncProposalStatus","setRevisionDeadline","notify"]:code==="submit"?["syncProposalStatus","clearRevision","notify"]:["notify"]})),
  }
}
