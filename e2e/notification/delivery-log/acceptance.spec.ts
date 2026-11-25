import { choose } from "../../lib/choice.mjs"
import {test,expect} from "@playwright/test"
import {randomUUID} from "node:crypto"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

test("B04 unit officer returns two rejected emails to the queue and leaves uncertain delivery for reconciliation",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const [operator,reader]=await Promise.all([0,1].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  try{
    const [staff,recipient]=await Promise.all([catalogUser(operator,"school-2","chuyen-vien-giao-thu","user"),catalogUser(reader,"school-2","nguoi-nhan-giao-thu","user")])
    const unit=randomUUID(),project=randomUUID()
    provision(`BEGIN;
      SELECT set_config('rms.tenant_id',(SELECT tenant_id::text FROM rms.account WHERE id=:'actor'),true);
      INSERT INTO rms.unit VALUES(rms.current_tenant(),:'unit','Khoa thử giao thư');
      UPDATE rms.account SET user_type='staff',unit_id=:'unit' WHERE id=:'actor';
      INSERT INTO rms.research_project(tenant_id,id,unit_id,title) VALUES(rms.current_tenant(),:'project',:'unit','Nguồn thông báo thử');
      WITH log AS (INSERT INTO rms.audit_log(tenant_id,actor_id,target_id,target_type,action)
        VALUES(rms.current_tenant(),:'actor',:'project','project','TEST_MAIL') RETURNING id)
      INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload)
        SELECT rms.current_tenant(),gen_random_uuid(),:'project','PROJECT.SUBMITTED',ARRAY['notify'],log.id,
          jsonb_build_object('ownerId',:'recipient'::uuid) FROM log CROSS JOIN generate_series(1,3);
      UPDATE rms.delivery d SET status='failed',attempts=5,last_error='smtp_rejected'
        FROM rms.outbox o WHERE o.id=d.event_id AND o.target_id=:'project' AND d.channel='smtp';
      UPDATE rms.delivery SET status='reconcile',last_error='smtp_unknown' WHERE id=(
        SELECT d.id FROM rms.delivery d JOIN rms.outbox o ON o.id=d.event_id WHERE o.target_id=:'project' AND d.channel='smtp' ORDER BY d.id LIMIT 1);
      COMMIT;`,{actor:staff.account.id,recipient:recipient.account.id,unit,project})
    await operator.reload()
    await operator.getByRole("button",{name:"Hộp thông báo",exact:true}).click()
    await operator.getByRole("button",{name:"Nhật ký gửi thông báo",exact:true}).click()
    const log=operator.getByRole("region",{name:"Nhật ký gửi thông báo"})
    await expect(log.getByText("2 lượt gửi",{exact:true})).toBeVisible()
    const boxes=log.getByRole("checkbox",{name:"Chọn lượt gửi"})
    await boxes.nth(0).check();await boxes.nth(1).check()
    await log.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/gui-lai-email.png",import.meta.url))})
    await log.getByRole("button",{name:"Gửi lại đã chọn (2)"}).click()
    await expect(log.getByText("Đã đưa 2 lượt gửi vào hàng đợi.")).toBeVisible()
    await expect(log.getByText("0 lượt gửi",{exact:true})).toBeVisible()
    await choose(log.getByLabel("Trạng thái gửi"), "reconcile")
    await expect(log.getByText("1 lượt gửi",{exact:true})).toBeVisible()
    await expect(log.getByRole("button",{name:"Gửi lại",exact:true})).toHaveCount(0)
    await choose(log.getByLabel("Trạng thái gửi"), "all")
    await expect(log.getByText(/Chờ gửi · 0 lần thử/)).toHaveCount(5)
    await reader.getByRole("button",{name:"Hộp thông báo",exact:true}).click()
    await expect(reader.getByRole("button",{name:"Nhật ký gửi thông báo"})).toHaveCount(0)
    expect((await reader.request.get("/api/tenants/school-2/notifications/deliveries",{headers:recipient.headers})).status()).toBe(403)
  }finally{await Promise.all([operator.close(),reader.close()])}
})
