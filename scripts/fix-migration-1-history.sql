-- Run once in Supabase SQL Editor (Gifty project).
-- Removes orphaned numeric migration versions from history.
-- Safe: schema is already applied; this only fixes the history table.

DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
