import assert from "node:assert/strict"
import test from "node:test"
import { generateKeyPair, SignJWT } from "jose"
import { verifyIdentity } from "../dist/modules/iam/token.js"

test("only a verified access token for this registered realm and API identifies a user", async () => {
  const issuer = "https://id.example.invalid/realms/a"
  const {publicKey, privateKey} = await generateKeyPair("RS256")
  const claims = { iss:issuer, aud:"rms-api", sub:"test-user", typ:"Bearer",
    email:"user@example.invalid", email_verified:true, iat:Math.floor(Date.now()/1000), exp:Math.floor(Date.now()/1000)+120 }
  const sign = payload => new SignJWT(payload).setProtectedHeader({alg:"RS256"}).sign(privateKey)
  const check = async changes => verifyIdentity(issuer,"Bearer " + await sign({...claims,...changes}),async () => publicKey)
  assert.deepEqual(await check({}),{subject:claims.sub,email:claims.email})
  for(const change of [{iss:issuer+"b"}, {aud:"other"}, {exp:1}, {typ:"ID"}, {email_verified:false}, {sub:""}]) {
    await assert.rejects(check(change),err => err.getStatus()===401)
  }
  const foreign = await generateKeyPair("RS256")
  await assert.rejects(verifyIdentity(issuer,"Bearer "+await sign(claims), async () => foreign.publicKey),err => err.getStatus()===401)
})
