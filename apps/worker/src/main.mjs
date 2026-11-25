import {scanExpiredCalls} from "@rms/backend/call-expiry"
import {scanTeachingHours} from "@rms/backend/teaching-hours"
import { Pool } from "pg"
import nodemailer from "nodemailer"
import { setTimeout as sleep } from "node:timers/promises"
import { deliverNext,retryPolicyReader,smsGateway } from "@rms/backend/notification-worker"

import { scanDeadlines } from "@rms/backend/deadline-reminders"

const connectionString = process.env.WORKER_DATABASE_URL
if (!connectionString) throw Error("WORKER_DATABASE_URL is required")
const host=process.env.SMTP_HOST??"127.0.0.1", local=["localhost","127.0.0.1","::1","mailpit"].includes(host)
const smtp=nodemailer.createTransport({host,port:Number(process.env.SMTP_PORT??1025),
  secure:process.env.SMTP_TLS==="implicit",requireTLS:!local,
  auth: process.env.SMTP_USER ? {user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined,
  connectionTimeout:5000,socketTimeout:20000,greetingTimeout:5000,
})
const smsUrl=process.env.RMS_SMS_GATEWAY_URL, smsToken=process.env.RMS_SMS_GATEWAY_TOKEN
if (Boolean(smsUrl)!==Boolean(smsToken)) throw Error("Configure both the SMS gateway URL and its credential")
const sendSms=smsUrl&&smsToken?smsGateway(smsUrl,smsToken):undefined
const pool=new Pool({connectionString,max:2,connectionTimeoutMillis:4000})
let running=true
let nextScan=0,scan,nextCleanup=0,nextHours=0,hourScan
let nextCallScan=0,callScan
const teachingSecret=process.env.RMS_TEACHING_SERVICE_SECRET
const reminderSecret=process.env.RMS_REMINDER_SERVICE_SECRET
const configOrigin=process.env.RMS_CONFIG_ORIGIN
const readRetryPolicy=configOrigin&&reminderSecret?retryPolicyReader(configOrigin,reminderSecret):undefined
if(!reminderSecret||!configOrigin)console.info("Progress reminder scheduler disabled: configure the B01 origin and reminder credential.")
process.on("SIGINT",()=>{running=false})
process.on("SIGTERM",()=>{running=false})
try {
  do {
    if(!callScan && Date.now()>=nextCallScan){
      nextCallScan=Date.now()+60000
      callScan=scanExpiredCalls(pool)
        .then(closed=>{if(closed)console.info("Expired proposal calls closed",closed)})
        .catch(()=>console.error("Call expiry scheduler unavailable"))
        .finally(()=>{callScan=undefined})
      if(process.argv.includes("--once"))await callScan
    }
    if(teachingSecret&&configOrigin&&!hourScan&&Date.now()>=nextHours){
      nextHours=Date.now()+60000
      hourScan=scanTeachingHours(pool,configOrigin,teachingSecret).catch(()=>console.error("Teaching hour worker unavailable")).finally(()=>{hourScan=undefined})
      if(process.argv.includes("--once"))await hourScan
    }
    if(Date.now()>=nextCleanup){
      nextCleanup=Date.now()+5*60*1000
      await pool.query("DELETE FROM rms.cv_download WHERE expires_at<=now()").catch(()=>console.error("Expired CV cleanup unavailable"))
    }
    if (reminderSecret && configOrigin && !scan && Date.now()>=nextScan) {
      nextScan=Date.now()+15*60*1000
      scan=scanDeadlines(pool,configOrigin,reminderSecret)
        .then(stats=>console.info("Progress reminders",stats))
        .catch(()=>console.error("Progress reminder scheduler unavailable"))
        .finally(()=>{scan=undefined})
      if(process.argv.includes("--once"))await scan
    }
    const delivered=await deliverNext(pool,async ({to,messageId,eventId,subject,text})=>{
      await smtp.sendMail({to,from:process.env.SMTP_FROM??"rms@example.invalid",messageId,
        headers:{"X-RMS-Event":eventId},subject,text})
    },undefined,readRetryPolicy,sendSms)
    if(process.argv.includes("--once")) break
    if(!delivered) await sleep(1000)
  } while(running)
} finally { await Promise.all([scan,hourScan,callScan]);smtp.close();await pool.end() }
