import {notificationRetryPolicy} from "./notification-retry.js"
import {teachingCalendar} from "./teaching-calendar.js"
import express,{type ErrorRequestHandler,type Request} from "express"
import { Pool } from "pg"
import { createClient } from "redis"
import { BadRequestException, HttpException, UnsupportedMediaTypeException } from "@nestjs/common"
import { authorize } from "./access.js"
import { parseInput } from "./content.js"
import { ConfigurationStore,contentType } from "./store.js"

import { reminderWindow } from "./reminder-window.js"

const app=express()
app.disable("x-powered-by")
if (!process.env.RMS_CONFIG_DATABASE_URL) throw Error("RMS_CONFIG_DATABASE_URL required")
const pool=new Pool({connectionString:process.env.RMS_CONFIG_DATABASE_URL,max:8,connectionTimeoutMillis:4000,statement_timeout:10000})
const redisOptions=process.env.RMS_REDIS_SOCKET ? {socket:{tls:false as const,path:process.env.RMS_REDIS_SOCKET}} : {url:process.env.RMS_REDIS_URL}
const redis=process.env.RMS_REDIS_SOCKET || process.env.RMS_REDIS_URL ? createClient({...redisOptions,disableOfflineQueue:true,commandsQueueMaxLength:128,commandOptions:{timeout:750}}) : undefined
redis?.on("error",()=>{})
void redis?.connect().catch(()=>undefined)
const store=new ConfigurationStore(pool,redis)
const route="/api/tenants/:slug/catalog/configurations"
app.get("/internal/notifications/:tenant/retry-policy",async(req,res)=>{
  res.set("Cache-Control","private, no-store")
  res.json(await notificationRetryPolicy(store,req.params.tenant,req.get("X-RMS-Reminder-Service")))
})
app.get("/internal/reminders/:tenant/window",async(req,res)=>{
  res.set("Cache-Control","private, no-store")
  res.json(await reminderWindow(store,req.params.tenant,req.get("X-RMS-Reminder-Service")))
})
app.get("/internal/teaching-hours/:tenant/calendar",async(req,res)=>{
  res.set("Cache-Control","private, no-store")
  res.json(await teachingCalendar(store,req.params.tenant,req.get("X-RMS-Teaching-Service")))
})
app.get("/health",(_req,res)=>res.json({status:"ok"}))
app.use(route,(req,res,next)=>{
  const origin=req.get("origin")
  if (origin && origin===process.env.RMS_WEB_ORIGIN) {
    res.vary("Origin")
    res.set({"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"Authorization, Content-Type",
      "Access-Control-Allow-Methods":"GET, HEAD, POST, PUT, DELETE","Access-Control-Expose-Headers":"X-Cache, X-RMS-Scope, Content-Type"})
    if (req.method==="OPTIONS") {res.status(204).end();return}
  }
  next()
})
app.use(route,async(req,res,next)=>{
  res.set({"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox; default-src 'none'"})
  res.locals.access=await authorize(req.params.slug,req.headers.authorization,!["GET","HEAD"].includes(req.method))
  next()
})
const homeLayouts=`${route}/home-layouts/:role` as const
app.get(homeLayouts,async(req,res)=>{
  const skip=req.query.skip
  if(skip!==undefined&&(typeof skip!=="string"||!/^\d+$/.test(skip)))throw new BadRequestException()
  res.json(await store.homeLayout(res.locals.access,req.params.role,Number(skip??0)))
})
app.put(homeLayouts,express.json({limit:"4kb",inflate:false}),async(req,res)=>{
  res.json(await store.saveHomeLayout(res.locals.access,req.params.role,req.body))
})
app.get(route,async(req,res)=>{res.json(await store.list(res.locals.access,req.query))})
app.get(`${route}/:key` as const,async(req,res)=>{
  const {meta,cache,bytes}=await store.read(res.locals.access,req.params.key)
  res.set({"Content-Type":contentType(meta),"X-Cache":cache,"X-RMS-Scope":meta.scope,"Content-Disposition":"attachment"})
  res.end(bytes)
})
const parsers=[express.json({limit:"28mb",inflate:false}),express.urlencoded({extended:false,limit:"61mb",parameterLimit:16,inflate:false}),express.raw({type:"multipart/form-data",limit:"21mb",inflate:false})]
async function body(req:Request) {
  if (req.is("application/json")) return {fields:req.body,format:"json" as const}
  if (req.is("application/x-www-form-urlencoded")) return {fields:req.body,format:"text" as const}
  if (!req.is("multipart/form-data")) throw new UnsupportedMediaTypeException()
  const form=await new Response(req.body,{headers:{"Content-Type":req.headers["content-type"]!}}).formData().catch(()=>{throw new BadRequestException()})
  const fields:Record<string,unknown>=Object.create(null)
  for (const [key,v] of form) {
    if (Object.hasOwn(fields,key)) throw new BadRequestException()
    if (typeof v!=="string" && key!=="content") throw new BadRequestException()
    fields[key]=typeof v==="string"?v:Buffer.from(await v.arrayBuffer())
  }
  return {fields,format:"multipart" as const}
}
app.post(route,...parsers,async(req,res)=>{
  const {fields,format}=await body(req)
  const key=fields?.key
  const input=await parseInput(key,fields,format,true)
  res.json(await store.save(res.locals.access,key,input,true,req.query.detect==="true"))
})
app.put(`${route}/:key` as const,...parsers,async(req,res)=>{
  const {fields,format}=await body(req)
  const input=await parseInput(req.params.key,fields,format,false)
  res.json(await store.save(res.locals.access,req.params.key,input,false))
})
app.delete(`${route}/:key` as const,async(req,res)=>{
  await store.remove(res.locals.access,req.params.key)
  res.status(204).end()
})
const errors:ErrorRequestHandler=(error,_req,res,_next)=>{
  if (res.headersSent) return _next(error)
  const status=error instanceof HttpException?error.getStatus():[400,413,415].includes(error.status)?error.status:503
  res.status(status).json({statusCode:status,message:error instanceof HttpException?error.message:"Không thể xử lý yêu cầu cấu hình."})
}
app.use(errors)
const server=app.listen(Number(process.env.PORT??3110),process.env.HOST??"127.0.0.1")
async function close() {
  server.close(async()=>{redis?.destroy();await pool.end()})
}
process.once("SIGTERM",close)
process.once("SIGINT",close)
