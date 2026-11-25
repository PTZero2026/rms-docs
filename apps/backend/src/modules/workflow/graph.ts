import { BadRequestException } from "@nestjs/common"
import type { components } from "@rms/api-contracts"

export type Graph = components["schemas"]["WorkflowGraph"]
const semantics = new Set(["DRAFT","SUBMITTED","UNDER_REVIEW","APPROVED","IN_PROGRESS","SUSPENDED","PENDING_ACCEPTANCE","UNDER_ACCEPTANCE","PASSED","FAILED","COMPLETED","REJECTED","CANCELLED"])
const knownRoles = new Set(["admin","staff","author","user"])
const knownGuards = new Set(["requireComment","validateProposalContent","authorCancellableOnly"])
const knownEffects = new Set(["syncProposalStatus","setRevisionDeadline","clearRevision","notify"])
const validCode = (s: unknown) => typeof s==="string" && s.trim()===s && s.length>0 && s.length<=64
const knownList = (x: unknown, known: Set<string>) => Array.isArray(x) && x.every(v=>known.has(v)) && new Set(x).size===x.length
function reject(message:string): never { throw new BadRequestException(message) }
export function validateGraph(graph: Graph) {
  if (!Array.isArray(graph?.steps) || graph.steps.length<2 || graph.steps.length>128 ||
      !Array.isArray(graph.transitions) || !graph.transitions.length || graph.transitions.length>512) reject("Số bước hoặc số cạnh chưa hợp lệ.")
  const steps = new Map<string,Graph["steps"][number]>()
  for (const s of graph.steps) {
    if (!s || !validCode(s.code) || steps.has(s.code) || !semantics.has(s.semantic) ||
        typeof s.initial!=="boolean" || typeof s.final!=="boolean" || (s.initial && s.final)) reject("Bước chưa hợp lệ: "+(s?.code??"?"))
    steps.set(s.code,s)
  }
  const start = graph.steps.filter(s=>s.initial)
  const finish = graph.steps.filter(s=>s.final)
  if(start.length!==1 || !finish.length) reject("Cần một bước đầu và ít nhất một bước kết thúc.")
  const edges = new Set<string>()
  for (const e of graph.transitions) {
    if(!e || !validCode(e.code) || edges.has(e.code) || !steps.has(e.from) || !steps.has(e.to) ||
        e.from===e.to || steps.get(e.from)?.final || !knownList(e.roles,knownRoles) || !e.roles.length ||
        !knownList(e.guards,knownGuards) || !knownList(e.effects,knownEffects) || typeof e.requiresComment!=="boolean") reject("Cạnh chưa hợp lệ: "+(e?.code??"?"))
    edges.add(e.code)
  }
  const reachable = new Set([start[0].code]), canFinish = new Set(finish.map(s=>s.code))
  for (let i=0;i<steps.size;i++) for (const e of graph.transitions) {
    if(reachable.has(e.from)) reachable.add(e.to)
    if(canFinish.has(e.to)) canFinish.add(e.from)
  }
  for(const s of steps.keys()) if(!reachable.has(s)||!canFinish.has(s)) reject("Bước không nối từ đầu đến cuối: "+s)
}
