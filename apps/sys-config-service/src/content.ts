import {parseRetrySetting} from "./notification-retry.js"
import {readStudentCalls} from "@rms/api-contracts/student-calls"
import { BadRequestException, PayloadTooLargeException } from "@nestjs/common"
import { fileTypeFromBuffer } from "file-type"
import registry from "@rms/api-contracts/catalog-registry" with {type:"json"}
import { detect } from "chardet"
import iconv from "iconv-lite"
import type { operations } from "@rms/api-contracts"

export type Metadata = operations["createConfiguration"]["responses"][200]["content"]["application/json"]
export const maxBytes = 20 * 1024 * 1024
export function validKey(value: unknown) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9._-]{1,128}$/.test(value)) throw new BadRequestException("Mã cấu hình không hợp lệ.")
  return value.toLowerCase()
}
export function textMime(value: string) {
  return value.startsWith("text/") || /(?:\+|\/)(?:json|xml|yaml)$/.test(value)
}
const fieldLimits = {mime_type:64,encoding:16,refer:64,group:64,description:1024}
function stringField(value:unknown, limit:number) {
  if (value === undefined) return undefined
  if (typeof value!=="string" || value.length>limit || value.includes("\0")) throw new BadRequestException("Siêu dữ liệu không hợp lệ.")
  return value
}
function flag(value:unknown) {
  if (value===undefined) return undefined
  if (value===true || value==="true") return true
  if (value===false || value==="false") return false
  throw new BadRequestException("Cờ cấu hình không hợp lệ.")
}
function encodeFormText(text: string, encoding: string) {
  if (!iconv.encodingExists(encoding)) throw new BadRequestException("Bảng mã chưa hỗ trợ nhập văn bản. Có thể gửi tệp hoặc Base64.")
  const bytes = iconv.encode(text, encoding)
  const decoded = iconv.decode(bytes, encoding, { stripBOM: false })
  if (decoded !== text && decoded !== "\uFEFF" + text) throw new BadRequestException("Bảng mã đã chọn không biểu diễn đủ ký tự trong nội dung.")
  return bytes
}
export async function parseInput(key: string, body:Record<string,unknown>, format:"json"|"text"|"multipart", creating:boolean) {
  const canonical=validKey(key)
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(k=>!["key","content","active","public",...Object.keys(fieldLimits)].includes(k))) throw new BadRequestException("Trường cấu hình không hợp lệ.")
  if (body.key!==undefined && validKey(body.key)!==canonical) throw new BadRequestException()
  let mime=stringField(body.mime_type,64), encoding=stringField(body.encoding,16)
  if (mime && !/^[A-Za-z0-9.+_-]+\/[A-Za-z0-9.+_-]+$/.test(mime) || encoding && !/^[A-Za-z0-9_-]+$/.test(encoding)) throw new BadRequestException()
  mime=mime?.toLowerCase() || undefined
  const literal = typeof body.content === "string" && format !== "json" ? body.content : undefined
  let bytes: Buffer|undefined
  if (body.content!==undefined && body.content!=="") {
    if (Buffer.isBuffer(body.content) && format==="multipart") bytes=body.content
    else if (literal !== undefined) bytes=encoding ? encodeFormText(literal, encoding) : Buffer.from(literal, "utf8")
    else if (typeof body.content==="string") {
      if (body.content.length%4!==0 || /[^a-zA-Z0-9+/=]/.test(body.content) || /=.+[^=]|={3}/.test(body.content)) throw new BadRequestException("Nội dung base64 không hợp lệ.")
      bytes=Buffer.from(body.content,"base64")
      if (bytes.toString("base64")!==body.content) throw new BadRequestException("Nội dung base64 không hợp lệ.")
    } else throw new BadRequestException()
  }
  if (bytes && bytes.length>maxBytes) throw new PayloadTooLargeException()
  if (!bytes?.length) {
    if (creating) throw new BadRequestException("Cần nhập nội dung.")
    bytes=undefined
  }
  if (bytes) {
    parseRetrySetting(canonical,bytes)
    if(canonical==="f10.calls"){
      try{readStudentCalls(new TextDecoder("utf-8",{fatal:true}).decode(bytes))}
      catch(e){throw new BadRequestException(e instanceof Error?e.message:"Danh sách đợt sinh viên chưa hợp lệ.")}
    }
    const sample=bytes.subarray(0,8192)
    if (!mime) {
      const magic=await fileTypeFromBuffer(sample).catch(()=>undefined)
      const textSample=literal===undefined?sample:Buffer.from(literal.slice(0,8192),"utf8")
      const looksText=!textSample.some(x=>x<32 && ![9,10,13].includes(x))
      mime=magic?.mime ?? (looksText?"text/plain":"application/octet-stream")
    }
    if (!encoding) {
      encoding=detect(sample)?.toLowerCase() || "utf-8"
      if (literal!==undefined && encoding!=="utf-8" && (!iconv.encodingExists(encoding) || iconv.decode(bytes,encoding,{stripBOM:false})!==literal)) encoding="utf-8"
    }
    if (canonical==="config.fe") {
      let data
      try { data=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes)) } catch {throw new BadRequestException("CONFIG.FE cần JSON UTF-8.")}
      if (!data || typeof data!=="object" || Array.isArray(data) || Object.entries(registry["config.fe"].schema.properties).some(([field,rule])=>field in data && typeof data[field]!==rule.type)) throw new BadRequestException("CONFIG.FE không khớp schema.")
    }
  }
  return {bytes,mime,encoding,description:stringField(body.description,1024),refer:stringField(body.refer,64),group:stringField(body.group,64),active:flag(body.active),public:flag(body.public)}
}
export type Input = Awaited<ReturnType<typeof parseInput>>
