#!/usr/bin/env bash
# Đồng bộ skills giữa các môi trường AI (.agents/skills, .claude/skills, .cursor/skills)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE_DIR="$ROOT_DIR/.agents/skills"
TARGET_DIRS=("$ROOT_DIR/.claude/skills" "$ROOT_DIR/.cursor/skills")

echo "=== Đồng bộ skills từ $SOURCE_DIR ==="

for target in "${TARGET_DIRS[@]}"; do
  mkdir -p "$target"
  for skill_path in "$SOURCE_DIR"/*; do
    if [ -d "$skill_path" ]; then
      skill_name="$(basename "$skill_path")"
      target_skill="$target/$skill_name"
      if [ -d "$target_skill" ]; then
        rm -rf "$target_skill"
      fi
      cp -R "$skill_path" "$target_skill"
    fi
  done
  echo "✓ Đã đồng bộ sang $(basename "$(dirname "$target")")/skills"
done

# Cấp quyền thực thi cho các script trợ giúp bên trong skills
find "$ROOT_DIR/.agents/skills" "$ROOT_DIR/.claude/skills" "$ROOT_DIR/.cursor/skills" \
  \( -name "*.sh" -o -name "*.py" -o -name "task-*" -o -name "sdd-*" -o -name "review-*" \) \
  -exec chmod +x {} + 2>/dev/null || true

echo "✓ Hoàn tất đồng bộ! Tổng số skills: $(ls -1 "$SOURCE_DIR" | wc -l)"
