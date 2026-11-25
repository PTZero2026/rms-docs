import assert from "node:assert/strict"
import { test } from "node:test"
import { parseInput, validKey } from "../dist/content.js"

test("text form fields preserve their declared charset and file or base64 uploads retain exact bytes", async () => {
  const phrase = "Khoa Thủy văn"
  for (const format of ["text", "multipart"]) {
    const text = await parseInput("libelle", { content: phrase, encoding:"utf-16le" }, format, true)
    assert.deepEqual(text.bytes, Buffer.from(phrase, "utf16le"))
    assert.equal(text.mime, "text/plain")
    assert.equal(text.encoding, "utf-16le")
    await assert.rejects(parseInput("libelle", { content:phrase, encoding:"us-ascii" }, format, false), e => e.getStatus?.() === 400)
    await assert.rejects(parseInput("libelle", { content:phrase, encoding:"unknown-charset" }, format, false), e => e.getStatus?.() === 400)
  }
  const automatic = await parseInput("libelle", { content:"a".repeat(8200) + phrase }, "text", true)
  assert.equal(new TextDecoder(automatic.encoding).decode(automatic.bytes), "a".repeat(8200) + phrase)
  const bytes = Buffer.from([0x80, 0xe9])
  const literal = await parseInput("prix", { content:"€é", encoding:"windows-1252" }, "text", true)
  assert.deepEqual(literal.bytes, bytes)
  for (const [format, content] of [["multipart", bytes], ["json", bytes.toString("base64")]]) {
    const original = await parseInput("prix", { content, encoding:"unknown-charset" }, format, true)
    assert.deepEqual(original.bytes, bytes)
  }
})

test("case-insensitive keys, typed registered JSON and binary size limit", async () => {
  assert.equal(validKey("CONFIG.FE"),"config.fe")
  assert.throws(() => validKey("khóa riêng"))
  const input = content => ({content:Buffer.from(content).toString("base64"),mime_type:"application/json"})
  const value = await parseInput("CONFIG.FE", input('{"appName":"RMS"}'),"json",true)
  assert.equal(value.bytes.toString(),'{"appName":"RMS"}')
  await assert.rejects(parseInput("CONFIG.FE",input('{"appName":12}'),"json",true))
  await assert.rejects(parseInput("free",{content:"?invalid"},"json",true))
  await assert.rejects(parseInput("free",{content:Buffer.alloc(20*1024*1024+1)},"multipart",true),e=>e.getStatus()===413)
  await assert.rejects(parseInput("free",{content:"x",tenantId:"other"},"text",true))
  assert.equal((await parseInput("free",{description:"new"},"json",false)).bytes,undefined)
})

test("B04 validates both retry settings before they can hold up a tenant's email queue",async()=>{
  for(const [key,value] of [["NOTIFICATION.MAXRETRY","0"],["notification.maxRetry","2.5"],["notification.retryBaseSeconds","901"]]){
    await assert.rejects(parseInput(key,{content:value},"text",true),e=>e.getStatus?.()===400)
  }
  assert.equal((await parseInput("notification.maxRetry",{content:"2"},"text",true)).bytes.toString(),"2")
})

test("B01 validates the F10 call list before accepting its preview or replacement",async()=>{
  const call={code:"HK1",unitId:"00000000-0000-4000-8000-000000000038",starts:"2026-09-01",ends:"2026-11-30",min:1,max:4,
    finalDue:"2027-03-31",requireProgress:true,finalEvidence:[{code:"REPORT",label:"Báo cáo"}]}
  const parse=(calls)=>parseInput("F10.CALLS",{content:JSON.stringify(calls)},"text",true)
  for(const input of [[{...call,max:0}],[call,call],[{...call,requireProgress:"true"}],[{...call,ends:"2026-02-31"}]])
    await assert.rejects(parse(input),e=>e.getStatus?.()===400)
  assert.deepEqual(JSON.parse((await parse([call])).bytes),[call])
  assert.equal((await parse([])).bytes.toString(),"[]")
})
