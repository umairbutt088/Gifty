#!/usr/bin/env bash
# Re-register all applied migrations after renaming to timestamp format.
#
# 1. Run scripts/fix-migration-1-history.sql in Supabase SQL Editor first.
# 2. Then run this script:
#
#   export SUPABASE_ACCESS_TOKEN="sbp_..."
#   export SUPABASE_DB_PASSWORD="..."
#   ./scripts/fix-migration-1-history.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Error: set SUPABASE_DB_PASSWORD."
  exit 1
fi

PASS=(-p "$SUPABASE_DB_PASSWORD")

TIMESTAMPS=(
  20240619133901
  20240619133902
  20240619133903
  20240619133904
  20240619133905
  20240619133906
  20240619133907
  20240619133908
  20240619133909
  20240619133910
)

echo "==> Register migrations 01–10 as applied"
for version in "${TIMESTAMPS[@]}"; do
  supabase migration repair "$version" --status applied "${PASS[@]}"
done

echo ""
echo "==> Migration list"
supabase migration list "${PASS[@]}"

echo ""
echo "==> Dry-run push (should report nothing pending)"
supabase db push "${PASS[@]}" --dry-run

echo ""
echo "Done."
