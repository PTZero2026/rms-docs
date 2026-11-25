"""Check the working copy and built web bundle. Print counts only."""
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
paths = subprocess.check_output(["git", "ls-files", "-co", "--exclude-standard", "-z"], cwd=root).decode().split("\0")
rules = {
    "privateKey": rb"-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----",
    "awsAccessKey": rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    "githubToken": rb"\b(?:gh[pousr]_[A-Za-z0-9]{35,}|github_pat_[A-Za-z0-9_]{80,})\b",
    "slackToken": rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b",
    "signedJwt": rb"\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{30,}\b",
}
def check(files):
    count = 0
    matched = {key: 0 for key in rules}
    for p in files:
        if p.is_symlink() or not p.is_file() or p.stat().st_size > 8_000_000:
            continue
        data = p.read_bytes()
        if b"\x00" in data:
            continue
        count += 1
        for name, regex in rules.items():
            matched[name] += int(re.search(regex, data) is not None)
    return {"files": count, "filesMatching": matched}

result = {"workingCopy": check(root/name for name in paths if name), "webBuild": check((root/"apps/web/dist").rglob("*"))}
print(json.dumps(result, indent=2))
raise SystemExit(int(any(sum(v["filesMatching"].values()) for v in result.values())))
