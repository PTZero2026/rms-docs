#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
if [[ "${1:-}" == "--oidc" ]]; then
  (cd ../.. && corepack pnpm build)
fi
pgbin="$(pg_config --bindir)"
cluster="$(mktemp -d /tmp/rms-pg.XXXXXXXX)"
# A private Unix socket keeps the test cluster off all network interfaces.
export PGHOST="$cluster" PGPORT=5432 PGDATABASE=rms_test PGUSER=rms_test_owner
unset PGOPTIONS PGPASSWORD PGSERVICE PGSERVICEFILE
backend_dir="$PWD"
cleanup() {
  if [[ -n "${RMS_BROWSER_FIXTURE_BUCKET:-}" ]]; then
    node "$backend_dir/test/db/browser-bucket.mjs" cleanup
  fi
  if [[ -s "$cluster/data/postmaster.pid" ]]; then
    "$pgbin/pg_ctl" -w -D "$cluster/data" stop -m fast >/dev/null || return 1
  fi
  rm -rf -- "$cluster"
}
trap cleanup EXIT
"$pgbin/initdb" --no-locale --encoding=UTF8 --auth-local=trust --auth-host=reject -U "$PGUSER" -D "$cluster/data" >/dev/null
"$pgbin/pg_ctl" -w -D "$cluster/data" -l "$cluster/postgres.log" -o "-k $cluster -c listen_addresses=''" start >/dev/null
"$pgbin/createdb" "$PGDATABASE"
sql=("$pgbin/psql" -X -v ON_ERROR_STOP=1 --quiet)
"${sql[@]}" -f prisma/bootstrap-roles.sql
"${sql[@]}" -c "GRANT CREATE ON DATABASE rms_test TO rms_migrate; CREATE ROLE rms_test_client LOGIN IN ROLE rms_runtime; CREATE ROLE rms_test_worker LOGIN IN ROLE rms_worker; CREATE ROLE rms_test_dispatch_ops LOGIN IN ROLE rms_dispatch_ops;"
for script in prisma/migrations/*/migration.sql; do "${sql[@]}" -f "$script"; done
"${sql[@]}" -f test/db/tenants.sql
if [[ "${1:-}" == "--oidc" ]]; then
  "${sql[@]}" -c "UPDATE rms.tenant SET issuer='http://127.0.0.1:8180/realms/' || slug"
fi
"$pgbin/createdb" rms_config_test
"${sql[@]}" -c "CREATE ROLE rms_config_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS; CREATE ROLE rms_config_test LOGIN IN ROLE rms_config_runtime"
for script in ../sys-config-service/db/*.sql; do "${sql[@]}" -d rms_config_test -f "$script"; done
export RMS_CONFIG_DATABASE_URL="postgresql://rms_config_test@localhost/rms_config_test?host=$PGHOST"
node --test test/db/*.test.mjs ../sys-config-service/test/store.test.mjs
if [[ "${1:-}" == "--idp-ui" ]]; then
  "${sql[@]}" -c "UPDATE rms.tenant SET issuer='http://127.0.0.1:8185/realms/' || slug WHERE slug IN ('school-1','school-2')"
  RMS_PROVISION_UI=1 node ../../e2e/release/keycloak-rehearsal.mjs
fi
if [[ "${1:-}" == "--rehearse" ]]; then node test/db/restore-objects.mjs; fi
if [[ "${1:-}" == "--capacity" ]]; then node test/db/load-capacity.mjs; fi
if [[ "${1:-}" == "--oidc" ]]; then
  export DATABASE_URL="postgresql://rms_test_client@localhost/rms_test?host=$PGHOST"
  export RMS_OIDC_INTEGRATION=1
  export RMS_CATALOG_SERVICE_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
  export RMS_REMINDER_SERVICE_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
  export RMS_TEACHING_SERVICE_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
  node ../worker/test/mailpit.mjs
  if [[ "${RMS_S3_ENDPOINT:-}" == "http://127.0.0.1:8333" ]]; then
    RMS_BROWSER_FIXTURE_BUCKET="$(node test/db/browser-bucket.mjs create)"
    export RMS_BROWSER_FIXTURE_BUCKET RMS_S3_BUCKET="$RMS_BROWSER_FIXTURE_BUCKET"
  fi
  cd ../../e2e
  shift
  npm run test:integrated -- "$@"
fi
