import assert from "node:assert/strict"
import test from "node:test"
import { createApplication } from "../dist/application.js"
import { createRmsClient } from "@rms/api-contracts"

test("the generated client reads health from a running Nest application", async (t) => {
  const app = await createApplication()
  t.after(() => app.close())
  await app.listen(0, "127.0.0.1")
  const api = createRmsClient(await app.getUrl())
  const { response, data } = await api.GET("/api/health")
  assert.equal(response.status, 200)
  assert.deepEqual(data, { status: "ok" })
  const missing = await fetch(await app.getUrl()+"/api/tenants/school-1/absent")
  assert.equal(missing.status,404)
  assert.match(missing.headers.get("cache-control") ?? "",/no-store/)
  assert.equal(missing.headers.get("x-content-type-options"),"nosniff")
  assert.equal(missing.headers.has("x-powered-by"),false)
})
