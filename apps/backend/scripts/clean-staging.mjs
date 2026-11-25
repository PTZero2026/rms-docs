import { Pool } from "pg"
import { withTenant } from "../dist/db/tenant-transaction.js"
import { AttachmentStore } from "../dist/modules/attachments/store.js"
import { cleanExpired } from "../dist/modules/attachments/service.js"

const slug=process.argv[2]
if(!slug || !process.env.DATABASE_URL || !process.env.RMS_S3_BUCKET)
  throw Error("Supply tenant slug, DATABASE_URL and RMS_S3_BUCKET")
const store=new AttachmentStore(process.env.RMS_S3_BUCKET)
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1})
try {
  const {rows:[tenant]}=await pool.query("SELECT id FROM rms.active_realm($1)",[slug])
  if(!tenant) throw Error("Unknown tenant")
  let count=0, batch
  do {batch=await withTenant(pool,tenant.id,db=>cleanExpired(db,store)); count+=batch} while(batch===50)
  console.log(slug+": "+count+" expired staging records cleaned")
} finally {store.client.destroy();await pool.end()}
