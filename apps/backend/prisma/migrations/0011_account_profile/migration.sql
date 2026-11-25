BEGIN;
SET LOCAL ROLE rms_migrate;
ALTER TABLE rms.account ADD COLUMN full_name text NOT NULL DEFAULT '' CHECK(length(full_name)<=160),
  ADD COLUMN phone text NOT NULL DEFAULT '' CHECK(length(phone)<=32),
  ADD COLUMN profile_revision integer NOT NULL DEFAULT 0 CHECK(profile_revision>=0);
COMMIT;
