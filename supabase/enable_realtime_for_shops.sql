-- =============================================================================
-- Shop status: enable Realtime for public.shops (safe to run multiple times).
-- If you previously ran ALTER PUBLICATION ... ADD TABLE and saw:
--   ERROR 42710: relation "shops" is already member of publication
-- then Realtime was ALREADY on — no action needed for this step.
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'shops'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
  END IF;
END $$;

-- =============================================================================
-- If admin still does not see vendor toggles live, check:
-- 1) Admin app subscribes to postgres_changes on public.shops (or refetches).
-- 2) RLS: admin role must be allowed SELECT on shop rows for events to deliver.
--
-- Example policy (adjust to your auth model):
--
-- create policy "Admins can read all shops"
--   on public.shops for select
--   to authenticated
--   using (
--     (auth.jwt() ->> 'user_role') = 'admin'
--     -- or: auth.uid() in (select user_id from admin_users)
--   );
-- =============================================================================
