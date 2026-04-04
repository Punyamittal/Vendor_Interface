-- If vendors can sign in but see "No shop assigned" while data exists in `shops`,
-- Row Level Security is likely blocking SELECT. Run policies like these (adjust names if needed).

-- Profiles: user reads own row
-- create policy "Users read own profile"
--   on public.profiles for select
--   to authenticated
--   using (auth.uid() = id);

-- Shops: vendor reads own shop(s)
-- create policy "Vendors read own shops"
--   on public.shops for select
--   to authenticated
--   using (owner_id = auth.uid());

-- Shops: vendor updates own shop (e.g. is_accepting_orders)
-- create policy "Vendors update own shops"
--   on public.shops for update
--   to authenticated
--   using (owner_id = auth.uid())
--   with check (owner_id = auth.uid());
