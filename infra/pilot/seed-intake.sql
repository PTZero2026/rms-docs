-- Optional example for a test tenant. Run as migration owner with -v tenant_id=...
BEGIN;
SET LOCAL ROLE rms_migrate;
SELECT set_config('rms.tenant_id', :'tenant_id'::uuid::text,true);
INSERT INTO rms.intake_reference(tenant_id,kind,name,definition)
VALUES (rms.current_tenant(),'field','Môi trường','{}'),
       (rms.current_tenant(),'form','Thuyết minh cơ sở','{"fields":[{"key":"objective","label":"Mục tiêu","required":true},{"key":"method","label":"Phương pháp","required":true}]}'),
       (rms.current_tenant(),'criteria','Bộ tiêu chí cơ sở','{"type":"PROPOSAL_REVIEW","items":[{"key":"quality","label":"Chất lượng khoa học","weight":0.6,"maxScore":10},{"key":"impact","label":"Tác động","weight":0.4,"maxScore":10}]}')
ON CONFLICT(tenant_id,kind,name,revision) DO NOTHING;
COMMIT;
