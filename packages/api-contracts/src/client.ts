import createClient from "openapi-fetch"
import type { paths } from "./schema.d.ts"

export type { paths, operations, components } from "./schema.d.ts"

export function createRmsClient(baseUrl: string) {
  return createClient<paths>({ baseUrl })
}
