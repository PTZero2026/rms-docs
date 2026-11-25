import test from "node:test"
import assert from "node:assert/strict"
import {parseProductTypes} from "../dist/modules/product/catalog.js"
import {validCommitments} from "@rms/api-contracts/products"

test("B01 product choices retain legacy labels and accept distinct codes with tenant labels",()=>{
  const choices=parseProductTypes(JSON.stringify(["ARTICLE",{code:"MAP",label:"Bản đồ nghiên cứu"}]))
  assert.deepEqual(choices,[{code:"ARTICLE",label:"Bài báo"},{code:"MAP",label:"Bản đồ nghiên cứu"}])
  assert.ok(validCommitments({MAP:2},choices.map(x=>x.code)))
  assert.equal(validCommitments({PATENT:1},choices.map(x=>x.code)),false)
  assert.deepEqual(parseProductTypes("[]"),[])
  assert.equal(parseProductTypes(null).length,5)
  for(const bad of ["{",'{"x":1}', '["INVALID"]', '["ARTICLE","ARTICLE"]', '[{"code":"__proto__","label":"A"}]', '[{"code":"MAP","label":" "}]'])
    assert.throws(()=>parseProductTypes(bad),e=>e.getStatus?.()===409)
})
