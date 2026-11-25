import { randomUUID } from "node:crypto"
import { provision } from "../../integration/session-fixture"

export function seedProfile(owner:string){
  const ids={owner,unit:randomUUID(),project:randomUUID()}
  provision(`BEGIN;
    INSERT INTO rms.unit SELECT tenant_id,:'unit'::uuid,'Khoa Công trình' FROM rms.account WHERE id=:'owner';
    UPDATE rms.account SET unit_id=:'unit',user_type='author',full_name='Lê Thanh Mai' WHERE id=:'owner';
    INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id) SELECT tenant_id,:'project',unit_id,'Quan trắc nước mặt',id FROM rms.account WHERE id=:'owner';
    INSERT INTO rms.project_member SELECT tenant_id,:'project',id,true FROM rms.account WHERE id=:'owner';
    INSERT INTO rms.research_output(tenant_id,id,project_id,owner_id,unit_id,title,normalized_title,kind,publication_year,publication,authors,status)
    SELECT tenant_id,gen_random_uuid(),:'project',id,unit_id,t,lower(t),'ARTICLE',2026,'Tạp chí Khoa học',ARRAY[id],s FROM rms.account
    CROSS JOIN (VALUES('Đo lưu lượng tự động','APPROVED'),('Bản đang thẩm định','PENDING_APPROVAL')) sample(t,s) WHERE id=:'owner'; COMMIT;`,ids)
}
