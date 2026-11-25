BEGIN;
SET LOCAL ROLE rms_migrate;
CREATE TABLE rms.budget_allocation (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,amount bigint NOT NULL CHECK(amount>0),rate numeric(5,2) NOT NULL CHECK(rate BETWEEN 0 AND 100),
  cap bigint CHECK(cap>=0),fee bigint NOT NULL CHECK(fee BETWEEN 0 AND amount),confirmed_by uuid NOT NULL,confirmed_at timestamptz NOT NULL DEFAULT now(),
  note text NOT NULL,revision integer NOT NULL DEFAULT 1,settled_at timestamptz,settled_by uuid,settlement_mode text CHECK(settlement_mode IN ('MANUAL','MATCHED')),
  PRIMARY KEY(tenant_id,project_id),FOREIGN KEY(tenant_id,project_id) REFERENCES rms.project_assignment(tenant_id,project_id),
  FOREIGN KEY(tenant_id,confirmed_by) REFERENCES rms.account(tenant_id,id),FOREIGN KEY(tenant_id,settled_by) REFERENCES rms.account(tenant_id,id)
);
CREATE TABLE rms.budget_expense (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,id uuid NOT NULL,owner_id uuid NOT NULL,amount bigint NOT NULL CHECK(amount>0),
  spent date NOT NULL,description text NOT NULL,revision integer NOT NULL DEFAULT 1,deleted_at timestamptz,
  reconciliation text NOT NULL DEFAULT 'UNRECONCILED' CHECK(reconciliation IN ('UNRECONCILED','MATCHED','MISMATCHED')),reference text,transferred bigint,
  PRIMARY KEY(tenant_id,project_id,id),FOREIGN KEY(tenant_id,project_id) REFERENCES rms.budget_allocation(tenant_id,project_id),
  FOREIGN KEY(tenant_id,owner_id) REFERENCES rms.account(tenant_id,id)
);
CREATE UNIQUE INDEX expense_reference ON rms.budget_expense(tenant_id,project_id,reference) WHERE reference IS NOT NULL AND deleted_at IS NULL;
CREATE TABLE rms.expense_receipt (
  tenant_id uuid NOT NULL,project_id uuid NOT NULL,expense_id uuid NOT NULL,file_id uuid NOT NULL,
  PRIMARY KEY(tenant_id,project_id,expense_id,file_id),
  FOREIGN KEY(tenant_id,project_id,expense_id) REFERENCES rms.budget_expense(tenant_id,project_id,id),
  FOREIGN KEY(tenant_id,project_id,file_id) REFERENCES rms.attachment_intent(tenant_id,project_id,id)
);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['budget_allocation','budget_expense','expense_receipt'] LOOP
    EXECUTE format('ALTER TABLE rms.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE rms.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('CREATE POLICY tenant_scope ON rms.%I TO rms_runtime USING (tenant_id=rms.current_tenant()) WITH CHECK(tenant_id=rms.current_tenant())',t);
    EXECUTE format('GRANT SELECT,INSERT ON rms.%I TO rms_runtime',t);
  END LOOP;
END $$;
GRANT UPDATE(amount,fee,note,revision,settled_at,settled_by,settlement_mode) ON rms.budget_allocation TO rms_runtime;
GRANT UPDATE(amount,spent,description,revision,deleted_at,reconciliation,reference,transferred) ON rms.budget_expense TO rms_runtime;
GRANT DELETE ON rms.expense_receipt TO rms_runtime;
COMMIT;
