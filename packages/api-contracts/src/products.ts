export const outputTypes={ARTICLE:"Bài báo",PATENT:"Sáng chế",SOFTWARE:"Phần mềm",REPORT:"Báo cáo",BOOK:"Sách"}
export function validCommitments(value:unknown,active:readonly string[]=Object.keys(outputTypes)):value is Record<string,number>{
  return !!value && typeof value==="object" && !Array.isArray(value) && Object.entries(value).every(([k,n])=>
    active.includes(k) && typeof n==="number" && Number.isInteger(n) && n>0 && n<=999)
}
