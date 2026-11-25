import { expect, type APIRequestContext } from "@playwright/test"
import type { catalogUser } from "./fixtures"

type Actor = Awaited<ReturnType<typeof catalogUser>>

export async function checkConfigReplicas(request: APIRequestContext, operator: Actor, admin: Actor, reader: Actor) {
  const primary = "http://127.0.0.1:3192"
  const peer = "http://127.0.0.1:3194"
  const key = "REPLICA.OVERRIDE"
  const otherKey = "REPLICA.OTHER"
  const cached = Boolean(process.env.RMS_REDIS_SOCKET || process.env.RMS_REDIS_URL)
  async function write(origin: string, actor: Actor, name: string, value: string, create: boolean) {
    const data = { key: name, mime_type: "text/plain", content: Buffer.from(value).toString("base64") }
    const response = await request.fetch(origin + actor.path + (create ? "" : "/" + name), {
      method: create ? "POST" : "PUT", headers: actor.headers, data,
    })
    expect(response.status()).toBe(200)
  }
  async function read(origin: string, actor: Actor, name: string, value: string, cache: "HIT" | "MISS") {
    const response = await request.get(origin + actor.path + "/" + name, { headers: actor.headers })
    expect(response.status()).toBe(200)
    expect(await response.text()).toBe(value)
    expect(response.headers()["x-cache"]).toBe(cached ? cache : "MISS")
  }
  await write(primary, operator, key, "Chung 1", true)
  await write(peer, admin, otherKey, "Riêng độc lập", true)
  await read(peer, admin, key, "Chung 1", "MISS")
  await read(primary, admin, key, "Chung 1", "HIT")
  await read(primary, reader, key, "Chung 1", "MISS")
  await read(peer, reader, key, "Chung 1", "HIT")
  await read(primary, admin, otherKey, "Riêng độc lập", "MISS")

  await write(peer, admin, key, "Riêng A", true)
  await read(primary, admin, key, "Riêng A", "MISS")
  await read(peer, reader, key, "Chung 1", "HIT")
  await write(primary, operator, key, "Chung 2", false)
  await read(peer, reader, key, "Chung 2", "MISS")
  await read(peer, admin, key, "Riêng A", "HIT")
  await write(primary, admin, key, "Riêng A 2", false)
  await read(peer, admin, key, "Riêng A 2", "MISS")
  const drop = (origin: string, actor: Actor) => request.delete(origin + actor.path + "/" + key, { headers: actor.headers })
  expect((await drop(peer, admin)).status()).toBe(204)
  await read(primary, admin, key, "Chung 2", "MISS")
  await read(primary, reader, key, "Chung 2", "HIT")
  await read(peer, admin, otherKey, "Riêng độc lập", "HIT")
  expect((await drop(primary, operator)).status()).toBe(204)
  for (const actor of [admin, reader]) {
    expect((await request.get(peer + actor.path + "/" + key, { headers: actor.headers })).status()).toBe(404)
  }
}
