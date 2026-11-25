import {createServer} from "node:http"
import {createHash} from "node:crypto"
// Integration fixture serves only loopback. Keep text out of diagnostic snapshots.
const digests=[]
const digest=text=>createHash("sha256").update(text).digest("hex")
createServer(async(req,res)=>{
  res.setHeader("Content-Type","application/json")
  if(req.url==="/health"){res.end("{}");return}
  if(req.url==="/observed"){res.end(JSON.stringify(digests));return}
  if(req.url!=="/v1/chat/completions"||req.method!=="POST"){res.writeHead(404);res.end("{}");return}
  try{
    let bytes=""
    for await(const c of req){bytes+=c;if(bytes.length>500000)throw Error()}
    const r=JSON.parse(bytes),passages=JSON.parse(r.messages[1].content)
    digests.push(passages.map(p=>digest(p.text)))
    if(passages.some(p=>p.text.includes("[offline-fixture]"))){res.writeHead(503);res.end("{}");return}
    const ids=passages.filter(p=>p.text.trim().split(/\s+/).length>=4).map(p=>p.id)
    res.end(JSON.stringify({choices:[{message:{content:JSON.stringify(ids)}}]}))
  }catch{res.writeHead(400);res.end("{}")}
}).listen(3193,"127.0.0.1")
