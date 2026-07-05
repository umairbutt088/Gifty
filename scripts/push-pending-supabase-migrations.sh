#!/usr/bin/env bash
# Push pending Supabase migrations when history for 1-10 is out of sync.
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."
#   export SUPABASE_DB_PASSWORD="..."
#
# Usage:
#   ./scripts/push-pending-supabase-migrations.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Error: set SUPABASE_ACCESS_TOKEN."
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Error: set SUPABASE_DB_PASSWORD."
  exit 1
fi

PASS=(-p "$SUPABASE_DB_PASSWORD")
ARCHIVE="supabase/migrations_applied"

mkdir -p "$ARCHIVE"

shopt -s nullglob
for f in supabase/migrations/{1,2,3,4,5,6,7,8,9,10}_*.sql; do
  mv "$f" "$ARCHIVE/"
done
shopt -u nullglob

cleanup() {
  shopt -s nullglob
  for f in "$ARCHIVE"/*.sql; do
    mv "$f" supabase/migrations/
  done
  shopt -u nullglob
  rmdir "$ARCHIVE" 2>/dev/null || true
}
trap cleanup EXIT

supabase migration repair 1 2 3 4 5 6 7 8 9 10 --status reverted "${PASS[@]}" || true
supabase db push "${PASS[@]}" --yes
for v in 1 2 3 4 5 6 7 8 9 10; do
  supabase migration repair "$v" --status applied "${PASS[@]}" || true
done

echo "Done. Pending migrations pushed."
