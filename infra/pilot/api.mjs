import { createApplication } from "../../apps/backend/dist/application.js"

let initializing
async function server() {
  const app=await createApplication()
  await app.init()
  return app.getHttpAdapter().getInstance()
}
export default async function handler(req,res) {
  initializing??=server().catch(error=>{initializing=undefined;throw error})
  return (await initializing)(req,res)
}
