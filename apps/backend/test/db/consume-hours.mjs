import {Pool} from "pg"
import {scanTeachingHours} from "../../dist/modules/teaching-hour/teaching-hours/consumer.js"
if(!/^\/tmp\/rms-pg\./.test(process.env.PGHOST??""))throw Error("Private test cluster required")
const pool=new Pool({user:"rms_test_worker"})
try{console.log(JSON.stringify(await scanTeachingHours(pool,"http://127.0.0.1:3192",process.env.RMS_TEACHING_SERVICE_SECRET)))}finally{await pool.end()}
