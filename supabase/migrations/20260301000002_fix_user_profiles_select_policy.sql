-- ============================================================
-- Fix: users cannot read their own user_profiles row when
-- restaurant_id is NULL.
--
-- Root cause: the only SELECT policy was:
--   USING (restaurant_id = auth_restaurant_id())
-- When restaurant_id IS NULL (user registered before the
-- auto-create trigger), NULL = NULL evaluates to FALSE in SQL,
-- so RLS hides the row and PostgREST returns 0 rows (PGRST116).
--
-- Fix: add a policy that always lets a user read their own row
-- via id = auth.uid(), independent of restaurant_id.
-- ============================================================

CREATE POLICY "self_select_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());
