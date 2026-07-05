#!/usr/bin/env bash
# Repair Supabase migration history for Gifty (addrgdmzhiqguiybfqcx).
#
# Use when `supabase db push` fails with:
#   "Remote migration versions not found in local migrations directory"
#
# Prerequisites:
#   export SUPABASE_ACCESS_TOKEN="sbp_..."   # gifty account token
#   export SUPABASE_DB_PASSWORD="..."        # Project Settings → Database → password
#
# Usage:
#   chmod +x scripts/repair-supabase-migrations.sh
#   ./scripts/repair-supabase-migrations.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Error: set SUPABASE_ACCESS_TOKEN (gifty account access token)."
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Error: set SUPABASE_DB_PASSWORD (database password from Supabase dashboard)."
  exit 1
fi

PASS=(-p "$SUPABASE_DB_PASSWORD")

echo "==> Re-syncing migrations 1–9 (remote checksum mismatch)"
for v in 1 2 3 4 5 6 7 8 9; do
  echo "--- migration $v"
  supabase migration repair "$v" --status reverted "${PASS[@]}"
  supabase migration repair "$v" --status applied "${PASS[@]}"
done

echo ""
echo "==> Migration list after repair"
supabase migration list "${PASS[@]}"

echo ""
echo "==> Pushing pending migrations (11, 12, …)"
supabase db push "${PASS[@]}"

echo ""
echo "==> Final migration list"
supabase migration list "${PASS[@]}"

echo ""
echo "Done."
