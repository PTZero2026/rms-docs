"""Restore disposable fixture databases and compare every application table."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time

socket = os.environ["PGHOST"]
if not re.fullmatch(r"/tmp/rms-pg\.[A-Za-z0-9]+", socket) or os.environ.get("PGUSER") != "rms_test_owner":
    raise SystemExit("Private RMS test cluster required")

def query(database, sql):
    return subprocess.check_output(["psql", "-XAt", "-v", "ON_ERROR_STOP=1", "-d", database, "-c", sql], text=True).strip()

def fingerprint(database):
    names = query(database, """SELECT format('%I.%I',schemaname,tablename) FROM pg_tables
        WHERE schemaname NOT IN ('information_schema','pg_catalog') ORDER BY 1""").splitlines()
    result = {}
    for table in names:
        result[table] = query(database, f"""SELECT count(*)::text||'/'||md5(coalesce(string_agg(h,'' ORDER BY h),''))
              FROM (SELECT md5(to_jsonb(t)::text) AS h FROM {table} t) hashes""")
    return result

stats = {}
start = time.monotonic()
for name, target in [("rms_test", "rms_restored"), ("rms_config_test", "rms_config_restored")]:
    expected = fingerprint(name)
    dump = Path(socket) / (name + ".dump")
    subprocess.run(["pg_dump", "-Fc", "-d", name, "-f", str(dump)], check=True)
    subprocess.run(["createdb", target], check=True)
    t = time.monotonic()
    subprocess.run(["pg_restore", "--exit-on-error", "-d", target, str(dump)], check=True)
    elapsed = time.monotonic() - t
    actual = fingerprint(target)
    if actual != expected:
        raise SystemExit("Restore mismatch: " + str([k for k in expected if actual.get(k) != expected[k]]))
    stats[name] = dict(tables=len(actual), rows=sum(int(v.split("/")[0]) for v in actual.values()),
                       dumpBytes=dump.stat().st_size, sha256=hashlib.sha256(dump.read_bytes()).hexdigest(),
                       restoreSeconds=round(elapsed,3), matched=True)
stats["elapsedWithChecksSeconds"] = round(time.monotonic()-start,3)
print(json.dumps(stats))
