BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.research_output
  ADD COLUMN approved_hour_shares jsonb CHECK(approved_hour_shares IS NULL OR (status='APPROVED' AND jsonb_typeof(approved_hour_shares)='array'));
GRANT UPDATE(approved_hour_shares) ON rms.research_output TO rms_runtime;
DO $$
DECLARE old_check name;
BEGIN
  SELECT conname INTO STRICT old_check FROM pg_constraint WHERE conrelid='rms.hour_request'::regclass
    AND contype='c' AND pg_get_constraintdef(oid) LIKE '%num_nonnulls(extension_id, applied_id, student_id)%';
  EXECUTE format('ALTER TABLE rms.hour_request DROP CONSTRAINT %I',old_check);
END $$;
ALTER TABLE rms.hour_request ADD COLUMN product_id uuid GENERATED ALWAYS AS (CASE WHEN kind='product' THEN source_id END) STORED,
  ADD CHECK(num_nonnulls(extension_id,applied_id,student_id,product_id)=1),
  ADD FOREIGN KEY(tenant_id,product_id) REFERENCES rms.research_output(tenant_id,id);
COMMIT;
